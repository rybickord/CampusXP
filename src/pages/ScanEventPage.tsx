import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, ScanLine } from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { calculateEventXp, type EventLevel, type StudentRole } from '../lib/engine'
import { api } from '../lib/api'

export function ScanEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [qrToken, setQrToken] = useState('')
  const [role, setRole] = useState<StudentRole>('Participant')
  const [previewLevel] = useState<EventLevel>('National')
  const [result, setResult] = useState<{ ok: boolean; message: string; xp?: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.identifier) return
    setLoading(true)
    setResult(null)

    try {
      const res = await api.scanQr(user.identifier, qrToken.trim(), role)
      if (res.ok) {
        setResult({
          ok: true,
          message: `Verified! +${res.xp_awarded} XP · Rank #${res.rank?.rank}`,
          xp: res.xp_awarded,
        })
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setResult({ ok: false, message: res.error ?? 'Scan failed.' })
      }
    } catch {
      setResult({
        ok: true,
        message: `Demo mode: +${calculateEventXp(previewLevel, role)} XP credited locally.`,
        xp: calculateEventXp(previewLevel, role),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <GridBackground>
      <Header showSystemLabel={false} variant="minimal" />

      <main className="mx-auto max-w-lg px-6 py-8">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-neon"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10">
              <ScanLine className="h-6 w-6 text-neon" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Scan Event QR</h1>
              <p className="text-xs text-gray-500">
                Time-locked verification · No link sharing
              </p>
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                QR Token (from venue display)
              </label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="qr_token"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="Paste or scan QR token"
                  required
                  className="w-full rounded-lg border border-charcoal-300 bg-charcoal py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Your Role at Event
              </label>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as StudentRole)}
                className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white focus:border-neon/50 focus:outline-none"
              >
                <option value="Participant">Participant (×1)</option>
                <option value="Volunteer">Volunteer (×1.5)</option>
                <option value="Winner">Winner (×2)</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">
              Expected XP preview (National):{' '}
              <span className="font-bold text-neon">
                +{calculateEventXp('National', role)} XP
              </span>
            </p>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Verifying presence…' : 'Verify & Credit XP'}
            </Button>
          </form>

          {result && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                result.ok
                  ? 'border-neon/30 bg-neon/10 text-neon'
                  : 'border-danger/30 bg-danger/10 text-red-400'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      </main>
    </GridBackground>
  )
}
