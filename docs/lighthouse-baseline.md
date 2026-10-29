# Baseline Lighthouse Fase 1

Tanggal: 2026-10-29

Lingkungan: server pengembangan Vite pada `http://127.0.0.1:5173/`, Chrome headless melalui `tools.browser.lighthouse`.

## Skor

| Kategori | Skor |
|---|---:|
| Accessibility | 1.00 |
| Best Practices | 1.00 |
| SEO | 1.00 |

Hasil audit awal menemukan tiga masalah aksesibilitas dan SEO:

1. Kontras teks kecil di bawah 4.5:1 pada label dan footer.
2. `aria-label` pada brand yang tidak mencakup teks terlihat.
3. Tidak ada `robots.txt` yang valid.

Semua masalah di atas sudah diperbaiki sebelum commit ini. Audit terakhir tidak melaporkan kegagalan.

## Bundle awal

| Artefak | Raw | Gzip |
|---|---:|---:|
| JavaScript utama | 297.57 KB | 93.61 KB |
| CSS | 48.60 KB | 8.65 KB |
| HTML | 1.06 KB | 0.56 KB |
| Chunk per halaman | 0.90 KB sampai 5.57 KB | 0.56 KB sampai 1.93 KB |

Anggaran yang dipakai untuk rilis: JavaScript awal di bawah 120 KB gzip. Hasil saat ini 93.61 KB.

## Catatan

- Performa tidak dilaporkan sebagai kategori terpisah oleh runner browser. Baseline performa memakai ukuran bundle dan waktu build.
- Font masih dimuat dari Google Fonts. Self-host akan dikerjakan pada Fase 11.
- CSP, cache header, dan kompresi produksi akan dikerjakan pada Fase 12.
- Laporan lengkap tersimpan di `lighthouse.json` dan `lighthouse.html` dari runner, tetapi tidak dimasukkan ke repo.
