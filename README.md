# Arah Jamaah — Demo Operasional Umroh

Demo interaktif untuk calon pengguna, berdasarkan [Master Blueprint V1.0](docs/BLUEPRINT_V1.0.md). Antarmuka berbahasa Indonesia memakai identitas ungu–emas dari logo referensi pengguna, foto profil manusia realistis, dan aset lokal.

## Deploy ke Netlify

Untuk alur GitHub Desktop → GitHub → Netlify, ikuti [panduan deployment](docs/DEPLOYMENT.md). Konfigurasi sudah tersedia di `netlify.toml`; API native Functions memakai Netlify Blobs dengan strong reads dan conditional writes. Tidak memerlukan personal access token yang ditanam dalam source.

## Menjalankan

Memerlukan Node.js 24 (menggunakan `node:sqlite`) dan npm. Gunakan checkout yang tersedia; setiap cloud task sudah terisolasi, sehingga tidak perlu Git worktree.

```sh
cd /workspace/demo-arahjamaah
npm ci --cache /tmp/arah-npm-cache
npm run dev
```

Server Express dan Vite berjalan bersama pada port **3000**, bind `0.0.0.0`. `PORT` dapat diubah. Untuk menjalankan hasil build:

```sh
npm run build
npm start
```

Tidak membutuhkan API key, database eksternal, atau koneksi foto/font eksternal. SQLite disimpan di `.data/demo.sqlite` (diabaikan Git). `DB_PATH` dapat mengubah lokasinya. Proses server perlu dijalankan lagi setelah lingkungan dipulihkan.

## Alur demonstrasi

1. **Command Center:** rata-rata readiness, departure health, prioritas, forecast cash shortfall, dan ringkasan profit.
2. **Leads & Booking:** tambah prospek → hubungi → kualifikasi → booking. Reservasi menahan kursi 48 jam. Kapasitas diperiksa atomik pada server.
3. **Keuangan:** catat pembayaran PENDING → verifikasi → booking CONFIRMED jika DP cukup. Invoice, outstanding, dan credit diturunkan dari ledger. Tersedia reject, reversal dengan alasan, pembatalan, serta refund dari credit.
4. **Dokumen:** unggah berkas dummy PDF/JPG/PNG maksimal 500 KB; status kembali REVIEW. Verifikasi merupakan aksi terpisah. Periksa validitas paspor terhadap kepulangan. Unduh kembali berkas melalui profil jamaah.
5. **Keberangkatan:** alokasi kamar per booking, manifest CSV hanya jamaah CONFIRMED, tugas operasional, final clearance, dan closing setelah kewajiban lunas.
6. **Money Calendar:** kas aktual + piutang diperkirakan − komitmen supplier; profit positif tetap dapat menghasilkan cash shortfall.
7. **Profit Guard:** revenue, cost, margin, break-even sederhana, simulasi diskon/tambahan biaya, ekspor CSV.
8. **Pengaturan:** aturan demo, roadmap, kualifikasi SaaS simulasi, audit trail, dan reset data.

Ganti peran di kanan atas untuk mencoba Owner, Operasional, Finance, Sales, dan Admin. Pilihan peran ini **simulasi**, bukan login produksi. API memeriksa izin tindakan dan menyaring data finansial dari peran yang tidak berhak. Sesi demo hanya mengizinkan workspace `org1`; ID tenant lain ditolak. Ini tidak mengklaim autentikasi atau sistem multi-tenant produksi sudah selesai.

## Skenario dan asumsi

- 24 jamaah, 3 keberangkatan, 2 paket, 2 agen travel, dan 4 prospek awal.
- Tanggal skenario: **17 Oktober 2026**; tanggal UI dalam WIB. Hold menggunakan waktu nyata agar pengujian 48 jam tetap bermakna.
- Hold 48 jam, quote resmi 14 hari, initial price lock 90 hari, dan review kuartalan mengikuti blueprint.
- DP Rp5 juta, passport buffer 6 bulan, bobot checklist setara, dan ambang margin 12% adalah **parameter simulasi**, bukan kebijakan final.
- Piutang diperkirakan masuk 7 hari sebelum departure. Forecast bukan penerimaan terverifikasi.
- Kualifikasi SaaS menggunakan breakpoint ilustratif dari blueprint, menyimpan status provisional/review dan referral. Harga resmi/komisi belum tersedia, sehingga tidak menerbitkan quotation resmi.
- Haji Khusus, KBIHU, network sharing, portal, WhatsApp, payment gateway, dan sistem pemerintah tetap roadmap.
- Foto adalah ilustrasi dummy; tidak mewakili identitas nama jamaah. Jangan masukkan dokumen atau transaksi pribadi asli ke demo publik.

## Validasi

```sh
npm test              # aturan bisnis + API/SQLite/isolasi workspace/konkurensi
npm run test:e2e      # build + alur browser dengan Chromium sistem
npm run test:netlify  # alur yang sama melalui adapter Netlify dan SDK Blobs
npm run build         # bundle produksi
```

Browser tests memakai `/usr/bin/chromium`, port 3002, dan database terpisah `.data/browser-test.sqlite`. API tests memakai port 3001 dan database temporary. Skenario demo utama tidak diubah oleh tests.

## Struktur

- `src/main.jsx`: modul UI, dialog, dashboard, chart, ekspor, dan simulasi.
- `src/domain.js`: data seed, aturan bisnis deterministik, forecast, dan permissions.
- `server.js`: API lokal, transaksi SQLite, pembatas workspace, dan Vite/static server.
- `netlify.toml`, `netlify/functions/api.mjs`: konfigurasi dan entry point deployment Netlify.
- `src/netlify-api.js`, `src/view-state.js`: adapter storage serverless dan penyaringan data per peran.
- `public/`: logo SVG yang digambar ulang dari referensi, foto lokal, dan hero visual.
- `tests/`: pengujian domain, API, dan browser.

Foto profil contoh bersumber dari aset Creative Tim Soft UI Dashboard (MIT): https://github.com/creativetimofficial/soft-ui-dashboard. Hero Makkah merupakan visual foto realistis hasil generasi untuk demo. Seluruh font disajikan lokal melalui `@fontsource-variable/plus-jakarta-sans` (OFL). Ikon: Lucide (ISC).
