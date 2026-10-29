import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui'

export default function NotFoundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="404"
        title="Halaman tidak ditemukan"
        description="Alamat ini tidak ada di HoaxLab. Periksa URL atau kembali ke beranda."
        icon={<Compass className="h-5 w-5" aria-hidden="true" />}
      />
      <Link
        to="/"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke beranda
      </Link>
    </div>
  )
}
