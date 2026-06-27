export type EventLevel = 'Local' | 'State' | 'National'
export type StudentRole = 'Volunteer' | 'Participant' | 'Winner'

/** Locked weights — faculty cannot override */
export const LEVEL_BASE_XP: Record<EventLevel, number> = {
  Local: 20,
  State: 50,
  National: 100,
}

export const ROLE_MULTIPLIER: Record<StudentRole, number> = {
  Participant: 1,
  Volunteer: 1.5,
  Winner: 2,
}

export const DEFAULT_EVENTS_REQUIRED = 5
export const MAX_XP_CEILING = 1000

/** National Winner = 100 × 2 = 200 XP */
export function calculateEventXp(level: EventLevel, role: StudentRole): number {
  const raw = LEVEL_BASE_XP[level] * ROLE_MULTIPLIER[role]
  return Math.min(Math.round(raw), MAX_XP_CEILING)
}

export function evaluateDangerZone(eventsCount: number, eventsRequired = DEFAULT_EVENTS_REQUIRED) {
  const isSafe = eventsCount >= eventsRequired
  const deficit = Math.max(0, eventsRequired - eventsCount)
  return {
    isSafe,
    label: isSafe ? 'Safe' : 'Danger Zone',
    eventsCount,
    eventsRequired,
    penaltyReduction: isSafe ? 0 : deficit * 5,
  }
}

export function finalScoreWithFloor(baseScore: number, penalty: number): number {
  return Math.max(0, baseScore - penalty)
}

export function mapXpToGrade(totalXp: number): string {
  if (totalXp >= 500) return 'O'
  if (totalXp >= 400) return 'A+'
  if (totalXp >= 300) return 'A'
  if (totalXp >= 200) return 'B+'
  if (totalXp >= 100) return 'B'
  if (totalXp >= 50) return 'C'
  if (totalXp >= 1) return 'D'
  return 'F'
}

/** @deprecated use calculateEventXp — kept for matrix preview tables */
export const POINT_MATRIX: Record<EventLevel, Record<StudentRole, number>> = {
  Local: {
    Participant: calculateEventXp('Local', 'Participant'),
    Volunteer: calculateEventXp('Local', 'Volunteer'),
    Winner: calculateEventXp('Local', 'Winner'),
  },
  State: {
    Participant: calculateEventXp('State', 'Participant'),
    Volunteer: calculateEventXp('State', 'Volunteer'),
    Winner: calculateEventXp('State', 'Winner'),
  },
  National: {
    Participant: calculateEventXp('National', 'Participant'),
    Volunteer: calculateEventXp('National', 'Volunteer'),
    Winner: calculateEventXp('National', 'Winner'),
  },
}
