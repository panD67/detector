# Protokol Anotasi

Versi: 2026.1

## Label

- `credible`: konten kredibel atau terverifikasi.
- `hoax`: klaim palsu atau menyesatkan.
- `satire`: parodi atau humor.
- `opinion`: pendapat tanpa klaim faktual.
- `miscontext`: foto asli dengan konteks salah.
- `synthetic`: gambar buatan AI.
- `manipulated`: gambar yang dimanipulasi.
- `coordinated`: pola koordinasi komentar.
- `organic`: diskusi alami.

## Aturan anotator

1. Anotasi berdasarkan sumber primer, bukan intuisi.
2. Dua anotator independen untuk setiap item.
3. Konflik diselesaikan oleh adjudikator.
4. Simpan sumber, tanggal, dan catatan.
5. Jangan menyetel bobot pada test set.

## Metrik

- Kappa minimal 0.75.
- ECE <= 0.08.
- F1 link >= 0.82.
- F1 komentar >= 0.85.
- F1 foto manipulasi >= 0.78.
