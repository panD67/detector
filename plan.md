# HoaxLab: Rencana Produk, Akurasi, dan Rekayasa

| Field | Isi |
|---|---|
| Versi dokumen | 1.0 |
| Tanggal | 29 Oktober 2026 |
| Status | Aktif, menjadi acuan tunggal |
| Stack | React 19, Vite 8, TypeScript, Tailwind CSS 4 |
| Model aplikasi | 100% client-side, tanpa backend |
| Pemilik | Kamu |
| Repo saat ini | Fondasi v0.1.0 + `plan.md` |

Dokumen ini adalah sumber kebenaran untuk arah produk, standar akurasi, aturan anti AI slop, desain UI/UX, dan urutan pengerjaan. Setiap keputusan teknis yang tidak tercantum di sini harus ditambahkan ke dokumen ini sebelum diimplementasikan.

Aturan wajib untuk dokumen ini dan seluruh repo:

1. Karakter em dash (U+2014) dilarang.
2. Karakter en dash (U+2013) juga dihindari.
3. Tidak ada klaim akurasi tanpa laporan evaluasi.
4. Tidak ada fitur yang menyamar sebagai kepastian.

---

## 0. Ringkasan

HoaxLab adalah aplikasi web untuk menilai risiko hoaks, koordinasi buzzer, dan manipulasi foto. Pengguna memasukkan link artikel, komentar media sosial, atau foto publik. Aplikasi menghasilkan skor risiko 0-100, tingkat keyakinan, bukti yang bisa diperiksa, temuan, dan langkah verifikasi.

Tiga hal yang membedakan HoaxLab dari alat serupa:

1. Bukti lebih dulu, AI kemudian. Model bahasa tidak menjadi hakim tunggal. Ia mengekstrak fitur dan menjelaskan pola, sementara skor akhir dihitung oleh fungsi deterministik yang dikalibrasi.
2. Risiko dipisahkan dari keyakinan. Konten bisa berisiko tinggi tetapi bukti masih lemah. Pengguna harus melihat perbedaan itu.
3. Semua data tetap di browser. Tidak ada server HoaxLab. API key, riwayat, dan hasil analisis disimpan lokal. Data hanya dikirim ke provider AI yang dipilih pengguna.

Yang tidak boleh dilakukan aplikasi ini:

1. Menyatakan seseorang pasti buzzer atau sebuah berita pasti hoaks tanpa bukti yang bisa diperiksa.
2. Memberi skor tinggi hanya karena model bahasa merasa konten itu mencurigakan.
3. Menyembunyikan keterbatasan, sumber yang gagal diambil, atau bagian yang tidak diverifikasi.
4. Memakai angka, testimoni, atau statistik palsu untuk membangun kepercayaan.

---

## 1. Kontrak Produk

### 1.1 Masalah

Pengguna menerima link, komentar, dan foto setiap hari. Mereka tidak punya waktu untuk memeriksa satu per satu. Alat fact-check yang ada sering menuntut pencarian manual, dan alat AI generik mudah percaya pada teks yang terlihat meyakinkan.

Masalah utamanya bukan kekurangan informasi, melainkan kekurangan bukti yang terstruktur dan mudah diperiksa.

### 1.2 Pengguna sasaran

| Segmen | Kebutuhan utama | Konteks pemakaian |
|---|---|---|
| Pembaca awam | Cek cepat sebelum membagikan | HP, koneksi tidak stabil |
| Admin grup dan komunitas | Menyaring konten yang masuk | Desktop, banyak link per hari |
| Jurnalis dan peneliti | Bukti, kutipan, dan sumber yang bisa dilacak | Desktop, butuh ekspor |
| Tim komunikasi | Memantau pola komentar | Desktop, volume komentar besar |

### 1.3 Sasaran terukur

| Sasaran | Ukuran | Ambang awal |
|---|---|---|
| Analisis link selesai | Waktu dari submit sampai hasil | <= 30 detik pada mode seimbang |
| Analisis komentar selesai | Waktu untuk 1.000 komentar | <= 15 detik, di luar panggilan AI |
| Analisis foto selesai | Waktu sampai hasil lokal | <= 5 detik, OCR terpisah |
| Kualitas link | Macro F1 pada golden set | >= 0.82 |
| Kualitas komentar | F1 biner terkoordinasi vs organik | >= 0.85 |
| Kualitas foto | F1 manipulasi pada mode mendalam | >= 0.78 |
| Kalibrasi | Expected Calibration Error | <= 0.08 |
| Aksesibilitas | WCAG | 2.2 AA |
| Performa | Lighthouse Performance | >= 90 |

Angka di atas adalah gerbang rilis, bukan janji pemasaran. Jika belum tercapai, fitur diberi label beta dan tidak boleh menampilkan klaim akurasi.

### 1.4 Non-sasaran

1. Menjadi lembaga fact-check resmi atau memberi putusan hukum.
2. Mengambil konten dari balik login, grup privat, atau akun terkunci.
3. Mengidentifikasi individu sebagai buzzer berdasarkan tebakan.
4. Menyimpan data pengguna di server.
5. Memberi jaminan 100% benar atau 100% salah.
6. Menjadi alat doxing, pembungkaman, atau serangan terhadap individu.

### 1.5 Status hasil

Setiap analisis menghasilkan satu status yang lebih berguna daripada sekadar angka.

| Status | Syarat | Arti |
|---|---|---|
| Tidak ada indikasi kuat | Risiko < 30, keyakinan minimal sedang, tidak ada bukti kontra | Tidak ditemukan pola risiko yang menonjol |
| Perlu verifikasi | Risiko 30-59, atau bukti belum cukup | Ada sinyal yang perlu dicek, belum bisa disimpulkan |
| Indikasi kuat | Risiko >= 60, keyakinan minimal sedang, evidence gate terpenuhi | Ada bukti atau kombinasi sinyal yang kuat |
| Tidak dapat diverifikasi | Sumber gagal diambil, sampel terlalu kecil, atau tidak ada bukti eksternal | Aplikasi tidak punya dasar untuk menilai |

Aturan penting: status "Indikasi kuat" tidak boleh muncul jika evidence gate belum terpenuhi, walaupun skor model tinggi.

### 1.6 Batasan tanpa backend

| Batasan | Dampak | Mitigasi |
|---|---|---|
| CORS | Sebagian situs tidak bisa diambil langsung | Multi-proxy, Jina Reader, mode tempel manual |
| API key di browser | Rentan jika ada XSS | CSP ketat, enkripsi opsional, tanpa skrip pihak ketiga |
| Tidak ada server crawler | Tidak bisa mengambil konten dinamis atau berbayar | Batasi ke konten publik, tampilkan kegagalan dengan jelas |
| Biaya API | Analisis mendalam bisa mahal | Mode cepat, cache, batas token, peringatan biaya |
| Tanpa database pusat | Tidak ada pembelajaran dari data pengguna | Evaluasi offline dan dataset anonim |
| Reverse image search | Umumnya butuh API berbayar dan CORS terbatas | Integrasi opsional, fallback buka Google Lens |

---

## 2. Aturan Anti AI Slop

AI slop adalah output yang terlihat rapi tetapi tidak punya isi: klaim berlebihan, kata pemanis, angka palsu, desain seragam yang tidak membantu tugas, dan kode yang hanya meniru struktur tanpa alasan.

Aturan di bawah berlaku untuk copy UI, komentar kode, prompt AI, dokumen, dan pesan error.

### 2.1 Aturan bahasa

1. Pakai kalimat pendek. Satu ide per kalimat.
2. Pakai kata kerja konkret: ambil, periksa, bandingkan, tampilkan, simpan.
3. Sebut angka dengan satuan dan konteks. "23 dari 40 komentar identik", bukan "banyak komentar identik".
4. Bedakan risiko, keyakinan, dan status. Jangan mencampurnya.
5. Tulis keterbatasan secara eksplisit.
6. Hindari tanda seru di UI.
7. Hindari emoji di UI, dokumentasi produk, dan pesan sistem.
8. Hindari pertanyaan retoris di UI.
9. Hindari kata "kami" untuk fitur yang tidak ada.
10. Gunakan "kamu" untuk pengguna, konsisten di seluruh produk.

Contoh buruk:

> AI revolusioner kami mendeteksi hoaks dengan akurasi 100% secara instan!

Contoh baik:

> Skor risiko 72 dari 100. Keyakinan sedang. Dua sumber independen membantah klaim utama. Satu klaim lain belum bisa diverifikasi.

### 2.2 Kata dan frasa terlarang

Daftar ini dilarang di copy produk. Pengecualian hanya untuk dokumen yang secara eksplisit membahas kata terlarang.

| Bahasa Indonesia | Bahasa Inggris |
|---|---|
| revolusioner | revolutionary |
| terbaik di kelasnya | best in class |
| super canggih | cutting edge |
| tanpa cela | seamless |
| mengubah segalanya | game changer |
| dijamin akurat | guaranteed accurate |
| 100% akurat | 100% accurate |
| solusi terbaik | ultimate solution |
| kekuatan AI | AI magic |
| cerdas secara ajaib | magically intelligent |
| masa depan deteksi | future of detection |
| hanya sekali klik | one click away |
| tanpa batas | limitless |

Aturan tambahan:

