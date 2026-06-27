from django.contrib import admin
from .models import AuditLog, Event, EventAttendance, ExemptionRequest, Faculty, Student

admin.site.register(Faculty)
admin.site.register(Student)
admin.site.register(Event)
admin.site.register(EventAttendance)
admin.site.register(ExemptionRequest)
admin.site.register(AuditLog)
