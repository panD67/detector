import {
  BarChart3,
  Calendar,
  Download,
  FileJson,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import {
  clearHistory,
  deleteHistory,
  exportHistory,
  importHistory,
  listHistory,
  validateHistoryImport,
} from '../../lib/storage/history'
import type { AnalysisResult } from '../../types/analysis'
import { formatDate } from '../../lib/utils'
import HistoryDetail from './HistoryDetail'

const TYPE_LABELS: Record<AnalysisResult['type'], string> = {
  link: 'Link',
  comment: 'Komentar',
  image: 'Foto',
}

export default function HistoryPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function load(): Promise<void> {
    setLoading(true)
    try {
      setItems(await listHistory(100))
    } catch (error) {
      toast({
        title: 'Gagal memuat riwayat',
        description: error instanceof Error ? error.message : 'Kesalahan tidak dikenal.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      const haystack = `${item.title} ${'domain' in item ? item.domain : ''}`.toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })
  }, [items, query, typeFilter, statusFilter])

  const selected = items.find((item) => item.id === selectedId) ?? null

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Hapus item riwayat ini?')) return
    try {
      await deleteHistory(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast({ title: 'Item dihapus', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menghapus',
        description: error instanceof Error ? error.message : 'Kesalahan tidak dikenal.',
        variant: 'error',
      })
    }
  }

  async function handleClearAll(): Promise<void> {
    if (!window.confirm('Hapus semua riwayat? Tindakan ini tidak bisa dibatalkan.')) return
    try {
      await clearHistory()
      setItems([])
      setSelectedId(null)
      toast({ title: 'Riwayat dibersihkan', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal membersihkan',
        description: error instanceof Error ? error.message : 'Kesalahan tidak dikenal.',
        variant: 'error',
      })
    }
  }

  async function handleImport(file: File): Promise<void> {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const validated = validateHistoryImport(parsed)
      await importHistory(validated)
      await load()
      toast({ title: 'Impor berhasil', description: `${validated.length} item.`, variant: 'success' })
    } catch (error) {
      toast({
        title: 'Impor gagal',
        description: error instanceof Error ? error.message : 'File tidak valid.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arsip lokal"
        title="Riwayat"
        description="Semua hasil tersimpan di IndexedDB browser. Tidak ada sinkronisasi server."
        icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => exportHistory(filtered)}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Ekspor
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <FileJson className="h-4 w-4" aria-hidden="true" />
              Impor
            </Button>
            <Button variant="danger" size="sm" onClick={() => void handleClearAll()}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Hapus semua
            </Button>
          </div>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImport(file)
          event.target.value = ''
        }}
      />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <Field label="Cari">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Judul atau domain"
                className="pl-9"
              />
            </div>
          </Field>
          <Field label="Tipe">
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Semua</option>
              <option value="link">Link</option>
              <option value="comment">Komentar</option>
              <option value="image">Foto</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Semua</option>
              <option value="no-strong-indication">Tidak ada indikasi kuat</option>
              <option value="needs-verification">Perlu verifikasi</option>
              <option value="strong-indication">Indikasi kuat</option>
              <option value="unverifiable">Tidak dapat diverifikasi</option>
            </Select>
          </Field>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-400">Memuat riwayat...</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" aria-hidden="true" />}
          title="Tidak ada riwayat"
          description="Hasil analisis akan muncul di sini. Ekspor dan impor tersedia untuk backup."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/[0.05]">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full flex-col gap-2 px-5 py-4 text-left transition hover:bg-white/[0.03] ${
                    selectedId === item.id ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="neutral">{TYPE_LABELS[item.type]}</Badge>
                    <span className="font-mono text-lg font-bold text-white">{item.score}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                    <span>{item.status}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
          <div>
            {selected ? (
              <HistoryDetail result={selected} onDelete={() => void handleDelete(selected.id)} />
            ) : (
              <Card className="flex h-full min-h-64 items-center justify-center p-8 text-sm text-slate-400">
                Pilih item untuk melihat detail.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
