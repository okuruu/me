# GILBY DHILEGA YODIAZ
## Senior Full-Stack Software Engineer

Malang, Jawa Timur, Indonesia | +62 898-4170-335 | gilbydhilegayodiaz@gmail.com
LinkedIn: linkedin.com/in/gilbydhilega | GitHub: github.com/okuruu

---

## RINGKASAN PROFESIONAL

Senior Full-Stack Software Engineer dengan pengalaman 5+ tahun membangun sistem web, desktop, mobile, dan AI tingkat produksi secara end-to-end — perangkat lunak yang menjalankan bisnis ritel 55+ lokasi setiap hari. Menguasai TypeScript, PHP, Python, Rust, dan Dart — SvelteKit, Laravel, Flutter, dan Tauri di permukaan; MySQL, PostgreSQL, dan Elasticsearch di belakangnya. Berfokus pada arsitektur offline-first, integrasi sistem, dan AI on-premise: POS native ~8MB yang tidak pernah kehilangan penjualan saat jaringan putus, jembatan ke POS lama dengan ID bertanda tangan kriptografis, dan agen analitik LLM lokal yang nyaris tanpa biaya operasi. 10+ sistem berjalan di produksi, digunakan setiap hari oleh 1.000+ orang di 55+ lokasi.

---

## KOMPETENSI UTAMA

Full-Stack Web / Desktop / Mobile | Sistem Offline-First & Tahan Gangguan | Desain & Integrasi REST API | Arsitektur Perangkat Lunak | Desain & Optimasi Basis Data | Message Queue & Pemrosesan Async | Integrasi AI / LLM | Optimasi Performa | Server Linux & DevOps | Kepemimpinan Teknis

---

## KEAHLIAN TEKNIS

- **Bahasa Pemrograman:** TypeScript, PHP, Rust, Python, Dart, SQL, Java
- **Framework:** SvelteKit, Laravel, Flutter, Tauri, Node.js, Bun, CodeIgniter, Rocket, Mastra, Bootstrap, DaisyUI
- **Basis Data:** MySQL, PostgreSQL, SQLite, Elasticsearch, Supabase, Firestore
- **API & Async:** REST API, Laravel Sanctum, Laravel Queues, webhook, microservice
- **AI / Otomasi:** Ollama, Mastra, Llama 3.2, WhatsApp/Telegram API, Baileys
- **Tools:** Git, Docker, Figma, Jira, Pandas, Looker Studio, Grafana, Android Studio
- **Lingkungan:** Administrasi server Linux (CentOS, Debian, Ubuntu, Mint, CachyOS)

---

## PENGALAMAN PROFESIONAL

### Head of IT Development / Lead Engineer — Dea Bakery
*Malang, Indonesia | Jan 2023 – Sekarang*

- Merancang arsitektur dan merilis 10+ sistem produksi (POS/ERP, HRIS, operasional multi-departemen, rekrutmen, AI) yang digunakan setiap hari oleh 1.000+ karyawan di 55+ outlet; memimpin tim 6 orang (2 full-stack, 1 backend, 1 mobile, 1 desainer UI/UX, 1 IT admin support) plus hingga 3 intern.
- Membangun **Chocoa**, POS offline-first berbasis Tauri + SvelteKit di atas back office Laravel/Elasticsearch dengan resilience pod di setiap kasir (idempotensi UUIDv7) — 0 penjualan hilang saat gangguan, binary ~8MB vs 80–150MB Electron, Rp 170 Miliar+ diproses.
- Mendesain **HRIS** desktop (Tauri/SvelteKit/Laravel) yang menyatukan payroll, cuti, BPJS, dan tunjangan untuk seluruh 1.000+ karyawan, dengan otomasi kebijakan terjadwal dan sinkronisasi Google Sheets API.
- Membangun **API membership** Laravel yang menjembatani POS lama secara read-only, dengan pembayaran BCA Virtual Account + QRIS dan ID publik bertanda tangan HMAC-SHA256 sehingga ID palsu atau hasil iterasi gagal di batas API.
- Mengintegrasikan **agen LLM on-premise** (Llama 3.2 via Ollama + Mastra) yang dibatasi hanya pada kueri SELECT read-only di balik safety gate, dengan respons streaming — latensi token pertama <3 detik, 100% on-premise.
- Mengoptimalkan kueri VPS produksi hingga respons tipikal di bawah 20ms; menangani 5 Juta+ record dalam pipeline data live.

### Web Developer — Dea Bakery
*Malang, Indonesia | Feb 2021 – Des 2022*

