import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { GraduationCap, Lock, Shield } from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { TrustBar } from '../components/layout/TrustBar'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../data/mockData'

export function LoginPage() {
  const [portal, setPortal] = useState<UserRole>('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

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
        navigate(portal === 'student' ? '/dashboard' : '/faculty')
      } else {
        setError('Sign-in failed. Check that the backend is running and Google OAuth is configured.')
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

          <div className="mb-8 flex rounded-lg border border-charcoal-300 bg-charcoal p-1">
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

          <div className="space-y-4">
            <p className="text-center text-sm text-gray-400">
              Sign in with your institutional Google account to access the{' '}
              {portal === 'student' ? 'student dashboard' : 'faculty portal'}.
            </p>

            {!clientId ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                Missing <code className="text-red-200">VITE_GOOGLE_CLIENT_ID</code>. Copy{' '}
                <code className="text-red-200">.env.example</code> to <code className="text-red-200">.env</code>{' '}
                and add your Google OAuth client ID.
              </p>
            ) : (
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
            )}

            {error && <p className="text-center text-xs text-red-400">{error}</p>}
          </div>
        </div>
      </div>

      <TrustBar variant="bottom" />
    </GridBackground>
  )
}
