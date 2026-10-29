import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Construction,
  ListChecks,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Card,
  PageHeader,
} from '../../components/ui'

interface Capability {
  title: string
  description: string
}

export default function ModulePlaceholder({
  phase,
  title,
  description,
  icon,
  accent,
  capabilities,
  gates,
  nextStep,
}: {
  phase: string
  title: string
  description: string
  icon: ReactNode
  accent: 'info' | 'accent' | 'warning'
  capabilities: Capability[]
  gates: string[]
  nextStep: string
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={phase}
        title={title}
        description={description}
        icon={icon}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={accent}>Belum aktif</Badge>
            <Badge variant="neutral">{phase}</Badge>
          </div>
        }
      />

      <Alert variant="info" title="Halaman rencana, bukan alat yang sudah berjalan">
        Modul ini sengaja belum menampilkan form analisis. Deteksi baru dianggap
        aktif setelah fase implementasinya selesai dan lulus gerbang evaluasi.
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ListChecks
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="text-sm font-bold text-white">Yang akan tersedia</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {capabilities.map((item, index) => (
              <li key={item.title} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] font-mono text-[10px] text-slate-500"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-200">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-brand-400"
              aria-hidden="true"
            />
            <h2 className="text-sm font-bold text-white">
              Pagar akurasi yang sudah dikunci
            </h2>
          </div>
          <ul className="mt-4 space-y-3">
            {gates.map((gate) => (
              <li
                key={gate}
                className="flex items-start gap-2.5 text-[12px] leading-relaxed text-slate-400"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                  aria-hidden="true"
                />
                {gate}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <Construction className="h-3.5 w-3.5" aria-hidden="true" />
              Langkah berikutnya
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {nextStep}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Link
          to="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>
        <Link
          to="/settings"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-300"
        >
          Lihat pengaturan
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