- Membangun platform rekrutmen, asesmen psikometri (8 instrumen), dan pusat pelatihan dari nol dengan Laravel dan SvelteKit.
- Memigrasikan data lama Excel dan Google Sheets ke MySQL dengan integritas penuh.
- Mengintegrasikan bot WhatsApp/Telegram dan pipeline pelaporan otomatis ke Looker Studio dan Grafana; membangun program penjualan yang menghasilkan USD $2,8 Juta.

### Founder & Lead Developer — okuruu labworks!
*Malang, Indonesia | Sep 2016 – Sekarang*

- Mendirikan dan memimpin studio beranggotakan 13 orang yang mengerjakan aplikasi mobile dan custom software, UI/UX, serta brand identity.

### Tutor Privat — Wiraswasta
*Okt 2021 – Sekarang*

- Membimbing developer dalam pengembangan web dan mobile full-stack (Laravel, SvelteKit).

### Software Engineer Intern — Perum Jasa Tirta I
*Sep 2019 – Mar 2020*

- Membangun sistem pelacakan KPI dengan CodeIgniter 3; mendukung penyiapan server Linux Proxmox dan implementasi SAP ERP.

---

## PROYEK PILIHAN

**Chocoa — POS & Retail ERP** *(Tauri, SvelteKit, TypeScript, Laravel, MySQL, Elasticsearch)*
POS desktop offline-first di atas back office Laravel/Elasticsearch, satu sumber kebenaran untuk 55+ outlet. Resilience pod per-kasir yang terikat ke 127.0.0.1 menjaga transaksi tetap berjalan saat server putus dan mengosongkan antreannya secara berurutan saat terhubung kembali; kunci UUIDv7 membuat retry idempoten — tanpa tagihan ganda. Ledger stock-card membuat setiap selisih dapat ditelusuri. Hasil: 0 penjualan hilang saat jaringan putus, tutup kas 2× lebih cepat.

**HRIS — Platform Manajemen SDM** *(Tauri, SvelteKit, Svelte 5, TypeScript, Laravel, MySQL)*
Klien desktop native ~8MB (vs 80–150MB Electron) di atas back office Laravel yang menyatukan payroll, cuti, BPJS, tunjangan, kedisiplinan, dan rekrutmen untuk seluruh 1.000+ karyawan. Auth berbasis peran, satu API client yang menangani auth/timeout/error i18n, job kebijakan terjadwal, dan sinkronisasi Google Sheets. Hasil: 10 modul aktif, 0 spreadsheet manual.

**Membership — Aplikasi Loyalti & Pemesanan** *(Laravel, PHP, MySQL, Sanctum, QRIS + BCA)*
Lapisan membership modern di atas POS lama yang tidak bisa dimodifikasi — membaca tabel POS, hanya menulis ke skema sendiri. Checkout atomik (validasi keranjang, cek voucher, pembuatan order, notifikasi WhatsApp async — semua atau tidak sama sekali), kanal BCA VA + QRIS, dan HMAC-SHA256 pada setiap ID publik sehingga enumerasi gagal di batas API. Hasil: 0 ID integer mentah terekspos, 0 langkah di kasir untuk membayar.

**FARS — Platform Operasional Multi-Departemen** *(Laravel 11, PHP 8.2, MySQL, Firebase)*
Platform modular di balik satu login untuk HR, keuangan, persetujuan pengadaan, IT, marketing, dan layanan umum. Tiga basis data dipisah berdasarkan tujuan (operasional / produksi / analitik) menjaga kueri pelaporan agar tidak membebani layar live; API berversi yang diamankan Sanctum memungkinkan HRIS dan aplikasi mobile membaca/menulis data yang sama. Hasil: persetujuan 4 tahap teraudit, 14+ tingkat peran, 6 departemen disatukan.

**Dea Bakery Careers — Platform Rekrutmen** *(SvelteKit, TypeScript, Laravel API, MySQL)*
Front end SvelteKit pre-rendered (cepat via CDN di kuota mobile) di atas API Laravel untuk 3 wilayah, dengan enam tes psikometri (CFIT, DISC, Kraepelin, PAPI, RMIB, MSDT) berjalan di browser dengan token-gate dan pipeline rekruter 8 tahap. Hasil: 0 formulir kertas. Live di karir.deabakery.co.id.

**Dashboard Perusahaan Bertenaga AI** *(Mastra, Ollama, Llama 3.2, SvelteKit, MySQL)*
Agen LLM on-premise yang menjawab pertanyaan bisnis berbahasa natural di dashboard internal. Mastra menangani orkestrasi; custom SQL tool membatasi agen hanya pada kueri SELECT read-only di balik safety gate; jawaban di-stream token demi token. Hasil: 0 panggilan API eksternal, token pertama <3 detik, 100% data on-premise, biaya inferensi Rp 0.

