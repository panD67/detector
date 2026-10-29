import { cn } from '../../lib/utils'

type ProgressTone = 'brand' | 'low' | 'medium' | 'high'

const tones: Record<ProgressTone, string> = {
  brand: 'bg-brand-400',
  low: 'bg-risk-low',
  medium: 'bg-risk-medium',
  high: 'bg-risk-high',
}

export function Progress({
  value,
  label,
  tone = 'brand',
  className,
  indeterminate = false,
}: {
  value?: number
  label?: string
  tone?: ProgressTone
  className?: string
  indeterminate?: boolean
}) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0))

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>{label}</span>
          {!indeterminate && <span className="font-mono">{safeValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? 'Progres'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : safeValue}
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
      >
        {indeterminate ? (
          <div className="skeleton-shimmer h-full w-full" />
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-500',
              tones[tone],
            )}
            style={{ width: `${safeValue}%` }}
          />
        )}
      </div>
    </div>
  )
}
