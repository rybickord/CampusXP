interface GridBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function GridBackground({ children, className = '' }: GridBackgroundProps) {
  return (
    <div className={`relative min-h-screen bg-charcoal grid-bg ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-charcoal/80" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
