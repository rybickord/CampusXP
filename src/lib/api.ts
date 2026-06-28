// In dev, Vite proxies /api → Django (see vite.config.ts). Override with VITE_API_URL if needed.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  } catch {
    return { ok: false, error: 'Network error' } as T
  }
}

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`)
    return res.json()
  } catch {
    return { ok: false, error: 'Network error' } as T
  }
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

export interface UploadRosterResponse {
  ok: boolean
  created: Array<{ prn: string; user: string; password: string }>
  errors: Array<{ row?: number; prn?: string; error: string }>
}

export const api = {
  googleLogin: (role: 'student' | 'faculty', credential: string) =>
    post<GoogleLoginResponse>('/api/auth/google/', { role, credential }),

  studentLogin: (prn: string, password: string) =>
    post<StudentLoginResponse>('/api/auth/student/', { prn, password }),

  facultyLogin: (staff_id: string, password: string) =>
    post<{ ok: boolean; role: 'faculty'; staff_id: string; name: string }>('/api/auth/faculty/', { staff_id, password }),

  facultySignup: (payload: {
    name: string
    email: string
    password: string
    college_name: string
  }) =>
    post<{ ok: boolean; role: 'faculty'; staff_id: string; name: string; email: string }>('/api/auth/faculty/signup/', payload),

  uploadRoster: async (formData: FormData): Promise<UploadRosterResponse> => {
    try {
      const res = await fetch(`${API_BASE}/api/faculty/upload-roster/`, {
        method: 'POST',
        body: formData,
      })
      return (await res.json()) as UploadRosterResponse
    } catch {
      return { ok: false, created: [], errors: [{ error: 'Network error' }] }
    }
  },

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
