"""Business logic: event creation, QR scan, attendance, reports."""
from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime, time

from django.utils import timezone

from .engine import (
    calculate_event_xp,
    clamp_xp,
    evaluate_danger_zone,
    final_score_with_floor,
    map_xp_to_grade,
    recalculate_ranks,
    LEVEL_BASE_XP,
)
from .models import AuditLog, Event, EventAttendance, ExemptionRequest, Faculty, Student


def log_audit(actor_type: str, actor_id: str, action: str, details: dict | None = None):
    AuditLog.objects.create(
        actor_type=actor_type,
        actor_id=actor_id,
        action=action,
        details=details or {},
    )


def create_event(
    faculty: Faculty,
    *,
    name: str,
    date,
    category: str,
    event_level: str,
    venue_start: datetime,
    venue_end: datetime,
) -> Event:
    event = Event.objects.create(
        name=name,
        date=date,
        category=category,
        event_level=event_level,
        created_by=faculty,
        qr_token=uuid.uuid4(),
        venue_start=venue_start,
        venue_end=venue_end,
        base_xp=LEVEL_BASE_XP[event_level],  # type: ignore[index]
    )
    log_audit('faculty', faculty.staff_id, 'event_created', {
        'event_id': event.id,
        'name': name,
        'level': event_level,
        'base_xp': event.base_xp,
        'qr_token': str(event.qr_token),
    })
    return event


def verify_qr_scan(
    student: Student,
    qr_token: str,
    role: str,
    scanned_at: datetime | None = None,
) -> dict:
    """Location/time lock + database write."""
    now = scanned_at or timezone.now()

    try:
        event = Event.objects.get(qr_token=qr_token)
    except Event.DoesNotExist:
        return {'ok': False, 'error': 'Invalid or expired QR code.'}

    if EventAttendance.objects.filter(student=student, event=event).exists():
        return {'ok': False, 'error': 'Already checked in for this event.'}

    if not (event.venue_start <= now <= event.venue_end):
        return {'ok': False, 'error': 'Scan outside event hours — link sharing blocked.'}

    xp = calculate_event_xp(event.event_level, role)  # type: ignore[arg-type]

    EventAttendance.objects.create(
        student=student,
        event=event,
        role=role,
        xp_awarded=xp,
        scanned_at=now,
    )

    student.total_xp = clamp_xp(student.total_xp + xp)
    student.events_count += 1
    student.save(update_fields=['total_xp', 'events_count'])

    log_audit('student', student.prn, 'qr_scan_verified', {
        'event_id': event.id,
        'role': role,
        'xp_awarded': xp,
        'total_xp': student.total_xp,
        'events_count': student.events_count,
    })

    danger = evaluate_danger_zone(student.events_count, student.events_required)
    rank_data = get_student_rank(student)

    return {
        'ok': True,
        'xp_awarded': xp,
        'total_xp': student.total_xp,
        'events_count': student.events_count,
        'danger_zone': {
            'is_safe': danger.is_safe,
            'label': danger.label,
            'events_required': danger.events_required,
        },
        'rank': rank_data,
    }


def get_student_rank(student: Student) -> dict:
    students = list(
        Student.objects.values('id', 'prn', 'total_xp').order_by('-total_xp')
    )
    ranked = recalculate_ranks(students)
    for entry in ranked:
        if entry['id'] == student.id:
            return {'rank': entry['rank'], 'total_students': len(ranked)}
    return {'rank': 0, 'total_students': len(ranked)}


def approve_exemption(faculty: Faculty, exemption: ExemptionRequest, frozen_to: int = 3):
    """Freeze threshold — no fake XP."""
    exemption.status = 'approved'
    exemption.frozen_threshold = frozen_to
    exemption.reviewed_by = faculty
    exemption.save()

    student = exemption.student
    student.events_required = frozen_to
    student.save(update_fields=['events_required'])

    log_audit('faculty', faculty.staff_id, 'exemption_approved', {
        'student_prn': student.prn,
        'frozen_threshold': frozen_to,
    })


def generate_marksheet_csv() -> str:
    """Term-end one-click marksheet for Mumbai University coordinator."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['PRN', 'Name', 'Department', 'Total XP', 'Events', 'Grade', 'Final Score'])

    for student in Student.objects.all().order_by('prn'):
        danger = evaluate_danger_zone(student.events_count, student.events_required)
        grade = map_xp_to_grade(student.total_xp)
        final = final_score_with_floor(student.total_xp, danger.penalty_reduction)
        writer.writerow([
            student.prn,
            student.name,
            student.department,
            student.total_xp,
            student.events_count,
            grade,
            final,
        ])

    return output.getvalue()


def lock_semester_records():
    Student.objects.update(semester_locked=True)
    log_audit('system', 'engine', 'semester_locked', {})
