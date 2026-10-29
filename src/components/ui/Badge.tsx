import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type BadgeVariant =
  | 'neutral'
  | 'brand'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'outline'

const variants: Record<BadgeVariant, string> = {
  neutral: 'border-white/10 bg-white/[0.04] text-slate-300',
  brand: 'border-brand-400/30 bg-brand-400/[0.09] text-brand-300',
  warning: 'border-amber-400/30 bg-amber-400/[0.09] text-amber-300',
  danger: 'border-rose-400/30 bg-rose-400/[0.09] text-rose-300',
  info: 'border-cyan-400/30 bg-cyan-400/[0.09] text-cyan-300',
  accent: 'border-violet-400/30 bg-violet-400/[0.09] text-violet-300',
  outline: 'border-white/15 bg-transparent text-slate-300',
}

export function Badge({
  variant = 'neutral',
  dot = false,
  className,
  children,
}: {
  variant?: BadgeVariant
  dot?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
