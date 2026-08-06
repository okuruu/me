# UD84 — Catatan Pengerjaan

**Periode:** 5–7 Agustus 2026
**Status:** seluruh item di `Instruction.md` selesai dan sudah di-merge ke `main`. **Belum ada yang naik ke server.**

Dokumen ini adalah catatan lengkap apa yang dikerjakan, kenapa dikerjakan begitu, dan apa yang ditemukan sepanjang jalan. Untuk menaikkannya ke server, lihat `me/docs/deployment/2026-08-07-DEPLOY-SEMUA.md`.

---

## 1. Ringkasan

| Yang diminta | Status |
|---|---|
| Cancel Invoice: batalkan & kelola retur | ✅ Selesai |
| QRIS di nota (placeholder) | ✅ Selesai |
| Format tanda tangan lebih rapi | ✅ Selesai |
| Cetak DL + Thermal 58mm, dua tombol | ✅ Selesai |
| Satuan item di nota | ✅ Selesai |
| Perbaikan Transaksi | ✅ Selesai — tiga tahap |
| Sales melihat harga jual di Pesan Online | ✅ Selesai |
| Sales mengajukan diskon → muncul di panel | ✅ Selesai |
| 1 juta = 1 poin + dashboard poin | ✅ Selesai |
| ~~Dashboard Sales~~ | Dihapus dari daftar 7 Agustus — fiturnya sudah ada sebagai **Analisa Hasil Kerja Sales** |

**Di luar daftar, diminta di tengah jalan dan sudah selesai:** manajemen sales (tambah, ubah nama, nonaktifkan, hapus).

**Angka akhir:** 155 test lolos di backend (1 gagal, yaitu `ExampleTest` bawaan yang sudah gagal sejak sebelum pekerjaan ini dimulai), `npm run check` 0 error / 6 warning, dan sembilan berkas test baru di `Marmyadose/tests/Feature/UD84/`.

---

## 2. Apa yang sekarang bisa dilakukan

### Nota dan cetak
Setiap baris nota menampilkan **satuan** (Pcs / Set / Dus). **Harga × Jumlah = Jumlah** sekarang cocok di setiap baris — sebelumnya, jumlah 100 mencetak total 100 kali lipat. Ada blok **QRIS** (masih placeholder bertuliskan "BUKAN KODE ASLI"), tanda tangan lebih ringkas, dan dua tombol cetak: **DL 110×220mm** dan **Thermal 58mm**. Dari kasir, setelah menyimpan penjualan, ada tombol **Cetak Nota** langsung.

### Manajemen sales
Halaman **Sales** untuk menambah, mengubah nama, menonaktifkan, dan menghapus. Sales yang dinonaktifkan hilang dari pilihan pesanan baru tetapi namanya tetap tampil di pesanan dan member lama. Sales yang sudah punya riwayat tidak bisa dihapus — hanya dinonaktifkan, supaya riwayatnya tidak ikut hilang.

### Pembatalan transaksi
Dari drawer Transaksi, satu transaksi bisa dibatalkan dengan **alasan wajib**. Yang terjadi: stok kembali, poin ditarik kembali, transaksi keluar dari **semua** perhitungan omzet, dan tercatat siapa yang membatalkan beserta waktunya. Nominal uang **tidak** diubah — uang yang sudah berpindah adalah fakta sejarah. Nota transaksi batal mencetak tanda **TRANSAKSI DIBATALKAN**.

Stok yang **tidak bisa** dikembalikan otomatis — karena produknya sudah dihapus, atau baris lamanya tidak mencatat satuan — dilewati, bukan ditebak, lalu dilaporkan lewat notifikasi yang harus ditutup manual. Menebak salah satuannya akan meleset sepuluh kali lipat.

### Perbaikan pesanan
Pesanan yang **belum diverifikasi** bisa dikoreksi: nama, WhatsApp, sales, keterangan, jumlah, tambah dan hapus item — semuanya dalam satu simpanan. Pesanan yang sudah diverifikasi terkunci dari perubahan **dan** penghapusan, karena angkanya sudah masuk laporan kinerja sales. Penghapusan pesanan sekarang menyimpan salinan lengkapnya dulu.

### Perbaikan transaksi
Transaksi yang sudah jadi bisa dikoreksi. Semua transaksi aktif bisa diperbaiki data pelanggan dan nominalnya; transaksi yang setiap barisnya masih mengenali produk **dan** mencatat satuannya juga bisa diubah itemnya. Satu simpanan menghitung ulang total, menyesuaikan stok, menyelaraskan poin member, dan mencatat semuanya — dalam satu transaksi database. Notanya mencetak **NOTA KOREKSI** beserta tanggal.

