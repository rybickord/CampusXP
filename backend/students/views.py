import io
import pandas as pd

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError, transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import StudentProfile
from core.models import Faculty, Student as CoreStudent


@api_view(['POST'])
def upload_roster(request):
	"""Accepts a file upload (CSV or Excel) and creates User + StudentProfile records.

	Expects multipart/form-data with 'file' and 'staff_id' fields.
	"""
	staff_id = request.POST.get('staff_id') or request.data.get('staff_id')
	if not staff_id:
		return Response({'ok': False, 'error': 'staff_id required'}, status=status.HTTP_400_BAD_REQUEST)

	faculty = Faculty.objects.filter(staff_id=staff_id).first()
	if not faculty:
		return Response({'ok': False, 'error': 'unknown faculty'}, status=status.HTTP_403_FORBIDDEN)

	upload = request.FILES.get('file')
	if not upload:
		return Response({'ok': False, 'error': 'file required'}, status=status.HTTP_400_BAD_REQUEST)

	# Read file into DataFrame
	try:
		if upload.name.lower().endswith('.csv'):
			df = pd.read_csv(upload)
		else:
			# openpyxl engine for xlsx
			df = pd.read_excel(upload, engine='openpyxl')
	except Exception as exc:
		return Response({'ok': False, 'error': f'could not parse file: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

	created = []
	errors = []
	for idx, row in df.iterrows():
		name = str(row.get('Name') or row.get('name') or '').strip()
		prn = str(row.get('PRN') or row.get('prn') or '').strip()
		email = str(row.get('Email') or row.get('email') or '').strip()

		if not prn:
			errors.append({'row': int(idx), 'error': 'missing prn'})
			continue

		username = prn
		password = User.objects.make_random_password()
		try:
			with transaction.atomic():
				user = User.objects.create(
					username=username,
					first_name=(name.split(' ')[0] if name else ''),
					last_name=(' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else ''),
					email=email or '',
					password=make_password(password),
				)
				profile = StudentProfile.objects.create(
					user=user,
					prn=prn,
					college_name=request.POST.get('college_name', ''),
					total_xp=0,
				)

				# Also ensure legacy core.Student record exists for compatibility
				CoreStudent.objects.get_or_create(
					prn=prn,
					defaults={
						'name': name or user.get_full_name() or username,
						'email': email or '',
						'department': request.POST.get('department', 'BCOM'),
						'total_xp': 0,
						'events_count': 0,
						'events_required': 5,
					},
				)

				created.append({'prn': prn, 'user': user.username, 'password': password})
		except IntegrityError:
			errors.append({'row': int(idx), 'prn': prn, 'error': 'duplicate prn or username'})

	return Response({'ok': True, 'created': created, 'errors': errors})
