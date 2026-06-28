import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, Shield } from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { TrustBar } from '../components/layout/TrustBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../data/mockData'

export function LoginPage() {
  const [portal, setPortal] = useState<UserRole>('student')
  const [showFacultySignup, setShowFacultySignup] = useState(false)
  const [prn, setPrn] = useState('')
  const [staffId, setStaffId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const goToPortal = (role: UserRole) => {
    navigate(role === 'student' ? '/dashboard' : '/faculty')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (portal === 'faculty' && showFacultySignup) {
        const ok = await signup(name, email, password, collegeName)
        if (ok) {
          goToPortal('faculty')
        } else {
          setError('Faculty signup failed. Check your inputs and try again.')
        }
      } else {
        const identifier = portal === 'student' ? prn : staffId
        const ok = await login(portal, identifier, password)
        if (ok) {
          goToPortal(portal)
        } else {
          setError('Invalid credentials. Check your ID and try again.')
        }
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
            ) : showFacultySignup ? (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={submitting}
                    className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@college.edu"
                    required
                    disabled={submitting}
                    className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="college_name"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                  >
                    College Name
                  </label>
                  <input
                    type="text"
                    id="college_name"
                    name="college_name"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Enter your college name"
                    required
                    disabled={submitting}
                    className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
                  />
                </div>
              </>
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
                required
                disabled={submitting}
                className="w-full rounded-lg border border-charcoal-300 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30 disabled:opacity-50"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" size="lg" showArrow disabled={submitting}>
              {portal === 'faculty' && showFacultySignup ? 'Create Faculty Account' : 'Enter Dashboard'}
            </Button>
          </form>

          {portal === 'faculty' && (
            <div className="mt-4 text-center text-xs text-gray-400">
              {showFacultySignup ? (
                <button
                  type="button"
                  onClick={() => setShowFacultySignup(false)}
                  className="font-semibold text-neon hover:text-white"
                >
                  Already have an account? Log in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFacultySignup(true)}
                  className="font-semibold text-neon hover:text-white"
                >
                  New faculty? Sign up here
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <TrustBar variant="bottom" />
    </GridBackground>
  )
}
