interface StatCardProps {
  label: string
  value: string | number
  highlight?: boolean
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="rounded-lg border border-charcoal-300 bg-charcoal-50/50 px-6 py-5 min-w-[140px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">
        {label}
      </p>
      <p
        className={`text-3xl font-bold tabular-nums ${
          highlight ? 'text-neon text-glow-neon' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