1. Jangan memakai kata "delve", "landscape", "robust", atau "leverage" dalam copy berbahasa Inggris.
2. Jangan menulis "AI-powered" tanpa menjelaskan bagian mana yang memakai AI.
3. Jangan memakai angka pengguna, testimoni, atau logo mitra yang tidak bisa diverifikasi.
4. Jangan menampilkan skor, grafik, atau persentase contoh yang terlihat seperti data nyata tanpa label "ilustrasi".

### 2.3 Aturan UI

1. Satu aksen utama (emerald) dan warna risiko yang punya arti. Warna modul hanya untuk identitas, bukan status.
2. Maksimal satu gradien besar per halaman. Sisanya permukaan datar.
3. Glassmorphism hanya untuk lapisan navigasi, bukan semua kartu.
4. Tidak ada blob, orb, atau animasi latar yang bergerak terus.
5. Tidak ada dashboard palsu dengan grafik yang tidak bisa dijelaskan.
6. Tidak ada ikon emoji. Pakai Lucide dengan ukuran 16, 20, atau 24.
7. Tidak ada pil berlebihan. Radius besar hanya untuk tombol dan badge.
8. Tidak ada teks abu-abu di atas latar gelap yang kontrasnya di bawah 4.5:1.
9. Tidak ada animasi dekoratif yang tidak membantu pemahaman.
10. Tidak ada dark pattern: tombol menipu, biaya tersembunyi, atau persetujuan otomatis.

### 2.4 Aturan kode

1. TypeScript strict. Tidak ada `any` tanpa komentar alasan.
2. Tidak ada `catch` kosong. Setiap error punya jalur tampilan atau log lokal.
3. Tidak ada kode mati, komentar hasil salin, atau dependensi yang tidak dipakai.
4. Fungsi skor, parser, dan normalisasi harus murni dan punya unit test.
5. Angka ajaib diberi nama konstanta dan dijelaskan.
6. Validasi input di batas sistem memakai Zod.
7. Tidak ada `dangerouslySetInnerHTML` untuk konten yang diambil dari internet.
8. Semua tautan eksternal memakai `rel="noreferrer noopener"`.
9. Prompt AI disimpan dengan versi dan diuji regresi.
10. Setiap fitur baru menambah atau memperbarui test yang relevan.

### 2.5 Aturan prompt AI

1. Prompt sistem mendefinisikan peran, rubrik, batas, dan skema JSON.
2. Konten yang diambil dari internet diperlakukan sebagai data tidak tepercaya.
3. Prompt harus menyatakan bahwa instruksi di dalam artikel, komentar, atau gambar harus diabaikan.
4. Output wajib JSON valid dan divalidasi Zod.
5. Model tidak boleh memberi skor akhir. Ia hanya memberi fitur, temuan, dan kutipan.
6. Setiap temuan harus merujuk pada bukti di teks atau gambar.
7. Jika bukti tidak cukup, model harus menulis "tidak cukup bukti".
8. Temperature 0.1 sampai 0.3 untuk analisis.
9. Tidak meminta chain-of-thought panjang. Minta ringkasan bukti yang bisa diperiksa.
10. Setiap prompt punya versi, changelog, dan contoh output valid.

### 2.6 Pemeriksaan otomatis

Buat `scripts/check-copy.mjs` pada fase 1. Skrip ini:

1. Memindai `src/`, `public/`, dan dokumentasi produk untuk U+2014 dan U+2013.
2. Memindai kata terlarang dari tabel 2.2, kecuali di `plan.md`.
3. Memindai emoji di file UI.
4. Gagal dengan exit code 1 jika menemukan pelanggaran.
5. Dijalankan di `npm run lint:copy` dan sebelum build.

Checklist review manual:

- [ ] Tidak ada em dash atau en dash.
- [ ] Tidak ada klaim akurasi tanpa laporan.
- [ ] Tidak ada emoji di UI.
- [ ] Semua error punya langkah lanjut.
- [ ] Semua skor punya penjelasan dan batas.
- [ ] Semua hasil AI punya kutipan atau alasan.
- [ ] Tidak ada statistik palsu.
- [ ] Kontras dan fokus keyboard lolos.

---

## 3. Arsitektur

### 3.1 Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Build | Vite 8 | Cepat, output statis, tanpa server |
| UI | React 19 + TypeScript | Ekosistem besar, cocok untuk alur interaktif |
| Styling | Tailwind CSS 4 | Token konsisten, utility cepat, bundle kecil |
| Routing | React Router 7 | Route statis, mudah di-deploy |
| Validasi | Zod 4 | Skema AI dan form |
| Ikon | Lucide React | Konsisten, tanpa emoji |
| Storage | localStorage + IndexedDB | Pengaturan kecil, riwayat besar |
| OCR | tesseract.js | Berjalan lokal, dimuat hanya saat dipakai |
| EXIF | exifr | Ringan, lengkap |
| Gambar | Canvas API | Thumbnail dan kompresi lokal |
| Grafik | SVG native | Tidak perlu library chart besar |
| Test | Vitest, Testing Library, Playwright | Unit, komponen, end-to-end |
| Deploy | Cloudflare Pages atau Vercel | Static hosting, tanpa backend |

### 3.2 Struktur folder target

```text
hoaxlab/
  plan.md
  index.html
  package.json
  vite.config.ts
  src/
    main.tsx
    app/
      App.tsx
      router.tsx
      ErrorBoundary.tsx
    components/
      layout/
      ui/
      result/
    features/
      link/
      comment/
      image/
      history/
      settings/
      onboarding/
    lib/
      ai/
        providers.ts
        schemas.ts
        prompts/
        capabilities.ts
      detectors/
        link.ts
        comment.ts
        image.ts
      evidence/
        search.ts
        stance.ts
        factcheck.ts
        reputation.ts
      scoring/
        calibrate.ts
        combine.ts
        confidence.ts
      storage/
        settings.ts
        history.ts
        crypto.ts
      utils/
    data/
      domains.json
      lexicons/
      calibration.json
    types/
  eval/
    links.jsonl
    comments.jsonl
    images.jsonl
    labels/
    reports/
  scripts/
    check-copy.mjs
    eval-local.mjs
    eval-ai.mjs
```

### 3.3 Alur data

```text
Input pengguna
  -> validasi dan normalisasi
  -> pengambilan konten atau parsing lokal
  -> ekstraksi fitur deterministik
  -> pencarian bukti (opsional, sesuai mode)
  -> analisis AI terstruktur
  -> validasi skema
  -> skor deterministik dan kalibrasi
  -> evidence gate dan confidence
  -> tampilan hasil
  -> simpan ke IndexedDB
```

Aturan alur:

1. Setiap tahap punya status yang bisa ditampilkan.
2. Kegagalan satu tahap tidak menghapus hasil tahap sebelumnya.
3. Hasil parsial selalu diberi label "belum lengkap".
4. Pengguna bisa membatalkan analisis yang berjalan.
5. Tidak ada panggilan AI jika input kosong atau tidak valid.

### 3.4 Penyimpanan

| Data | Lokasi | Batas | Catatan |
|---|---|---|---|
| Profil AI | localStorage | 5 profil | API key dienkripsi opsional |
| Preferensi | localStorage | kecil | Tema, mode terakhir, bahasa |
| Riwayat | IndexedDB | 100 item | Thumbnail dikompresi 400px |
| Cache AI | IndexedDB | 200 entri | Hash konten, kedaluwarsa 7 hari |
| Dataset eval | Repo | tidak masuk build | Hanya untuk pengembangan |

Aturan retensi:

1. Pengguna bisa menghapus satu item, semua riwayat, atau semua data.
2. Ekspor riwayat dalam JSON.
3. Impor riwayat dengan validasi skema.
4. Jika kuota penuh, hapus thumbnail dan entri tertua, bukan seluruh data.
5. Tidak ada data yang dikirim ke server HoaxLab karena server itu tidak ada.

### 3.5 Layer AI

Interface tunggal:

```ts
interface AiAdapter {
  id: string
  supportsVision: boolean
  supportsWebSearch: boolean
  analyze(request: AnalysisRequest): Promise<AnalysisResponse>
}
```

Provider yang didukung:

| Provider | Tipe | Vision | Web search |
|---|---|---|---|
| Google Gemini | Native | Ya | Ya, grounding |
| OpenAI | OpenAI-compatible | Ya | Ya, tool search |
| Anthropic | Native | Ya | Ya, web search |
| OpenRouter | OpenAI-compatible | Tergantung model | Ya, model `:online` |
| Groq | OpenAI-compatible | Tergantung model | Tidak |
| DeepSeek | OpenAI-compatible | Tidak | Tidak |
| Ollama | OpenAI-compatible | Tergantung model | Tidak |
| LM Studio | OpenAI-compatible | Tergantung model | Tidak |
| Custom | OpenAI-compatible | Tergantung model | Tidak |

Aturan adapter:

1. Semua output JSON divalidasi Zod.
2. Satu retry jika JSON tidak valid, lalu gagal dengan pesan jelas.
3. Timeout 120 detik untuk teks, 180 detik untuk vision.
4. Error 401, 403, 404, 429, dan 5xx dipetakan ke pesan yang bisa ditindaklanjuti.
5. API key tidak pernah masuk log, pesan error, atau URL.
6. Cache berdasarkan hash konten, provider, model, dan versi prompt.

### 3.6 Provider bukti opsional

