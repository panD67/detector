# Runbook

## Deploy

1. Jalankan `npm run check`.
2. Jalankan `npm run build`.
3. Jalankan `npm run check:bundle`.
4. Deploy folder `dist` ke Cloudflare Pages atau Vercel.

## Rollback

1. Pilih deployment sebelumnya di platform hosting.
2. Promosikan deployment lama.
3. Verifikasi beranda dan satu analisis link.

## Insiden

1. Jika provider AI gagal, hasil heuristik tetap tampil sebagai parsial.
2. Jika kuota browser penuh, entri riwayat tertua dihapus bertahap.
3. Jika OCR gagal, hasil lokal tetap tersedia.

## Data pengguna

1. Semua data ada di browser pengguna.
2. Hapus semua data dari halaman Pengaturan.
3. Tidak ada backup server.
