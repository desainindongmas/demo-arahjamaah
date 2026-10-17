# MASTER BLUEPRINT ARAH JAMAAH V1.0 — OPERASIONAL UMROH & HAJI

> **Status:** LOCKED — Product & Architecture Baseline  
> **Tanggal penguncian revisi:** 16 Oktober 2026  
> **Jenis dokumen:** Single Source of Truth (SSOT)  
> **Versi:** 1.0 — Revisi Multi-Vertical Haji + Brand Lock Arah Jamaah  
> **Rujukan keputusan:** Diskusi SaaS Travel Umroh/Haji hingga 16 Oktober 2026  
> **Identitas merek/nama produk:** **Arah Jamaah** — nama resmi disepakati dan **LOCKED** pada 16 Oktober 2026. Nama domain, logo dan visual identity masih **TBD**.
> **Kendali revisi:** Pembaruan ini mengunci identitas merek dan penamaan deskriptif dokumen/modul; tidak menambah fitur, mengubah roadmap, harga, atau business rules.

---

## 0. Status keputusan dan cara membaca dokumen

Dokumen ini **menggantikan seluruh ringkasan parsial Master Blueprint V1.0 sebelumnya** untuk aspek produk yang tercakup di dalamnya. Penguncian versi berarti *product scope, prinsip arsitektur, business invariants, komersialisasi dan urutan roadmap* menjadi baseline bersama. Penguncian **bukan klaim bahwa aplikasi sudah dibangun, angka komersial ilustratif sudah disetujui, integrasi pemerintah sudah tersedia, atau fitur Haji telah diluncurkan**.

Label yang digunakan:

- **[LOCKED]**: keputusan atau aturan yang telah ditetapkan; perubahan memerlukan change request.
- **[V1 / P0]**: fondasi operasional prioritas implementasi pertama.
- **[V1 / P1]**: intelligence dan kendali bisnis yang menyempurnakan janji inti V1; tidak ditukar dengan fitur kosmetik.
- **[LATER]**: disiapkan oleh fondasi data tetapi **tidak** menjadi deliverable rilis pertama.
- **[ILLUSTRATIVE]**: angka atau mekanisme simulasi, bukan kebijakan harga final.
- **[TBD]**: parameter belum disepakati; dilarang mengarang nilai baku dan mengiklankannya sebagai final.

Jika bagian ini bertentangan dengan ide eksploratif lama, yang berlaku adalah keputusan berlabel **[LOCKED]** yang paling mutakhir pada dokumen ini.

## 1. Identitas, posisi dan janji produk [LOCKED]

**Nama produk / merek resmi: Arah Jamaah.** Seluruh UI, materi sales, quotation dan dokumen teknis menampilkan nama ini secara konsisten.

**Nama kategori/positioning:** **Pilgrimage Operations Intelligence Platform**.  
**Vertical pertama:** Umroh — penyelenggara PPIU.  
**Arah reuse:** Haji Khusus — PIHK; Bimbingan Haji — KBIHU.  
**Tagline kerja:** *Know the problem before it becomes a problem.* **Belum menjadi tagline brand final.**

### 1.1 Arsitektur penamaan Arah Jamaah [BRAND LOCKED]

| Pemakaian | Nama yang ditampilkan | Status | Arti dan batas |
|---|---|---|---|
| Merek/platform induk | **Arah Jamaah** | **LOCKED** | Satu identitas produk SaaS lintas vertical |
| Aplikasi Umroh | **Arah Jamaah — Operasional Umroh** | Konvensi label fungsional | Jalur aktif pertama, bukan sub-brand baru |
| Modul Haji Khusus | **Arah Jamaah — Haji Khusus** | Konvensi label fungsional; **LATER/V2** | Tidak boleh ditawarkan sebagai fitur live V1 |
| Modul Bimbingan Haji | **Arah Jamaah — Bimbingan Haji** | Konvensi label fungsional; **LATER/V2.x** | Workflow KBIHU, berbeda dari operasional paket |
| Program pemasaran | **Program Affiliate Arah Jamaah** | Konvensi label program | Affiliate menjual subscription SaaS, bukan paket jamaah |
| Dokumen untuk sales | **Panduan Affiliate Arah Jamaah** | Konvensi judul dokumen | Turunan dari Master Blueprint, bukan produk terpisah |
| Alat kualifikasi terpisah | **Kalkulator Affiliate Arah Jamaah** | Konvensi nama alat | Web app standalone, satu sumber pricing policy |

**Aturan penamaan:** `Arah Jamaah` ditulis dua kata dengan kapital A dan J; label setelah tanda pisah hanya menerangkan fungsi. **Tidak ada sub-brand independen, akronim brand, tagline resmi, domain resmi, warna resmi, atau logo yang disahkan dalam revisi ini.** Nama engine seperti `Departure Autopilot`, `Profit Guard`, `Exception Engine`, dan `Cashflow Protection` tetap istilah kapabilitas/engine yang sudah ada, bukan merek baru.

**Penggunaan komersial:** judul presentasi dan halaman berangkat dari **Arah Jamaah**. Quotation menyebut merek produk **Arah Jamaah**, tetapi identitas badan hukum penerbit penawaran/invoice harus mengikuti data legal perusahaan yang benar ketika ditetapkan; nama brand tidak otomatis sama dengan nama badan hukum. Identitas URL dan akun media sosial menggunakan placeholder terverifikasi sampai kanal resmi dipilih.

### 1.2 Prinsip klaim merek dan kesiapan modul

Nama Arah Jamaah sudah final; hal tersebut **tidak mengubah status rilis**. UI dan materi affiliate harus tetap membedakan `LIVE`, `LATER`, dan `UNSUPPORTED`; tidak boleh menyiratkan PIHK/KBIHU aktif hanya karena nama modulnya sudah tersedia. Status nama `LOCKED` juga tidak berarti merek telah diperiksa/terdaftar secara hukum. Pemeriksaan merek, domain, dan aset visual tetap langkah terpisah.


**Empat pilar nilai:**

| Pilar | Arti produk | Pembuktian operasional |
|---|---|---|
| **READY** | Kesiapan jamaah dan perjalanan dapat dilihat sebelum hari keberangkatan | Jamaah Readiness, Departure Health, Final Clearance |
| **SAFE** | Masalah prioritas tidak tertutup oleh progress/score yang tampak bagus | Blocker, exception, deadline, owner, escalation, audit |
| **CASH-SAFE** | Tim mengetahui kebutuhan kas dan risiko kekurangan kas sebelum jatuh tempo | Payment ledger, Money Calendar, cashflow forecast |
| **PROFITABLE** | Margin perjalanan dipahami sebelum dan setelah realisasi | Supplier cost, profit guard, break-even, discount guard |

