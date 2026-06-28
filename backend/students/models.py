from django.db import models
from django.contrib.auth.models import User


class StudentProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
	prn = models.CharField(max_length=32, unique=True)
	college_name = models.CharField(max_length=256, blank=True)
	total_xp = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.prn} — {self.user.get_full_name() or self.user.username}"
