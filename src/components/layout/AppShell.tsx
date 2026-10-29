import { NavLink, Outlet } from 'react-router-dom'
import {
  History,
  Home,
  Image as ImageIcon,
  Link2,
  Lock,
  MessagesSquare,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { Progress } from '../ui'
import { cn } from '../../lib/utils'

const navigation = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/detect/link', label: 'Deteksi Link', icon: Link2 },
  { to: '/detect/comment', label: 'Deteksi Komentar', icon: MessagesSquare },
  { to: '/detect/image', label: 'Deteksi Foto', icon: ImageIcon },
  { to: '/history', label: 'Riwayat', icon: History },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

const mobileNavigation = navigation.filter((item) =>
  ['/', '/detect/link', '/detect/comment', '/detect/image', '/history'].includes(
    item.to,
  ),
)

function Brand() {
  return (
    <NavLink
      to="/"
      className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
      aria-label="HoaxLab, kembali ke beranda"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/30 bg-brand-400/[0.09] text-brand-300">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <span
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-400"
          aria-hidden="true"
        />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-white">
          Hoax<span className="text-brand-400">Lab</span>
        </span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          Evidence first
        </span>
      </span>
    </NavLink>
  )
}

function NavItems({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Navigasi utama" className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-400/10 text-brand-300'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                compact && 'justify-center px-0',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!compact && item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppShell() {
  return (
    <div className="min-h-svh">
      <a
        href="#main-content"
        className="skip-link rounded-lg bg-brand-400 px-4 py-2 text-sm font-bold text-ink-950"
      >
        Lewati ke konten utama
      </a>

      <div className="ambient-glow pointer-events-none fixed inset-0 -z-10" />
      <div className="surface-grid pointer-events-none fixed inset-0 -z-10" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-ink-950/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Ruang kerja
          </p>
          <NavItems />
        </div>
        <div className="space-y-3 pt-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-slate-300">
                Fase 1 selesai
              </p>
              <span className="font-mono text-[10px] text-brand-400">2 / 13</span>
            </div>
            <Progress
              value={15}
              tone="brand"
              className="mt-2"
              label="Fondasi aplikasi"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Modul deteksi belum aktif. Berikutnya: layer AI dan pengaturan
              provider.
            </p>
          </div>
          <p className="flex items-start gap-1.5 px-1 text-[10px] leading-relaxed text-slate-600">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            Data dan API key akan tersimpan di browser. Tidak ada server
            HoaxLab.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-ink-950/85 px-4 backdrop-blur-xl lg:hidden">
        <Brand />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition',
              isActive
                ? 'bg-brand-400/10 text-brand-300'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
            )
          }
          aria-label="Buka pengaturan"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </NavLink>
      </header>

      <div className="lg:pl-64">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-10"
        >
          <Outlet />
          <footer className="mt-14 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>HoaxLab v0.1.0. Penilaian risiko, bukan putusan fakta.</p>
            <p>Diproses di browser. Tanpa akun. Tanpa server.</p>
          </footer>
        </main>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-ink-950/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {mobileNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition-colors',
                    isActive ? 'text-brand-300' : 'text-slate-500',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label.replace('Deteksi ', '')}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
