# Deploy ke Netlify melalui GitHub Desktop

Aplikasi sudah disesuaikan untuk alur **GitHub Desktop → GitHub → Netlify**. `netlify.toml` mengatur build, folder hasil build, Netlify Functions, dan routing. API memakai Netlify Blobs pada Netlify; tidak memakai file SQLite yang hilang setelah fungsi selesai.

## 1. Masukkan file ke repository lokal

1. Ekstrak paket `arah-jamaah-netlify.zip`.
2. Di GitHub Desktop, pilih repository `demo-arahjamaah` dan pilih **Repository → Show in Explorer / Show in Finder**.
3. Salin **isi folder `arah-jamaah` hasil ekstraksi** ke folder repository lokal tersebut. `package.json`, `netlify.toml`, `src/`, dan `netlify/` harus berada langsung di root repository, bukan dalam subfolder tambahan.
4. Pertahankan folder `.git` repository lokal. Paket tidak menyertakan `.git`, credential, database, atau `node_modules`.

Folder `dist/` disertakan untuk pemeriksaan lokal tetapi diabaikan oleh Git. Netlify membangunnya sendiri dari source.

## 2. Commit dan push dengan GitHub Desktop

1. Pastikan branch tujuan adalah `main` (atau branch produksi yang memang dipakai Netlify).
2. Periksa file yang berubah. Isi pesan commit, misalnya `Add Arah Jamaah demo with Netlify API`.
3. Klik **Commit to main**, kemudian **Push origin**. Bila ini push pertama pada branch, tombolnya dapat bertuliskan **Publish branch**.

File dalam workspace chat ini belum otomatis berada di GitHub. Langkah commit dan push dari GitHub Desktop diperlukan agar Netlify dapat membacanya.

## 3. Hubungkan repository ke Netlify

Jika project Netlify sudah terhubung ke repository dan branch itu, push biasanya memulai deploy otomatis.

Jika belum, gunakan **Add new project / Import an existing project → GitHub**, pilih `desainindongmas/demo-arahjamaah`, kemudian branch `main`. Nama menu dapat sedikit berbeda menurut tampilan dashboard.

Konfigurasi ada di `netlify.toml`. Jika panel meminta pengaturan manual, gunakan:

| Pengaturan          | Nilai                    |
| ------------------- | ------------------------ |
| Base directory      | kosong / root repository |
| Build command       | `npm run build`          |
| Publish directory   | `dist`                   |
| Functions directory | `netlify/functions`      |
| Node version        | `24`                     |

Jangan mengunggah hanya folder `dist/` melalui Netlify Drop: cara tersebut tidak memasang API serverless yang dibutuhkan demo ini.

## 4. Buka URL project setelah deploy berhasil

Tunggu deploy berstatus **Published**. Buka URL yang ditampilkan Netlify, atau domain/subdomain milikmu yang telah diarahkan ke project tersebut. URL persisnya mengikuti project Netlify; paket ini tidak mengarang domain publik.

Netlify Functions menyediakan binding Blobs secara otomatis. Source tidak memerlukan personal access token, API key, atau database password. Store `arah-jamaah-demo-v1` dibuat pada penggunaan pertama dan dipertahankan lintas deployment pada project Netlify yang sama. Deploy preview pada project yang sama juga memakai store demo yang sama.

## 5. Pemeriksaan setelah deploy

- Command Center terbuka dengan 24 jamaah dan 3 keberangkatan pada skenario awal.
- `/api/state` menghasilkan JSON dengan `demo: true`, bukan HTML.
- Function `api` muncul di daftar Functions pada project Netlify.
- Coba booking, pembayaran, dokumen, dan muat ulang. Perubahan harus tersimpan.
- Foto, font, dan manifest berfungsi dari aset lokal.

Jika API mengembalikan 503 karena binding Blobs belum tersedia, periksa log function dan status Blobs pada project Netlify. Jangan mengganti penyimpanan dengan direktori temporary atau menghapus pemeriksaan versi data.

## Data dan batas demo

Semua pengunjung menggunakan workspace simulasi bersama. Pilihan peran memang terbuka untuk presentasi dan bukan login produksi. Gunakan data dan dokumen dummy. Berkas maksimum 500 KB per upload dan total state demo dibatasi 4 MB agar respons fungsi tetap dapat diproses.

Reset skenario tersedia pada **Pengaturan → Workspace → Reset skenario demo** untuk peran Owner. Reset memengaruhi demo bersama, bukan satu browser saja.

## Menjalankan dan menguji lokal

```sh
npm ci
npm run dev          # Express + SQLite lokal, tanpa akun Netlify
npm test             # 45 uji domain/API/adapter Netlify
npm run test:netlify  # 15 alur browser melalui native function + SDK Blobs
```

Pengujian Netlify menggunakan fixture HTTP lokal dengan ETag dan conditional writes; tidak mengklaim deployment atau storage live di akun Netlify telah diverifikasi. Uji storage asli memerlukan deployment ke project milik pengguna.

Tur pengunjung, kalkulator kebutuhan langganan, dan pemesanan simulasi dijelaskan di [VISITOR_FLOW.md](VISITOR_FLOW.md). Setelah deployment, pengunjung baru melihat tur otomatis; pengunjung lama dapat mengulangnya melalui tombol **Jelajah demo** di header.
