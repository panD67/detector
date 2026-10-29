import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-ink-850/80 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.95)] backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
