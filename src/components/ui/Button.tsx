import { ArrowRight } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showArrow?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-neon text-charcoal font-bold hover:bg-neon-dim shadow-neon-sm hover:shadow-neon',
    secondary:
      'border border-charcoal-300 bg-charcoal-50 text-gray-300 hover:border-gray-500 hover:text-white',
    ghost: 'text-gray-400 hover:text-neon uppercase tracking-wider text-xs font-semibold',
    danger:
      'bg-danger text-white font-bold hover:bg-red-700 shadow-danger',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3.5 text-sm rounded-lg w-full',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className="h-4 w-4" />}
    </button>
  )
}
