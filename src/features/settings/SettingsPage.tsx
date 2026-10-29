import {
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  Lock,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Card,
  PageHeader,
} from '../../components/ui'

const providers = [
  { name: 'Google Gemini', kind: 'Native', vision: 'Ya', search: 'Ya' },
  { name: 'OpenAI', kind: 'OpenAI-compatible', vision: 'Ya', search: 'Ya' },
  { name: 'Anthropic', kind: 'Native', vision: 'Ya', search: 'Ya' },
  { name: 'OpenRouter', kind: 'OpenAI-compatible', vision: 'Tergantung model', search: 'Ya' },
  { name: 'Groq', kind: 'OpenAI-compatible', vision: 'Tergantung model', search: 'Tidak' },
  { name: 'Ollama', kind: 'OpenAI-compatible', vision: 'Tergantung model', search: 'Tidak' },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan"
        description="Hubungkan provider AI dengan API key milikmu. Konfigurasi disimpan lokal dan tidak dikirim ke server HoaxLab."
        icon={<Settings className="h-5 w-5" aria-hidden="true" />}
        actions={<Badge variant="neutral">Fase 2</Badge>}
      />

      <Alert
        variant="warning"
        title="Form provider belum aktif"
      >
        Fase 1 hanya menyiapkan fondasi. Input API key, test koneksi, pemilihan
        model, dan enkripsi opsional dikerjakan pada Fase 2. Tidak ada key yang
        diminta atau disimpan di halaman ini.
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
            <BrainCircuit className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <h2 className="text-sm font-bold text-white">
              Provider yang akan didukung
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[12px]">
              <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-semibold">
                    Provider
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Tipe
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Vision
                  </th>
                  <th scope="col" className="px-5 py-2.5 font-semibold">
                    Web search
                  </th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr
                    key={provider.name}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-200">
                      {provider.name}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{provider.kind}</td>
                    <td className="px-3 py-3 text-slate-400">{provider.vision}</td>
                    <td className="px-5 py-3 text-slate-400">{provider.search}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-400/[0.07] text-brand-300">
              <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-bold text-white">
              Rencana penyimpanan key
            </h2>
            <ul className="mt-3 space-y-2">
              {[
                'Disimpan di localStorage, bukan server.',
                'Enkripsi opsional dengan passphrase dan WebCrypto.',
                'Tidak pernah masuk log, URL, atau pesan error.',
                'Bisa dihapus kapan saja dari halaman ini.',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-400"
                >
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex items-start gap-3 p-4">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-relaxed text-slate-500">
              API key di browser rentan jika ada XSS. Fase 2 menambahkan CSP,
              sanitasi input, dan opsi enkripsi sebelum form key dirilis.
            </p>
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Halaman ini belum menyimpan data apa pun.
        </p>
        <Link
          to="/"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          Kembali ke beranda
        </Link>
      </Card>
    </div>
  )
}
