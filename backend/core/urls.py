from django.urls import path

from . import views
from students import views as students_views

urlpatterns = [
    path('login/student/', views.student_login_page, name='student_login'),
    path('login/faculty/', views.faculty_login_page, name='faculty_login'),
    path('api/auth/student/', views.api_student_login),
    path('api/auth/faculty/', views.api_faculty_login),
    path('api/auth/faculty/signup/', views.api_faculty_signup),
    path('api/auth/google/', views.api_google_login),
    path('api/faculty/upload-roster/', students_views.upload_roster),
    path('api/landing-stats/', views.api_landing_stats),
    path('api/xp-matrix/', views.api_xp_matrix),
    path('api/events/create/', views.api_create_event),
    path('api/events/scan/', views.api_scan_qr),
    path('api/exemptions/approve/', views.api_approve_exemption),
    path('api/reports/marksheet/', views.api_marksheet),
    path('api/leaderboard/', views.api_leaderboard),
]