| Sumber | Fungsi | Biaya | Catatan |
|---|---|---|---|
| Gemini grounding | Cari sumber web | Kuota provider | Paling mudah untuk pengguna Gemini |
| OpenRouter `:online` | Cari sumber web | Per token | Bergantung model |
| Perplexity Sonar | Cari sumber dan kutipan | Berbayar | Kualitas kutipan baik |
| Google Fact Check Tools | Cocokkan klaim | Gratis, butuh key | CORS perlu diuji |
| TinEye atau SerpAPI | Reverse image search | Berbayar | Untuk mode mendalam |
| Hive atau Sightengine | Deteksi AI generatif | Berbayar | Untuk foto |
| C2PA | Provenance | Gratis | Hanya jika file menyimpan manifest |

Tanpa sumber eksternal, aplikasi tetap bisa memberi triage, tetapi keyakinan maksimal sedang dan skor tinggi dibatasi.

---

## 4. Model Akurasi

### 4.1 Prinsip

1. Bukti eksternal mengalahkan penilaian model.
2. Beberapa sinyal independen mengalahkan satu sinyal kuat.
3. Model bahasa adalah pengekstrak fitur, bukan juri.
4. Skor risiko dan keyakinan adalah dua sumbu terpisah.
5. Hasil harus bisa dijelaskan tanpa membuka model.
6. Jika bukti tidak ada, statusnya "tidak dapat diverifikasi".
7. Tidak ada skor tinggi tanpa evidence gate.
8. Kalibrasi diuji pada data yang tidak dipakai untuk menyetel bobot.

### 4.2 Skor dan keyakinan

Skor risiko 0-100 dihitung dari probabilitas terkalibrasi:

```text
z = b0 + b1*x1 + b2*x2 + ... + bn*xn
p = sigmoid(z)
risk = round(100 * p)
```

`x` adalah fitur yang sudah dinormalisasi 0-1. Bobot `b` dilatih pada training split dan disimpan di `data/calibration.json`. Versi kalibrasi ditampilkan di halaman hasil.

Keyakinan tidak dihitung dari skor. Keyakinan dihitung dari:

| Faktor | Pengaruh |
|---|---|
| Jumlah bukti independen | Semakin banyak, semakin tinggi |
| Kualitas sumber | Fact-checker dan media kredibel lebih tinggi |
| Kesepakatan antar sumber | Sumber yang saling bertentangan menurunkan keyakinan |
| Kelengkapan metadata | Timestamp dan username menaikkan keyakinan komentar |
| Ukuran sampel | Sampel kecil membatasi keyakinan |
| Kemampuan provider | Tanpa web search, keyakinan dibatasi |
| Kontradiksi internal | Menurunkan keyakinan |

Klasifikasi keyakinan:

| Level | Syarat minimum |
|---|---|
| Tinggi | 3 sinyal independen, minimal 1 bukti eksternal, tidak ada kontradiksi besar |
| Sedang | 2 sinyal, atau 1 bukti eksternal dengan dukungan parsial |
| Rendah | 1 sinyal, sampel kecil, atau hanya penilaian model |

### 4.3 Evidence gate

| Modul | Syarat untuk status "Indikasi kuat" | Jika gagal |
|---|---|---|
| Link | 2 sinyal independen, atau 1 kecocokan fact-check dari sumber tepercaya | Skor dibatasi 60, status "Perlu verifikasi" |
| Komentar | Minimal 30 komentar dan 3 sinyal koordinasi | Skor dibatasi 65, keyakinan rendah |
| Foto | Kecocokan reverse search, kontradiksi provenance, atau detector khusus >= 0.90 | Skor dibatasi 65, status "Perlu verifikasi" |

Aturan tambahan:

1. Penilaian model saja tidak pernah menghasilkan keyakinan tinggi.
2. Fact-check yang membahas hoaks tidak boleh dianggap sebagai hoaks. Klasifikasi tipe halaman wajib.
3. Satire, opini, dan parodi tidak boleh diberi status "Indikasi kuat" tanpa konteks yang jelas.
4. Jika sumber utama gagal diambil, hasil tidak boleh lebih dari "Tidak dapat diverifikasi".

### 4.4 Mode analisis

| Mode | Yang dijalankan | Keyakinan maksimal | Cocok untuk |
|---|---|---|---|
| Cepat | Heuristik lokal + satu panggilan AI | Sedang | Triage awal, kuota terbatas |
| Seimbang | Heuristik + AI + web search provider | Tinggi, jika bukti cukup | Pemakaian harian |
| Mendalam | Semua di atas + fact-check API + reverse search + detector khusus | Tinggi | Kasus penting, biaya lebih tinggi |

UI wajib menampilkan mode yang dipakai dan fitur yang tidak tersedia.

### 4.5 Kalibrasi

1. Split data: 60% train, 20% validation, 20% test.
2. Bobot awal dari analisis domain, bukan intuisi kosong.
3. Kalibrasi memakai isotonic regression atau Platt scaling.
4. Metrik kalibrasi: ECE, Brier score, reliability diagram.
5. Kalibrasi diulang setiap kuartal atau saat prompt berubah.
6. Setiap artefak kalibrasi punya versi dan tanggal.
7. Jangan menyetel bobot pada test set.

### 4.6 Anti-halusinasi

1. Setiap klaim harus punya kutipan dari sumber atau teks asli.
2. Sumber harus bisa diklik.
3. Model dilarang mengarang URL. URL divalidasi dan harus berasal dari hasil pencarian.
4. Jika model tidak menemukan sumber, tulis "tidak ditemukan".
5. Jawaban model yang tidak lolos skema dibuang, bukan diperbaiki diam-diam.
6. Kutipan diperiksa ulang terhadap teks sumber dengan pencocokan string fuzzy.
7. Hasil yang bertentangan ditampilkan, bukan dipilih yang paling sesuai.

---

## 5. Spesifikasi Modul

### 5.1 Detektor Link

#### Input

1. URL publik.
2. Mode analisis.
3. Teks manual opsional jika pengambilan otomatis gagal.
4. Konteks tambahan opsional dari pengguna.

#### Pipeline

1. Validasi URL. Hanya http dan https.
2. Normalisasi URL, buang tracking parameter.
3. Ambil konten dengan urutan: direct fetch, Jina Reader, AllOrigins, CorsProxy.
4. Jika semua gagal, tampilkan editor teks manual.
5. Ekstrak judul, author, tanggal, canonical, badan artikel, dan gambar utama.
6. Klasifikasi tipe halaman: berita, fact-check, opini, satire, promosi, forum, tidak dikenal.
7. Ekstrak maksimal 8 klaim atomik.
8. Cari bukti untuk setiap klaim pada mode seimbang atau mendalam.
9. Klasifikasi stance sumber: mendukung, membantah, tidak cukup, tidak relevan.
10. Hitung fitur internal: clickbait, atribusi, emosi, judul vs isi, tanggal, domain.
11. Hitung skor deterministik dan kalibrasi.
12. Terapkan evidence gate dan confidence.
13. Susun ringkasan, temuan, rekomendasi, dan keterbatasan.

#### Fitur dan bobot awal

| Fitur | Bobot awal | Sumber |
|---|---|---|
| Reputasi domain | 0.16 | Registry domain |
| Tipe halaman | 0.10 | Klasifikasi |
| Dukungan klaim | 0.22 | Evidence engine |
| Konsistensi stance lintas sumber | 0.20 | Evidence engine |
| Gaya internal dan clickbait | 0.10 | Heuristik teks |
| Konteks waktu | 0.08 | Metadata dan konten |
| Provenance media | 0.08 | EXIF, hash, reverse search |
| Penilaian AI terstruktur | 0.06 | Model |

Total 1.00. Bobot ini titik awal dan wajib dikalibrasi ulang.

#### Output

1. Status dan skor.
2. Keyakinan.
3. Ringkasan 2 sampai 4 kalimat.
4. Tabel klaim: klaim, stance, sumber, kutipan.
5. Rincian skor per fitur.
6. Temuan dengan tingkat keparahan.
7. Rekomendasi verifikasi.
8. Keterbatasan dan bagian yang tidak diperiksa.
9. Detail teknis: mode, provider, model, versi prompt, waktu.

#### Kegagalan yang harus ditangani

| Kegagalan | Tampilan |
|---|---|
| URL tidak valid | Pesan inline, contoh format |
| Situs memblokir | Tawaran mode tempel manual |
| Konten terlalu pendek | Peringatan, skor tidak dihitung |
| Provider AI error | Hasil heuristik tetap tampil, label parsial |
| Kuota habis | Saran ganti provider atau mode cepat |
| Tidak ada bukti | Status "Tidak dapat diverifikasi", bukan skor tinggi |

#### Kriteria selesai

1. 20 URL uji menghasilkan hasil tanpa crash.
2. Mode manual bekerja saat semua proxy gagal.
3. Setiap skor punya minimal satu alasan yang bisa dibaca.
4. Tidak ada hasil "Indikasi kuat" tanpa evidence gate.
5. Waktu mode seimbang <= 30 detik untuk artikel normal.

### 5.2 Detektor Komentar

#### Input

1. Tempel teks, satu komentar per baris.
2. CSV dengan kolom `username`, `komentar`, `waktu`.
3. JSON dengan skema yang ditentukan.
4. File TXT atau CSV.

#### Pipeline

