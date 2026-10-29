# HoaxLab

Aplikasi web client-side untuk menilai risiko hoaks, koordinasi buzzer, dan manipulasi foto. Semua data diproses di browser. Tidak ada backend HoaxLab.

Status saat ini: **Fase 0 dan Fase 1 selesai**. Modul deteksi belum aktif.

## Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- React Router 7
- Lucide React
- Zod
- Vitest dan Testing Library

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Typecheck dan build produksi |
| `npm run preview` | Melihat hasil build |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run lint` | Menjalankan oxlint |
| `npm run lint:copy` | Memeriksa em dash, en dash, emoji, dan kata terlarang |
| `npm run test` | Menjalankan unit test |
| `npm run test:coverage` | Unit test dengan laporan coverage |
| `npm run check` | Typecheck, lint, copy check, dan test |

## Struktur

```text
src/
  app/            routing, error boundary, scroll restore
  components/     layout dan komponen UI
  features/       halaman per modul
  lib/analysis/   status, confidence, evidence gate
  lib/utils.ts    utilitas umum
  types/          kontrak data analisis
  test/           setup test
scripts/          pemeriksaan copy
```

## Pagar akurasi

Fondasi ini sudah mengunci beberapa aturan:

1. Skor risiko dan keyakinan adalah dua nilai terpisah.
2. Status indikasi kuat membutuhkan evidence gate.
3. Skor tinggi tanpa bukti ditahan menjadi perlu verifikasi.
4. Sampel komentar kecil membatasi keyakinan.
5. Penilaian model tidak boleh menjadi satu-satunya dasar.

Implementasi ada di `src/lib/analysis/` dan diuji di file test terkait.

## Privasi

- Tidak ada server HoaxLab.
- API key dan riwayat akan disimpan di browser.
- Data hanya dikirim ke provider AI yang dipilih pengguna.
- Proxy CORS dapat melihat URL yang diambil. Detail ini akan ditampilkan sebelum fitur link aktif.

## Aturan kontribusi

- Dilarang memakai karakter em dash U+2014 dan en dash U+2013.
- Dilarang memakai emoji di UI dan dokumentasi produk.
- Jalankan `npm run check` sebelum commit.
- Jangan menulis klaim akurasi tanpa laporan evaluasi.

Rencana lengkap ada di `plan.md`.
