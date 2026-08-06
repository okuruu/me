# UD84 — Panduan Deploy Lengkap ke cPanel

**Tanggal:** 2026-08-07
**Untuk:** menaikkan **seluruh** pekerjaan 5–7 Agustus 2026 ke server, dalam satu kali jalan.

Semua yang dibangun sejak 5 Agustus belum pernah naik ke server. Enam rilis menumpuk di belakang satu deployment yang belum terjadi. Dokumen ini menggabungkan keenamnya menjadi satu urutan: satu blok SQL, satu paket file, satu kali bersih-bersih cache.

> **Bahasa:** panduan ini ditulis campur — instruksi dalam bahasa Indonesia, nama file dan perintah apa adanya.

---

## Ringkasan satu halaman

| Langkah | Apa | Perkiraan waktu |
|---|---|---|
| 0 | Backup database + file lama | 10 menit |
| 1 | Jalankan **7 perintah SQL** di phpMyAdmin | 5 menit |
| 2 | Upload **1 folder + 3 file** backend, extract | 10 menit |
| 3 | **Bersihkan cache** (wajib) | 2 menit |
| 4 | Push frontend, tunggu Vercel | 5 menit |
| 5 | Cek 8 hal di server | 20 menit |

**Yang paling gampang terlewat:** langkah 3. Kalau cache tidak dibersihkan, halaman baru jadi 404 dan poin tetap dihitung dengan aturan lama — tanpa pesan error apa pun di layar.

---

## Langkah 0 — Backup dulu

**Jangan lewati ini.** Semua perubahan di bawah bersifat menambah, tetapi backup adalah satu-satunya jalan pulang kalau ada yang tidak beres.

### 0a. Database

phpMyAdmin → pilih database (`u1643348_esdelfron`) → **Export** → **Custom** → centang tabel berikut → **Go**:

```
ud84_penjualan_rekap      ud84_penjualan_detail
ud84_pesanan_rekap        ud84_pesanan_detail
ud84_master_produk        ud84_member
ud84_sales                ud84_logs
```

Simpan file `.sql`-nya. Beri nama yang jelas, misalnya `backup-sebelum-deploy-2026-08-07.sql`.

### 0b. File backend

cPanel → **File Manager** → masuk ke folder root Laravel (folder yang berisi `app`, `routes`, `artisan`). Download folder ini apa adanya:

```
app/Http/Controllers/UD84/
```

Lalu download tiga file ini:

```
routes/api.php
config/ud84.php                      (kalau sudah ada; kalau belum, lewati)
app/Http/Controllers/POS/EMoney.php
```

Itu persis daftar yang akan ditimpa di langkah 2, jadi kalau perlu mundur, tinggal kembalikan.

---

## Langkah 1 — Jalankan SQL di phpMyAdmin

phpMyAdmin → pilih database → tab **SQL** → tempel **semua** perintah di bawah sekaligus → **Go**.

Semuanya bersifat menambah atau melebarkan kolom. Tidak ada data yang dihapus, tidak ada yang ditimpa.

