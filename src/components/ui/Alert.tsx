import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'

type AlertVariant = 'info' | 'warning' | 'error' | 'success'

const config: Record<
  AlertVariant,
  { icon: LucideIcon; container: string; iconClass: string }
> = {
  info: {
    icon: Info,
    container: 'border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-50',
    iconClass: 'text-cyan-400',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-50',
    iconClass: 'text-amber-400',
  },
  error: {
    icon: XCircle,
    container: 'border-rose-400/25 bg-rose-400/[0.06] text-rose-50',
    iconClass: 'text-rose-400',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-brand-400/25 bg-brand-400/[0.06] text-brand-50',
    iconClass: 'text-brand-400',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  action,
  className,
}: {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const item = config[variant]
  const Icon = item.icon
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        item.container,
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-4 w-4 shrink-0', item.iconClass)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
