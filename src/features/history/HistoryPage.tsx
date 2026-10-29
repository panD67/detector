import { History, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, EmptyState, PageHeader } from '../../components/ui'

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arsip lokal"
        title="Riwayat"
        description="Semua hasil analisis akan tersimpan di IndexedDB browser kamu. Tidak ada sinkronisasi ke server."
        icon={<History className="h-5 w-5" aria-hidden="true" />}
        actions={<Badge variant="neutral">Fase 6</Badge>}
      />

      <EmptyState
        icon={<History className="h-6 w-6" aria-hidden="true" />}
        title="Belum ada riwayat"
        description="Riwayat akan terisi setelah modul deteksi aktif. Penyimpanan lokal, filter, ekspor, dan impor dikerjakan pada Fase 6."
        action={
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Kembali ke beranda
          </Link>
        }
      />

      <Card className="flex items-start gap-3 p-4">
        <Lock
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
          aria-hidden="true"
        />
        <p className="text-[12px] leading-relaxed text-slate-400">
          Rencana penyimpanan: maksimal 100 hasil, thumbnail dikompresi 400px,
          ekspor JSON dengan validasi, dan tombol hapus semua data. Jika kuota
          penuh, entri tertua dihapus lebih dulu.
        </p>
      </Card>
    </div>
  )
}