---

## PROYEK LAINNYA

- **Outlet — Sistem Operasional Franchise** *(Laravel 11)* — Platform multi-tenant satu deployment dengan isolasi data per-outlet, alur status terpadu lintas modul, dan kolom JSON untuk data berbentuk variabel.
- **Pusdiklat — Manajemen Pusat Pelatihan** *(Laravel 12)* — Satu catatan per peserta dengan status lulus/gagal berbasis skor, stok inventaris yang dijaga oleh trigger, dan logika presensi di service layer yang didukung DB views.
- **Psikotes — Platform Asesmen Psikometri** *(Laravel 12, Chart.js)* — Mengkodekan algoritma penilaian nyata untuk 7 instrumen (metrik Kraepelin, matriks MSDT, 19 dimensi PAPI, RMIB, CFIT) — laporan instan vs. berhari-hari penilaian manual. Live di psikotes.deabakery.co.id.
- **Personal Account — Aplikasi Klien HRIS** *(Flutter, Laravel, MySQL)* — Layanan mandiri mobile untuk seluruh 1.000+ karyawan dengan geofencing GPS yang divalidasi di sisi API. Tersedia di Google Play.
- **Microservice Bot WhatsApp & Telegram** *(Laravel, WhatsApp/Telegram API)* — Bot yang dapat di-deploy independen di atas shared business service dengan dispatch webhook queue-first. 80% lebih sedikit penanganan pesan manual.
- **Sistem Internal Koperasi Kosada** *(Laravel, Node.js, Baileys)* — Sistem koperasi dengan socket Node persisten dan notifikasi WhatsApp ter-queue dengan retry exponential-backoff.
- **Sistem KPI — Perum Jasa Tirta I** *(CodeIgniter 3)* — Sistem pelacakan KPI internal.
- **Bank Daus — Sistem Internal PLN** *(Web Full-Stack)* — Sistem web operasional internal.

---

## PENDIDIKAN

**Bachelor of Engineering, Computer Software Engineering (Beasiswa)**
Universiti Tun Hussein Onn Malaysia (UTHM) — 2020
- IPK: 3,58
- Penghargaan Best Proceedings Article (UTHM)

---

## SERTIFIKASI

- Belajar Dasar-Dasar DevOps — Dicoding Indonesia (2024)
- Belajar Prinsip Pemrograman SOLID — Dicoding Indonesia (2024)
- Belajar Membuat Front-End Web untuk Pemula — Dicoding Indonesia (2024)
- Cloud Practitioner Essentials (AWS Cloud) — Dicoding Indonesia (2024)
- Belajar Membuat Aplikasi Back-End untuk Pemula — Dicoding Indonesia (2024)
- Belajar Dasar Pemrograman JavaScript — Dicoding Indonesia (2024)
- Belajar Membuat Aplikasi Flutter untuk Pemula — Dicoding Indonesia (2023)
- Memulai Pemrograman dengan Dart — Dicoding Indonesia (2023)
- Data Analysis Bootcamp — MySkill (2022)
- Oracle SQL Programming Certificate — Oracle (2018)
- Quantum Learning for Manager — Wealth Institute (2021)

**Penghargaan Akademik:** National University Debate Championship (NUDC 2019) — Finalis Provinsi; Juara 3 Technical Support — Lomba Kompetensi Siswa (Malang).

---

## VOLUNTEER & KETERLIBATAN KOMUNITAS

- **Super Mentor — Dealls (Jobs & Mentoring, YC W22)** *(Agu 2024 – Sekarang)* — Mentor sukarela 1-on-1 yang memberi bimbingan karier dan teknis bagi generasi muda dan profesional Indonesia.
- **Koordinator Al-Qur'an — Dea Bakery** *(Sep 2022 – Sekarang)* — Mengajar tilawah Al-Qur'an kepada karyawan dan membangun sistem Google Sheets untuk melacak progres harian.
- **Qori Tampil — Dea Bakery** *(2024, 2025)* — Terpilih sebagai Qori untuk membaca Al-Qur'an pada acara perusahaan di Grand Mercure Hotel, Malang.
- **Pengajar Dasar Studi Al-Qur'an — Pemkab Malang** *(Des 2018 – Jan 2019)* — Membimbing santri di Pondok Pesantren Balesari dalam literasi dasar Al-Qur'an.

---

## BAHASA

Inggris (Fasih) | Indonesia (Asli) | Jawa (Fasih) | Melayu (Percakapan)