### Poin member
Satu poin per **Rp 1.000.000** pembayaran tunai, berlaku kelipatan. Halaman **Poin** menampilkan saldo setiap member, total poin yang pernah terbit, dan tombol tambah/kurang manual — karena penukaran poin pada praktiknya adalah percakapan di meja kasir.

### Harga jual dan pengajuan diskon
Di **Pesan Online**, sales sekarang melihat **harga jual** setiap barang di keranjang, dan bisa menuliskan **pengajuan diskon** bebas per baris ("5%", "5000", "samakan harga bulan lalu"). Di panel, pesanan yang membawa pengajuan diberi tanda di daftar, dan isinya terbaca di drawer item. Memberi diskonnya tetap keputusan admin, diketik manual di Retail.

---

## 3. Yang ditemukan sepanjang jalan

Bagian ini yang paling layak dibaca. Semua ini ditemukan dari data sungguhan atau dari review, bukan dari dugaan.

### Yang sudah diperbaiki

**Password salah bisa masuk ke panel.** Halaman login memeriksa `status === "Unauthorized"`, padahal helper `db()` tidak pernah mengembalikan nilai itu — server menjawab 401, helper-nya melempar error, lalu melapor `"error"`. Pemeriksaannya tidak pernah cocok, jadi password salah lolos ke jalur sukses dan membuka panel. Sekarang diperiksa secara positif terhadap satu-satunya nilai sukses.

**Navigasi menyorot halaman yang salah dan menyapa nama yang salah.** `activeMenu` dipatok mati ke `'Transaksi'`, jadi setiap halaman panel menyorot Transaksi, dan sapaannya "Hello, Richie" — nama yang dipatok di kode. Sekarang diturunkan dari URL, dan menyapa operator yang benar-benar login.

**Halaman Pesanan selalu terbuka kosong.** Halaman itu tidak pernah memanggil `onMount` — bahkan tidak meng-import-nya — jadi terbuka dengan tulisan "Tidak ada data" sampai operator menekan cari. Terbaca seperti "tidak ada pesanan", padahal artinya "belum ada yang diminta".

**Diskon persen bisa membuat nota tidak cocok dengan dirinya sendiri.** `POTONGAN_PERSEN` kolomnya integer, jadi MySQL membulatkan saat menyimpan, sementara `TOTAL` sudah terlanjur dihitung dari angka yang belum dibulatkan. Sekarang dibulatkan sekali di sumbernya.

**Pesan error daftar pesanan tidak pernah sampai ke operator.** Dua endpoint menjawab dengan HTTP 400/500, dan `db()` mengubah semua respons non-2xx menjadi error koneksi umum — jadi operator melihat "Server Tidak Dapat Diakses", bukan pesan yang sudah ditulis untuknya. Satu endpoint juga berhenti mengirim teks exception mentah ke halaman publik.

**Pesanan dengan produk terhapus tidak bisa dibuka sama sekali.** Endpoint-nya membaca nama produk tanpa memastikan produknya ada, jadi error — pesanan itu tidak bisa dilihat, apalagi diperbaiki. Sekarang barisnya ditandai dan hanya bisa dihapus, yang memang satu-satunya jalan keluarnya.

### Yang ditemukan review, sebelum sempat jadi masalah

- **Baris ganda untuk satu produk bisa hilang diam-diam** saat pesanan diperbaiki, karena barisnya dipetakan per produk. Sekarang ditolak terang-terangan.
- **Kunci "sudah diverifikasi" bisa dilewati** kalau dua orang bekerja bersamaan — dicek sebelum transaksi database dibuka, bukan di dalamnya.
- **Item yang ditambahkan saat memperbaiki transaksi lama tercatat tanggal hari ini**, jadi barang yang ditambahkan ke transaksi Agustus akan muncul di laporan produk bulan September sementara uangnya tetap di Agustus.
- **Gerbang perbaikan item lebih longgar daripada aturan sebenarnya**, sehingga transaksi berisi salah satu dari **114 dari 409 produk** yang tidak mencatat isi per satuan akan membuka editor lengkap lalu menolak setiap simpanan — tanpa jalan mundur ke perbaikan nominal.
- **Pilihan satuan bisa menampilkan "Pcs" dan "Pieces" berdampingan**, terlihat seperti sinonim padahal berbeda sampai 48 kali lipat.
- **Poin bisa tercatat diberikan padahal tidak pernah masuk ke saldo siapa pun**, kalau nama pelanggannya bukan member terdaftar. Pembatalan berikutnya akan menarik poin yang tidak pernah diberikan.

### Yang ditemukan dari data, bukan dari kode

