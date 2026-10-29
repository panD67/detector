import { useRef, useState } from 'react'
import {
  MessagesSquare,
  Upload,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  PageHeader,
  Progress,
  Select,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { analyzeComments } from '../../lib/comment/analyze'
import { parseComments } from '../../lib/comment/parser'
import { loadSettings } from '../../lib/storage/settings'
import type { AnalysisMode, CommentResult } from '../../types/analysis'

const MODES = [
  { value: 'fast', label: 'Cepat' },
  { value: 'balanced', label: 'Seimbang' },
  { value: 'deep', label: 'Mendalam' },
] as const

export default function CommentPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<AnalysisMode>('balanced')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')
  const [result, setResult] = useState<CommentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsed = parseComments(input)

  function handleFile(file: File): void {
    const reader = new FileReader()
    reader.onload = () => {
      setInput(String(reader.result ?? ''))
      toast({ title: 'File dimuat', description: file.name, variant: 'success' })
    }
    reader.onerror = () => toast({ title: 'Gagal membaca file', variant: 'error' })
    reader.readAsText(file)
  }

  async function runAnalysis(): Promise<void> {
    const settings = loadSettings()
    const profile = settings.settings.profiles.find(
      (item) => item.id === settings.settings.activeProfileId,
    )
    if (settings.locked) {
      toast({ title: 'Pengaturan terkunci', variant: 'error' })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)
    setStep('Memulai')

    try {
      const next = await analyzeComments(
        {
          input,
          mode,
          profile: profile ?? undefined,
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
        eyebrow="Fase 4"
        title="Deteksi Komentar"
        description="Analisis pola komentar secara agregat: duplikasi, spam, burst, konsentrasi, dan variasi bahasa."
        icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
      />

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Field label="Mode analisis">
            <Select value={mode} onChange={(event) => setMode(event.target.value as AnalysisMode)}>
              {MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleFile(file)
                event.target.value = ''
              }}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Unggah file
            </Button>
          </div>
        </div>

        <Field
          label="Tempel komentar"
          hint="Satu komentar per baris, atau CSV/JSON. Username tidak ditampilkan sebagai target."
          className="mt-4"
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tempel komentar di sini."
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button loading={loading} onClick={() => void runAnalysis()} disabled={!input.trim()}>
            {loading ? 'Menganalisis' : 'Analisis komentar'}
          </Button>
          <Badge variant="neutral">{parsed.comments.length} komentar terdeteksi</Badge>
          {parsed.warnings.map((warning) => (
            <Badge key={warning} variant="warning">
              {warning}
            </Badge>
          ))}
        </div>

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
                <Badge variant={result.score >= 60 ? 'danger' : result.score >= 30 ? 'warning' : 'brand'}>
                  {result.status}
                </Badge>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white">
                  {result.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.summary}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-4xl font-extrabold text-white">{result.score}</p>
                <p className="text-xs text-slate-400">Keyakinan: {result.confidence}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total', result.totalComments],
              ['Unik', result.uniqueComments],
              ['Duplikat', `${result.duplicatePercent.toFixed(1)}%`],
              ['Spam', `${result.spamPercent.toFixed(1)}%`],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
              </Card>
            ))}
          </div>

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
                      <p className="text-xs font-semibold text-slate-200">{finding.title}</p>
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
                  <li key={index} className="text-xs leading-relaxed text-slate-400">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Keterbatasan</h3>
              <ul className="mt-3 space-y-2">
                {result.limitations.map((item, index) => (
                  <li key={index} className="text-xs leading-relaxed text-slate-400">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {result.duplicateSamples.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Contoh klaster duplikat</h3>
              <div className="mt-3 space-y-2">
                {result.duplicateSamples.map((group, index) => (
                  <p key={index} className="text-xs text-slate-400">
                    Klaster {index + 1}: {group.length} komentar
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