**Killer engines yang ditetapkan:** Departure Autopilot, Exception Engine, Profit Guard, Cashflow Protection/Money Calendar dan Role-Based Command Center. AI hanya opsi lapisan penjelasan; tidak boleh menjadi penentu kebenaran finansial, status pembayaran atau clearance.

**Sasaran awal:** travel kecil/berkembang sampai travel besar dan jejaring mitra; termasuk penyelenggara yang beroperasi melalui kerja sama dengan travel pemilik izin. Pengelompokan pricing memperhatikan skala operasional dan kompleksitas, bukan klaim sepihak jumlah jamaah di masa depan.

## 2. Keputusan arsitektur reuse Umroh–Haji [LOCKED]

### 2.1 Satu SaaS, tiga vertical bisnis

**Jangan membangun tiga aplikasi/database independen** hanya karena istilah/jenis layanan berbeda. Bangun shared core + *vertical-specific workflow* dengan aktivasi modul per organisasi.

| Vertical | Entitas pengguna utama | Karakter layanan | Status produk |
|---|---|---|---|
| **Umrah Operations** | PPIU dan mitra operasionalnya | Penjualan paket/perjalanan, jamaah, kursi, dokumen, supplier, uang masuk/keluar, departure | **V1 live scope** |
| **Hajj Special** | PIHK dan mitra terkait | Core travel serupa Umroh tetapi mengikuti persyaratan, kalender, dokumen dan koordinasi Haji Khusus yang berbeda | **Fondasi V1; modul aktif V2** |
| **Hajj Guidance** | KBIHU | Bimbingan/pendampingan jamaah haji reguler; cohort, manasik, pembimbing, kehadiran dan kesiapan bimbingan | **Fondasi V1; modul aktif V2.x** |

**Batas legal/produk:** KBIHU bukan travel yang menjual atau menyelenggarakan seluruh paket Haji Reguler. Sistem untuk KBIHU tidak boleh mengesankan organisasi tersebut menentukan akomodasi, transportasi, kuota, manifest pemerintah atau keberangkatan resmi. Platform ini merupakan software operasional, **bukan izin PPIU/PIHK/KBIHU atau sistem pemerintah**.

### 2.2 Reuse shared core vs modul khusus

**Shared core:** organization/tenant, person/participant, berkas, pembayaran operasional yang sah sesuai model organisasinya, tugas, exception, audit, role & permission, notifikasi dalam aplikasi, profil jaringan, pelaporan operasional dan engine rule yang dapat dikonfigurasi.

**Umroh / PIHK (travel operations):** package/booking/departure/capacity/manifest, passport/visa/travel docs, hotel/transport, rooming, supplier/contract/cost, trip readiness, per-departure profit/cashflow. Mayoritas konsep ini dapat digunakan kembali untuk PIHK; **angka reuse ~80% adalah estimasi konsep, bukan persentase implementasi yang dijamin**.

**KBIHU (guidance):** musim haji, cohort, kelompok/rombongan/regu atau kloter **sebagai atribut koordinasi**, manasik, sesi & attendance, pembimbing/pendamping, bantuan kebutuhan khusus yang relevan, guidance readiness, tindakan pendampingan. Travel package sales, supplier margin perjalanan dan inventory seat **bukan kewajiban modul KBIHU**.

### 2.3 Type, activation dan bahasa domain

Field konseptual yang disetujui pada organisasi:

```text
organization_type = PPIU | PIHK | KBIHU | PARTNER | BRANCH | AGENT_NETWORK
module_activation = UMRAH_OPERATIONS | HAJJ_SPECIAL | HAJJ_GUIDANCE
```

`organization_type` adalah klasifikasi operasional untuk konfigurasi dan relasi jaringan. **Status izin legal harus divalidasi secara terpisah**; `PARTNER` dan `BRANCH` tidak otomatis berarti memiliki izin PPIU/PIHK. Organisasi dapat berkaitan dengan lebih dari satu layanan sesuai hak dan aktivasi yang diberikan. Pengaktifan modul dan hak akses tidak boleh diputuskan dari label organisasi saja.

**Abstraksi event/journey** disiapkan agar data tidak terkunci pada label `departure` untuk selamanya:

```text
Organization -> Program/Module -> Journey/Event -> Season (optional)
                                     -> Cohort/Group (optional)
                                     -> Participant/Assignment
```

- **V1 Umroh tetap memakai `Package` ≠ `Departure`**: satu paket dapat punya banyak keberangkatan; seorang jamaah dapat muncul di lebih dari satu booking pada waktu berbeda.
- **Haji Khusus:** journey dapat terkait musim haji dan perjalanan/rombongan Haji Khusus; status dan dokumen domain khusus dimasukkan kelak lewat konfigurasi/modul.
- **KBIHU:** *season/cohort* menjadi unit pengelompokan utama, bukan “seat departure” yang dijual.
- `journey`, `season`, `cohort`, `kloter`, `rombongan`, `regu` adalah konsep skema/kompatibilitas lintas vertical; **UI dan workflow aktifnya tidak otomatis termasuk V1**.
- Migration dan pemisahan data tidak boleh mengasumsikan `departure_id` wajib untuk seluruh peserta dari setiap vertical.

### 2.4 Konfigurasi rules, bukan hard-code satu vertical

Mesin utama menerima konfigurasi aturan berdasarkan vertical/organisasi/perjalanan:

```text
Event -> Rule Evaluation -> Exception / Task / Status / Notification
```

- Berkas wajib, due date relatif, readiness checklist, severity dan blocked status dapat berbeda menurut vertical.
- Readiness travel dan Guidance Readiness tidak boleh disamakan hanya dengan mengganti judul halaman.
- Ketiadaan data dianggap `UNKNOWN` / butuh verifikasi, **bukan otomatis READY**.
- Final clearance hanya bisa dinyatakan oleh sistem setelah semua prasyarat sesuai aturan vertical terpenuhi dan tidak ada active blocker.

## 3. Ruang lingkup V1.0 dan prioritas [LOCKED]

**V1.0 adalah produk Umroh yang benar-benar dapat dipakai secara operasional**, sekaligus fondasi arsitektur multi-vertical. Detail PIHK/KBIHU menjadi target roadmap, bukan komitmen fungsi aktif pada hari rilis V1.

### 3.1 P0 — Core operasional wajib