```sql
-- 1. Satuan penjualan pada setiap baris nota (Pcs / Set / Dus).
--    Tanpa ini, item pada transaksi baru tidak bisa dikoreksi nanti.
ALTER TABLE `ud84_penjualan_detail`
  ADD COLUMN `SATUAN` varchar(20) DEFAULT NULL AFTER `NAMA`;

-- 2. Status aktif/nonaktif untuk sales.
ALTER TABLE `ud84_sales`
  ADD COLUMN `STATUS` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif' AFTER `NAMA`;

-- 3. Status transaksi: dipakai pembatalan invoice.
--    Semua transaksi lama otomatis 'Aktif', jadi laporan tidak berubah.
ALTER TABLE `ud84_penjualan_rekap`
  ADD COLUMN `STATUS` enum('Aktif','Dibatalkan') NOT NULL DEFAULT 'Aktif' AFTER `UNIQUE`;

-- 4. Poin yang benar-benar diberikan oleh satu transaksi.
--    Supaya pembatalan mengembalikan persis yang pernah diberikan.
ALTER TABLE `ud84_penjualan_rekap`
  ADD COLUMN `POIN` smallint(6) DEFAULT NULL AFTER `MEMBER`;

-- 5. KODE menyimpan ID produk (int), tetapi kolomnya smallint -- batas 32767.
--    Pembatalan mencari produk lewat KODE untuk mengembalikan stok; ID yang
--    terpotong akan mengembalikan stok ke produk yang SALAH.
ALTER TABLE `ud84_penjualan_detail`
  MODIFY COLUMN `KODE` int(11) DEFAULT NULL;

-- 6. SALES menyimpan ID sales (int) di kolom tinyint -- batas 127. Setiap
--    sales yang pernah dibuat memakai satu nomor selamanya, dan menghapus
--    sales tidak mengembalikannya. Sekarang belum kena; nanti pesanan dengan
--    sales ke-128 akan GAGAL disimpan.
ALTER TABLE `ud84_pesanan_rekap`
  MODIFY COLUMN `SALES` int(11) DEFAULT NULL;

-- 7. Pengajuan diskon per baris pesanan, ditulis sales di /ud84.
ALTER TABLE `ud84_pesanan_detail`
  ADD COLUMN `DISKON` varchar(100) DEFAULT NULL AFTER `JUMLAH`;

-- 8. Tabel jejak: siapa membatalkan/memperbaiki apa, kapan, dan alasannya.
CREATE TABLE `ud84_transaksi_log` (
  `ID`               bigint(19) NOT NULL AUTO_INCREMENT,
  `UNIQUE_TRANSAKSI` varchar(50)  DEFAULT NULL,
  `AKSI`             varchar(30)  DEFAULT NULL,
  `OPERATOR`         varchar(100) DEFAULT NULL,
  `ALASAN`           text         DEFAULT NULL,
  `CATATAN_SISTEM`   text         DEFAULT NULL,
  `SEBELUM`          longtext     DEFAULT NULL,
  `SESUDAH`          longtext     DEFAULT NULL,
  `CREATED_AT`       timestamp    NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `UNIQUE_TRANSAKSI` (`UNIQUE_TRANSAKSI`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Cek hasilnya

Tempel ini di tab SQL, lalu pastikan semua muncul:

```sql
SHOW COLUMNS FROM `ud84_penjualan_detail` LIKE 'SATUAN';
SHOW COLUMNS FROM `ud84_penjualan_detail` LIKE 'KODE';
SHOW COLUMNS FROM `ud84_penjualan_rekap`  LIKE 'STATUS';
SHOW COLUMNS FROM `ud84_penjualan_rekap`  LIKE 'POIN';
SHOW COLUMNS FROM `ud84_pesanan_rekap`    LIKE 'SALES';
SHOW COLUMNS FROM `ud84_pesanan_detail`   LIKE 'DISKON';
SHOW COLUMNS FROM `ud84_sales`            LIKE 'STATUS';
SHOW TABLES LIKE 'ud84_transaksi_log';
```

Yang diharapkan: `varchar(20)`, `int`, `enum('Aktif','Dibatalkan')`, `smallint`, `int`, `varchar(100)`, `enum('Aktif','Nonaktif')`, dan satu baris nama tabel.

> ### ⚠️ JANGAN jalankan `php artisan migrate`
> Tabel `migrations` di database ini hanya berisi migrasi lama zaman Laravel 9/10, sementara folder `database/migrations/` sekarang berisi file gaya Laravel 11 yang tidak tercatat di sana. `migrate` akan mencoba membuat tabel `users` yang sudah ada, lalu gagal di tengah jalan. **SQL di atas adalah satu-satunya cara yang benar.**

---

## Langkah 2 — Upload file backend

### Yang di-zip

Sesuai preferensi Anda, ini di-zip per folder:

| Zip apa | Isi | Aman? |
|---|---|---|
| **folder `app/Http/Controllers/UD84/`** | 9 file: `MasterProduk`, `Member`, `Penjualan`, `Pesanan`, `Poin`, `Report`, `Sales`, `Stock`, `Transaksi` | ✅ Ya — seluruh isi folder ini memang milik UD84 |
| `routes/api.php` | daftar rute | ✅ Ya |
| `config/ud84.php` | aturan poin (1 poin per Rp 1.000.000) | ✅ Ya |
| `app/Http/Controllers/POS/EMoney.php` | wajib ikut, lihat catatan | ✅ Ya |

> ### ⚠️ JANGAN zip seluruh folder `app/` atau seluruh folder `config/`
>
> - **`app/` seluruhnya** ikut membawa pekerjaan Anda yang belum selesai — `app/Http/Controllers/POS/`, `app/Http/Controllers/Kosada/`, `app/DTO/`, `app/Models/Kosada/`. Itu belum pernah diuji dan tidak termasuk rilis ini.
> - **`config/` seluruhnya** ikut menimpa `config/database.php`, `config/mail.php`, dan lain-lain milik server. Cukup ambil `config/ud84.php` saja.
>
> Zip **folder `app/Http/Controllers/UD84/`** saja — itu sudah mencakup hampir semua pekerjaan ini, dan isinya murni UD84.

> ### Kenapa `EMoney.php` ikut
> `routes/api.php` yang baru memuat dua rute `POS/Report/Delete-EMoney` dan `POS/Report/Update-EMoney`, yang menunjuk ke dua method di `POS\EMoney`. Dua method itu **ditambahkan** ke file tersebut — tidak ada yang diubah dari isi lamanya, dan belum ada layar yang memanggil rute barunya. Kalau `api.php` naik sendirian, ada dua rute menunjuk ke method yang tidak ada di server.

### Cara membuat zip-nya

Dari `D:\Coedes\Production\Marmyadose`, buka **Git Bash**, lalu:

```bash
git archive --format=zip --output=../ud84-backend-lengkap.zip main \
  app/Http/Controllers/UD84 \
  app/Http/Controllers/POS/EMoney.php \
  routes/api.php \
  config/ud84.php \
  database/sql
