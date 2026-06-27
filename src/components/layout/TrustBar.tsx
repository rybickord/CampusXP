import { Shield } from 'lucide-react'

interface TrustBarProps {
  variant?: 'top' | 'bottom'
}

export function TrustBar({ variant = 'bottom' }: TrustBarProps) {
  const text =
    variant === 'top'
      ? 'Faculty-Verified · Zero Free-Form Marks · Audit-Logged'
      : 'All faculty actions are audit-logged · Students cannot self-award points'

  return (
    <div
      className={`flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 ${
        variant === 'top' ? 'border-b border-charcoal-200' : ''
      }`}
    >
      <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />
      <span className="text-center">{text}</span>
    </div>
  )
}
