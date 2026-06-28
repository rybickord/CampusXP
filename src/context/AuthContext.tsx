import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { UserRole } from '../data/mockData'

export interface AuthUser {
  role: UserRole
  id: string
  name: string
  identifier: string
  email?: string
  picture?: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (role: UserRole, identifier: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, collegeName: string) => Promise<boolean>
  loginWithGoogle: (role: UserRole, credential: string) => Promise<boolean>
  logout: () => void
}

const STORAGE_KEY = 'campusxp_auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(loadStoredUser())
    setLoading(false)
  }, [])

  const persistUser = (next: AuthUser) => {
    setUser(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const login = async (role: UserRole, identifier: string, password: string) => {
    const id = identifier.trim()
    const pass = password.trim()
    if (!id || !pass) return false

    if (role === 'student') {
      const res = await api.studentLogin(id, pass)
      if (!res.ok) return false
      persistUser({
        role: 'student',
        id: res.prn,
        name: res.name,
        identifier: res.prn,
      })
    } else {
      const res = await api.facultyLogin(id, pass)
      if (!res.ok) return false
      persistUser({
        role: 'faculty',
        id: res.staff_id,
        name: res.name,
        identifier: res.staff_id,
      })
    }
    return true
  }

  const signup = async (name: string, email: string, password: string, collegeName: string) => {
    const res = await api.facultySignup({ name, email, password, college_name: collegeName })
    if (!res.ok) return false
    persistUser({
      role: 'faculty',
      id: res.staff_id,
      name: res.name,
      identifier: res.staff_id,
      email: res.email,
    })
    return true
  }

  const loginWithGoogle = async (role: UserRole, credential: string) => {
    const res = await api.googleLogin(role, credential)
    if (!res.ok) return false

    if (res.role === 'student') {
      if (!res.prn) return false
      persistUser({
        role: 'student',
        id: res.prn,
        name: res.name,
        identifier: res.prn,
        email: res.email,
        picture: res.picture,
      })
    } else {
      if (!res.staff_id) return false
      persistUser({
        role: 'faculty',
        id: res.staff_id,
        name: res.name,
        identifier: res.staff_id,
        email: res.email,
        picture: res.picture,
      })
    }
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
