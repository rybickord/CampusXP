from django.contrib.auth.hashers import make_password
from django.test import TestCase

from .models import CampusEvent, Faculty, Student, SubjectContainer


class AuthApiTests(TestCase):
    def setUp(self):
        self.student = Student.objects.create(
            prn='BCOM2024042',
            name='Aarav Mehta',
            department='BCOM',
            password_hash=make_password('CampusXP2026'),
        )
        self.faculty = Faculty.objects.create(
            staff_id='FAC-2024-089',
            name='Dr. Sunita Rao',
            department='Computer Applications',
            password_hash=make_password('CampusXP2026'),
        )

    def test_student_login_accepts_password(self):
        response = self.client.post(
            '/api/auth/student/',
            {'prn': self.student.prn, 'password': 'CampusXP2026'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['ok'])
        self.assertEqual(payload['prn'], self.student.prn)

    def test_faculty_login_accepts_password(self):
        response = self.client.post(
            '/api/auth/faculty/',
            {'staff_id': self.faculty.staff_id, 'password': 'CampusXP2026'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['ok'])
        self.assertEqual(payload['staff_id'], self.faculty.staff_id)

    def test_landing_stats_endpoint_returns_real_counts(self):
        Student.objects.create(
            prn='BCOM2024043',
            name='Student One',
            department='BCOM',
            total_xp=120,
            password_hash=make_password('secret'),
        )
        Student.objects.create(
            prn='BSC2024001',
            name='Student Two',
            department='BSC',
            total_xp=80,
            semester_locked=True,
            password_hash=make_password('secret'),
        )

        subject = SubjectContainer.objects.create(
            name='Environmental Studies',
            semester='Sem 4',
            min_events_required=5,
        )
        CampusEvent.objects.create(
            title='Hackathon',
            date='2026-06-28',
            scope_points=20,
            associated_subject=subject,
            created_by=None,
        )
        CampusEvent.objects.create(
            title='Workshop',
            date='2026-06-29',
            scope_points=50,
            associated_subject=subject,
            created_by=None,
        )

        response = self.client.get('/api/landing-stats/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['students'], 2)
        self.assertEqual(payload['events'], 2)
        self.assertEqual(payload['xp_awarded'], 200)
