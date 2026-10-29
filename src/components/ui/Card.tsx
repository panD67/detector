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
        'glass-card rounded-3xl shadow-[0_24px_80px_-48px_rgba(0,0,0,0.95)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