1. Parse dan validasi.
2. Deteksi delimiter dan header.
3. Preview kolom dan jumlah baris.
4. Normalisasi teks: lowercase, URL, mention, hashtag, emoji, slang.
5. Deduplikasi exact dan near-duplicate.
6. Analisis waktu: burst, entropi, interval.
7. Analisis konsentrasi hashtag, mention, dan domain.
8. Deteksi spam: judi, pinjaman, promosi, kontak.
9. Analisis metadata akun jika tersedia.
10. Analisis jaringan balasan jika tersedia.
11. Analisis bahasa: variasi leksikal, sentimen, template.
12. Analisis AI untuk menjelaskan pola.
13. Hitung skor dan confidence.
14. Tampilkan hasil agregat, bukan menuduh individu.

#### Fitur dan bobot awal

| Fitur | Bobot awal | Syarat data |
|---|---|---|
| Duplikasi dan near-duplicate | 0.25 | Minimal 10 komentar |
| Burst waktu | 0.18 | Minimal 5 timestamp |
| Konsentrasi hashtag, mention, URL | 0.15 | Teks |
| Metadata akun | 0.14 | Username atau data akun |
| Variasi leksikal dan template | 0.10 | Teks |
| Pola jaringan balasan | 0.10 | Data balasan |
| Spam dan promosi | 0.08 | Teks |

Bobot dinormalisasi ulang jika data tidak tersedia.

#### Ambang sampel

| Jumlah komentar | Keyakinan maksimal | Catatan |
|---|---|---|
| < 10 | Rendah | Tampilkan peringatan sampel kecil |
| 10-29 | Sedang | Hanya sinyal kuat yang ditampilkan |
| 30-99 | Sedang atau tinggi | Tergantung jumlah sinyal |
| >= 100 | Tinggi | Jika minimal 3 sinyal independen |

#### Output

1. Status dan skor koordinasi.
2. Keyakinan.
3. Ringkasan pola.
4. Statistik: total, unik, duplikat, spam, pendek, timestamp.
5. Klaster duplikat dengan contoh.
6. Hashtag dan mention teratas.
7. Grafik waktu sederhana.
8. Temuan dan rekomendasi.
9. Keterbatasan: data yang tidak tersedia.

#### Aturan etika

1. Jangan menampilkan nama akun sebagai buzzer.
2. Jangan membuat daftar target.
3. Fokus pada pola agregat.
4. Sembunyikan username di tampilan default, tampilkan hanya jika pengguna membuka detail.

#### Kriteria selesai

1. 5.000 komentar diproses < 2 detik untuk heuristik lokal.
2. Duplikasi exact dan near-duplicate terdeteksi pada fixture.
3. CSV dengan tanda kutip dan koma di dalam komentar terbaca benar.
4. Hasil tidak menampilkan tuduhan individu.
5. Keyakinan turun otomatis saat timestamp tidak ada.

### 5.3 Detektor Foto

#### Input

1. File JPG, PNG, WebP.
2. Maksimal 10 MB.
3. Konteks opsional: caption, klaim, lokasi, tanggal.
4. Pilihan OCR dan mode analisis.

#### Pipeline

1. Validasi tipe dan ukuran.
2. Hitung hash file dan perceptual hash.
3. Buat thumbnail 400px.
4. Baca EXIF, XMP, IPTC.
5. Baca manifest C2PA jika ada.
6. Jalankan OCR jika dipilih.
7. Kirim gambar ke model vision jika tersedia.
8. Reverse image search jika mode mendalam dan API tersedia.
9. Deteksi AI generatif dengan API khusus jika tersedia.
10. Cocokkan klaim OCR dengan bukti.
11. Hitung skor dan confidence.
12. Tampilkan keterbatasan.

#### Fitur dan bobot awal

| Fitur | Bobot awal | Catatan |
|---|---|---|
| Kecocokan reverse search | 0.30 | Sinyal terkuat untuk miskonteks |
| Provenance C2PA | 0.18 | Hanya jika ada |
| Detector AI generatif | 0.20 | Probabilistik, bukan bukti tunggal |
| Metadata EXIF dan software | 0.10 | Tidak ada EXIF bukan bukti |
| Konsistensi klaim OCR | 0.12 | Teks vs konteks |
| Artefak visual dari model | 0.10 | Bobot rendah, rawan false positive |

#### Aturan penting

1. Tidak adanya EXIF bukan indikasi hoaks. Media sosial menghapus metadata.
2. ELA bukan bukti manipuasi. Jika dipakai, bobotnya sangat rendah dan diberi label.
3. Detector AI generatif bisa salah. Tampilkan probabilitas, bukan vonis.
4. Foto asli dengan konteks salah adalah kasus hoaks yang paling umum. Reverse search lebih penting daripada deteksi AI.
5. Foto hasil AI untuk satire tidak otomatis hoaks.

#### Output

1. Status dan skor.
2. Keyakinan.
3. Thumbnail.
4. Metadata EXIF yang terbaca.
5. Teks OCR.
6. Probabilitas AI generatif jika tersedia.
7. Hasil reverse search jika tersedia.
8. Temuan visual dengan bukti.
9. Rekomendasi: cek sumber asli, reverse search, cek tanggal, cek konteks.
10. Keterbatasan.

#### Kriteria selesai

1. EXIF terbaca benar pada fixture kamera.
2. OCR berjalan lokal dan bisa dibatalkan.
3. Tidak ada klaim "pasti AI" tanpa detector khusus.
4. File tanpa EXIF tidak otomatis diberi skor tinggi.
5. Mode lokal tetap memberi hasil meski tanpa AI.

### 5.4 Riwayat

1. Daftar dengan filter tipe, status, dan tanggal.
2. Pencarian judul dan domain.
3. Detail hasil yang bisa dibuka ulang.
4. Hapus satu item dan hapus semua.
5. Ekspor JSON dan impor dengan validasi.
6. Thumbnail disimpan terpisah agar tidak memenuhi kuota.
7. Setiap item menyimpan versi prompt, model, dan kalibrasi.

### 5.5 Pengaturan

1. Daftar profil AI.
2. Tambah, edit, hapus, dan set aktif.
3. Preset provider.
4. Test koneksi.
5. Input API key dengan show/hide.
6. Enkripsi opsional dengan passphrase.
7. Pengaturan sumber bukti: Jina key, fact-check key, reverse search key.
8. Preferensi mode default.
9. Manajemen data: ekspor, impor, hapus.
10. Tentang: versi aplikasi, versi kalibrasi, tautan kebijakan.

### 5.6 Halaman hasil bersama

Urutan tampilan:

1. Status, skor, keyakinan.
2. Ringkasan.
3. Bukti dan sumber.
4. Rincian skor.
5. Temuan.
6. Rekomendasi.
7. Keterbatasan dan bagian yang tidak diperiksa.
8. Detail teknis di bagian yang bisa dibuka.

Skor tidak boleh tampil tanpa keyakinan dan keterbatasan.

---

## 6. UI dan UX

### 6.1 Prinsip

1. Hasil dulu, dekorasi kemudian.
2. Setiap angka punya arti dan penjelasan.
3. Pengguna selalu tahu apa yang sedang terjadi.
4. Kegagalan tidak boleh menjadi jalan buntu.
5. Tampilkan ketidakpastian, jangan sembunyikan.
6. Konsisten lebih penting daripada variasi visual.
7. Aksesibel sejak awal, bukan tambahan di akhir.

### 6.2 Token desain

| Token | Nilai |
|---|---|
| Latar utama | `#05080F` |
| Permukaan | `#0B1220` |
| Permukaan naik | `#111A2B` |
| Garis | `rgba(255,255,255,0.08)` |
| Teks utama | `#F8FAFC` |
| Teks sekunder | `#94A3B8` |
| Teks redup | `#64748B` |
| Aksen utama | `#34D399` |
| Aksen hover | `#6EE7B7` |
| Risiko rendah | `#34D399` |
| Risiko sedang | `#FBBF24` |
| Risiko tinggi | `#FB7185` |
| Aksen link | `#22D3EE` |
| Aksen komentar | `#A78BFA` |
| Aksen foto | `#FBBF24` |
| Font UI | Plus Jakarta Sans |
| Font data | JetBrains Mono |
| Skala teks | 12, 14, 16, 20, 24, 32, 40 |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64 |
| Radius | 8, 12, 16, 24 |
| Durasi animasi | 150-220 ms |

Aturan warna:

1. Warna risiko hanya untuk data risiko, bukan hiasan.
2. Warna modul tidak boleh dipakai untuk status.
3. Jangan memakai lebih dari satu warna aksen dalam satu komponen kecuali untuk status.

### 6.3 Layout

1. Desktop: sidebar 264px, konten maksimal 1120px.
2. Mobile: header 56px, bottom navigation 64px plus safe area.
3. Grid 12 kolom, gutter 24px.
4. Breakpoint: 640, 768, 1024, 1280.
5. Form satu kolom di mobile, maksimal dua kolom di desktop.
6. Tombol utama selalu terlihat tanpa scroll pada alur input.

### 6.4 Komponen wajib

