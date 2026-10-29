import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  ShieldCheck,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Progress,
  Select,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { analyzeLink } from '../../lib/link/analyze'
import { loadSettings } from '../../lib/storage/settings'
import type { AnalysisMode, LinkResult } from '../../types/analysis'

const MODES: Array<{ value: AnalysisMode; label: string; description: string }> = [
  { value: 'fast', label: 'Cepat', description: 'Heuristik dan satu panggilan AI.' },
  { value: 'balanced', label: 'Seimbang', description: 'AI plus web search jika provider mendukung.' },
  { value: 'deep', label: 'Mendalam', description: 'Analisis lebih rinci dan bukti tambahan.' },
]

function StatusBadge({ status }: { status: LinkResult['status'] }) {
  const variant =
    status === 'strong-indication'
      ? 'danger'
      : status === 'needs-verification'
        ? 'warning'
        : status === 'unverifiable'
          ? 'neutral'
          : 'brand'
  const label =
    status === 'strong-indication'
      ? 'Indikasi kuat'
      : status === 'needs-verification'
        ? 'Perlu verifikasi'
        : status === 'unverifiable'
          ? 'Tidak dapat diverifikasi'
          : 'Tidak ada indikasi kuat'
  return <Badge variant={variant}>{label}</Badge>
}

export default function LinkPage() {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<AnalysisMode>('balanced')
  const [context, setContext] = useState('')
  const [manualText, setManualText] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')
  const [result, setResult] = useState<LinkResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAnalysis(): Promise<void> {
    const settings = loadSettings()
    const profile = settings.settings.profiles.find(
      (item) => item.id === settings.settings.activeProfileId,
    )
    if (!profile) {
      toast({
        title: 'Belum ada profil AI aktif',
        description: 'Buka Pengaturan dan tambahkan profil terlebih dahulu.',
        variant: 'error',
      })
      return
    }
    if (settings.locked) {
      toast({
        title: 'Pengaturan terkunci',
        description: 'Buka kunci di Pengaturan sebelum analisis.',
        variant: 'error',
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)
    setStep('Memulai')

    try {
      const next = await analyzeLink(
        {
          url,
          mode,
          context: context.trim() || undefined,
          manualText: manualText.trim() || undefined,
          profile,
        },
        (label, value) => {
          setStep(label)
          setProgress(value)
        },
      )
      setResult(next)
      toast({ title: 'Analisis selesai', variant: 'success' })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Analisis gagal.'
      setError(message)
      toast({ title: 'Analisis gagal', description: message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fase 3"
        title="Deteksi Link"
        description="Ambil isi artikel publik, ekstrak klaim, nilai risiko dengan bukti, dan tampilkan keterbatasan."
        icon={<Link2 className="h-5 w-5" aria-hidden="true" />}
      />

      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <Field label="URL artikel" required>
            <Input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://contoh.com/artikel"
            />
          </Field>
          <Field label="Mode analisis">
            <Select value={mode} onChange={(event) => setMode(event.target.value as AnalysisMode)}>
              {MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Konteks tambahan" hint="Opsional. Tambahkan latar belakang yang kamu ketahui.">
          <Textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Misalnya: artikel ini beredar di grup WhatsApp."
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Button loading={loading} onClick={() => void runAnalysis()} disabled={!url.trim() && !manualText.trim()}>
            {loading ? 'Menganalisis' : 'Analisis link'}
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
          <Button variant="ghost" onClick={() => setShowManual((value) => !value)}>
            {showManual ? 'Sembunyikan mode tempel' : 'Mode tempel manual'}
          </Button>
        </div>

        {showManual && (
          <Field
            label="Teks manual"
            hint="Gunakan jika semua proxy gagal. Minimal 200 karakter."
            className="mt-4"
          >
            <Textarea
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
              placeholder="Tempel isi artikel di sini."
            />
          </Field>
        )}

        {loading && (
          <div className="mt-5">
            <Progress value={progress} label={step} />
          </div>
        )}

        {error && (
          <Alert variant="error" title="Analisis tidak selesai" className="mt-5">
            {error}
          </Alert>
        )}
      </Card>

      {result && (
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <StatusBadge status={result.status} />
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white">
                  {result.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">{result.domain}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.summary}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-4xl font-extrabold text-white">{result.score}</p>
                <p className="text-xs text-slate-400">Keyakinan: {result.confidence}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <Badge variant="neutral">{result.meta.mode}</Badge>
              <Badge variant="neutral">{result.meta.providerLabel}</Badge>
              <Badge variant="neutral">{result.meta.model}</Badge>
              <Badge variant="neutral">{result.wordCount} kata</Badge>
            </div>
          </Card>

          {result.claims.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h3 className="text-sm font-bold text-white">Klaim dan penilaian</h3>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {result.claims.map((claim) => (
                  <div key={claim.id} className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-200">{claim.text}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {claim.assessment} · {claim.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Rincian skor</h3>
              <div className="mt-4 space-y-3">
                {result.breakdown.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono text-slate-400">{item.score}</span>
                    </div>
                    <Progress value={item.score} tone={item.score >= 60 ? 'high' : item.score >= 30 ? 'medium' : 'low'} className="mt-1" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Temuan</h3>
              <div className="mt-4 space-y-3">
                {result.findings.length === 0 ? (
                  <p className="text-xs text-slate-400">Tidak ada temuan khusus.</p>
                ) : (
                  result.findings.map((finding) => (
                    <div key={finding.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                        <p className="text-xs font-semibold text-slate-200">{finding.title}</p>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{finding.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Rekomendasi</h3>
              <ul className="mt-3 space-y-2">
                {result.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Keterbatasan</h3>
              <ul className="mt-3 space-y-2">
                {result.limitations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {result.evidence.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Bukti eksternal</h3>
              <div className="mt-3 space-y-3">
                {result.evidence.map((item) => (
                  <div key={item.id} className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                      <Badge variant={item.stance === 'refutes' ? 'danger' : item.stance === 'supports' ? 'brand' : 'neutral'}>
                        {item.stance}
                      </Badge>
                    </div>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] text-brand-300">
                        {item.url}
                      </a>
                    )}
                    {item.quote && (
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{item.quote}</p>
                    )}
                    <p className="mt-2 text-[10px] text-slate-500">
                      {item.verified ? 'Sumber tervalidasi.' : 'Kutipan belum diverifikasi.'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-slate-400">
                Mode {result.meta.mode}, provider {result.meta.providerLabel}, model {result.meta.model}, prompt {result.meta.promptVersion}, durasi {result.meta.durationMs} ms.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
