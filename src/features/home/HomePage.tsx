import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Image as ImageIcon,
  Layers,
  Link2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card } from '../../components/ui'
import { statusMeta } from '../../lib/analysis/status'
import type { AnalysisStatus } from '../../types/analysis'
import { cn } from '../../lib/utils'

const modules = [
  {
    to: '/detect/link',
    title: 'Deteksi Link',
    phase: 'Fase 3',
    icon: Link2,
    tone: 'info' as const,
    iconClass: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
    description: 'Ambil artikel, ekstrak klaim, cari bukti, lalu hitung risiko.',
  },
  {
    to: '/detect/comment',
    title: 'Deteksi Komentar',
    phase: 'Fase 4',
    icon: MessagesSquare,
    tone: 'accent' as const,
    iconClass: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    description: 'Deteksi duplikasi, spam, burst waktu, dan konsentrasi pola.',
  },
  {
    to: '/detect/image',
    title: 'Deteksi Foto',
    phase: 'Fase 5',
    icon: ImageIcon,
    tone: 'warning' as const,
    iconClass: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
    description: 'Baca metadata, OCR lokal, dan nilai konteks dengan AI vision.',
  },
]

const guardrails = [
  {
    icon: FileCheck2,
    title: 'Bukti lebih dulu',
    description: 'Temuan harus merujuk pada teks, metadata, atau sumber yang bisa diperiksa.',
  },
  {
    icon: Gauge,
    title: 'Skor dan keyakinan terpisah',
    description: 'Risiko tinggi tidak otomatis berarti bukti kuat.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence gate',
    description: 'Status kuat hanya muncul jika ambang bukti terpenuhi.',
  },
]

const statusOrder: AnalysisStatus[] = [
  'no-strong-indication',
  'needs-verification',
  'strong-indication',
  'unverifiable',
]

const toneDot: Record<string, string> = {
  low: 'bg-risk-low',
  medium: 'bg-risk-medium',
  high: 'bg-risk-high',
  neutral: 'bg-slate-500',
}

export default function HomePage() {
  return (
    <div className="space-y-12 pb-4 lg:space-y-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up">
          <Badge variant="brand" dot>
            Fondasi siap
          </Badge>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.2rem]">
            Nilai risiko hoaks dengan{' '}
            <span className="text-gradient">bukti, bukan tebakan.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Tiga modul analisis berjalan di browser. API key dan riwayat tidak dikirim ke server HoaxLab.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/detect/link"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 px-5 text-sm font-bold text-ink-950 shadow-[0_18px_45px_-18px_rgba(16,185,129,0.75)] transition hover:from-brand-400 hover:to-brand-300"
            >
              Mulai analisis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#kontrak"
              className="inline-flex h-11 items-center gap-2 rounded-2xl glass-card px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Layers className="h-4 w-4 text-brand-300" aria-hidden="true" />
              Kontrak hasil
            </a>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-400">
            {['Tanpa backend', 'API key milikmu', 'Bukti bisa diperiksa'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Card id="kontrak" className="glass-card relative overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Kontrak hasil
              </p>
              <h2 className="mt-1 text-base font-bold text-white">
                Empat status, tanpa vonis absolut
              </h2>
            </div>
            <Badge variant="neutral">v0.1</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {statusOrder.map((status) => {
              const item = statusMeta[status]
              return (
                <div key={status} className="flex items-start gap-3">
                  <span
                    className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', toneDot[item.tone])}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">{item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">
              Modul
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Tiga jenis konten, satu standar bukti
            </h2>
          </div>
          <p className="text-xs text-slate-400">Modul aktif bertahap.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.to}
                to={module.to}
                className="group glass-card card-hover flex flex-col rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border', module.iconClass)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant={module.tone}>{module.phase}</Badge>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{module.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">{module.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition group-hover:text-white">
                  Buka modul
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">
            Pagar akurasi
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
            Tiga aturan utama
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guardrails.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="glass-card rounded-3xl p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-400/10 text-brand-300">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{item.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Status build
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">Fondasi v0.1</h2>
            </div>
            <Badge variant="brand">2 / 13 fase</Badge>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
            Fase 0 dan 1 selesai. Modul deteksi dan evaluasi tersedia.
          </p>
        </Card>

        <Card className="glass-card flex flex-col justify-between rounded-3xl p-5 sm:p-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Berikutnya</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
              Uji API key, jalankan analisis, lalu periksa riwayat dan bukti.
            </p>
          </div>
          <Link
            to="/settings"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl glass-card px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Buka pengaturan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </section>

      <section className="flex flex-col items-start gap-3 rounded-3xl glass-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-slate-400">
          HoaxLab bukan lembaga fact-check. Hasil selalu menyertakan keterbatasan.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-brand-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Evidence first
        </span>
      </section>
    </div>
  )
}