| Komponen | Fungsi |
|---|---|
| AppShell | Navigasi dan latar |
| PageHeader | Judul, deskripsi, aksi |
| Card | Wadah konten |
| Button | Aksi, dengan state loading dan disabled |
| Field | Label, hint, error |
| Input, Textarea, Select | Form |
| Tabs | Pilihan mode atau format |
| Stepper | Tahap analisis |
| Progress | Progres nyata, bukan palsu |
| ScoreGauge | Skor dan status |
| ConfidenceMeter | Tingkat keyakinan |
| EvidenceCard | Sumber, kutipan, stance |
| ClaimRow | Klaim dan penilaian |
| FindingCard | Temuan dan severity |
| StatTile | Statistik komentar |
| SourceChip | Domain dan kategori |
| EmptyState | Kondisi kosong |
| ErrorState | Error dan langkah lanjut |
| Skeleton | Memuat |
| Toast | Notifikasi singkat |
| ConfirmDialog | Aksi destruktif |
| CopyButton | Salin ringkasan |

### 6.5 Alur per modul

#### Link

1. Pengguna membuka modul.
2. Jika belum ada profil AI, tampil gate ke pengaturan.
3. Pengguna menempel URL.
4. Pilih mode.
5. Klik analisis.
6. Stepper menampilkan: validasi, ambil konten, ekstrak, cari bukti, analisis, hitung skor.
7. Jika pengambilan gagal, tampil editor teks manual.
8. Hasil tampil.
9. Pengguna bisa menyimpan, menyalin ringkasan, atau menganalisis lagi.

#### Komentar

1. Pilih format: teks, CSV, atau JSON.
2. Tempel atau unggah.
3. Preview jumlah dan kolom.
4. Pilih apakah timestamp dan username tersedia.
5. Analisis.
6. Hasil agregat dan klaster.
7. Unduh laporan JSON.

#### Foto

1. Drag and drop atau pilih file.
2. Preview dan ukuran.
3. Pilih OCR.
4. Isi konteks opsional.
5. Analisis.
6. Hasil lokal langsung tampil, AI menyusul.
7. Jika AI gagal, hasil lokal tetap ada dengan label.

#### Riwayat

1. Daftar dan filter.
2. Buka detail.
3. Hapus atau ekspor.
4. Impor dengan validasi.

#### Pengaturan

1. Pilih preset.
2. Isi key dan model.
3. Test koneksi.
4. Simpan.
5. Set aktif.
6. Atur data dan privasi.

### 6.6 State

| State | Perilaku |
|---|---|
| Kosong | Penjelasan singkat dan CTA |
| Memuat | Stepper dengan status nyata |
| Parsial | Hasil lokal plus peringatan bagian yang gagal |
| Error | Penyebab, dampak, dan langkah lanjut |
| Rate limit | Waktu tunggu dan saran provider lain |
| Sampel kecil | Peringatan dan confidence rendah |
| Tanpa bukti | Status tidak dapat diverifikasi |
| Sukses | Hasil lengkap dengan keterbatasan |

Aturan:

1. Jangan memakai spinner tanpa teks.
2. Jangan memakai persentase palsu.
3. Jangan menghilangkan hasil yang sudah ada saat AI gagal.
4. Jangan menampilkan error mentah dari provider.
5. Setiap error harus punya minimal satu aksi.

### 6.7 Hierarki halaman hasil

1. Status dan skor.
2. Keyakinan.
3. Ringkasan.
4. Bukti.
5. Rincian skor.
6. Temuan.
7. Rekomendasi.
8. Keterbatasan.
9. Detail teknis.

Alasannya: pengguna harus bisa mengambil keputusan dari bagian atas tanpa membaca seluruh laporan.

### 6.8 Aksesibilitas

1. WCAG 2.2 AA.
2. Fokus terlihat dengan ring 2px.
3. Semua fungsi bisa diakses keyboard.
4. Skip link ke konten utama.
5. `aria-live` untuk progres dan error.
6. Label eksplisit untuk setiap input.
7. Error terhubung ke input dengan `aria-describedby`.
8. Kontras minimal 4.5:1 untuk teks normal.
9. Target sentuh minimal 44x44px.
10. Hormati `prefers-reduced-motion`.
11. Jangan mengandalkan warna saja untuk status.
12. Teks alternatif untuk gambar dan grafik.

### 6.9 Performa

| Metrik | Target |
|---|---|
| Initial JS | <= 180 KB gzip, tanpa OCR |
| LCP | < 2.5 detik pada 4G |
| INP | < 200 ms |
| CLS | < 0.1 |
| Lighthouse Performance | >= 90 |
| Lighthouse Accessibility | >= 95 |
| Bundle route awal | <= 120 KB gzip |

Cara mencapai:

1. Code splitting per route.
2. Lazy load tesseract dan halaman foto.
3. Lazy load grafik.
4. Cache respons AI.
5. Batasi teks artikel 15.000 karakter.
6. Batasi komentar 5.000 per analisis.
7. Kompres thumbnail sebelum disimpan.
8. Hindari library besar untuk hal yang bisa dilakukan SVG atau CSS.

### 6.10 Copy

1. Bahasa Indonesia.
2. Kalimat aktif.
3. Tidak ada tanda seru.
4. Tidak ada emoji.
5. Tidak ada em dash.
6. Tidak ada kata terlarang dari 2.2.
7. Jelaskan istilah teknis saat pertama muncul.
8. Gunakan "kamu", bukan "Anda" atau "user".
9. Angka selalu punya konteks.
10. Status memakai istilah dari tabel 1.5.

Contoh copy hasil:

> Skor risiko 64 dari 100. Keyakinan sedang. Dua sumber membantah klaim utama, tetapi satu klaim lain belum ditemukan sumbernya. Jangan sebarkan sebelum memeriksa tautan di bagian bukti.

Contoh copy error:

> Artikel gagal diambil. Situs menolak pembaca otomatis. Tempel teks artikel secara manual untuk melanjutkan analisis.

---

## 7. Data dan Evaluasi

### 7.1 Dataset

| Dataset | Jumlah | Komposisi | Sumber |
|---|---|---|---|
| Link | 600 | 200 hoaks, 150 valid, 100 satire/opini, 100 clickbait-true, 50 halaman fact-check | Mafindo, CekFakta, TurnBackHoax, media publik |
| Komentar | 240 thread | 120 terkoordinasi, 120 organik, minimal 30 komentar per thread | Thread publik, anotasi manual |
| Foto | 400 | 100 asli konteks benar, 100 asli konteks salah, 100 manipulasi, 100 AI generatif | Kasus fact-check publik, fixture sintetis untuk unit test |
| Klaim | 300 | Klaim dengan bukti mendukung, membantah, atau tidak cukup | Turunan dataset link |

Aturan data:

1. Jangan menyimpan teks berhak cipta penuh. Simpan URL, kutipan pendek, dan label.
2. Foto hanya untuk evaluasi internal, bukan ditampilkan sebagai contoh tanpa izin.
3. Data pribadi dari komentar dianonimkan.
4. Dataset test tidak dipakai untuk menyetel prompt atau bobot.
5. Setiap item punya sumber, tanggal, dan label alasan.

### 7.2 Protokol anotasi

1. Dua anotator independen per item.
2. Label buta, tanpa melihat output aplikasi.
3. Codebook berisi definisi dan contoh batas.
4. Adjudikasi oleh anotator ketiga jika berbeda.
5. Cohen's kappa minimal 0.75.
6. Jika kappa di bawah ambang, codebook direvisi dan anotasi diulang.
7. Setiap label menyimpan alasan singkat.

Taksonomi label link:

| Label | Definisi |
|---|---|
| Hoaks | Klaim faktual salah atau menyesatkan |
| Valid | Klaim utama didukung sumber kredibel |
| Satire | Konten komedi yang jelas |
| Opini | Penilaian, bukan klaim fakta |
| Clickbait-true | Judul sensasional, isi benar |
| Tidak dapat diverifikasi | Bukti tidak cukup |

Taksonomi komentar:

| Label | Definisi |
|---|---|
| Terkoordinasi | Pola duplikasi, waktu, atau akun yang kuat |
| Organik | Variasi wajar, tanpa pola koordinasi |
| Spam | Promosi, judi, pinjaman, tautan |
| Campuran | Ada sinyal, tetapi tidak konsisten |

Taksonomi foto:

| Label | Definisi |
|---|---|
| Asli konteks benar | Foto asli, konteks sesuai |
| Asli konteks salah | Foto asli dipakai untuk peristiwa lain |
| Manipulasi | Ada editing yang mengubah makna |
| AI generatif | Dihasilkan model generatif |
| Tidak dapat diverifikasi | Bukti tidak cukup |

### 7.3 Metrik

1. Precision, recall, F1 per kelas dan macro.
2. AUROC dan AUPRC untuk skor kontinu.
3. ECE dan Brier score untuk kalibrasi.
4. False positive rate pada ambang "Indikasi kuat".
5. Recall pada precision 0.90.
6. Waktu proses p50 dan p95.
7. Tingkat kegagalan pengambilan konten.
8. Tingkat retry JSON.
9. Bootstrap confidence interval 1.000 iterasi.

### 7.4 Target rilis

| Modul | Metrik | Target |
|---|---|---|
| Link | Macro F1 | >= 0.82 |
| Link | Precision "Indikasi kuat" | >= 0.88 |
| Link | Recall "Indikasi kuat" | >= 0.78 |
| Link | ECE | <= 0.08 |
| Komentar | F1 terkoordinasi vs organik | >= 0.85 |
| Komentar | Precision keyakinan tinggi | >= 0.90 |
| Komentar | ECE | <= 0.08 |
| Foto | F1 manipulasi mode mendalam | >= 0.78 |
| Foto | AUROC AI generatif dengan detector khusus | >= 0.85 |
| Semua | Waktu hasil mode seimbang | <= 30 detik |

