from django.urls import path

from . import views

urlpatterns = [
    path('login/student/', views.student_login_page, name='student_login'),
    path('login/faculty/', views.faculty_login_page, name='faculty_login'),
    path('api/auth/student/', views.api_student_login),
    path('api/auth/google/', views.api_google_login),
    path('api/xp-matrix/', views.api_xp_matrix),
    path('api/events/create/', views.api_create_event),
    path('api/events/scan/', views.api_scan_qr),
    path('api/exemptions/approve/', views.api_approve_exemption),
    path('api/reports/marksheet/', views.api_marksheet),
    path('api/leaderboard/', views.api_leaderboard),
]
