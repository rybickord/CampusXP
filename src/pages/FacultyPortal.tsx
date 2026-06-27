import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  Download,
  LogOut,
  PlusCircle,
  QrCode,
  Shield,
  XCircle,
} from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { Header } from '../components/layout/Header'
import { TrustBar } from '../components/layout/TrustBar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { EXEMPTION_REQUESTS, DEMO_FACULTY, type ExemptionRequest } from '../data/mockData'
import {
  calculateEventXp,
  LEVEL_BASE_XP,
  POINT_MATRIX,
  ROLE_MULTIPLIER,
  type EventLevel,
  type StudentRole,
} from '../lib/engine'
import { api } from '../lib/api'

type Tab = 'events' | 'exemptions' | 'reports'

export function FacultyPortal() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const faculty = {
    ...DEMO_FACULTY,
    name: user?.name ?? DEMO_FACULTY.name,
    staffId: user?.identifier ?? DEMO_FACULTY.staffId,
  }
  const [tab, setTab] = useState<Tab>('events')

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [category, setCategory] = useState('Hackathon')
  const [eventLevel, setEventLevel] = useState<EventLevel>('National')
  const [previewRole, setPreviewRole] = useState<StudentRole>('Winner')
  const [qrData, setQrData] = useState<{ image: string; token: string } | null>(null)
  const [creating, setCreating] = useState(false)

  const [exemptions, setExemptions] = useState(EXEMPTION_REQUESTS)

  const previewXp = useMemo(
    () => calculateEventXp(eventLevel, previewRole),
    [eventLevel, previewRole]
  )

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await api.createEvent({
        staff_id: user?.identifier ?? faculty.staffId,
        name: eventName,
        date: eventDate,
        category,
        event_level: eventLevel,
      })
      if (res.ok) {
        setQrData({ image: res.qr_image_base64, token: res.qr_token })
      }
    } catch {
      setQrData({
        image: '',
        token: `demo-${Date.now()}`,
      })
    } finally {
      setCreating(false)
    }
  }

  const handleExemption = (id: string, action: 'approved' | 'rejected') => {
    setExemptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: action,
              ...(action === 'approved' ? { frozenThreshold: 3 } : {}),
            }
          : e
      )
    )
  }

  const handleMarksheet = async () => {
    try {
      const res = await api.marksheet()
      const blob = new Blob([res.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'campusxp_marksheet.csv'
      a.click()
    } catch {
      alert('Connect Django backend at localhost:8000 for live marksheet export.')
    }
  }

  return (
    <GridBackground>
      <Header showSystemLabel={false} variant="minimal" />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="neutral">Faculty Admin · Audit-Logged</Badge>
            <h1 className="mt-2 text-2xl font-bold text-white">{faculty.name}</h1>
            <p className="text-sm text-gray-400">
              {faculty.staffId} · {faculty.department}
            </p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-2 self-start text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="mb-6 flex rounded-lg border border-charcoal-300 bg-charcoal p-1">
          {(
            [
              ['events', 'Event Setup'],
              ['exemptions', 'Exemptions'],
              ['reports', 'Term-End Report'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === key ? 'bg-neon text-charcoal' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'events' && (
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <PlusCircle className="h-5 w-5 text-neon" />
                <div>
                  <h2 className="text-lg font-bold text-white">Phase A — Event Creation</h2>
                  <p className="text-xs text-gray-500">Locked weights · Auto QR generation</p>
                </div>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <Field label="Event Name">
                  <input
                    name="name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="National Hackathon 2026"
                    required
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date">
                    <input
                      name="date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputCls}
                    >
                      <option>Hackathon</option>
                      <option>Fest</option>
                      <option>Workshop</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
                <Field label="Event Level (Base XP)">
                  <select
                    name="event_level"
                    value={eventLevel}
                    onChange={(e) => setEventLevel(e.target.value as EventLevel)}
                    className={inputCls}
                  >
                    <option value="Local">Local (+20 XP)</option>
                    <option value="State">State (+50 XP)</option>
                    <option value="National">National (+100 XP)</option>
                  </select>
                </Field>
                <Field label="Preview Role Multiplier">
                  <select
                    value={previewRole}
                    onChange={(e) => setPreviewRole(e.target.value as StudentRole)}
                    className={inputCls}
                  >
                    <option value="Participant">Participant (×1)</option>
                    <option value="Volunteer">Volunteer (×1.5)</option>
                    <option value="Winner">Winner (×2)</option>
                  </select>
                </Field>

                <div className="rounded-xl border border-charcoal-300 bg-charcoal p-4 text-xs">
                  <p className="mb-2 font-semibold uppercase tracking-wider text-gray-500">
                    Locked Matrix
                  </p>
                  <p className="text-gray-400">
                    {eventLevel} base {LEVEL_BASE_XP[eventLevel]} ×{' '}
                    {ROLE_MULTIPLIER[previewRole]} ={' '}
                    <span className="font-bold text-neon">{previewXp} XP</span>
                  </p>
                </div>

                <Button type="submit" size="lg" disabled={creating}>
                  {creating ? 'Generating QR…' : 'Create Event & Generate QR'}
                </Button>
              </form>
            </section>

            <section className="rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-bold text-white">Dynamic Event QR</h2>
              </div>
              {qrData ? (
                <div className="text-center">
                  {qrData.image && (
                    <img
                      src={`data:image/png;base64,${qrData.image}`}
                      alt="Event QR Code"
                      className="mx-auto mb-4 rounded-lg border border-charcoal-300"
                      width={200}
                      height={200}
                    />
                  )}
                  <p className="mb-2 text-xs text-gray-500">Secure token (day-locked)</p>
                  <code className="block break-all rounded-lg bg-charcoal p-3 text-xs text-neon">
                    {qrData.token}
                  </code>
                  <p className="mt-4 text-xs text-gray-500">
                    Students scan via mobile web → time/venue verified → XP credited
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Create an event to generate a secure QR code for venue check-in.
                </p>
              )}

              <div className="mt-8 rounded-xl border border-charcoal-300 bg-charcoal p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-[10px] font-semibold uppercase text-gray-500">
                    Full Matrix Reference
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                  {(['Local', 'State', 'National'] as EventLevel[]).map((level) => (
                    <div key={level}>
                      <p className="mb-1 font-semibold">{level}</p>
                      {(['Participant', 'Volunteer', 'Winner'] as StudentRole[]).map((role) => (
                        <p key={role} className="tabular-nums">
                          {POINT_MATRIX[level][role]}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'exemptions' && (
          <section className="rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6 md:p-8">
            <h2 className="mb-2 text-lg font-bold text-white">Exemption Portal</h2>
            <p className="mb-6 text-xs text-gray-500">
              Approve to freeze requirement (5 → 3 events) — no fake XP awarded
            </p>
            <div className="space-y-4">
              {exemptions.map((req) => (
                <ExemptionCard key={req.id} request={req} onAction={handleExemption} />
              ))}
            </div>
          </section>
        )}

        {tab === 'reports' && (
          <section className="rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6 md:p-8">
            <h2 className="mb-2 text-lg font-bold text-white">Phase D — Term-End Report</h2>
            <p className="mb-6 text-sm text-gray-400">
              Locks student records, applies max(0, final_score) floor, maps XP → grade scale,
              exports CSV for Mumbai University marks coordinator.
            </p>
            <Button onClick={handleMarksheet} showArrow>
              <Download className="h-4 w-4" />
              One-Click Marksheet (CSV)
            </Button>
          </section>
        )}
      </main>

      <footer>
        <TrustBar />
      </footer>
    </GridBackground>
  )
}

const inputCls =
  'w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white focus:border-neon/50 focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {children}
    </div>
  )
}

function ExemptionCard({
  request,
  onAction,
}: {
  request: ExemptionRequest & { frozenThreshold?: number }
  onAction: (id: string, action: 'approved' | 'rejected') => void
}) {
  const statusStyles = {
    pending: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    approved: 'border-neon/30 bg-neon/5 text-neon',
    rejected: 'border-danger/30 bg-danger/5 text-red-400',
  }

  return (
    <div className="rounded-xl border border-charcoal-300 bg-charcoal p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{request.studentName}</p>
          <p className="text-xs text-gray-500">{request.prn}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[request.status]}`}
        >
          {request.status}
        </span>
      </div>
      <p className="mb-2 text-sm text-gray-400">{request.reason}</p>
      {request.status === 'approved' && request.frozenThreshold && (
        <p className="mb-2 text-xs text-neon">
          Threshold frozen: 5 → {request.frozenThreshold} events required
        </p>
      )}
      {request.status === 'pending' && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onAction(request.id, 'approved')}>
            <CheckCircle className="h-3.5 w-3.5" />
            Approve & Freeze (→3)
          </Button>
          <Button size="sm" variant="danger" className="flex-1" onClick={() => onAction(request.id, 'rejected')}>
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}