Jika target tidak tercapai:

1. Fitur tetap beta.
2. Label "beta" terlihat di UI.
3. Klaim akurasi tidak dipublikasikan.
4. Hasil evaluasi dicatat di `eval/reports/`.

### 7.5 Harness evaluasi

1. `npm run eval:local` menjalankan heuristik tanpa API.
2. `npm run eval:ai -- --provider gemini --mode balanced` menjalankan evaluasi penuh dengan cache.
3. Hasil ditulis ke `eval/reports/YYYY-MM-DD.md`.
4. Setiap laporan memuat versi prompt, model, kalibrasi, dan commit.
5. Regression gate: F1 turun lebih dari 2 poin atau ECE naik lebih dari 0.02 = gagal rilis.
6. Live evaluation memakai batas biaya dan concurrency.
7. Respons API direkam untuk regression offline.

### 7.6 Red teaming

Kasus wajib:

1. Artikel fact-check yang mengutip hoaks.
2. Satire yang terlihat serius.
3. Opini yang keras tetapi bukan hoaks.
4. Berita benar dengan judul clickbait.
5. Komentar organik yang marah.
6. Komentar buzzer yang halus tanpa duplikasi.
7. Foto asli dengan konteks salah.
8. Foto AI yang sangat realistis.
9. Teks dengan prompt injection.
10. URL yang meniru domain resmi.
11. Komentar dengan banyak bahasa dan slang.
12. Thread dengan timestamp palsu.

### 7.7 Taksonomi error

| Kode | Jenis | Contoh |
|---|---|---|
| E01 | False positive satire | Satire diberi status hoaks |
| E02 | False positive opini | Opini politik diberi skor tinggi |
| E03 | False positive fact-check | Halaman debunk dianggap hoaks |
| E04 | False negative tanpa bukti | Hoaks baru tanpa sumber |
| E05 | Pengambilan konten gagal | Situs memblokir |
| E06 | Ekstraksi salah | Navigasi terbaca sebagai artikel |
| E07 | Klaster salah | Komentar berbeda dianggap duplikat |
| E08 | Metadata hilang | EXIF dihapus media sosial |
| E09 | Detector AI salah | Foto asli dianggap AI |
| E10 | Prompt injection | Konten menyuruh model mengabaikan aturan |

Setiap error dicatat dengan penyebab, dampak, dan perbaikan.

---

## 8. Roadmap Fase

Estimasi adalah perkiraan untuk satu pengembang. Fase dapat berjalan berurutan, kecuali disebutkan lain.

| Fase | Nama | Estimasi | Status |
|---|---|---|---|
| 0 | Kontrak produk dan anti-slop | 0.5 hari | Selesai, kontrak di kode |
| 1 | Fondasi repo dan design system | 1 hari | Selesai, fondasi v0.1.0 |
| 2 | Layer AI dan pengaturan | 2 hari | Selesai, v1 |
| 3 | Detektor link v1 | 3 hari | Selesai, v1 |
| 4 | Detektor komentar v1 | 3 hari | Selesai, v1 |
| 5 | Detektor foto v1 | 2 hari | Selesai, v1 |
| 6 | Riwayat dan siklus data | 1.5 hari | Selesai, v1 |
| 7 | Evidence engine dan mode | 5 hari | Selesai, v1 |
| 8 | Buzzer analytics lanjutan | 4 hari | Belum |
| 9 | Image forensics lanjutan | 5 hari | Belum |
| 10 | Evaluasi dan kalibrasi | 7 hari | Belum |
| 11 | UX, aksesibilitas, performa | 4 hari | Belum |
| 12 | UAT, rilis, operasi | 2 hari | Belum |

Total estimasi: sekitar 40 hari kerja.

### Fase 0: Kontrak Produk dan Anti-Slop

Tujuan: menyepakati definisi hasil, status, batas akurasi, dan aturan copy sebelum menulis kode.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 0.1 | Finalisasi dokumen ini | `plan.md` | Disetujui |
| 0.2 | Tetapkan status hasil | Tabel 1.5 | Dipakai di seluruh UI |
| 0.3 | Tetapkan aturan anti-slop | Bagian 2 | Checklist review tersedia |
| 0.4 | Tulis copy deck | Daftar istilah dan contoh | Tidak ada kata terlarang |
| 0.5 | Tetapkan gerbang akurasi | Tabel 7.4 | Tidak ada klaim tanpa evaluasi |

Exit criteria:

1. Tidak ada istilah yang saling bertentangan.
2. Semua fitur punya status yang jelas.
3. Aturan em dash dan kata terlarang disepakati.

### Fase 1: Fondasi Repo dan Design System

Tujuan: repo bersih, build stabil, dan komponen dasar siap.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 1.1 | Scaffold Vite React TS Tailwind | Repo berjalan | `npm run dev` dan build sukses |
| 1.2 | Token desain | CSS variables | Sesuai tabel 6.2 |
| 1.3 | Komponen UI dasar | Button, Card, Field, Alert, Badge | Tidak ada inline style acak |
| 1.4 | Layout dan routing | AppShell, sidebar, bottom nav | Desktop dan mobile |
| 1.5 | Error boundary dan toast | Penanganan error global | Error tidak memutihkan layar |
| 1.6 | Skrip cek copy | `scripts/check-copy.mjs` | Gagal jika ada em dash |
| 1.7 | Baseline Lighthouse | Laporan awal | Skor tercatat |

Exit criteria:

1. Build tanpa warning TypeScript.
2. Tidak ada em dash atau en dash di `src`.
3. Layout lolos di 360px dan 1440px.
4. Skip link dan fokus keyboard bekerja.

### Fase 2: Layer AI dan Pengaturan

Tujuan: pengguna bisa menghubungkan provider AI dengan aman dan menguji koneksi.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 2.1 | Interface adapter | `AiAdapter` | Tipe stabil |
| 2.2 | Adapter OpenAI-compatible | OpenAI, OpenRouter, Groq, DeepSeek, Ollama | Tes teks berhasil |
| 2.3 | Adapter Gemini | Native | Tes teks dan vision |
| 2.4 | Adapter Anthropic | Native, direct browser | Tes teks dan vision |
| 2.5 | Validasi JSON dan retry | Zod + satu retry | Output invalid tertangani |
| 2.6 | Preset provider | Daftar preset | Base URL dan model terisi |
| 2.7 | Halaman pengaturan | CRUD profil, test koneksi | Semua state tampil |
| 2.8 | Penyimpanan key | localStorage, enkripsi opsional | Key tidak muncul di log |
| 2.9 | Registry kemampuan | Vision dan web search | UI menyesuaikan fitur |
| 2.10 | Cache respons | Hash + TTL | Tidak ada panggilan ganda |

Exit criteria:

1. Tiga provider utama lolos test koneksi.
2. Key salah menampilkan pesan yang bisa ditindaklanjuti.
3. Tidak ada key di console, URL, atau pesan error.
4. Pengguna bisa menghapus semua data.

### Fase 3: Detektor Link v1

Tujuan: alur link end-to-end dengan heuristik dan AI.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 3.1 | Fetch multi-proxy | Jina, AllOrigins, CorsProxy | Fallback berurutan |
| 3.2 | Ekstraksi artikel | Judul, teks, tanggal, author | Fixture HTML lolos |
| 3.3 | Mode tempel manual | Editor teks | Bisa lanjut saat fetch gagal |
| 3.4 | Registry domain v1 | `domains.json` | Kategori dan versi |
| 3.5 | Heuristik internal | Clickbait, atribusi, emosi | Unit test |
| 3.6 | Klasifikasi tipe halaman | Berita, fact-check, opini, satire | Kasus uji lolos |
| 3.7 | Prompt dan skema | JSON tervalidasi | Retry bekerja |
| 3.8 | UI dan stepper | Form, progress, hasil | Mobile dan desktop |
| 3.9 | Simpan riwayat | IndexedDB | Bisa dibuka ulang |
| 3.10 | Batas dan label | Keterbatasan tampil | Tidak ada klaim berlebih |

Exit criteria:

1. 20 URL uji tanpa crash.
2. Hasil parsial tampil jika AI gagal.
3. Waktu normal <= 30 detik.
4. Setiap skor punya alasan.

### Fase 4: Detektor Komentar v1

Tujuan: analisis pola komentar secara lokal dan dengan AI.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 4.1 | Parser teks, CSV, JSON | Normalisasi input | Kutip dan koma terbaca |
| 4.2 | Normalisasi bahasa | Slang, URL, mention, emoji | Fixture Indonesia lolos |
| 4.3 | Deduplikasi | Exact hash + near-duplicate | Klaster benar |
| 4.4 | Spam dan konsentrasi | Regex dan indeks | Kasus judi/promo terdeteksi |
| 4.5 | Burst dan sentimen | Statistik waktu | Timestamp invalid diabaikan |
| 4.6 | Prompt dan skema | JSON tervalidasi | Tidak menuduh individu |
| 4.7 | UI tempel dan unggah | Preview dan mapping | Format salah diberi pesan |
| 4.8 | Performa 5.000 komentar | Web Worker atau LSH | < 2 detik |
| 4.9 | Hasil agregat | Statistik dan klaster | Username tersembunyi |

Exit criteria:

1. 30 thread uji berjalan.
2. Sampel kecil memicu confidence rendah.
3. Tidak ada daftar target individu.
4. CSV kompleks terbaca benar.