| Area | Fungsi minimum |
|---|---|
| Multi-tenant | Tenant/org, auth, role-based access, scoped permission dan audit trail |
| Leads | Prospek, asal/referensi, tindak lanjut dan konversi ke booking |
| Products | Paket dan jadwal keberangkatan sebagai entitas terpisah |
| Booking | Reservasi, alokasi seat/capacity, masa hold, keluarga/peserta, status booking |
| Jamaah | Data peserta, kontak, relasi booking, identitas dan arsip status |
| Finance | Invoice/tagihan, DP/termin, verifikasi pembayaran, outstanding, reversal, credit/refund tracking |
| Documents | Passport/dokumen wajib, upload, pengecekan, validitas dan status verifikasi |
| Operations | Supplier, biaya dasar, jadwal, task, rooming, manifest peserta terkonfirmasi |
| Distribution | Agen travel, atribusi dan dasar komisi agen sesuai data transaksi |
| Controls | Riwayat perubahan dan aksi sensitif; tidak ada silent mutation |

### 3.2 P1 — Intelligence yang membuktikan janji inti V1

| Engine/UI | Hasil minimum |
|---|---|
| Departure Autopilot | Tugas berbasis event, aturan tanggal dan checklist operasional |
| Departure/Jamaah Readiness | Score **dan** status; flag kekurangan berkas/keputusan, final blockers |
| Exception Engine | Blocker/risk, severity, impact, owner, deadline, action, escalation dan dedup |
| Profit Guard | Estimated revenue/cost/margin, actual vs projected, break-even, discount impact |
| Cashflow Protection | Jadwal piutang dan kewajiban supplier, Money Calendar, lowest projected cash, shortfall alert |
| Command Center | Dashboard owner, admin, finance, operations sesuai role; daftar action prioritas, pencarian |

**Kriteria penyelesaian V1:** P0 dapat memproses operasi nyata; P1 menampilkan masalah dan risikonya sebelum jadi krisis. Tidak cukup sekadar CRUD/website booking. Detail parameter score dan thresholds yang belum diputuskan tetap configurable/TBD; jangan mengarang angka baku.

### 3.3 Di luar rilis pertama / backlog yang sudah tercatat [LATER]

- **P2:** margin leakage/collection priority lanjutan, task dependency, agent portal, basic jamaah portal apabila belum tercakup di implementasi fase awal, WhatsApp API, payment gateway, AI morning brief/explain.
- **P3:** family portal, chat AI, integrasi Siskopatuh, native mobile, visual workflow builder, predictive ML, smart rooming, BI/pembukuan tingkat lanjut.
- Integrasi resmi/WhatsApp/payment gateway **tidak dipasarkan sebagai sudah tersedia** ketika belum dibangun dan diuji.
- Detail modul PIHK/KBIHU, network sharing penuh dan monetisasi lanjutan mengikuti roadmap di bagian 13.

## 4. Alur end-to-end Umroh [LOCKED]

```text
Lead
 -> Booking / Reservation (seat hold)
 -> Jamaah / Participants
 -> Invoice + Payment Verification
 -> Documents + Passport Risk
 -> Departure Preparation (rooms, supplier, manifest, tasks)
 -> Readiness + Exception Handling
 -> Final Clearance
 -> Departure / In-Trip Status
 -> Return
 -> Closing & Reconciliation
```

Status dan keputusan tidak bergantung pada urutan tombol secara naif: setiap transisi harus melewati business rule dan hak akses. Contoh: booking dapat dibuat sambil dokumen belum lengkap, tetapi **tidak** boleh dinyatakan final READY bila blocker aktif.

### 4.1 Booking dan kapasitas

1. Paket bukan keberangkatan; tanggal, seat dan manifest melekat ke departure yang relevan.
2. Status awal reservasi `RESERVED` hanya jika kapasitas cukup.
3. Masa *hold* awal disepakati **2 × 24 jam**.
4. **Confirmed seat + active held reservation** sama-sama mengurangi available capacity. Tidak boleh overbooking.
5. Jika waktu hold lewat tanpa DP terverifikasi yang memenuhi minimum, reservation expire dan seat dikembalikan.
6. Booking baru menjadi confirmed saat **verified cumulative payments ≥ minimum DP**. Data peserta dan manifest mengikuti state booking aktual.
7. Pembatalan/rekonsiliasi harus menjaga jejak sejarah, tidak menghapus transaksi.

### 4.2 Pembayaran, tagihan dan rekonsiliasi

- Pembayaran baru: `PENDING` hingga diverifikasi.
- Hanya pembayaran **`VERIFIED`** yang menambah saldo terbayar, bisa memenuhi minimum DP dan mengubah status invoice/booking.
- Pembayaran invalid dapat `REJECTED`; pembetulan finansial menggunakan **reversal + transaksi pengganti**, bukan overwrite diam-diam.
- `total_paid`, `outstanding`, `paid_status` adalah nilai turunan sistem.
- **Overpayment bukan diskon invoice diam-diam**: kelebihan menjadi **credit balance** yang tercatat; penggunaan/pengembalian credit harus transparan.
- Pembatalan dapat memerlukan refund, transfer credit atau reallocation sesuai persetujuan dan status pembayaran. Sistem wajib menjaga audit dan mencegah saldo negatif palsu.
- Status invoice dan status kesiapan jamaah adalah dua domain berbeda; **lunas ≠ otomatis READY**.

### 4.3 Data jamaah dan dokumen

- Orang/jamaah adalah entitas tersendiri, dapat ikut perjalanan berbeda tanpa menduplikasi identitas secara tidak terkendali.
- Dokumen memiliki status submit/review/verified/rejected atau ekuivalen; **upload ≠ verified**.
- Validitas passport dibandingkan tanggal yang relevan terhadap kebijakan perjalanan; risiko expiry dan missing document masuk Exception Engine.
- Manifest departure merupakan proyeksi dari **booking/participant terkonfirmasi**, bukan tabel manual yang tidak sinkron.
- Dokumen sensitif dilindungi dengan tenant scope dan permission yang sesuai.

### 4.4 Readiness, exception, clearance

- Readiness menyajikan **nilai progress/score dan status operasional** secara bersamaan.
- **Blocker aktif selalu mengalahkan score tinggi**. `READY`/final clearance mustahil bila terdapat blocker yang wajib diselesaikan.
- Exception memiliki severity, sumber event, objek terkait, owner, due date, dampak dan next action. Duplikasi satu kondisi yang sama harus dicegah.
- Penyelesaian exception mencatat siapa, kapan dan bukti/perubahan pemicu; kemudian engine menghitung ulang readiness.
- Alert tidak boleh menutupi risiko dana atau kegagalan departure hanya karena checklist minor selesai.
- Untuk kondisi yang belum terverifikasi, gunakan status pending/unknown, bukan menganggap selesai.

