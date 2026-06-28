import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GridBackground } from '../components/layout/GridBackground'
import { Header } from '../components/layout/Header'
import { TrustBar } from '../components/layout/TrustBar'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'

interface LandingStats {
  students: number
  events: number
  xp_awarded: number
}

export function LandingPage() {
  const [stats, setStats] = useState<LandingStats>({ students: 0, events: 0, xp_awarded: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/landing-stats/')
        if (res.ok) {
          const data = (await res.json()) as LandingStats
          setStats(data)
        }
      } catch {
        // Keep the zero state if the API is unavailable.
      }
    }

    loadStats()
  }, [])

  return (
    <GridBackground>
      <Header />

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 md:pt-16">
        <div className="mb-8">
          <Badge variant="live">Live · Academic Year 2025-26</Badge>
        </div>

        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          Stop writing exams.
          <br />
          <span className="text-neon text-glow-neon">Start earning XP.</span>
        </h1>

        <p className="mb-10 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
          CampusXP replaces stale non-major papers with a real-time credit engine.
          Show up at hackathons, fests and workshops — faculty score it — the
          leaderboard moves.
        </p>

        <div className="mb-12 flex flex-wrap gap-4">
          <StatCard label="Students" value={stats.students.toLocaleString()} />
          <StatCard label="Events" value={stats.events.toString()} />
          <StatCard label="XP Awarded" value={stats.xp_awarded.toLocaleString()} highlight />
        </div>

        <Link to="/login">
          <Button size="lg" showArrow className="max-w-xs">
            Enter Gateway
          </Button>
        </Link>
      </main>

      <footer className="absolute bottom-0 left-0 right-0">
        <TrustBar />
      </footer>
    </GridBackground>
  )
}
