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
import { Suspense } from 'react'
import { Progress } from '../ui'
import { cn } from '../../lib/utils'
import PageFallback from './PageFallback'

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
      className="group flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
      aria-label="HoaxLab Evidence first"
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-400/30 bg-brand-400/10 text-brand-300 transition-transform duration-300 group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-white">
          Hoax<span className="text-gradient">Lab</span>
        </span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
          Evidence first
        </span>
      </span>
    </NavLink>
  )
}

function NavItems() {
  return (
    <nav aria-label="Navigasi utama" className="space-y-1.5">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-400/12 text-brand-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppShell() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <a
        href="#main-content"
        className="skip-link rounded-xl glass-panel px-4 py-2 text-sm font-bold text-white"
      >
        Lewati ke konten utama
      </a>

      <div className="ambient-glow pointer-events-none fixed inset-0 -z-20" />
      <div className="surface-grid pointer-events-none fixed inset-0 -z-20" />
      <div className="ambient-orb left-[-8rem] top-20 h-72 w-72 bg-brand-500/20" />
      <div className="ambient-orb right-[-6rem] top-40 h-64 w-64 bg-cyan-400/10" style={{ animationDelay: '1.5s' }} />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col gap-6 border-r border-white/[0.07] bg-ink-950/60 px-5 py-6 backdrop-blur-2xl lg:flex">
        <Brand />
        <div className="flex-1">
          <p className="mb-3 px-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Ruang kerja
          </p>
          <NavItems />
        </div>
        <div className="space-y-3">
          <div className="glass-card rounded-3xl px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-slate-200">Fondasi v0.1</p>
              <span className="font-mono text-[10px] text-brand-300">2 / 13</span>
            </div>
            <Progress value={15} tone="brand" className="mt-3" label="Fondasi aplikasi" />
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Modul deteksi sudah tersedia. Berikutnya: evaluasi dan release.
            </p>
          </div>
          <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-slate-500">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            Data dan API key tersimpan di browser. Tidak ada server HoaxLab.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.07] bg-ink-950/75 px-4 backdrop-blur-2xl lg:hidden">
        <Brand />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl transition',
              isActive
                ? 'bg-brand-400/12 text-brand-200'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
            )
          }
          aria-label="Buka pengaturan"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </NavLink>
      </header>

      <div className="lg:pl-72">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-10"
        >
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
          <footer className="mt-16 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>HoaxLab v0.1.0. Penilaian risiko, bukan putusan fakta.</p>
            <p>Diproses di browser. Tanpa akun. Tanpa server.</p>
          </footer>
        </main>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-ink-950/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
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
                    'flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-[10px] font-semibold transition-all duration-200',
                    isActive ? 'text-brand-200' : 'text-slate-500 hover:text-slate-200',
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
