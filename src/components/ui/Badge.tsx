interface BadgeProps {
  children: React.ReactNode
  variant?: 'live' | 'danger' | 'success' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const styles = {
    live: 'border-neon/50 text-neon bg-neon/5',
    danger: 'border-danger/50 text-red-400 bg-danger/10',
    success: 'border-neon/50 text-neon bg-neon/10',
    neutral: 'border-charcoal-300 text-gray-400 bg-charcoal-50',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {variant === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
      )}
      {children}
    </span>
  )
}
