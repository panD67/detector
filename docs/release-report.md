# Laporan Rilis Fase 10

Tanggal: 2026-10-29

## Status fitur

| Modul | Status | Catatan |
|---|---|---|
| Link | Beta | F1 seed 0.800, di bawah target 0.82. Perlu dataset penuh. |
| Komentar | Beta | F1 seed 1.000, tetapi dataset seed kecil. |
| Foto | Beta | F1 seed 0.800, di atas target 0.78 pada seed. |

## Metrik seed

| Modul | Precision | Recall | F1 |
|---|---:|---:|---:|
| Link | 1.000 | 0.667 | 0.800 |
| Komentar | 1.000 | 1.000 | 1.000 |
| Foto | 1.000 | 0.667 | 0.800 |

## Red team

12 kasus tercatat di `data/redteam.json`. Semua kasus harus lolos sebelum klaim akurasi final.

## Kalibrasi

Artefak awal tersimpan di `data/calibration.json`. ECE belum diukur pada dataset penuh.

## Keputusan

1. Tidak ada klaim akurasi final sebelum dataset penuh.
2. Modul link tetap beta sampai F1 >= 0.82.
3. Semua hasil tetap menampilkan keterbatasan.