### 4.5 Profit Guard dan Cashflow Protection

**Profit Guard:**

```text
projected_revenue = SUM(booking/invoice/revenue yang relevan)
projected_cost    = SUM(cost supplier + cost operasional yang relevan)
projected_profit  = projected_revenue - projected_cost
projected_margin  = projected_revenue > 0 ? projected_profit/projected_revenue : N/A
```

Perhitungan **projected** dan **actual** harus dipisahkan. Break-even dan pengaruh perubahan seat/cost/discount digunakan untuk peringatan dan keputusan; rumus rinci alokasi biaya lintas departure dan ambang alert **[TBD]**.

**Cashflow Protection:**

```text
opening_cash + verified/expected inflows by due date - committed/expected outflows by due date
 -> projected daily balance
 -> lowest projected cash and date
 -> shortfall/obligation warning
```

Money Calendar membedakan kas **benar-benar tersedia**, tagihan yang diperkirakan masuk dan kewajiban pemasok yang akan jatuh tempo. Forecast bukan klaim uang sudah diterima. Potensi margin baik tetapi kas tidak cukup tetap harus menghasilkan cash warning. Jangan menyatukan jadwal invoice dan jadwal pembayaran supplier tanpa arah arus yang jelas.

## 5. Reuse Haji Khusus / PIHK [LOCKED ARCHITECTURE; LATER DELIVERY]

PIHK memanfaatkan kembali domain jamaah, booking/payment, berkas, tim, biaya, akomodasi, manifest internal, supplier, cashflow dan exceptions dari Travel Operations. Perbedaannya dimodelkan lewat *vertical configuration* dan objek Haji yang spesifik; tidak dengan membuat copy aplikasi Umroh.

**Prinsip pemetaan:**

| Shared capability | Interpretasi Haji Khusus |
|---|---|
| Organization | PIHK dengan izin/relasi mitra yang sesuai |
| Package / Journey | Program Haji Khusus dan musim terkait |
| Participant | Jamaah Haji Khusus, identitas dan keperluan administratif |
| Documents | Berkas/dokumen Haji Khusus yang diwajibkan pada proses aktual |
| Travel readiness | Kesiapan keberangkatan Haji Khusus menurut aturan spesifik |
| Suppliers / costs | Komitmen layanan, biaya dan pemasok pada travel PIHK |
| Exception | Masalah dokumen, jadwal, biaya, layanan dan koordinasi Haji Khusus |

**Tidak dimasukkan sebagai klaim V1 aktif:** kuota Haji resmi, akses ke sistem pemerintah, penerbitan visa, penentuan eligibility atau prosedur regulasi pemerintah. Field yang mengikuti aturan musiman harus dapat diperbarui sebelum modul diaktivasi dan diverifikasi terhadap ketentuan terbaru.

## 6. Reuse KBIHU / Bimbingan Haji [LOCKED ARCHITECTURE; LATER DELIVERY]

KBIHU adalah vertical *guidance operations*, bukan versi kecil travel paket Haji Khusus.

**Alur konseptual:**

```text
Peserta bimbingan
 -> Hajj Season / Cohort
 -> Kelompok/Rombongan/Regu + Pembimbing
 -> Jadwal Manasik
 -> Attendance + Pembinaan/Pendampingan
 -> Guidance Readiness + Exceptions
 -> Koordinasi keberangkatan/pelaksanaan sesuai kewenangan KBIHU
 -> Evaluasi & Closing Season
```

**Kapabilitas domain:** pengelolaan peserta, grup/cohort, pembimbing, pertemuan manasik, kehadiran, progres bimbingan, dukungan peserta berkebutuhan pendampingan, tugas dan pengecualian. `Guidance Readiness` tidak dianggap sah hanya karena passport atau tagihan travel selesai; ia memakai prasyarat bimbingan sesuai konteks KBIHU.

**Guardrails legal:**

- KBIHU bertugas membimbing dan mendampingi; tidak menyandang kewenangan operasional penuh penyelenggara Haji Reguler.
- Kloter/kelompok dalam aplikasi adalah catatan koordinasi; sistem tidak mengklaim menerbitkan/menetapkan kloter resmi.
- Jangan mengimplementasikan penjualan kursi haji reguler sebagai inventori milik KBIHU.
- Biaya KBIHU, jika dikelola, tidak disamakan dengan harga paket travel. Tarif dan ketentuan resminya harus diverifikasi sebelum komersialisasi modul.

## 7. Multi-tenant, mitra, branch dan network [LOCKED ARCHITECTURE]

Kasus bisnis penting: travel baru bekerja sama dengan atau menggunakan layanan/izin travel induk yang berwenang. Software harus bisa mencatat **hubungan operasional** tanpa mengaburkan kewenangan legal atau membuat data jamaah seluruh mitra terbuka.

**Relasi yang ditetapkan:**

```text
organizations
organization_relationships(parent_id, child_id, relationship_type, ...)
relationship_type = PARTNER | BRANCH | AGENT_NETWORK
```

**Prinsip visibilitas:**

- Setiap org memiliki workspace dan pembatas data sendiri.
- Child/mitra hanya dapat melihat leads, jamaah, booking, finance miliknya sendiri kecuali ada izin eksplisit.
- Parent boleh memperoleh ringkasan jaringan dan detail tertentu **hanya sesuai role, agreement dan permission**.
- Mitra A tidak bisa melihat jamaah milik mitra B hanya karena memakai departure induk yang sama.
- Jenis kemitraan dan pembagian tanggung jawab tidak otomatis membuktikan status perizinan.

**Alokasi keberangkatan shared:**

```text
parent owns departure and physical_capacity
 -> departure_allocations(parent_departure, child_organization, allocated_seats)
 -> child sees allocated / sold / available seats for its own allocation
 -> child cannot see the parent's full manifest or another child's customer data
```

Invariant: agregat booking dan reservation tidak melebihi kapasitas departure; jumlah alokasi juga tidak boleh melampaui kapasitas yang tersedia menurut kebijakan allocation. Mekanisme atomicity/concurrency wajib mencegah race-condition seat.

**Delivery:** skema dan batas akses dirancang kompatibel mulai V1; aktivasi workflow network sharing/management penuh masuk **V1.5**. Tier **Mitra** tetap menjadi kategori komersial penting ketika calon customer belum beroperasi mandiri sebagai PPIU.

