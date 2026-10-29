import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-brand-400 text-ink-950 shadow-[0_18px_45px_-18px_rgba(16,185,129,0.75)] hover:from-brand-400 hover:to-brand-300',
  secondary:
    'glass-card text-slate-100 hover:bg-white/[0.08] hover:border-white/[0.16]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
  danger:
    'border border-rose-400/25 bg-rose-400/[0.08] text-rose-200 hover:bg-rose-400/[0.14]',
  outline:
    'border border-brand-400/35 text-brand-300 hover:bg-brand-400/[0.08] hover:border-brand-400/55',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-2xl px-3.5 text-xs',
  md: 'h-11 gap-2 rounded-2xl px-4.5 text-sm',
  lg: 'h-12 gap-2.5 rounded-2xl px-6 text-sm',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
