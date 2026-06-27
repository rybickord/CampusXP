import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Calendar,
  LogOut,
  Medal,
  QrCode,
  Trophy,
  User,
} from 'lucide-react'
import { GridBackground } from '../components/layout/GridBackground'
import { Header } from '../components/layout/Header'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAuth } from '../context/AuthContext'
import {
  ACTIVITY_TIMELINE,
  DEMO_STUDENT,
  LEADERBOARD,
  type LeaderboardEntry,
} from '../data/mockData'

type LeaderboardFilter = 'global' | 'department' | 'monthly'

export function StudentDashboard() {
  const { logout } = useAuth()
  const student = DEMO_STUDENT
  const [filter, setFilter] = useState<LeaderboardFilter>('global')

  const isInDanger = student.eventsCompleted < student.eventsRequired

  const filteredLeaderboard = useMemo(() => {
    let entries = [...LEADERBOARD]
    if (filter === 'department') {
      entries = entries.filter((e) => e.department === student.department)
      entries = entries.map((e, i) => ({ ...e, rank: i + 1 }))
    }
    if (filter === 'monthly') {
      entries = [...entries]
        .sort((a, b) => b.xp * 0.3 - a.xp * 0.3)
        .map((e, i) => ({ ...e, rank: i + 1 }))
    }
    return entries
  }, [filter, student.department])

  const userEntry = filteredLeaderboard.find((e) => e.isCurrentUser)
  const topEntries = filteredLeaderboard.filter((e) => e.rank <= 5)
  const pinContext = filteredLeaderboard.filter(
    (e) => e.isCurrentUser || (userEntry && Math.abs(e.rank - userEntry.rank) <= 1)
  )

  return (
    <GridBackground>
      <Header showSystemLabel={false} variant="minimal" />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-4 md:px-10">
        {/* Hero Section */}
        <section className="mb-8 rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={student.avatar}
                alt={student.name}
                className="h-20 w-20 rounded-xl border-2 border-charcoal-300 bg-charcoal object-cover"
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Student Profile
                </p>
                <h1 className="text-2xl font-bold text-white">{student.name}</h1>
                <p className="text-sm text-gray-400">
                  {student.prn} · {student.department}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="rounded-xl border border-charcoal-300 bg-charcoal px-6 py-4 text-center min-w-[120px]">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-gray-500">
                  <Medal className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Global Rank
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  #{student.rank}
                  <span className="text-sm font-normal text-gray-500">
                    {' '}
                    of {student.totalStudents.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-neon/30 bg-neon/5 px-6 py-4 text-center min-w-[120px] shadow-neon-sm">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-neon">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Total XP
                  </span>
                </div>
                <p className="text-3xl font-bold text-neon text-glow-neon tabular-nums">
                  {student.xp}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section
          className={`mb-8 rounded-2xl border p-6 md:p-8 transition-all ${
            isInDanger
              ? 'border-danger/50 bg-danger/5 shadow-danger'
              : 'border-neon/30 bg-neon/5'
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle
              className={`h-5 w-5 ${isInDanger ? 'text-red-400' : 'text-neon'}`}
            />
            <div>
              <h2
                className={`text-lg font-bold ${isInDanger ? 'text-red-400' : 'text-neon'}`}
              >
                {isInDanger ? 'Danger Zone — Action Required' : 'Requirement Met ✓'}
              </h2>
              <p className="text-sm text-gray-400">
                {isInDanger
                  ? 'Complete 5 campus events before end of semester to avoid academic penalty.'
                  : 'You have met the minimum event participation requirement.'}
              </p>
            </div>
            <Badge variant={isInDanger ? 'danger' : 'success'} className="ml-auto shrink-0">
              {isInDanger ? 'Critical' : 'Safe'}
            </Badge>
          </div>
          <ProgressBar
            current={student.eventsCompleted}
            total={student.eventsRequired}
            label="Events Completed"
            dangerThreshold={student.eventsRequired}
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Leaderboard */}
          <section className="lg:col-span-3 rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Trophy className="h-5 w-5 text-neon" />
                Leaderboard
              </h2>
              <div className="flex rounded-lg border border-charcoal-300 bg-charcoal p-0.5">
                {(
                  [
                    ['global', 'Global'],
                    ['department', student.department],
                    ['monthly', 'Monthly'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                      filter === key
                        ? 'bg-neon text-charcoal'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-300 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pr-4">Rank</th>
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Dept</th>
                    <th className="pb-3 text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {topEntries.map((entry) => (
                    <LeaderboardRow key={entry.id} entry={entry} />
                  ))}
                  {userEntry && userEntry.rank > 5 && (
                    <>
                      <tr>
                        <td colSpan={4} className="py-2 text-center text-gray-600">
                          ···
                        </td>
                      </tr>
                      {pinContext.map((entry) => (
                        <LeaderboardRow key={entry.id} entry={entry} pinned />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Activity Timeline */}
          <section className="lg:col-span-2 rounded-2xl border border-charcoal-300 bg-charcoal-50/60 p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
              <Calendar className="h-5 w-5 text-neon" />
              Activity Timeline
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-300 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pr-3">Event</th>
                    <th className="pb-3 pr-3">Date</th>
                    <th className="pb-3 pr-3">Role</th>
                    <th className="pb-3 text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIVITY_TIMELINE.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-charcoal-200/50 hover:bg-charcoal/40 transition-colors"
                    >
                      <td className="py-3 pr-3 font-medium text-white max-w-[140px] truncate">
                        {activity.eventName}
                      </td>
                      <td className="py-3 pr-3 text-gray-400 tabular-nums whitespace-nowrap">
                        {activity.date}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded border border-charcoal-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-400">
                          {activity.role}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-neon tabular-nums">
                        +{activity.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-lg border border-neon/30 bg-neon/5 px-4 py-2 text-sm font-semibold text-neon hover:bg-neon/10 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            Scan Event QR
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </main>
    </GridBackground>
  )
}

function LeaderboardRow({
  entry,
  pinned = false,
}: {
  entry: LeaderboardEntry
  pinned?: boolean
}) {
  return (
    <tr
      className={`border-b border-charcoal-200/50 transition-colors ${
        entry.isCurrentUser
          ? 'bg-neon/10 border-l-2 border-l-neon'
          : pinned
            ? 'bg-charcoal/30'
            : 'hover:bg-charcoal/40'
      }`}
    >
      <td className="py-3 pr-4">
        <span
          className={`font-bold tabular-nums ${
            entry.rank <= 3 ? 'text-neon' : 'text-gray-300'
          }`}
        >
          #{entry.rank}
        </span>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          {entry.isCurrentUser && <User className="h-3.5 w-3.5 text-neon shrink-0" />}
          <span className={entry.isCurrentUser ? 'font-bold text-neon' : 'text-white'}>
            {entry.name}
            {entry.isCurrentUser && (
              <span className="ml-1.5 text-[10px] uppercase text-neon/70">You</span>
            )}
          </span>
        </div>
      </td>
      <td className="py-3 pr-4 text-gray-500">{entry.department}</td>
      <td className="py-3 text-right font-semibold tabular-nums text-white">
        {entry.xp}
      </td>
    </tr>
  )
}
