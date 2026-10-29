import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-850/40 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400">
        {icon}
      </div>
      <h2 className="text-base font-bold text-slate-200">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
