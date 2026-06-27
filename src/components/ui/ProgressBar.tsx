interface ProgressBarProps {
  current: number
  total: number
  label?: string
  dangerThreshold?: number
}

export function ProgressBar({
  current,
  total,
  label,
  dangerThreshold,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  const isDanger = dangerThreshold !== undefined && current < dangerThreshold
  const isComplete = current >= total

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </span>
          <span
            className={`text-sm font-bold tabular-nums ${
              isComplete ? 'text-neon' : isDanger ? 'text-red-400' : 'text-gray-300'
            }`}
          >
            {current}/{total}
          </span>
        </div>
      )}
      <div
        className={`h-3 w-full overflow-hidden rounded-full border bg-charcoal-100 ${
          isDanger
            ? 'border-danger/60 animate-pulse-danger'
            : isComplete
              ? 'border-neon/40'
              : 'border-charcoal-300'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isComplete
              ? 'bg-neon shadow-neon-sm'
              : isDanger
                ? 'bg-gradient-to-r from-danger-dark to-danger'
                : 'bg-gradient-to-r from-gray-600 to-gray-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
