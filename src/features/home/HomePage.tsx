import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  Gauge,
  Image as ImageIcon,
  Layers,
  Link2,
  Lock,
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
    iconClass: 'border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-300',
    description:
      'Ambil isi artikel, periksa reputasi domain, ekstrak klaim, lalu cari bukti pendukung atau pembantah.',
    capabilities: ['Ekstraksi artikel', 'Registry domain', 'Cek klaim dan sitasi'],
  },
  {
    to: '/detect/comment',
    title: 'Deteksi Komentar',
    phase: 'Fase 4',
    icon: MessagesSquare,
    tone: 'accent' as const,
    iconClass: 'border-violet-400/25 bg-violet-400/[0.08] text-violet-300',
    description:
      'Deteksi duplikasi, hashtag seragam, spam, dan burst waktu. Analisis pola agregat, bukan menuduh individu.',
    capabilities: ['Klaster duplikat', 'Pola waktu', 'Statistik agregat'],
  },
  {
    to: '/detect/image',
    title: 'Deteksi Foto',
    phase: 'Fase 5',
    icon: ImageIcon,
    tone: 'warning' as const,
    iconClass: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-300',
    description:
      'Baca EXIF, jalankan OCR lokal, dan nilai indikasi manipulasi dengan AI vision serta bukti tambahan.',
    capabilities: ['Metadata EXIF', 'OCR lokal', 'Analisis konteks'],
  },
]

const guardrails = [
  {
    icon: FileCheck2,
    title: 'Bukti lebih dulu',
    description:
      'Setiap temuan harus merujuk pada teks, metadata, atau sumber yang bisa diperiksa. Model bahasa bukan hakim tunggal.',
  },
  {
    icon: Gauge,
    title: 'Skor dan keyakinan terpisah',
    description:
      'Konten bisa berisiko tinggi tetapi buktinya masih lemah. Keduanya ditampilkan terpisah agar tidak menyesatkan.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence gate',
    description:
      'Status indikasi kuat hanya muncul jika ambang bukti terpenuhi. Skor tinggi tanpa bukti akan ditahan.',
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

const roadmap = [
  { phase: 'Fase 0', label: 'Kontrak produk', done: true },
  { phase: 'Fase 1', label: 'Fondasi dan design system', done: true },
  { phase: 'Fase 2', label: 'Layer AI dan pengaturan', done: false },
  { phase: 'Fase 3', label: 'Detektor link', done: false },
]

export default function HomePage() {
  return (
    <div className="space-y-14 pb-4 lg:space-y-18">
      <section className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="animate-fade-up">
          <Badge variant="brand" dot>
            Fase 1 selesai: fondasi siap
          </Badge>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.3rem]">
            Nilai risiko hoaks dengan{' '}
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-cyan-400 bg-clip-text text-transparent">
              bukti, bukan tebakan.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
            HoaxLab menyiapkan tiga modul analisis: link berita, komentar media
            sosial, dan foto publik. Semua diproses di browser. API key dan
            riwayat tidak dikirim ke server HoaxLab.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/detect/link"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-400 px-6 text-sm font-bold text-ink-950 shadow-[0_0_32px_-10px_rgba(52,211,153,0.7)] transition hover:bg-brand-300"
            >
              Lihat modul
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#kontrak"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Layers className="h-4 w-4 text-brand-400" aria-hidden="true" />
              Kontrak hasil
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-500">
            {[
              'Tanpa backend',
              'API key milikmu',
              'Bukti bisa diperiksa',
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-brand-400"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Card id="kontrak" className="relative overflow-hidden p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
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
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      toneDot[item.tone],
                    )}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
            <Lock
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-relaxed text-slate-500">
              Tidak ada skor yang berarti tanpa keyakinan, sumber, dan daftar
              bagian yang belum diperiksa.
            </p>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-400/80">
              Modul
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Tiga jenis konten, satu standar bukti
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Modul deteksi aktif bertahap sesuai roadmap.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.to}
                to={module.to}
                className="group flex flex-col rounded-2xl border border-white/[0.07] bg-ink-850/70 p-5 transition hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_18px_50px_-28px_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl border',
                      module.iconClass,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={module.tone}>{module.phase}</Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      <CircleDashed className="h-3 w-3" aria-hidden="true" />
                      Belum aktif
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  {module.title}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">
                  {module.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {module.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
                    >
                      {capability}
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition group-hover:text-white">
                  Buka halaman rencana
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-400/80">
            Pagar akurasi
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
            Tiga aturan yang tidak boleh dilanggar
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guardrails.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-400/[0.07] text-brand-300">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Status build
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Roadmap fase
              </h2>
            </div>
            <Badge variant="brand">2 / 13 fase</Badge>
          </div>
          <ol className="mt-5 space-y-3">
            {roadmap.map((item, index) => (
              <li key={item.phase} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold',
                    item.done
                      ? 'border-brand-400/30 bg-brand-400/10 text-brand-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-500',
                  )}
                  aria-hidden="true"
                >
                  {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-[13px] font-semibold',
                      item.done ? 'text-slate-200' : 'text-slate-400',
                    )}
                  >
                    {item.phase}: {item.label}
                  </p>
                  {!item.done && (
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Belum dikerjakan
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">
              Berikutnya: layer AI
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
              Fase 2 menghubungkan provider AI dengan API key milikmu, menguji
              koneksi, dan menyimpan konfigurasi secara lokal. Belum ada
              analisis yang diklaim berjalan sebelum fase ini selesai.
            </p>
          </div>
          <Link
            to="/settings"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Lihat halaman pengaturan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </section>

      <section className="flex flex-col items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-slate-500">
          HoaxLab bukan lembaga fact-check. Hasil akhir akan selalu menyertakan
          keterbatasan dan langkah verifikasi.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-brand-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Evidence first
        </span>
      </section>
    </div>
  )
}
