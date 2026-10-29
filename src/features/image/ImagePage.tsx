import { useRef, useState } from 'react'
import {
  ImageIcon,
  Upload,
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
import { analyzeImage } from '../../lib/image/analyze'
import { loadSettings } from '../../lib/storage/settings'
import type { AnalysisMode, ImageResult } from '../../types/analysis'
import { formatBytes } from '../../lib/utils'

const MODES = [
  { value: 'fast', label: 'Cepat' },
  { value: 'balanced', label: 'Seimbang' },
  { value: 'deep', label: 'Mendalam' },
] as const

export default function ImagePage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<AnalysisMode>('balanced')
  const [context, setContext] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [ocrEnabled, setOcrEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')
  const [result, setResult] = useState<ImageResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function selectFile(nextFile: File): void {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(nextFile.type)) {
      toast({ title: 'Tipe file tidak didukung', variant: 'error' })
      return
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      toast({ title: 'File terlalu besar', variant: 'error' })
      return
    }
    setFile(nextFile)
    const url = URL.createObjectURL(nextFile)
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return url
    })
    setResult(null)
    setError(null)
  }

  async function runAnalysis(): Promise<void> {
    if (!file) return
    const settings = loadSettings()
    const profile = settings.settings.profiles.find(
      (item) => item.id === settings.settings.activeProfileId,
    )
    const reverseSearchKey = settings.settings.evidenceKeys.reverseSearch
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
      const next = await analyzeImage(
        {
          file,
          mode,
          context: context.trim() || undefined,
          ocrEnabled,
          profile: profile ?? undefined,
          imageUrl: imageUrl.trim() || undefined,
          reverseSearchKey: reverseSearchKey?.trim() || undefined,
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
        eyebrow="Fase 5"
        title="Deteksi Foto"
        description="Baca metadata, jalankan OCR lokal, dan nilai risiko konteks dengan AI vision."
        icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />}
      />

      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) selectFile(selected)
                event.target.value = ''
              }}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Pilih foto
            </Button>
            {file && (
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="text-xs font-semibold text-slate-200">{file.name}</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatBytes(file.size)}</p>
              </div>
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Pratinjau foto"
                className="mt-4 max-h-72 w-full rounded-xl border border-white/[0.07] object-contain"
              />
            )}
          </div>

          <div className="space-y-4">
            <Field label="Mode analisis">
              <Select value={mode} onChange={(event) => setMode(event.target.value as AnalysisMode)}>
                {MODES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Konteks tambahan" hint="Opsional. Caption, klaim, lokasi, atau tanggal.">
              <Textarea
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Misalnya: foto ini diklaim kebakaran hutan kemarin."
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={ocrEnabled}
                onChange={(event) => setOcrEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-ink-900"
              />
              Jalankan OCR lokal
            </label>
            <Field label="URL gambar publik" hint="Opsional, untuk reverse search jika key tersedia.">
              <Input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://contoh.com/foto.jpg"
              />
            </Field>
            <Button loading={loading} onClick={() => void runAnalysis()} disabled={!file}>
              {loading ? 'Menganalisis' : 'Analisis foto'}
            </Button>
            {loading && <Progress value={progress} label={step} />}
            {error && (
              <Alert variant="error" title="Analisis tidak selesai">
                {error}
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant={result.score >= 60 ? 'danger' : result.score >= 30 ? 'warning' : 'brand'}>
                  {result.status}
                </Badge>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white">{result.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{formatBytes(result.fileSize)}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.summary}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-4xl font-extrabold text-white">{result.score}</p>
                <p className="text-xs text-slate-400">Keyakinan: {result.confidence}</p>
                {result.aiGeneratedLikelihood !== null && (
                  <p className="mt-1 text-xs text-slate-400">
                    Probabilitas AI: {Math.round(result.aiGeneratedLikelihood * 100)}%
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Pratinjau dan metadata</h3>
              <img
                src={result.preview}
                alt="Thumbnail hasil"
                className="mt-4 max-h-64 w-full rounded-xl border border-white/[0.07] object-contain"
              />
              <div className="mt-4 space-y-2">
                {Object.entries(result.exif).length === 0 ? (
                  <p className="text-xs text-slate-400">Tidak ada metadata yang terbaca.</p>
                ) : (
                  Object.entries(result.exif).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <span className="w-32 shrink-0 text-slate-500">{key}</span>
                      <span className="break-all text-slate-300">{value}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">OCR dan rincian skor</h3>
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-300">Teks OCR</p>
                <p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                  {result.ocrText || 'Tidak ada teks OCR.'}
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {result.breakdown.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono text-slate-400">
                        {item.available ? item.score : 'n/a'}
                      </span>
                    </div>
                    <Progress value={item.available ? item.score : 0} tone="medium" className="mt-1" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
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
            <Card className="p-5">
              <h3 className="text-sm font-bold text-white">Rekomendasi dan keterbatasan</h3>
              <ul className="mt-3 space-y-2">
                {result.recommendations.map((item, index) => (
                  <li key={index} className="text-xs leading-relaxed text-slate-400">
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-2">
                {result.limitations.map((item, index) => (
                  <li key={index} className="text-xs leading-relaxed text-slate-400">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