**Bedakan dua istilah:** `travel_agent` adalah pihak yang menjual/memberangkatkan jamaah dalam ekosistem travel. `saas_affiliate` adalah pihak yang mereferensikan/menjual langganan platform kita. Atribusi dan komisinya tidak dicampur.

## 8. Data model konseptual dan invariants [LOCKED]

Struktur inti minimal secara domain, bukan kontrak kolom SQL final:

| Entitas/relasi | Fungsi |
|---|---|
| `organizations`, `users`, `memberships`, `roles/permissions` | Tenant, identitas, aktivasi, scope |
| `organization_relationships`, `departure_allocations` | Parent–child, jaringan, berbagi kapasitas terlindungi |
| `leads`, `agents`, `referrals` | Akuisisi peserta dan agen travel |
| `packages`, `departures`, `bookings`, `booking_participants` | Produk, jadwal, reservasi seat, jamaah terdaftar |
| `participants/persons`, `documents` | Profil peserta dan berkas terverifikasi |
| `invoices`, `invoice_lines`, `payments`, `reversals`, `credits/refunds` | Ledger tagihan dan koreksi keuangan |
| `suppliers`, `supplier_commitments`, `costs`, `rooms`, `operational_tasks` | Operasional perjalanan dan pengeluaran |
| `rules`, `readiness_checks`, `exceptions`, `audit_events` | Intelligence, tindakan, pelacakan |
| `seasons`, `journeys`, `cohorts`, `groups`, `sessions`, `attendance` | Fondasi model multi-vertical; fitur KBIHU aktif nanti |
| `subscription_qualification`, `pricing_quotes`, `saas_affiliates`, `affiliate_attributions` | Klasifikasi SaaS, penawaran dan distribusi penjualan |

**Invariants lintas data:**

1. Setiap objek berhak akses terikat ke tenant/scope, termasuk melalui relasi parent-child.
2. Semua perubahan finansial dan clearance penting memiliki actor, waktu dan jejak koreksi.
3. Kunci reservasi/capacity dievaluasi server-side dan atomik.
4. Nilai turunan dari ledger/state dihitung engine; tidak menjadi angka edit manual tanpa alasan dan audit.
5. Seorang peserta tidak identik dengan satu booking; satu booking dapat terkait lebih dari satu participant.
6. `Package` tidak sama dengan `Departure`; `Departure` tidak menjadi satu-satunya parent bagi semua kegiatan Haji/KBIHU.
7. Rule engine memeriksa program/vertical aktif dan versi konfigurasi yang berlaku.
8. Tidak ada akses otomatis lintas tenant karena pihak berasal dari network atau memakai label organisasi yang sama.

## 9. Role-Based Command Center dan UI principles [LOCKED]

**Filosofi:** professional B2B dashboard yang menunjukkan **apa yang harus ditindaklanjuti**, bukan hanya statistik cantik. Grafik dan alert harus bersumber dari data aktual atau simulasi yang dilabel jelas.

| Role / POV | Prioritas informasi |
|---|---|
| Owner/Director | Departure health, cash shortfall, profit/break-even, tren penerimaan dan masalah besar |
| Operations/Admin | Jamaah/documents, manifest, rooms, supplier, departure timeline, to-do, blockers |
| Finance | Invoice/outstanding, verified payment, jatuh tempo, cash calendar, kewajiban supplier |
| Sales/Travel Agent | Leads, booking teratribusi, tindak lanjut dan status yang diizinkan |
| Super Admin SaaS | Aktivasi tenant, subscription/pricing, affiliate attribution dan audit administratif sesuai scope |
| KBIHU Pembimbing [LATER] | Cohort, sesi manasik, kehadiran, peserta perlu pendampingan, guidance readiness |

**Common presentation rules:** status `READY`, `AT_RISK`, `BLOCKED` harus dapat ditelusuri ke data sumber. Alert harus menyatakan tindakan/penanggung jawab; projected vs actual diberi label berbeda; status dari dua vertical tidak boleh dicampur tanpa konteks.

## 10. Pricing & Sales Qualification Engine [LOCKED POLICY]

### 10.1 Prinsip harga

Model komersial: **subscription SaaS** dengan klasifikasi berbasis volume operasional dan kompleksitas, bukan semata jumlah staff, nilai paket atau jumlah jamaah sepanjang sejarah. Untuk PPIU/PIHK, basis paling kuat adalah **actual/processed/confirmed jamaah trailing 12 months (TTM)** + active departures + jumlah pengguna + cabang/network complexity.

**Bukan:** memaksa prospek meramal jamaah 12 bulan ke depan untuk mendapatkan harga; bukan pricing hanya atas satu bulan musim puncak; bukan mengaku mengukur volume aktual bila data belum tersedia.

Kategori yang disetujui:

```text
MITRA -> STARTER -> GROWTH -> SCALE -> NETWORK
```

**Contoh diskusi yang belum menjadi harga resmi:**

| Tier | Volume jamaah TTM [ILLUSTRATIVE] | Harga/bulan [ILLUSTRATIVE] | Active departures [ILLUSTRATIVE] | Users [ILLUSTRATIVE] |
|---|---:|---:|---:|---:|
| Mitra | ≤100 | Rp249.000 | 2 | 3 |
| Starter | 101–300 | Rp649.000 | 5 | 10 |
| Growth | 301–1.000 | Rp1.490.000 | 15 | 25 |
| Scale | 1.001–3.000 | Rp3.490.000 | 30 | 50 |
| Network | Custom | Custom | Custom | Custom |

> **PENTING:** Seluruh angka tier/batas aktif di tabel adalah **simulasi yang pernah dibahas, BUKAN rate card locked**. Termasuk kisaran historis Mitra Rp149–299 ribu/bulan, angka final baru dapat diberlakukan melalui keputusan komersial tersendiri. Penjualan hanya boleh menampilkan harga resmi yang ada di pricing engine yang telah dipublikasikan, bukan tabel simulasi ini.

### 10.2 Klasifikasi calon pelanggan

**Input minimum:**

```text
organization_type + activated/intended_module
confirmed_processed_jamaah_ttm (if verifiable)
active_jamaah (if no full history)
active_departures
number_of_users / staff
branches + partners + parent-child structure
operational_need / complexity
source_affiliate / attribution
```

**Urutan penentuan:**

