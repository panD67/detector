import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const controlBase =
  'w-full rounded-xl border border-white/10 bg-ink-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 transition focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-rose-400/60 aria-[invalid=true]:ring-rose-400/15'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlBase, 'min-h-28 resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={cn(controlBase, 'appearance-none pr-10', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </span>
  )
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  const autoId = useId()
  const childProps = isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : null
  const childId =
    typeof childProps?.id === 'string' ? childProps.id : undefined
  const controlId = htmlFor ?? childId ?? autoId
  const hintId = hint ? `${autoId}-hint` : undefined
  const errorId = error ? `${autoId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  let control = children
  if (isValidElement(children)) {
    const element = children as ReactElement<Record<string, unknown>>
    control = cloneElement(element, {
      id: controlId,
      'aria-describedby': describedBy,
      'aria-invalid': error ? true : undefined,
    })
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={controlId}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
      >
        {label}
        {required && (
          <span className="text-rose-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs leading-relaxed text-rose-300">
          {error}
        </p>
      )}
    </div>
  )
}
