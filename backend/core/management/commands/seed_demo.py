"""Seed demo data for CampusXP."""
from datetime import datetime, timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import ExemptionRequest, Faculty, Student


class Command(BaseCommand):
    help = 'Seed demo students, faculty, and exemption requests'

    def handle(self, *args, **options):
        faculty, _ = Faculty.objects.get_or_create(
            staff_id='FAC-2024-089',
            defaults={
                'name': 'Dr. Sunita Rao',
                'department': 'Computer Applications',
                'password_hash': make_password('CampusXP2026'),
            },
        )

        student, _ = Student.objects.get_or_create(
            prn='BCOM2024042',
            defaults={
                'name': 'Aarav Mehta',
                'department': 'BCOM',
                'total_xp': 450,
                'events_count': 3,
                'events_required': 5,
                'password_hash': make_password('CampusXP2026'),
            },
        )

        Student.objects.get_or_create(
            prn='BSC2023089',
            defaults={
                'name': 'Rohan Kapoor',
                'department': 'BSC',
                'total_xp': 200,
                'events_count': 2,
                'password_hash': make_password('CampusXP2026'),
            },
        )

        self.stdout.write(self.style.SUCCESS(f'Seeded faculty {faculty.staff_id}, student {student.prn}'))