1. Jika data TTM valid tersedia, jadikan volume aktual 12 bulan terakhir sebagai baseline.
2. Jika travel baru tidak punya histori cukup, gunakan **jamaah aktif + departure aktif + user/branch/network complexity** untuk klasifikasi sementara; tandai *provisional* dan confidence.
3. Jika terdapat kondisi network/cabang/kompleksitas tidak sesuai batas normal, tandai **manual review**, bukan memaksa satu tier otomatis.
4. Pricing engine mengembalikan plan rekomendasi, alasan klasifikasi, confidence, harga **resmi** (jika ada), apakah perlu review dan offer/quote yang sah.
5. Harga pelanggan yang telah disetujui **dikunci 90 hari** pada periode awal yang ditentukan kebijakan; **review kuartalan**, dengan grace/seasonal buffer agar perubahan kecil/musiman tidak memicu upgrade otomatis mendadak.
6. Batas angka grace, durasi buffer rinci, prosedur perubahan tarif dan kebijakan tahunan **[TBD]**; jangan mengarang angka selain 90 hari yang telah disepakati.

### 10.3 Model harga lintas vertical Haji

- **Umroh / PIHK:** berorientasi operasi travel; pertimbangkan jamaah TTM dan kompleksitas. Aktivasi PIHK baru ditawarkan setelah modulnya benar-benar siap.
- **KBIHU:** pricing lebih cocok **per musim/cohort**, bukan copy tarif per departure travel. Ini **keputusan arah model**, belum ada rate card, harga atau batas cohort final.
- **Network:** kompleksitas parent-child, cabang dan hak berbagi operasional dinilai khusus. Harga custom hanya dapat diberikan tim berwenang.
- Calon KBIHU **tidak otomatis diberi penawaran modul live** saat V1 hanya Umroh tersedia.

## 11. Affiliate/Commercial Engine dan pedoman pitching [LOCKED POLICY]

**Tujuan Program Affiliate Arah Jamaah:** affiliate bisa mengklasifikasi calon pelanggan dan menampilkan harga penawaran **yang konsisten**, tanpa harus menghitung rolling year atau bernegosiasi sendiri. Sistem yang menentukan kelas, bukan asumsi affiliate.

### 11.1 Flow affiliate

```text
Lead captured + referral code
 -> Sales Qualification (form)
 -> Pricing Engine (recommended tier + confidence + reasons)
 -> Official Quote + pitch angle / demo focus
 -> Demo / Trial
 -> Customer activation + verified subscription payment
 -> Commission: pending -> earned (subject to verification)
```

Output kualifikasi: plan, harga resmi, alasan, confidence, `manual_review`, pitch angle, demo focus, status komisi dan quote.

**Quote valid 14 hari**, sesuai keputusan. Quote yang kedaluwarsa harus diproses ulang; quote yang sedang valid tidak sama dengan jaminan harga selama masa kontrak. **90-day initial price lock** berlaku sesuai kebijakan aktivasi, bukan perpanjangan 14-day quote.

**Affiliate tidak berwenang:**

- memberi diskon atau harga custom atas nama perusahaan;
- menjanjikan fitur yang belum dirilis, tanggal rilis yang belum disetujui, API/integrasi resmi yang belum siap, atau kepatuhan perizinan;
- mengganti rekomendasi manual-review menjadi harga yang seolah sudah approved;
- menyamakan komisi affiliate SaaS dengan komisi agen penjual paket Umroh/Haji.

**Atribusi minimum:** affiliate/referral code, source, waktu kualifikasi, input snapshot, recommended plan, quoted price, expiry, customer, activation, verified payment dan status komisi. Konflik referral ditandai untuk review; komisi **baru earned setelah pembayaran pelanggan terverifikasi**. Tarif/persentase komisi dan kebijakan clawback [TBD] jika belum ditetapkan.

### 11.2 Script sederhana yang mengikuti positioning (pedoman, bukan janji numerik)

**Pembuka:** “Arah Jamaah membantu travel Umroh mengelola keberangkatan. Saat mengelola beberapa keberangkatan, bagian tersulit biasanya bukan sekadar input jamaah, tetapi mengetahui dokumen yang belum aman, kewajiban yang segera jatuh tempo dan apakah tiap keberangkatan masih sehat secara operasional dan keuangan.”

**Diagnosis:** “Dalam 12 bulan terakhir, kira-kira berapa jamaah yang benar-benar diproses, berapa keberangkatan aktif, dan berapa orang yang perlu mengakses sistem? Kalau bisnis baru belum punya histori setahun, kita pakai data aktif dulu.”

**Value:** “Arah Jamaah membantu tim melihat kesiapan jamaah/keberangkatan, risiko yang harus dibereskan, tagihan, cash calendar, serta margin perjalanan dari satu dashboard sesuai peran.”

**Harga:** “Saya masukkan data operasional travel ke Kalkulator Affiliate Arah Jamaah. Sistem akan menampilkan paket yang cocok, alasan rekomendasinya dan harga penawaran resmi. Kalau strukturnya jaringan atau di luar pola standar, saya ajukan review.”

**KBIHU:** “Kami menyiapkan fondasi produk bimbingan Haji yang terpisah dari workflow travel. Modul KBIHU belum boleh dipresentasikan sebagai fitur yang sudah live pada rilis Umroh pertama.”

## 12. Arsitektur teknis implementasi [LOCKED PRINCIPLES; STACK TBD]

### 12.1 Rule-first, automation-second, AI-third

1. **Deterministic domain functions** menghasilkan kebenaran booking, capacity, outstanding, score/status, blocker, margin dan cash forecast.
2. **Workflow/event handlers** mendengarkan perubahan status lalu membuat task, alert dan perhitungan ulang yang idempotent.
3. **AI opsional** mengubah hasil engine menjadi ringkasan bahasa natural, tidak menciptakan fakta transaksi atau clearance.
4. UI tidak menghitung hasil resmi yang bertentangan dengan backend; backend memvalidasi seluruh mutation, role dan tenant context.

### 12.2 Infrastruktur

- **Single multi-tenant product** dengan pemisahan data kuat dan migration berjenjang; bukan clone project per customer.
- Backend/database, object storage berkas sensitif, background jobs dan audit disusun untuk skalabilitas bertahap; **vendor/hosting/angka limit belum diputuskan**.
- Menyimpan timestamp dalam bentuk konsisten; tanggal operasi ditampilkan dalam zona lokal yang ditentukan organisasi. Deadline relatif menggunakan tanggal domain, bukan asumsi selisih milidetik.
- Tindakan penting harus transactional dan resilient terhadap retry; status dokumen, booking dan cashflow tidak boleh dikoreksi manual oleh dashboard dengan mengabaikan ledger.
- Kepatuhan kebijakan data pribadi, persetujuan pemrosesan, akses, retensi dan keamanan dibuktikan saat implementasi; deklarasi arsitektur ini **bukan** audit kepatuhan selesai.

