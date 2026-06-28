import base64
import io

import qrcode
from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.crypto import get_random_string
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .engine import calculate_event_xp, evaluate_danger_zone, LEVEL_BASE_XP, ROLE_MULTIPLIER
from .models import CampusEvent, Event, ExemptionRequest, Faculty, Student
from .services import (
    approve_exemption,
    create_event,
    generate_marksheet_csv,
    get_student_rank,
    verify_qr_scan,
)


# ── HTML login forms (field names match DB columns) ──────────────────────────

def student_login_page(request):
    error = None
    if request.method == 'POST':
        prn = request.POST.get('prn', '').strip()
        password = request.POST.get('password', '')
        if Student.objects.filter(prn=prn).exists():
            request.session['role'] = 'student'
            request.session['prn'] = prn
            return redirect('/api/student/dashboard/')
        error = 'Invalid PRN.'
    return render(request, 'student_login.html', {'error': error})


def faculty_login_page(request):
    error = None
    if request.method == 'POST':
        staff_id = request.POST.get('staff_id', '').strip()
        password = request.POST.get('password', '')
        if Faculty.objects.filter(staff_id=staff_id).exists():
            request.session['role'] = 'faculty'
            request.session['staff_id'] = staff_id
            return redirect('/api/faculty/dashboard/')
        error = 'Invalid Staff ID.'
    return render(request, 'faculty_login.html', {'error': error})


# ── REST API (React frontend) ────────────────────────────────────────────────

@api_view(['POST'])
def api_student_login(request):
    prn = request.data.get('prn', '').strip()
    password = request.data.get('password', '')
    if not prn or not password:
        return Response({'ok': False, 'error': 'prn and password required'}, status=status.HTTP_400_BAD_REQUEST)

    student = Student.objects.filter(prn=prn).first()
    if not student or not student.password_hash or not check_password(password, student.password_hash):
        return Response({'ok': False, 'error': 'Invalid PRN or password'}, status=status.HTTP_401_UNAUTHORIZED)

    danger = evaluate_danger_zone(student.events_count, student.events_required)
    rank = get_student_rank(student)
    return Response({
        'ok': True,
        'role': 'student',
        'prn': student.prn,
        'name': student.name,
        'total_xp': student.total_xp,
        'events_count': student.events_count,
        'events_required': student.events_required,
        'danger_zone': {'is_safe': danger.is_safe, 'label': danger.label},
        'rank': rank['rank'],
        'total_students': rank['total_students'],
    })