### Fase 5: Detektor Foto v1

Tujuan: analisis lokal dan vision dengan batas yang jelas.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 5.1 | Upload dan validasi | Dropzone | Tipe dan ukuran dicek |
| 5.2 | EXIF dan hash | Metadata, pHash | Fixture kamera lolos |
| 5.3 | Thumbnail | Canvas 400px | Kuota aman |
| 5.4 | OCR lazy | tesseract.js | Bisa dibatalkan |
| 5.5 | Vision prompt | JSON tervalidasi | Tidak mengklaim pasti |
| 5.6 | Mode lokal | Hasil tanpa AI | Tetap berguna |
| 5.7 | Peringatan privasi | Copy jelas | Pengguna tahu data dikirim |
| 5.8 | Batas keyakinan | Evidence gate | Tidak ada vonis AI |

Exit criteria:

1. EXIF dan OCR benar pada fixture.
2. AI gagal tidak menghapus hasil lokal.
3. Tidak ada klaim "pasti AI".
4. File tanpa EXIF tidak otomatis berisiko tinggi.

### Fase 6: Riwayat dan Siklus Data

Tujuan: hasil bisa disimpan, dibuka, diekspor, dan dihapus dengan aman.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 6.1 | Skema IndexedDB | Store dan indeks | Migrasi versi |
| 6.2 | Daftar riwayat | Filter dan pencarian | 100 item lancar |
| 6.3 | Detail hasil | Render dari storage | Sama dengan hasil awal |
| 6.4 | Hapus dan bersihkan | Konfirmasi | Tidak ada sisa thumbnail |
| 6.5 | Ekspor dan impor | JSON tervalidasi | Roundtrip identik |
| 6.6 | Kuota penuh | Fallback | Data lama dihapus bertahap |
| 6.7 | Versi data | Prompt, model, kalibrasi | Ditampilkan di detail |

Exit criteria:

1. Ekspor lalu impor mengembalikan data yang sama.
2. Tidak ada data yang tersisa setelah hapus semua.
3. Kuota penuh tidak merusak aplikasi.

### Fase 7: Evidence Engine dan Mode

Tujuan: meningkatkan akurasi dengan bukti eksternal dan sitasi.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 7.1 | Registry kemampuan provider | Web search dan vision | UI menyesuaikan |
| 7.2 | Adapter web search | Gemini grounding, OpenRouter online, Perplexity | Hasil dengan URL |
| 7.3 | Ekstraksi klaim v2 | Maksimal 8 klaim | Klaim atomik |
| 7.4 | Stance detection | Mendukung, membantah, tidak cukup | Kutipan wajib |
| 7.5 | Fact-check lookup | Google Fact Check API | CORS diuji |
| 7.6 | Registry domain v2 | Kategori dan skor | Versi terlihat |
| 7.7 | Evidence gate | Aturan tabel 4.3 | Skor dibatasi |
| 7.8 | Confidence model | Faktor tabel 4.2 | Terpisah dari skor |
| 7.9 | Sitasi dan pemeriksaan kutipan | EvidenceCard | URL valid |
| 7.10 | Pemilih mode | Cepat, seimbang, mendalam | Biaya dijelaskan |

Exit criteria:

1. Mode seimbang menghasilkan minimal 2 sumber untuk 80% klaim yang bisa diverifikasi.
2. URL yang tidak valid dibuang.
3. Tidak ada skor tinggi tanpa evidence gate.
4. Kutipan bisa dicocokkan ke sumber.

### Fase 8: Buzzer Analytics Lanjutan

Tujuan: analisis komentar besar dan pola koordinasi yang lebih halus.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 8.1 | MinHash dan LSH | Near-duplicate cepat | 10.000 komentar < 3 detik |
| 8.2 | Embedding opsional | Klaster semantik | Biaya dikendalikan |
| 8.3 | Burst detection | Kleinberg atau entropi | Fixture waktu lolos |
| 8.4 | Analisis jaringan | Reply graph | Modularity dihitung |
| 8.5 | Heuristik akun | Username, umur, rasio | Hanya jika data ada |
| 8.6 | Normalisasi bahasa | Kamus slang | Akurasi naik |
| 8.7 | Visualisasi | Timeline dan klaster | Tidak menyesatkan |
| 8.8 | Kalibrasi komentar | Ambang baru | ECE turun |

Exit criteria:

1. 10.000 komentar tidak membekukan UI.
2. Tidak ada O(n^2) pada jalur utama.
3. Visualisasi punya label dan penjelasan.
4. Hasil tetap agregat.

### Fase 9: Image Forensics Lanjutan

Tujuan: bukti visual yang lebih kuat untuk foto.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 9.1 | C2PA | Baca manifest | Status provenance |
| 9.2 | pHash dan database | Impor/ekspor hash | Cocokkan cepat |
| 9.3 | Reverse search | SerpAPI, TinEye, atau Lens | Hasil dengan URL |
| 9.4 | Detector AI | Hive, Sightengine, AI or Not | Probabilitas |
| 9.5 | Model lokal opsional | Transformers.js | Lazy load |
| 9.6 | Laporan provenance | Ringkasan bukti | Tidak ada vonis |
| 9.7 | Kalibrasi foto | Ambang | ECE tercatat |

Exit criteria:

1. Tiga sumber bukti bisa dipakai.
2. Biaya API terlihat sebelum analisis.
3. Tidak ada klaim "pasti AI".
4. Mode lokal tetap tersedia.

### Fase 10: Evaluasi dan Kalibrasi

Tujuan: mengukur akurasi dan mengunci gerbang rilis.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 10.1 | Dataset link | 600 item | Label dan sumber |
| 10.2 | Dataset komentar | 240 thread | Dua anotator |
| 10.3 | Dataset foto | 400 item | Empat kelas |
| 10.4 | Protokol anotasi | Codebook | Kappa >= 0.75 |
| 10.5 | Eval lokal | `eval:local` | Laporan dibuat |
| 10.6 | Eval AI | `eval:ai` | Cache dan biaya |
| 10.7 | Prompt regression | Rekaman respons | Perubahan terdeteksi |
| 10.8 | Red team | 12 kasus | Semua dianalisis |
| 10.9 | Kalibrasi | `calibration.json` | ECE <= 0.08 |
| 10.10 | Laporan rilis | Markdown | Target tercatat |

Exit criteria:

1. Target tabel 7.4 terpenuhi atau fitur ditandai beta.
2. Laporan bisa direproduksi.
3. Tidak ada klaim akurasi tanpa laporan.

### Fase 11: UX, Aksesibilitas, Performa

Tujuan: produk terasa selesai dan nyaman dipakai.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 11.1 | Audit alur | Daftar gesekan | Tidak ada jalan buntu |
| 11.2 | State lengkap | Empty, loading, error, partial | Semua modul |
| 11.3 | Keyboard dan screen reader | Perbaikan a11y | WCAG 2.2 AA |
| 11.4 | Responsif | 360px sampai 1440px | Tidak ada overflow |
| 11.5 | Performa | Code split, lazy load | Target tabel 6.9 |
| 11.6 | Audit copy | Hapus kata terlarang | Skrip lolos |
| 11.7 | Cross-browser | Chrome, Firefox, Safari, Edge | Alur utama lolos |

Exit criteria:

1. Lighthouse Performance >= 90.
2. Lighthouse Accessibility >= 95.
3. Tidak ada pelanggaran em dash atau kata terlarang.
4. Semua alur bisa diselesaikan dengan keyboard.

### Fase 12: UAT, Rilis, Operasi

Tujuan: merilis versi statis yang stabil dan mudah dirawat.

| ID | Pekerjaan | Output | Kriteria selesai |
|---|---|---|---|
| 12.1 | UAT | Skenario pengguna | Semua lolos |
| 12.2 | Deploy statis | Cloudflare Pages atau Vercel | HTTPS aktif |
| 12.3 | Header keamanan | CSP dan lainnya | Diuji |
| 12.4 | Versioning | Semver dan changelog | Terlihat di UI |
| 12.5 | Runbook | Dokumen operasi | Rollback diuji |
| 12.6 | Rekalibrasi kuartalan | Jadwal | Pemilik jelas |

Exit criteria:

1. Rilis bisa di-rollback.
2. Tidak ada secret di bundle.
3. README berisi cara pakai dan batas.
4. Laporan evaluasi versi rilis tersedia.

### Urutan kritis

1. Fase 0 dan 1 harus selesai sebelum kode fitur.
2. Fase 2 harus selesai sebelum semua modul.
3. Fase 3, 4, dan 5 bisa berjalan paralel setelah fase 2.
4. Fase 7 bergantung pada fase 3.
5. Fase 8 bergantung pada fase 4.
6. Fase 9 bergantung pada fase 5.
7. Fase 10 bergantung pada fase 3 sampai 9.
8. Fase 11 dan 12 tidak boleh dimulai sebelum fase 10 stabil.

---

## 9. Strategi Pengujian

### 9.1 Unit

1. Parser URL, CSV, dan JSON.
2. Normalisasi teks dan slang.
3. Deduplikasi exact dan near-duplicate.
4. Perhitungan burst, entropi, dan konsentrasi.
5. Rumus skor dan confidence.
6. Kalibrasi.
7. Validasi skema AI.
8. Pemeriksaan kutipan.
9. Utilitas tanggal dan ukuran file.

