const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  return res.json()
}

export interface StudentLoginResponse {
  ok: boolean
  role: 'student'
  prn: string
  name: string
  total_xp: number
  events_count: number
  events_required: number
  danger_zone: { is_safe: boolean; label: string }
  rank: number
  total_students: number
}

export interface CreateEventResponse {
  ok: boolean
  event_id: number
  name: string
  base_xp: number
  qr_token: string
  qr_image_base64: string
  sample_xp: Record<string, number>
}

export interface ScanResponse {
  ok: boolean
  xp_awarded?: number
  total_xp?: number
  events_count?: number
  error?: string
  danger_zone?: { is_safe: boolean; label: string; events_required: number }
  rank?: { rank: number; total_students: number }
}

export interface GoogleLoginResponse {
  ok: boolean
  role: 'student' | 'faculty'
  name: string
  email: string
  picture?: string
  prn?: string
  staff_id?: string
  total_xp?: number
  events_count?: number
  events_required?: number
  danger_zone?: { is_safe: boolean; label: string }
  rank?: number
  total_students?: number
  error?: string
}

export const api = {
  googleLogin: (role: 'student' | 'faculty', credential: string) =>
    post<GoogleLoginResponse>('/api/auth/google/', { role, credential }),

  studentLogin: (prn: string) =>
    post<StudentLoginResponse>('/api/auth/student/', { prn }),

  facultyLogin: (staff_id: string) =>
    post<{ ok: boolean; role: 'faculty'; staff_id: string; name: string }>('/api/auth/faculty/', { staff_id }),

  createEvent: (payload: {
    staff_id: string
    name: string
    date: string
    category: string
    event_level: string
    start_time?: string
    end_time?: string
  }) => post<CreateEventResponse>('/api/events/create/', payload),

  scanQr: (prn: string, qr_token: string, role: string) =>
    post<ScanResponse>('/api/events/scan/', { prn, qr_token, role }),

  marksheet: () => get<{ ok: boolean; csv: string }>('/api/reports/marksheet/'),
}
