import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<
  ToastVariant,
  { icon: LucideIcon; className: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    className: 'border-brand-400/25',
    iconClass: 'text-brand-400',
  },
  error: {
    icon: XCircle,
    className: 'border-rose-400/25',
    iconClass: 'text-rose-400',
  },
  info: {
    icon: Info,
    className: 'border-cyan-400/25',
    iconClass: 'text-cyan-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-400/25',
    iconClass: 'text-amber-400',
  },
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'info' }: ToastInput) => {
      const id = createId()
      setItems((current) => [
        ...current.slice(-3),
        { id, title, description, variant },
      ])
      const timer = setTimeout(() => {
        dismiss(id)
      }, 6000)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:items-end lg:bottom-6 lg:right-6 lg:items-end lg:px-0"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((item) => {
          const config = variantConfig[item.variant]
          const Icon = config.icon
          return (
            <div
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border bg-ink-800/95 px-4 py-3 shadow-2xl backdrop-blur',
                config.className,
              )}
            >
              <Icon
                className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
                aria-label="Tutup notifikasi"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) {
    throw new Error('useToast harus dipakai di dalam ToastProvider.')
  }
  return value
}
