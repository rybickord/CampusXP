import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { GraduationCap, Lock, Shield } from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { TrustBar } from '../components/layout/TrustBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../data/mockData'

export function LoginPage() {
  const [portal, setPortal] = useState<UserRole>('student')
  const [prn, setPrn] = useState('')
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const goToPortal = (role: UserRole) => {
    navigate(role === 'student' ? '/dashboard' : '/faculty')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const identifier = portal === 'student' ? prn : staffId
    try {
      const ok = await login(portal, identifier, password)
      if (ok) {
        goToPortal(portal)
      } else {
        setError('Invalid credentials. Check your ID and try again.')
      }
    } catch {
      setError('Could not reach the server. Start the Django backend and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google sign-in failed. Please try again.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const ok = await loginWithGoogle(portal, response.credential)
      if (ok) {
        goToPortal(portal)
      } else {
        setError('Google sign-in failed. Check that OAuth is configured on the server.')
      }
    } catch {
      setError('Could not reach the server. Start the Django backend and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GridBackground className="flex flex-col">
      <TrustBar variant="top" />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-charcoal-300 bg-charcoal-50/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                CampusXP Gateway
              </p>
              <h1 className="text-2xl font-bold text-white">Choose your portal</h1>
            </div>
            <Lock className="h-5 w-5 text-gray-500" />
          </div>

          <div className="mb-6 flex rounded-lg border border-charcoal-300 bg-charcoal p-1">
            <button
              type="button"
              onClick={() => setPortal('student')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
                portal === 'student'
                  ? 'bg-neon text-charcoal shadow-neon-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setPortal('faculty')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
                portal === 'faculty'
                  ? 'bg-neon text-charcoal shadow-neon-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Shield className="h-4 w-4" />
              Faculty Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {portal === 'student' ? (
              <div>
                <label
                  htmlFor="prn"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                >
                  University ID / PRN
                </label>
                <input
                  type="text"
                  id="prn"
                  name="prn"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  placeholder="e.g. BCOM2024042"
                  required
                  disabled={submitting}
                  className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="staff_id"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                >
                  Verified Staff ID
                </label>
                <input
                  type="text"
                  id="staff_id"
                  name="staff_id"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter Staff ID"
                  required
                  disabled={submitting}
                  className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" size="lg" showArrow disabled={submitting}>
              Enter Dashboard
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-charcoal-50/80 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                or sign in with
              </span>
            </div>
          </div>

          {clientId ? (
            <div className={`flex justify-center ${submitting ? 'pointer-events-none opacity-50' : ''}`}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="pill"
                width="320"
              />
            </div>
          ) : (
            <p className="text-center text-[11px] text-gray-500">
              Google sign-in unavailable — add{' '}
              <code className="text-gray-400">VITE_GOOGLE_CLIENT_ID</code> to <code className="text-gray-400">.env</code>
            </p>
          )}
        </div>
      </div>

      <TrustBar variant="bottom" />
    </GridBackground>
  )
}
