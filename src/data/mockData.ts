export type UserRole = 'student' | 'faculty'

export type EventLevel = import('../lib/engine').EventLevel
export type StudentRole = import('../lib/engine').StudentRole
export { POINT_MATRIX, calculateEventXp } from '../lib/engine'

export interface Student {
  id: string
  prn: string
  name: string
  department: 'BCOM' | 'BSC'
  avatar: string
  xp: number
  rank: number
  totalStudents: number
  eventsCompleted: number
  eventsRequired: number
  monthlyXp: number
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  department: 'BCOM' | 'BSC'
  xp: number
  isCurrentUser?: boolean
}

export interface ActivityEntry {
  id: string
  eventName: string
  date: string
  role: 'Participant' | 'Volunteer' | 'Lead' | 'Winner'
  points: number
  eventLevel: 'Local' | 'State' | 'National'
}

export interface ExemptionRequest {
  id: string
  studentName: string
  prn: string
  reason: string
  fileName: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export const PLATFORM_STATS = {
  students: 1200,
  events: 184,
  xpAwarded: '48.2K',
}

export const DEMO_STUDENT: Student = {
  id: 'stu-001',
  prn: 'BCOM2024042',
  name: 'Aarav Mehta',
  department: 'BCOM',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
  xp: 450,
  rank: 42,
  totalStudents: 1200,
  eventsCompleted: 3,
  eventsRequired: 5,
  monthlyXp: 120,
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 's1', name: 'Priya Sharma', department: 'BSC', xp: 920 },
  { rank: 2, id: 's2', name: 'Rahul Desai', department: 'BCOM', xp: 875 },
  { rank: 3, id: 's3', name: 'Sneha Patel', department: 'BSC', xp: 810 },
  { rank: 4, id: 's4', name: 'Vikram Singh', department: 'BCOM', xp: 780 },
  { rank: 5, id: 's5', name: 'Ananya Iyer', department: 'BSC', xp: 745 },
  { rank: 40, id: 's40', name: 'Karan Joshi', department: 'BCOM', xp: 465 },
  { rank: 41, id: 's41', name: 'Meera Nair', department: 'BSC', xp: 458 },
  { rank: 42, id: 'stu-001', name: 'Aarav Mehta', department: 'BCOM', xp: 450, isCurrentUser: true },
  { rank: 43, id: 's43', name: 'Dev Patel', department: 'BCOM', xp: 442 },
  { rank: 44, id: 's44', name: 'Isha Gupta', department: 'BSC', xp: 435 },
]

export const ACTIVITY_TIMELINE: ActivityEntry[] = [
  { id: 'a1', eventName: 'TechFest Hackathon 2025', date: '2025-03-15', role: 'Participant', points: 80, eventLevel: 'State' },
  { id: 'a2', eventName: 'Annual Cultural Fest', date: '2025-02-08', role: 'Volunteer', points: 50, eventLevel: 'Local' },
  { id: 'a3', eventName: 'AI Workshop Series', date: '2025-01-22', role: 'Lead', points: 120, eventLevel: 'National' },
  { id: 'a4', eventName: 'Inter-College Debate', date: '2024-12-10', role: 'Winner', points: 150, eventLevel: 'State' },
  { id: 'a5', eventName: 'Green Campus Drive', date: '2024-11-05', role: 'Volunteer', points: 50, eventLevel: 'Local' },
]

export const EXEMPTION_REQUESTS: ExemptionRequest[] = [
  { id: 'e1', studentName: 'Rohan Kapoor', prn: 'BSC2023089', reason: 'Medical leave — hospitalization', fileName: 'medical_cert_rohan.pdf', submittedAt: '2025-03-01', status: 'pending' },
  { id: 'e2', studentName: 'Neha Reddy', prn: 'BCOM2023156', reason: 'Official university representation', fileName: 'official_letter_neha.pdf', submittedAt: '2025-02-28', status: 'pending' },
  { id: 'e3', studentName: 'Arjun Malhotra', prn: 'BSC2024012', reason: 'Surgery recovery period', fileName: 'surgery_exemption.pdf', submittedAt: '2025-02-15', status: 'approved' },
]

export const DEMO_FACULTY = {
  id: 'fac-001',
  staffId: 'FAC-2024-089',
  name: 'Dr. Sunita Rao',
  department: 'Computer Applications',
}
