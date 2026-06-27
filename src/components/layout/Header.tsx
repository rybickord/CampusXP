import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  showSystemLabel?: boolean
  variant?: 'landing' | 'minimal'
}

export function Header({ showSystemLabel = true, variant = 'landing' }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neon">
          <Zap className="h-5 w-5 text-charcoal" fill="currentColor" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white group-hover:text-neon transition-colors">
          CampusXP
        </span>
        {variant === 'landing' && (
          <span className="hidden sm:inline rounded-full border border-charcoal-300 bg-charcoal-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            v0.1 · Phase 1
          </span>
        )}
      </Link>
      {showSystemLabel && (
        <p className="hidden md:block text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
          Real-Time Activity Credit System
        </p>
      )}
    </header>
  )
}