### 12.3 Prinsip perangkat/UI

Web app responsif profesional; core data dan aturan identik pada desktop/mobile browser. **Native mobile app tidak masuk V1**. Browser-side input bukan sumber kepercayaan finansial atau keamanan.

## 13. Roadmap resmi dan batas rilis [LOCKED]

| Fase | Fokus | Batas |
|---|---|---|
| **V1.0 — Umrah Operations Intelligence** | Core P0/P1 Umroh, engines READY/SAFE/CASH-SAFE/PROFITABLE, fondasi data multi-vertical, pricing & qualification policy | Tidak menjanjikan workflow PIHK/KBIHU sudah aktif |
| **V1.5 — Network & Commercial** | Aktivasi parent–child, shared departure allocations, network visibility, penguatan commercial/affiliate workflows | Tidak menganggap kemitraan = izin hukum |
| **V2 — Hajj Special / PIHK** | Vertical PIHK dengan template journey/season dan readiness/exception khusus Haji Khusus | Dipasarkan hanya setelah validasi bisnis/regulasi/uji |
| **V2.x — Hajj Guidance / KBIHU** | Cohort/season, manasik, attendance, pembimbing, pendampingan, Guidance Readiness | Tidak mengubah KBIHU menjadi travel paket Haji Reguler |
| **Fase lebih lanjut** | Portal, integrasi dan kapabilitas AI/BI yang telah dibacklog | Bukan bagian wajib V1 launch |

Urutan ini adalah prioritas, **bukan tanggal rilis yang dijanjikan**. Angka P0/P1 merupakan tingkat prioritas di dalam V1, bukan versi berlangganan yang dapat dibeli terpisah.

## 14. Acceptance criteria dan edge cases untuk implementasi

**Uji P0/P1 Umroh:**

- [ ] Tenant A tidak dapat membaca/menulis participant, document, finance atau booking tenant B melalui URL/API maupun agregasi dashboard.
- [ ] Dua admin serentak mencoba seat terakhir: maksimal satu berhasil reserve; tidak ada oversell.
- [ ] Hold 2×24 jam expired tanpa verified DP: seat kembali tersedia dan audit tercatat.
- [ ] Pembayaran PENDING atau REJECTED tidak memenuhi DP dan tidak mengkonfirmasi booking.
- [ ] Verified DP memenuhi minimum: booking menjadi confirmed dan manifest turunan berubah konsisten.
- [ ] Verified overpayment: nilai invoice tidak berubah menjadi diskon; credit balance tercatat.
- [ ] Payment salah: reversing dan replacement tercatat tanpa menghapus sejarah.
- [ ] Lunas tetapi passport belum verified/expired: jamaah tetap NOT_READY/AT_RISK/BLOCKED menurut rule, bukan otomatis READY.
- [ ] Score 99% dengan satu blocker aktif: departure tetap tidak dapat Final Clearance.
- [ ] Profit positif tetapi projected cash turun di bawah kebutuhan supplier: Cash-Safe warning tetap muncul.
- [ ] Perubahan harga/cost, jadwal, booking atau status dokumen memicu recompute yang relevan dan tidak menggandakan exception.
- [ ] Owner/admin/finance/operations hanya mendapat dashboard dan aksi sesuai permission.
- [ ] Jamaah yang ikut perjalanan lain tetap terhubung identitasnya tanpa menggabungkan dua invoice/booking.

**Uji arsitektur reuse Haji/network (data contract & keamanan pada V1; fungsi aktif sesuai roadmap):**

- [ ] Schema mengakomodasi `organization_type`, module activation dan relasi partner tanpa mencampur data pribadi.
- [ ] Entity cohort KBIHU tidak diwajibkan mempunyai departure seat milik travel.
- [ ] PIHK dan KBIHU tidak mewarisi readiness checklist Umroh secara otomatis.
- [ ] Mitra dengan allocation hanya melihat kapasitas, booking dan jamaah dalam haknya; tidak melihat manifest seluruh parent.
- [ ] Child A tidak dapat mengintip child B walau parent/departure sama.
- [ ] Sistem menolak klaim modul HAJJ_SPECIAL/HAJJ_GUIDANCE aktif sebelum activation dan permission valid.

**Uji pricing/affiliate:**

- [ ] Input TTM benar menghasilkan basis klasifikasi sesuai tier rules yang dipublikasikan.
- [ ] Travel baru tanpa histori TTM mendapat klasifikasi provisional menggunakan data aktif dan confidence, bukan tebak 12 bulan.
- [ ] Lonjakan kecil/musiman tidak otomatis menagih upgrade sebelum review/grace policy.
- [ ] Quote berlaku 14 hari; perubahan periode setelah expired memerlukan kalkulasi baru.
- [ ] Plan berstatus manual-review tidak dapat diterbitkan affiliate sebagai custom quote approved.
- [ ] Affiliate tidak dapat mengubah official rate card, diskon atau tanggal live fitur.
- [ ] Komisi SaaS hanya earned berdasarkan pembayaran pelanggan terverifikasi dan atribusi sah.

## 15. Daftar yang TIDAK boleh dianggap sudah final [EXPLICIT TBD]

1. **Logo, palet warna, tipografi, domain, tagline resmi, akun sosial dan identitas badan hukum** untuk merek **Arah Jamaah**. **Nama merek Arah Jamaah sudah LOCKED, bukan TBD.**
2. **Rate card nominal**, volume-tier breakpoint, seat/active-departure/user limits, add-on dan pajak resmi. Semua tabel nominal saat ini ilustratif.
3. Nilai **affiliate commission**, aturan clawback/refund, target bonus dan persetujuan diskon.
4. Jadwal/tarif bulanan vs tahunan, mekanisme invoice subscription SaaS dan metode penagihan resmi.
5. Detail formula readiness weight, severity thresholds, margin/shortfall trigger, vendor cost allocation dan pengecualian tiap vertical.
6. Batas kuantitatif grace/seasonality, koreksi kenaikan tier dan formulasi upgrade saat review. **Yang telah locked hanyalah 90-day initial lock dan quarterly review + prinsip grace/buffer.**
7. Harga berbasis *per season/cohort* untuk KBIHU dan pricing khusus PIHK/Network.
8. Nama tabel/enum status final dalam schema SQL; daftar domain di dokumen adalah kontrak konsep, belum migrasi final.
9. Vendor cloud, database, email, payment, WhatsApp, government interface dan kapabilitas integrasi yang belum diuji.
10. Detail compliance checklist Kemenhaj/PPIU/PIHK/KBIHU menurut regulasi terbaru pada saat modul bersangkutan dikembangkan.