Alat: Vitest dan fast-check untuk property-based test.

### 9.2 Integrasi

1. Adapter AI dengan respons mock.
2. Fetch artikel dengan fixture HTML.
3. IndexedDB dengan fake-indexeddb.
4. Ekspor dan impor riwayat.
5. Alur settings sampai test koneksi.

### 9.3 End-to-end

1. Onboarding sampai analisis link.
2. Analisis komentar dengan CSV.
3. Analisis foto dengan OCR.
4. Riwayat dan hapus.
5. Error provider dan pemulihan.
6. Mode manual saat fetch gagal.

Alat: Playwright.

### 9.4 Aksesibilitas

1. axe-core pada setiap halaman.
2. Navigasi keyboard.
3. Screen reader smoke test.
4. Kontras warna.
5. Reduced motion.

### 9.5 Performa

1. Lighthouse CI.
2. Bundle analyzer.
3. Batas ukuran route.
4. Uji 5.000 komentar dan 10.000 komentar.
5. Uji memori OCR.

### 9.6 Keamanan

1. CSP tanpa unsafe-inline.
2. Tidak ada secret di bundle.
3. Uji XSS pada input dan hasil.
4. Uji prompt injection.
5. Uji URL berbahaya.
6. Uji file gambar rusak.

### 9.7 Prompt regression

1. Rekam respons untuk fixture.
2. Bandingkan skema dan skor.
3. Perubahan prompt menaikkan versi.
4. Hasil yang berubah drastis ditinjau manual.

### 9.8 Gerbang rilis

1. Semua test wajib lulus.
2. Tidak ada error TypeScript.
3. Tidak ada pelanggaran copy.
4. Target performa tercapai.
5. Laporan evaluasi tersedia.
6. Tidak ada temuan keamanan kritis.

---

## 10. Keamanan, Privasi, dan Hukum

### 10.1 Model ancaman API key

1. Key disimpan di browser dan bisa dicuri jika ada XSS.
2. Mitigasi: CSP ketat, tanpa skrip pihak ketiga, sanitasi input.
3. Enkripsi opsional dengan passphrase dan WebCrypto AES-GCM.
4. Kunci turunan memakai PBKDF2 atau Argon2 jika tersedia.
5. Kunci tidak pernah dikirim ke selain provider yang dipilih.
6. Tombol hapus key harus benar-benar menghapus dari storage.

### 10.2 XSS dan konten eksternal

1. Tidak ada `dangerouslySetInnerHTML`.
2. Teks artikel ditampilkan sebagai teks, bukan HTML.
3. URL divalidasi dan hanya http atau https.
4. Tautan luar memakai `noopener noreferrer`.
5. Markdown dari AI tidak dirender sebagai HTML.
6. Kutipan dibatasi panjangnya.

### 10.3 Prompt injection

1. Konten asing dibungkus penanda data.
2. Prompt sistem menyatakan konten tidak boleh memberi instruksi.
3. Instruksi mencurigakan di dalam konten tidak dieksekusi.
4. Output tetap divalidasi skema.
5. Perubahan perilaku model dicatat sebagai error.

### 10.4 Privasi

1. Tidak ada analytics default.
2. Tidak ada server HoaxLab.
3. Riwayat bisa dihapus dan diekspor.
4. Thumbnail dan teks komentar disimpan lokal.
5. Peringatan sebelum mengirim gambar ke provider.
6. Proxy CORS dapat melihat URL. Beri tahu pengguna.
7. Jangan menyimpan data pribadi yang tidak perlu.

### 10.5 Hukum dan etika

1. Hanya konten publik.
2. Tidak mengambil konten dari balik login.
3. Tidak menuduh individu sebagai buzzer.
4. Hasil adalah indikator risiko, bukan putusan hukum.
5. Hormati hak cipta. Simpan kutipan pendek.
6. Patuhi UU PDP untuk data pribadi.
7. Sediakan mekanisme koreksi dan hapus data.
8. Jika menyebut nama organisasi, sertakan bukti dan konteks.

### 10.6 Disclaimer wajib

Tampilkan di halaman hasil dan pengaturan:

> HoaxLab memberi penilaian risiko berdasarkan pola, metadata, dan bukti yang tersedia. Hasilnya bukan bukti hukum dan tidak menggantikan fact-checker manusia. Selalu periksa sumber primer sebelum mengambil keputusan.

---

## 11. Rilis dan Operasi

### 11.1 Hosting

1. Static hosting: Cloudflare Pages, Vercel, atau Netlify.
2. Tidak ada environment variable rahasia.
3. Build deterministik.
4. HTTPS wajib.
5. SPA fallback ke `index.html`.

### 11.2 Header keamanan

1. Content-Security-Policy ketat.
2. `X-Content-Type-Options: nosniff`.
3. `Referrer-Policy: strict-origin-when-cross-origin`.
4. `Permissions-Policy` minimal.
5. Frame ancaman dibatasi.

### 11.3 Versi

1. Semver.
2. Changelog pengguna.
3. Versi prompt dan kalibrasi ditampilkan di detail hasil.
4. Migrasi storage diberi versi.
5. Data lama tetap bisa dibuka atau diberi pesan migrasi.

### 11.4 Operasi

1. Tidak ada monitoring server.
2. Diagnostik lokal: error terakhir, latensi provider, versi prompt.
3. Laporan bug menyertakan versi aplikasi dan kalibrasi.
4. Rekalibrasi kuartalan.
5. Review daftar domain setiap bulan.
6. Review prompt setiap perubahan model.

### 11.5 Rollback

1. Deploy sebelumnya tetap tersedia di platform.
2. Rollback tidak menghapus data pengguna.
3. Perubahan skema storage harus kompatibel ke belakang.
4. Jika tidak kompatibel, sediakan ekspor sebelum migrasi.

---

## 12. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Proxy CORS mati | Link tidak bisa dianalisis | Multi-proxy, mode manual |
| Provider AI berubah perilaku | Akurasi turun | Prompt regression, versi model |
| Halusinasi model | Bukti palsu | Validasi URL, kutipan wajib, evidence gate |
| False positive satire | Reputasi rusak | Klasifikasi tipe halaman, red teaming |
| Dataset tidak representatif | Klaim akurasi lemah | Sampling berlapis, laporan CI |
| Biaya API membengkak | Pengguna berhenti | Mode cepat, cache, batas token |
| Key dicuri XSS | Kerugian pengguna | CSP, enkripsi, tanpa skrip pihak ketiga |
| Detector AI salah | Foto asli dituduh | Probabilitas, bukan vonis, bobot rendah |
| Metadata hilang | Analisis foto lemah | Jangan jadikan ketiadaan EXIF sebagai bukti |
| Konten berhak cipta | Masalah hukum | Simpan kutipan pendek, tautkan sumber |
| Defamasi | Masalah hukum | Agregat, tanpa nama individu, disclaimer |
| Prompt injection | Hasil menyimpang | Delimiter, validasi, uji red team |

---

## 13. Backlog Pasca-Rilis

1. Ekstensi browser untuk cek link langsung.
2. Mode perbandingan dua artikel.
3. Klaim per kalimat dengan sorotan.
4. PWA dan mode offline.
5. Kamus slang Indonesia yang bisa diperbarui.
6. Database hash hoax yang bisa diimpor komunitas.
7. Ekspor laporan PDF.
8. API publik opsional dengan backend terpisah.
9. Dukungan bahasa Inggris.
10. Integrasi WhatsApp bot, jika ada backend.
11. Panel admin untuk curator domain.
12. Pembelajaran dari koreksi pengguna secara anonim.

Semua item di atas memerlukan evaluasi ulang privasi, biaya, dan akurasi sebelum dikerjakan.

---

## 14. Definition of Done

Sebuah fase dianggap selesai jika:

1. Semua sub-fase memiliki output yang bisa diperiksa.
2. Test unit dan integrasi lulus.
3. Tidak ada error TypeScript.
4. Tidak ada em dash, en dash, atau kata terlarang.
5. State kosong, memuat, error, dan parsial sudah ada.
6. Aksesibilitas dasar lolos.
7. Performa tidak melewati budget.
8. Dokumentasi diperbarui.
9. Tidak ada klaim akurasi tanpa laporan.
10. Perubahan dicatat di changelog.

Sebuah rilis dianggap selesai jika:

1. Fase 0 sampai 12 selesai.
2. Target evaluasi terpenuhi atau fitur ditandai beta.
3. UAT lolos.
4. Rollback diuji.
5. Laporan evaluasi tersedia.
6. Disclaimer dan kebijakan privasi tampil.

---

## 15. Tugas Berikutnya

Urutan kerja setelah dokumen ini:

1. Setujui `plan.md`.
2. Jalankan fase 0.2 sampai 0.5.
3. Scaffold repo pada fase 1.
4. Bangun design system dan skrip cek copy.
5. Bangun layer AI dan halaman pengaturan.
6. Bangun detektor link v1.
7. Lanjut komentar, foto, riwayat.
8. Bangun evidence engine sebelum mengklaim akurasi.
9. Siapkan dataset dan evaluasi.
10. Kalibrasi, hardening, lalu rilis.

---

## 16. Changelog

| Tanggal | Versi | Perubahan |
|---|---|---|
| 2026-10-29 | 1.0 | Dokumen awal, aturan anti-slop, arsitektur, model akurasi, fase 0-12 |