- **207 dari 409 produk** yang tampil di katalog tidak punya harga jual sama sekali. Sales akan melihat "Belum ada harga" — angka itu memang belum pernah diisi.
- **114 dari 409 produk** tidak mencatat isi per satuan, termasuk 53 dari 101 produk bersatuan Dus.
- **56 dari 57** baris transaksi lama tidak mencatat satuan, dan **21 dari 57** menunjuk produk yang sudah tidak ada. Ini yang menentukan bahwa perbaikan item hanya bisa untuk transaksi baru.
- **Belum ada satu pun member yang punya poin**, dan hanya 2 transaksi sepanjang sejarah yang tunainya mencapai 1 juta — keduanya dari 2023.
- **`ud84_pesanan_rekap.SALES` bertipe tinyint** padahal menyimpan ID sales bertipe int: batas 127, dan setiap sales yang pernah dibuat memakai satu nomor selamanya. Ditemukan karena sebuah test mulai gagal setelah cukup banyak dijalankan.

---

## 4. Cara kerja yang dipakai

Setiap fitur besar melewati empat tahap: **brainstorm** (menetapkan keputusan bersama pemilik), **spec** (menuliskan keputusan dan alasannya), **plan** (langkah demi langkah beserta kodenya), lalu **eksekusi** dengan review di setiap langkah.

Untuk dua fitur paling berisiko — perbaikan pesanan dan perbaikan transaksi — setiap langkah dikerjakan agen terpisah lalu ditinjau agen lain, ditutup satu review menyeluruh di akhir. Itu yang menemukan sebagian besar cacat di daftar atas. **Tidak satu pun ditemukan oleh test yang gagal**; semuanya ditemukan dengan membaca kode terhadap maksudnya.

Setiap fitur juga dijalankan sungguhan di browser sebelum dianggap selesai — bukan hanya di-test — lewat Chrome headless yang dikendalikan langsung, dan hasilnya dicocokkan dengan isi database.

Dokumentasinya ada di `me/docs/superpowers/specs/` (keputusan) dan `me/docs/superpowers/plans/` (langkah pengerjaan).

---

## 5. Yang belum dikerjakan, dan kenapa

**Autentikasi API.** Tidak ada satu pun rute di `routes/api.php` yang memakai middleware, jadi setiap endpoint — termasuk yang memindahkan uang, stok, dan poin — bisa dipanggil tanpa login. Ini masalah terbesar yang tersisa. Tidak dikerjakan karena atas permintaan pemilik: memperbaikinya menyentuh semua rute sekaligus halaman login, dan kalau salah, toko terkunci dari sistemnya sendiri. Perlu dikerjakan dengan pemilik mendampingi.

**Nota transaksi yang dibatalkan masih mencetak QRIS dan Sisa Tagihan** di bawah tanda DIBATALKAN — seolah meminta pembayaran atas transaksi yang batal. Tidak dikerjakan atas permintaan pemilik, karena mengubah dokumen yang dipegang pelanggan dan belum pernah ada printer sungguhan yang diuji.

**Identitas per sales.** Halaman `/ud84` memakai satu password bersama dengan nama dipilih dari dropdown, jadi sistem tidak bisa membedakan satu sales dari yang lain. Pengajuan diskon karena itu melekat pada pesanan dan nama sales yang tertulis di pesanan itu, bukan pada orang yang mengetiknya. Tidak ada yang diminta sekarang bergantung pada ini.

**Printer sungguhan.** Semua pengecekan cetak lewat Chrome pada ukuran kertas yang benar. Geometrinya betul; perilaku printer aslinya belum pernah diuji — terutama nota thermal dengan 5 item atau lebih.

Sisanya ada di `HANDOFF.md` §9: sekitar dua puluh catatan kecil, tidak ada yang menghalangi.

---

## 6. Langkah berikutnya

1. **Naikkan ke server.** Enam rilis menumpuk dan belum satu pun bertemu data sungguhan. Panduannya: `me/docs/deployment/2026-08-07-DEPLOY-SEMUA.md`. Setiap rilis tambahan membuat deployment pertama makin besar dan makin sulit ditelusuri kalau ada yang salah.
2. **Perhatikan hari pertama.** Yang paling mungkin mengejutkan adalah hal-hal yang tidak terlihat di data lokal: apakah `SATUAN` mulai terisi di penjualan baru, apakah poin mulai bertambah, dan apakah ada produk dengan satuan yang belum tertangani.
3. **Isi harga jual produk** lewat Master Produk, supaya kolom harga di Pesan Online berguna untuk lebih dari separuh katalog.
4. **Ganti QRIS placeholder** dengan kode asli begitu tersedia — caranya ada di panduan rilis pertama.
5. Setelah itu baru catatan kecil di `HANDOFF.md`, dan autentikasi API kalau sudah siap mengerjakannya bersama.
