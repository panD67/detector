import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, ShieldAlert } from 'lucide-react'
import { Button } from '../components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('HoaxLab render error', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-ink-850 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-400/[0.08] text-rose-300">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-white">
            Aplikasi berhenti karena error
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Data yang sudah tersimpan di browser tidak terhapus. Muat ulang
            halaman untuk mencoba lagi.
          </p>
          {import.meta.env.DEV && this.state.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-rose-300">
              {this.state.message}
            </pre>
          )}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={this.handleReload}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Muat ulang
            </Button>
            <Button variant="secondary" onClick={() => window.location.assign('/')}>
              Kembali ke beranda
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