**Aturan status:** TBD bukan izin menambah fitur. Jika membutuhkan keputusan sebelum implementasi, buat **Decision Record** khusus parameter tersebut dan tautkan pada versi ini tanpa mengubah scope produk diam-diam.

## 16. Governance, change control, dan definisi LOCK

- **Merek resmi Arah Jamaah menjadi bagian SSOT V1.0**; penyebutan nama berbeda di dokumen turunan/skrip harus dikoreksi, bukan dianggap alternatif nama.
- **Dokumen ini menjadi SSOT V1.0**; PRD, ERD, business rules, API, test case, UI/UX dan prompt vibe coding wajib menurunkan asumsi dari sini.
- Pemisahan `V1 active` dan `future-ready` bersifat mengikat: *schema-ready ≠ feature-shipped*.
- Usulan fitur baru atau perubahan vertical, perhitungan harga atau role scope dilakukan lewat **Change Request** dengan alasan, dampak ke database, izin, pricing, UX dan testing.
- Koreksi bug dan parameter implementasi yang tetap setia pada baseline dapat dilakukan tanpa menamai ulang scope.
- Perubahan ruang lingkup produk menggunakan revisi terkontrol (`V1.0.x` untuk klarifikasi/bug aturan; versi minor berikutnya untuk kemampuan baru). Jangan merekayasa riwayat bahwa fitur baru “sudah disepakati”.
- Kebijakan regulasi wajib diverifikasi ulang saat produk PIHK/KBIHU dipasarkan. Pernyataan software tidak menggantikan nasihat/persetujuan otoritas.

### Definition of Done V1.0

Sebuah travel Umroh dapat mengelola alur dari lead, booking, verifikasi pembayaran, berkas, departure, tasks dan supplier hingga closing; owner/ops/finance menerima insight readiness, blockers, profit dan cashflow yang konsisten serta bisa ditelusuri. Sistem memenuhi tes isolasi tenant, pembayaran, kapasitas, exception dan audit. Arsitektur dapat mengaktifkan vertical PIHK/KBIHU kelak tanpa membangun ulang aplikasi atau mencampur kewenangan KBIHU dengan PIHK. Pricing qualification dan aturan affiliate terdokumentasi; harga resmi/komisi yang masih TBD **tidak dipalsukan sebagai sudah lock**.

## 17. Revisi spesifik terhadap Master Blueprint Umroh sebelumnya

| Sebelum revisi | Setelah revisi V1.0 (16 Oktober 2026) |
|---|---|
| Positioning **Travel Operations Intelligence Platform** | Diperluas menjadi **Pilgrimage Operations Intelligence Platform** |
| Domain diasumsikan `Umrah only`, Haji disebut kemungkinan | Tiga vertical secara eksplisit: `UMRAH_OPERATIONS`, `HAJJ_SPECIAL`, `HAJJ_GUIDANCE` |
| Customer umumnya travel | `organization_type` meliputi PPIU, PIHK, KBIHU, PARTNER, BRANCH, AGENT_NETWORK |
| `Departure` berisiko menjadi satu-satunya sumber grouping | Journey/season/cohort foundation, sambil tetap mempertahankan Package ≠ Departure di Umroh V1 |
| Readiness dan exception satu pola perjalanan | Rule config per vertical; `Guidance Readiness` berbeda dari `Travel Readiness` |
| Haji dianggap perlu menyalin fitur Umroh | PIHK reuse mayoritas travel core; KBIHU memerlukan model bimbingan yang berbeda |
| Model harga diarahkan travel Umroh saja | TTM + complexity untuk Umroh/PIHK; season/cohort KBIHU pada fase kelak |
| Mitra berisiko diperlakukan sebagai tenant tanpa hubungan | Parent-child relationships dan `departure_allocations`, isolasi data, V1.5 activation |
| Scope perluasan Haji belum dipisahkan dengan jelas | V1 Umroh → V1.5 Network/Commercial → V2 PIHK → V2.x KBIHU |
| Nama produk belum diputuskan | **Arah Jamaah LOCKED**; label Operasional Umroh, Haji Khusus, Bimbingan Haji, Program Affiliate, dan Kalkulator Affiliate adalah turunan deskriptif, bukan sub-brand mandiri |

## 18. Referensi pemeriksaan domain eksternal (bukan keputusan fitur)

- Kementerian Haji dan Umrah RI — informasi perizinan PPIU/PIHK, PMHU 2/2026: <https://sumsel.haji.go.id/berita/perketat-izin-ppiu-dan-pihk-kemenhaj-sumsel-gelar-sosialisasi-pmhu-nomor-2-tahun-2026-1789478804025>
- Kementerian Haji dan Umrah RI — penguatan manasik dan peran KBIHU (25 September 2026): <https://www.haji.go.id/berita/manasik-haji-diperkuat-jemaah-tak-boleh-bergantung-pada-kbihu-1790353275454>
- Kementerian Haji dan Umrah RI — keputusan pendamping KBIHU 2026, tugas bimbingan/koordinasi dan batasan fungsi: <https://bengkulu.haji.go.id/uploads/general/6e890ad7-4100-4587-b19e-e9153424730c-1767930098436.pdf>

Referensi ini dipakai untuk **memeriksa perbedaan fungsi organisasi**. Seluruh aturan pricing, status engine, feature gates, dan prioritas rilis adalah **keputusan produk internal**, bukan klaim bahwa direkomendasikan/disahkan pemerintah.

---

**FINAL DECLARATION — ARAH JAMAAH MASTER BLUEPRINT V1.0 LOCKED (REVISI HAJI + BRAND)**  
**Tanggal:** 16 Oktober 2026  
**Merek resmi:** **Arah Jamaah** — LOCKED.  
**Lingkup live pertama:** SaaS operasional Umroh (PPIU/mitra sesuai haknya).  
**Lingkup reuse yang ditetapkan:** Haji Khusus (PIHK) dan Bimbingan Haji (KBIHU) melalui satu core, aktivasi terpisah dan roadmap bertahap.  
**Aturan mutlak:** Seluruh materi produk dan sales menggunakan Arah Jamaah. Jangan menambah fitur/nominal/regulatory promises yang belum diputuskan dan jangan menunda MVP Umroh hanya untuk menyelesaikan seluruh vertical Haji.
