import { MessagesSquare } from 'lucide-react'
import ModulePlaceholder from '../shared/ModulePlaceholder'

export default function CommentPage() {
  return (
    <ModulePlaceholder
      phase="Fase 4"
      title="Deteksi Komentar"
      description="Analisis pola komentar secara agregat: duplikasi, hashtag seragam, spam, burst waktu, dan variasi bahasa. Bukan daftar tuduhan individu."
      icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
      accent="accent"
      capabilities={[
        {
          title: 'Parser teks, CSV, dan JSON',
          description:
            'Deteksi header, tanda kutip, kolom username, isi komentar, dan timestamp. Preview sebelum analisis.',
        },
        {
          title: 'Klaster duplikat dan near-duplicate',
          description:
            'Hash exact untuk duplikat identik, lalu MinHash atau LSH untuk komentar yang mirip tetapi tidak sama.',
        },
        {
          title: 'Pola waktu dan konsentrasi',
          description:
            'Burst detection, entropi waktu, konsentrasi hashtag, mention, dan domain tautan.',
        },
        {
          title: 'Confidence berbasis sampel',
          description:
            'Sampel di bawah 10 komentar tidak boleh menghasilkan keyakinan tinggi. Username disembunyikan secara default.',
        },
      ]}
      gates={[
        'Status indikasi kuat membutuhkan minimal 30 komentar dan tiga sinyal koordinasi independen.',
        'Sampel di bawah 30 komentar dibatasi pada keyakinan sedang, di bawah 10 pada keyakinan rendah.',
        'Hasil selalu agregat. Tidak ada daftar target atau tuduhan terhadap akun tertentu.',
        'Komentar negatif atau marah tidak otomatis dianggap buzzer. Yang dinilai adalah pola koordinasi.',
      ]}
      nextStep="Fase 4 membangun parser, deduplikasi, statistik, dan antarmuka unggah setelah layer AI selesai."
    />
  )
}
