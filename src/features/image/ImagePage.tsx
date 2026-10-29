import { Image as ImageIcon } from 'lucide-react'
import ModulePlaceholder from '../shared/ModulePlaceholder'

export default function ImagePage() {
  return (
    <ModulePlaceholder
      phase="Fase 5"
      title="Deteksi Foto"
      description="Baca metadata EXIF, jalankan OCR lokal, dan nilai indikasi manipulasi atau konteks yang salah dengan bukti tambahan."
      icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />}
      accent="warning"
      capabilities={[
        {
          title: 'Metadata dan hash',
          description:
            'EXIF, XMP, IPTC, perceptual hash, dan manifest C2PA jika tersedia di file.',
        },
        {
          title: 'OCR lokal',
          description:
            'Tesseract dijalankan di browser hanya saat dibutuhkan. Proses bisa dibatalkan dan tidak mengunggah file ke server HoaxLab.',
        },
        {
          title: 'Analisis vision',
          description:
            'Model vision menilai artefak visual dan konteks. Hasilnya probabilitas, bukan vonis pasti.',
        },
        {
          title: 'Bukti tambahan',
          description:
            'Reverse image search dan detector AI khusus pada mode mendalam. Tanpa bukti ini, keyakinan dibatasi.',
        },
      ]}
      gates={[
        'Tidak adanya EXIF bukan bukti hoaks. Media sosial sering menghapus metadata.',
        'Status indikasi kuat membutuhkan reverse search, kontradiksi provenance, atau detector khusus minimal 0.90.',
        'Detector AI generatif menampilkan probabilitas, bukan klaim pasti.',
        'Foto asli dengan konteks salah diperlakukan sebagai risiko utama, bukan sekadar deteksi AI.',
      ]}
      nextStep="Fase 5 membangun upload, EXIF, OCR lazy, dan antarmuka hasil. Fase 9 menambahkan reverse search dan C2PA."
    />
  )
}