```

Hasilnya: `D:\Coedes\Production\ud84-backend-lengkap.zip`, dengan struktur folder yang sudah benar di dalamnya.

`git archive` mengambil isi dari branch `main` yang **sudah di-commit**, bukan dari folder kerja Anda — jadi pekerjaan yang belum di-commit tidak mungkin ikut terbawa, bahkan kalau tidak sengaja.

(Folder `database/sql` ikut hanya sebagai arsip — isinya file `.sql` yang sudah Anda jalankan di langkah 1. Tidak berpengaruh apa-apa saat dijalankan.)

### Upload dan extract

1. cPanel → **File Manager** → masuk ke folder root Laravel (yang berisi `app`, `routes`, `artisan`).
2. **Upload** `ud84-backend-lengkap.zip`.
3. Klik kanan → **Extract**, ke folder yang sama. Pilih **overwrite** kalau ditanya.
4. Hapus file zip-nya dari server setelah selesai.

---

## Langkah 3 — Bersihkan cache (WAJIB)

Ini langkah yang paling sering terlewat dan paling membingungkan kalau terlewat.

**Kalau ada Terminal di cPanel**, dari folder root Laravel:

```
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

**Kalau tidak ada Terminal**: File Manager → masuk `bootstrap/cache/` → hapus **semua isinya kecuali** `.gitignore`. Itu termasuk `routes-v7.php`, `config.php`, `events.php`, `packages.php`, `services.php`. **Jangan hapus foldernya.** Laravel akan membuatnya ulang otomatis.

### Kalau langkah ini dilewati

| Yang terjadi | Gejalanya |
|---|---|
| `route:clear` terlewat | Halaman **Poin** kosong, tombol **Batalkan** dan **Perbaiki** tidak berfungsi, pengajuan diskon tidak muncul — **semua tanpa pesan error**, hanya tabel kosong. |
| `config:clear` terlewat | Poin tetap dihitung **1 poin per Rp 500.000**, bukan per Rp 1.000.000. Tidak ada tanda apa pun di layar bahwa aturan lama masih berlaku. |

---

## Langkah 4 — Deploy frontend

Frontend ada di Vercel dan naik otomatis begitu di-push.

**Sebelum push, pastikan satu baris ini.** Buka `me/src/library/resources/phraseBox.ts`, baris pertama harus:

```ts
const isProduction: boolean = true;
```

Kalau nilainya `false`, panel di server akan menunjuk ke `http://localhost` dan **tidak ada apa pun yang jalan**. Nilai itu memang sengaja dibalik ke `false` saat pengujian lokal, dan sudah dikembalikan — tapi tetap dicek.

```bash
cd "D:/Coedes/Production/me"
git checkout main
git push
```

Tunggu sampai Vercel selesai build sebelum mulai mengetes.

---

## Langkah 5 — Cek di server

Delapan hal. Kalau semuanya lolos, deployment berhasil.

### 5a. Nota

Buka **Transaksi** → pilih transaksi lama → **Cetak Ulang**.

- Kolom **Satuan** muncul (transaksi lama isinya tanda "-", itu benar — dulu satuan memang tidak dicatat).
- **Harga × Jumlah = Jumlah** cocok di setiap baris. Ini perbaikan utama rilis pertama.
- Blok **QRIS** tampil (masih placeholder bertuliskan BUKAN KODE ASLI).
- Tombol **Cetak DL** dan **Cetak 58mm** dua-duanya ada.