@api_view(['POST'])
def api_faculty_login(request):
    staff_id = request.data.get('staff_id', '').strip()
    password = request.data.get('password', '')
    if not staff_id or not password:
        return Response({'ok': False, 'error': 'staff_id and password required'}, status=status.HTTP_400_BAD_REQUEST)

    faculty = Faculty.objects.filter(staff_id=staff_id).first()
    if not faculty or not faculty.password_hash or not check_password(password, faculty.password_hash):
        return Response({'ok': False, 'error': 'Invalid staff ID or password'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({'ok': True, 'role': 'faculty', 'staff_id': faculty.staff_id, 'name': faculty.name})


@api_view(['POST'])
def api_faculty_signup(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    college_name = request.data.get('college_name', '').strip()

    if not name or not email or not password or not college_name:
        return Response({'ok': False, 'error': 'name, email, password, and college_name are required'}, status=status.HTTP_400_BAD_REQUEST)

    if Faculty.objects.filter(email=email).exists():
        return Response({'ok': False, 'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    staff_id = f'FAC-{get_random_string(6).upper()}'
    while Faculty.objects.filter(staff_id=staff_id).exists():
        staff_id = f'FAC-{get_random_string(6).upper()}'

    faculty = Faculty.objects.create(
        staff_id=staff_id,
        name=name,
        department=college_name,
        email=email,
        password_hash=make_password(password),
    )

    return Response({'ok': True, 'role': 'faculty', 'staff_id': faculty.staff_id, 'name': faculty.name, 'email': faculty.email})


@api_view(['POST'])
def api_google_login(request):
    credential = request.data.get('credential', '').strip()
    role = request.data.get('role', '').strip()

    if not credential or role not in ('student', 'faculty'):
        return Response({'ok': False, 'error': 'credential and role required'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.GOOGLE_CLIENT_ID:
        return Response({'ok': False, 'error': 'Google OAuth not configured on server'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        return Response({'ok': False, 'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

    email = idinfo.get('email', '').lower()
    name = idinfo.get('name') or email.split('@')[0]
    google_sub = idinfo.get('sub', '')

    if not email:
        return Response({'ok': False, 'error': 'Google account has no email'}, status=status.HTTP_400_BAD_REQUEST)

    if role == 'student':
        student = Student.objects.filter(email=email).first()
        if not student:
            prn = f'G-{google_sub[:12]}'
            student = Student.objects.create(
                prn=prn,
                name=name,
                email=email,
                department='BCOM',
            )
        elif student.name != name:
            student.name = name
            student.save(update_fields=['name'])

        danger = evaluate_danger_zone(student.events_count, student.events_required)
        rank = get_student_rank(student)
        return Response({
            'ok': True,
            'role': 'student',
            'prn': student.prn,
            'name': student.name,
            'email': email,
            'picture': idinfo.get('picture', ''),
            'total_xp': student.total_xp,
            'events_count': student.events_count,
            'events_required': student.events_required,
            'danger_zone': {'is_safe': danger.is_safe, 'label': danger.label},
            'rank': rank['rank'],
            'total_students': rank['total_students'],
        })

    faculty = Faculty.objects.filter(email=email).first()
    if not faculty:
        staff_id = f'G-{google_sub[:12]}'
        faculty = Faculty.objects.create(
            staff_id=staff_id,
            name=name,
            email=email,
            department='General',
        )
    elif faculty.name != name:
        faculty.name = name
        faculty.save(update_fields=['name'])

    return Response({
        'ok': True,
        'role': 'faculty',
        'staff_id': faculty.staff_id,
        'name': faculty.name,
        'email': email,
        'picture': idinfo.get('picture', ''),
    })


@api_view(['GET'])
def api_landing_stats(request):
    students = Student.objects.filter(semester_locked=False)
    events = CampusEvent.objects.count()
    total_xp = Student.objects.aggregate(total_xp=models.Sum('total_xp'))['total_xp'] or 0

    return Response({
        'students': students.count(),
        'events': events,
        'xp_awarded': int(total_xp),
    })


@api_view(['GET'])
def api_xp_matrix(request):
    return Response({
        'level_base_xp': LEVEL_BASE_XP,
        'role_multiplier': ROLE_MULTIPLIER,
    })


@api_view(['POST'])
def api_create_event(request):
    staff_id = request.data.get('staff_id')
    faculty = Faculty.objects.get(staff_id=staff_id)
    venue_date = request.data['date']
    start_time = request.data.get('start_time', '09:00')
    end_time = request.data.get('end_time', '18:00')
    from datetime import datetime as dt
    venue_start = timezone.make_aware(dt.fromisoformat(f'{venue_date}T{start_time}:00'))
    venue_end = timezone.make_aware(dt.fromisoformat(f'{venue_date}T{end_time}:00'))

    event = create_event(
        faculty,
        name=request.data['name'],
        date=venue_date,
        category=request.data.get('category', 'Other'),
        event_level=request.data['event_level'],
        venue_start=venue_start,
        venue_end=venue_end,
    )

    qr_url = f'campusxp://scan/{event.qr_token}'
    qr_img = qrcode.make(qr_url)
    buf = io.BytesIO()
    qr_img.save(buf, format='PNG')
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    return Response({
        'ok': True,
        'event_id': event.id,
        'name': event.name,
        'base_xp': event.base_xp,
        'qr_token': str(event.qr_token),
        'qr_image_base64': qr_b64,
        'sample_xp': {
            role: calculate_event_xp(event.event_level, role)  # type: ignore[arg-type]
            for role in ['Participant', 'Volunteer', 'Winner']
        },
    })


@api_view(['POST'])
def api_scan_qr(request):
    prn = request.data.get('prn')
    qr_token = request.data.get('qr_token')
    role = request.data.get('role', 'Participant')
    student = Student.objects.get(prn=prn)
    result = verify_qr_scan(student, qr_token, role)
    if not result['ok']:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response(result)


@api_view(['POST'])
def api_approve_exemption(request):
    staff_id = request.data.get('staff_id')
    exemption_id = request.data.get('exemption_id')
    frozen_to = int(request.data.get('frozen_threshold', 3))
    faculty = Faculty.objects.get(staff_id=staff_id)
    exemption = ExemptionRequest.objects.get(id=exemption_id)
    approve_exemption(faculty, exemption, frozen_to)
    return Response({'ok': True, 'frozen_threshold': frozen_to})


@api_view(['GET'])
def api_marksheet(request):
    csv_data = generate_marksheet_csv()
    return Response({'ok': True, 'csv': csv_data})


@api_view(['GET'])
def api_leaderboard(request):
    students = Student.objects.all().order_by('-total_xp')
    dept = request.query_params.get('department')
    qs = students
    if dept:
        qs = qs.filter(department=dept)
    return Response([
        {
            'rank': i,
            'prn': s.prn,
            'name': s.name,
            'department': s.department,
            'total_xp': s.total_xp,
        }
        for i, s in enumerate(qs, start=1)
    ])
