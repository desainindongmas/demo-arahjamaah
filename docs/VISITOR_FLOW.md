# Tur pengunjung dan alur langganan demo

Perubahan ini menambahkan jalur calon pelanggan **travel yang ingin berlangganan Arah Jamaah**, terpisah dari reservasi paket Umroh untuk jamaah.

## Pengalaman pengunjung

- Pada akses pertama di browser, tampil pengenalan merek dan empat pilar produk.
- Pengunjung dapat memilih tur singkat, menjelajah sendiri, langsung menghitung kebutuhan, atau melewati pengenalan.
- Tur menyorot bagian UI yang relevan dan berpindah halaman otomatis: Command Center → exception → departure readiness → Money Calendar → Profit Guard → jalur kebutuhan. Peran tanpa akses keuangan melewati bagian keuangan.
- Tombol **Jelajah demo** di header dapat mengulang tur. **Jelajah & Kebutuhan** di navigasi membuka panduan kapan saja.
- Tur mendukung tombol sebelumnya/lanjut, Escape, keyboard focus, dan viewport mobile. Tur tidak memproses booking atau mengubah data operasional.

## Alur kebutuhan dan pemesanan

1. **Kenali alurnya:** enam tahap operasional Umroh dan tautan untuk mencoba modul terkait.
2. **Hitung kebutuhan:** organisasi, modul yang diminati, volume aktual TTM atau data aktif untuk travel baru, jumlah departure, pengguna, cabang, dan referral.
3. **Rekomendasi:** kelas ilustratif, provisional/review, alasan, kebutuhan fitur, serta batas bahwa harga resmi belum tersedia.
4. **Pemesanan:** isi kontak dummy, tinjau ringkasan kebutuhan, dan setujui sifat simulasi.
5. **Selesai:** server menyimpan pemesanan simulasi, menghasilkan referensi, dan menyediakan ringkasan TXT.

Draft dan receipt pengunjung disimpan pada browser tersebut. API workspace tidak memuat daftar pemesanan beserta kontak pengunjung. Pengiriman ulang dengan request ID dan data yang sama menghasilkan receipt yang sama, sehingga tidak membuat pesanan ganda. Mengubah payload untuk ID yang sama ditolak.

## Dasar perhitungan

`src/commercial.js` menjadi sumber perhitungan bersama untuk kalkulator calon pelanggan dan kualifikasi SaaS pada Pengaturan. Batas ilustratif mengikuti tabel blueprint:

| Kelas ilustratif | Jamaah TTM / aktif | Departure aktif | Pengguna |
| ---------------- | -----------------: | --------------: | -------: |
| MITRA            |               ≤100 |              ≤2 |       ≤3 |
| STARTER          |               ≤300 |              ≤5 |      ≤10 |
| GROWTH           |             ≤1.000 |             ≤15 |      ≤25 |
| SCALE            |             ≤3.000 |             ≤30 |      ≤50 |

Demo memilih kelas yang mencakup semua dimensi di atas. Lebih dari satu organisasi/cabang atau kebutuhan di luar tabel masuk NETWORK/manual review. Tanpa histori TTM, volume jamaah aktif menghasilkan rekomendasi provisional. TTM nol tidak diganti dengan angka aktif atau proyeksi tahunan.

Ini keputusan implementasi **simulasi**, bukan publikasi pricing policy. Tidak menambahkan harga resmi, batas kontrak, persentase komisi, grace period, atau tanggal aktivasi. Aturan 14-day quote dan 90-day initial price lock hanya dijelaskan sebagai kebijakan blueprint, bukan quotation yang diterbitkan oleh kalkulator.

PIHK/KBIHU tetap roadmap. Minat pada modul tersebut menghasilkan `WAITLIST_DEMO`, bukan aktivasi. Kebutuhan jaringan menghasilkan `MANUAL_REVIEW_DEMO`. Pemesanan demo biasa menghasilkan `REQUESTED_DEMO`. Tidak ada pembayaran, tagihan resmi, pengiriman email/WhatsApp, kontak sales, atau aktivasi layanan nyata.

## Penyimpanan dan validasi

- Kunci browser `arah-onboarding-v1` mencatat pengenalan sudah dilihat.
- Kunci browser `arah-visitor-journey-v1` menyimpan draft, tahap, request ID, dan receipt milik browser tersebut.
- Aksi server `calculateNeeds` menghitung tanpa mengubah booking, ledger, kas, atau audit.
- Aksi server `subscriptionOrder` memvalidasi ulang kebutuhan, kontak, consent, dan idempotency sebelum menyimpan receipt serta audit.
- SQLite lokal dan Netlify Blobs menggunakan fungsi domain yang sama. Deployment tetap memakai konfigurasi Netlify yang sudah ada; tidak membutuhkan secret atau layanan baru.
