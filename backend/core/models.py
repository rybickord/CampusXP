import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Faculty(models.Model):
    staff_id = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=128)
    department = models.CharField(max_length=128)
    email = models.EmailField(unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=256, blank=True)

    class Meta:
        verbose_name_plural = 'faculty'

    def __str__(self):
        return f'{self.staff_id} — {self.name}'


class Student(models.Model):
    DEPARTMENTS = [('BCOM', 'BCOM'), ('BSC', 'BSC')]

    prn = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=128)
    email = models.EmailField(unique=True, null=True, blank=True)
    department = models.CharField(max_length=8, choices=DEPARTMENTS)
    total_xp = models.PositiveIntegerField(default=0)
    events_count = models.PositiveIntegerField(default=0)
    events_required = models.PositiveIntegerField(default=5)
    password_hash = models.CharField(max_length=256, blank=True)
    semester_locked = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.prn} — {self.name}'


class Event(models.Model):
    LEVELS = [('Local', 'Local'), ('State', 'State'), ('National', 'National')]
    CATEGORIES = [
        ('Hackathon', 'Hackathon'),
        ('Fest', 'Fest'),
        ('Workshop', 'Workshop'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=256)
    date = models.DateField()
    category = models.CharField(max_length=32, choices=CATEGORIES)
    event_level = models.CharField(max_length=16, choices=LEVELS)
    created_by = models.ForeignKey(Faculty, on_delete=models.PROTECT, related_name='events')
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    venue_start = models.DateTimeField()
    venue_end = models.DateTimeField()
    base_xp = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class EventAttendance(models.Model):
    ROLES = [
        ('Participant', 'Participant'),
        ('Volunteer', 'Volunteer'),
        ('Winner', 'Winner'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    role = models.CharField(max_length=16, choices=ROLES)
    xp_awarded = models.PositiveIntegerField()
    scanned_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = [('student', 'event')]


class ExemptionRequest(models.Model):
    STATUSES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exemptions')
    reason = models.TextField()
    file_name = models.CharField(max_length=256)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=16, choices=STATUSES, default='pending')
    frozen_threshold = models.PositiveIntegerField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        Faculty, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviews'
    )


class AuditLog(models.Model):
    """Immutable audit trail — anti-tamper rule."""
    actor_type = models.CharField(max_length=16)  # faculty | student | system
    actor_id = models.CharField(max_length=32)
    action = models.CharField(max_length=64)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SubjectContainer(models.Model):
    name = models.CharField(max_length=100, help_text="e.g., Environmental Studies (EVS)")
    semester = models.CharField(max_length=20, help_text="e.g., Sem 4")
    min_events_required = models.IntegerField(default=5)
    max_academic_marks = models.IntegerField(default=100, help_text="The ultimate marks boundary for the university sheet")

    def __str__(self):
        return f"{self.name} - {self.semester}"


class CampusEvent(models.Model):
    # Event Scope Levels
    SCOPE_CHOICES = [
        (20, 'Intra-College (20 XP)'),
        (50, 'Inter-College (50 XP)'),
        (100, 'National Level (100 XP)'),
    ]
    
    title = models.CharField(max_length=200)
    date = models.DateField()
    scope_points = models.IntegerField(choices=SCOPE_CHOICES)
    associated_subject = models.ForeignKey(SubjectContainer, on_delete=models.CASCADE, related_name='events')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.title


class ActionAuditLog(models.Model):
    # Strict paper trail tracking for all faculty modifications
    faculty_user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_performed = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.faculty_user.username} executed changes at {self.timestamp}"