### 5b. Sales

Menu **Sales** ada di navigasi. Daftarnya tampil. Coba tambah satu nama, ubah, lalu nonaktifkan — yang dinonaktifkan hilang dari pilihan sales di `/ud84`, tetapi namanya tetap tampil di pesanan lama.

### 5c. Pembatalan transaksi

**Transaksi** → **Lihat** pada satu transaksi kecil milik sendiri → **Batalkan Transaksi**.

- Alasan **wajib** diisi.
- Setelah dibatalkan: stok produknya kembali, **Kartu Stok** dapat baris baru `Batal Transaksi`, dan transaksinya hilang dari daftar.
- Centang **Tampilkan Dibatalkan**: transaksinya muncul abu-abu, tanpa tombol Cetak Ulang, dan **Total di bawah tetap tidak menghitungnya**.
- **Riwayat Perubahan** di drawer menyebut nama Anda, waktunya, dan alasannya.

### 5d. Perbaikan pesanan

**Pesanan** → daftar langsung terisi begitu halaman dibuka (tidak perlu tekan cari) → **Lihat** → **Ubah Pesanan**. Ubah nama pelanggan dan satu jumlah, simpan. Riwayat di bawah mencatat perubahannya.

Pesanan yang sudah **Verified** tidak menampilkan tombol Ubah maupun Hapus — itu memang disengaja.

### 5e. Perbaikan transaksi

**Transaksi** → **Lihat** → **Perbaiki Transaksi**.

- Untuk transaksi **lama**: hanya data pelanggan dan nominal yang bisa diubah, dan ada keterangan kenapa itemnya tidak bisa. **Ini normal, bukan kerusakan** — lihat catatan di bawah.
- Untuk transaksi **baru** (dibuat setelah deploy ini): tabel item ikut bisa diubah.
- Setelah diperbaiki, nota-nya mencetak **NOTA KOREKSI** beserta tanggalnya.

### 5f. Poin

Menu **Poin** ada di navigasi, antara Member dan Sales. Daftar member tampil beserta saldonya (kemungkinan besar semuanya 0 — itu wajar, lihat catatan). Coba **Tambah** 2 poin ke satu member lalu **Kurang** 1; angka baris dan **Total Poin Terbit** di atas ikut berubah. Kembalikan seperti semula setelah dites.

### 5g. Harga jual dan pengajuan diskon

Buka `/ud84` → **Pesan Online** → masukkan password sales.

- Kolom **Harga Jual** muncul di keranjang. Produk yang belum ada harganya tertulis **"Belum ada harga"**, bukan "Rp 0".
- Kolom **Pengajuan Diskon** ada di setiap baris. Tulis sesuatu di salah satunya, lalu simpan pesanan.
- Di **Pesanan** panel: pesanan itu ditandai **Ada pengajuan**, dan isinya terbaca di drawer item.

### 5h. Login

Coba masuk panel dengan password **salah**. Harus ditolak. (Sebelum rilis ini, password salah justru bisa masuk.)

---

## Yang wajar terjadi setelah deploy — bukan kerusakan

Empat hal di bawah akan terlihat seperti fitur yang tidak jalan. Semuanya normal.

**1. Perbaikan item transaksi belum bisa dipakai untuk transaksi lama.** Mengubah item berarti menghitung ulang stok, dan itu butuh dua hal yang baris lama tidak punya: produk yang masih bisa ditemukan, dan **satuan** penjualannya. Kolom `SATUAN` baru mulai terisi oleh transaksi yang dibuat **setelah** deploy ini. Di database lokal, hanya 1 dari 29 transaksi yang memenuhi syarat. Transaksi lama tetap bisa dikoreksi data pelanggan dan nominalnya. Fitur ini akan makin berguna seiring bertambahnya transaksi baru.

**2. Halaman Poin kemungkinan besar kosong.** Poin butuh pembayaran **tunai** minimal Rp 1.000.000 atas nama **member terdaftar**. Di database lokal, belum pernah ada satu pun member yang punya poin. Halaman berisi angka 0 semua berarti programnya baru mulai, bukan rusak.

**3. Lebih dari separuh produk belum punya harga jual.** Dari 409 produk yang tampil di katalog, **207 di antaranya** `HARGA_JUAL`-nya kosong atau 0. Sales akan melihat **"Belum ada harga"** pada produk-produk itu. Tidak ada kode yang bisa memunculkan harga yang memang belum pernah diisi — harganya perlu dimasukkan lewat **Master Produk**.

**4. Poin yang sudah ada tidak dihitung ulang.** Saldo lama tetap seperti apa adanya. Mulai deploy ini, satu transaksi mendapat setengah dari poin yang dulu didapat. Transaksi yang dibatalkan tetap mengembalikan persis poin yang dulu diberikan, karena setiap transaksi menyimpan sendiri angkanya.

---

## Kalau ada yang tidak beres

### Mundur (rollback)

1. Kembalikan folder `app/Http/Controllers/UD84/` dan tiga file dari **Langkah 0b**.
2. Bersihkan cache lagi — `route:clear` **dan** `config:clear`.
3. Frontend: Vercel → **Deployments** → pilih deployment lama yang bekerja → **Promote to Production**.

### Yang TIDAK perlu di-rollback

**Biarkan semua perubahan database.** Semuanya menambah: kolom baru boleh kosong, `STATUS` default-nya `Aktif`, kolom yang dilebarkan menerima semua yang dulu diterima, dan tabel `ud84_transaksi_log` diabaikan oleh kode lama. Menghapusnya justru berisiko.

### Yang tidak bisa dikembalikan oleh rollback

- **Transaksi yang sudah dibatalkan** tetap bertanda `Dibatalkan` di data, tetapi kode lama akan menghitungnya lagi sebagai omzet. Catat kalau ada yang dibatalkan sebelum rollback.
- **Perbaikan transaksi** yang sudah tersimpan sudah benar-benar menggeser stok dan poin. Mengembalikan kode tidak mengembalikan stoknya.
- **Poin yang sudah diberikan** dengan aturan baru tetap ada. Mengubah kembali konstantanya tidak menghitung ulang transaksi lama.

---

## Catatan penting yang perlu diketahui

- **Penyesuaian poin manual tidak dicatat.** Menambah atau mengurangi poin lewat halaman Poin tidak menyimpan siapa yang melakukannya, kapan, atau kenapa. Ini keputusan yang disengaja demi kesederhanaan. Kalau ada member protes soal saldonya, tidak ada catatan yang bisa dicek.
- **Pengajuan diskon tidak punya status.** Tidak ada "disetujui" atau "ditolak" — admin membacanya lalu memutuskan sendiri di Retail. Pesanan akan terus bertanda **Ada pengajuan** meski diskonnya sudah diberikan.
- **Belum ada printer sungguhan yang diuji.** Semua pengecekan cetak dilakukan lewat Chrome pada ukuran kertas yang benar. Geometrinya sudah tepat; bagaimana printer Anda menarik dan memotong kertas belum pernah dicoba. Kalau tanda tangan atau QRIS terpotong di kertas thermal, naikkan `TAIL_FEED_MM` di `me/src/routes/ud84/panel/nota/[id]/+page.svelte`.
- **Nota transaksi yang dibatalkan masih mencetak blok QRIS dan Sisa Tagihan** di bawah tanda DIBATALKAN — jadi seolah meminta pembayaran atas transaksi yang sudah batal. Sudah dicatat, belum diperbaiki.
- **Semua ini baru diuji dengan data lokal**: 29 transaksi, 409 produk, 11 member, 1 pesanan. Belum pernah bertemu data sungguhan.

---

## Kalau ingin deploy satu rilis saja

Panduan ini menggabungkan enam rilis. Kalau suatu saat perlu menaikkan satu saja, panduan aslinya masih berlaku dan lebih detail per rilis:

1. `2026-08-06-ud84-nota-print-deploy.md` — nota, cetak, satuan, manajemen sales
2. `2026-08-06-ud84-cancel-invoice-deploy.md` — pembatalan transaksi
3. `2026-08-06-ud84-perbaikan-pesanan-deploy.md` — perbaikan pesanan
4. `2026-08-06-ud84-perbaikan-transaksi-deploy.md` — perbaikan transaksi
5. `2026-08-07-ud84-poin-member-deploy.md` — poin member
6. `2026-08-07-ud84-harga-jual-diskon-deploy.md` — harga jual dan pengajuan diskon

**Urutannya tidak boleh diacak**, karena beberapa rilis menyentuh file yang sama: rilis 2 mengubah `Report.php` dan `Penjualan.php` lagi, rilis 4 mengubah `Transaksi.php` setelah rilis 3, rilis 5 mengganti `config/ud84.php` dari rilis 2, dan rilis 6 mengubah `Pesanan.php` setelah rilis 3.
