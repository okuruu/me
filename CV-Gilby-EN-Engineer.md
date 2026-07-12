# GILBY DHILEGA YODIAZ
## Senior Full-Stack Software Engineer

Malang, East Java, Indonesia | +62 898-4170-335 | gilbydhilegayodiaz@gmail.com
LinkedIn: linkedin.com/in/gilbydhilega | GitHub: github.com/okuruu

---

## PROFESSIONAL SUMMARY

Senior Full-Stack Software Engineer with 5+ years building production web, desktop, mobile, and AI systems end to end — software that keeps a 55+ location retail business running every day. Ship across TypeScript, PHP, Python, Rust, and Dart — SvelteKit, Laravel, Flutter, and Tauri on the surface; MySQL, PostgreSQL, and Elasticsearch underneath. Specialize in offline-first architecture, systems integration, and on-premise AI: a tiny ~8MB native POS that never loses a sale to a network drop, a legacy-POS bridge with cryptographically signed IDs, and a local-LLM analytics agent that costs nothing to run. 10+ systems in production, used daily by 1,000+ people across 55+ locations.

---

## CORE COMPETENCIES

Full-Stack Web / Desktop / Mobile | Offline-First & Resilient Systems | REST API Design & Integration | Software Architecture | Database Design & Optimization | Message Queues & Async Processing | AI / LLM Integration | Performance Optimization | Linux Server & DevOps | Technical Leadership

---

## TECHNICAL SKILLS

- **Languages:** TypeScript, PHP, Rust, Python, Dart, SQL, Java
- **Frameworks:** SvelteKit, Laravel, Flutter, Tauri, Node.js, Bun, CodeIgniter, Rocket, Mastra, Bootstrap, DaisyUI
- **Databases:** MySQL, PostgreSQL, SQLite, Elasticsearch, Supabase, Firestore
- **APIs & Async:** REST APIs, Laravel Sanctum, Laravel Queues, webhooks, microservices
- **AI / Automation:** Ollama, Mastra, Llama 3.2, WhatsApp/Telegram APIs, Baileys
- **Tools:** Git, Docker, Figma, Jira, Pandas, Looker Studio, Grafana, Android Studio
- **Environment:** Linux server administration (CentOS, Debian, Ubuntu, Mint, CachyOS)

---

## PROFESSIONAL EXPERIENCE

### Head of IT Development / Lead Engineer — Dea Bakery
*Malang, Indonesia | Jan 2023 – Present*

- Architected and shipped 10+ production systems (POS/ERP, HRIS, multi-department operations, recruitment, AI) used daily by 1,000+ employees across 55+ outlets; lead a 6-person team (2 full-stack, 1 backend, 1 mobile, 1 UI/UX designer, 1 IT admin support) plus up to 3 interns.
- Built **Chocoa**, an offline-first Tauri + SvelteKit POS over a Laravel/Elasticsearch back office with an on-register resilience pod (UUIDv7 idempotency) — zero sales lost to outages, ~8MB binary vs 80–150MB Electron, Rp 170B+ processed.
- Designed a desktop **HRIS** (Tauri/SvelteKit/Laravel) consolidating payroll, leave, BPJS, and benefits for all 1,000+ employees, with scheduled policy automation and Google Sheets API sync.
- Built a Laravel **membership API** bridging a legacy POS read-only, with BCA Virtual Account + QRIS payments and HMAC-SHA256–signed public IDs so forged or iterated IDs fail at the API boundary.
- Integrated an **on-premise LLM agent** (Llama 3.2 via Ollama + Mastra) constrained to read-only SELECT queries behind a safety gate, with streaming responses — <3s first-token latency, 100% on-premise.
- Tuned production VPS queries to sub-20ms typical response across systems; handle 5M+ records in live data pipelines.

### Web Developer — Dea Bakery
*Malang, Indonesia | Feb 2021 – Dec 2022*

- Built recruitment, psychometric assessment (8 instruments), and training-center platforms from scratch with Laravel and SvelteKit.
- Migrated legacy Excel and Google Sheets data into MySQL with full integrity.
- Integrated WhatsApp/Telegram bots and automated reporting pipelines into Looker Studio and Grafana; built sales programs generating USD $2.8M.

### Founder & Lead Developer — okuruu labworks!
*Malang, Indonesia | Sep 2016 – Present*

- Founded and lead a 13-person studio delivering mobile and custom software, UI/UX, and brand identity work.

### Private Tutor — Self-employed
*Oct 2021 – Present*

- Mentor developers in full-stack web and mobile development (Laravel, SvelteKit).

### Software Engineer Intern — Perum Jasa Tirta I
*Sep 2019 – Mar 2020*

- Built a KPI tracking system with CodeIgniter 3; supported Proxmox Linux server setup and SAP ERP deployment.

---

## SELECTED PROJECTS

**Chocoa — POS & Retail ERP** *(Tauri, SvelteKit, TypeScript, Laravel, MySQL, Elasticsearch)*
Offline-first desktop POS over a Laravel/Elasticsearch back office, one source of truth for 55+ outlets. A per-register resilience pod bound to 127.0.0.1 keeps the line transacting through server outages and drains its queue in order on reconnect; UUIDv7 keys make retries idempotent — no double charges. Stock-card ledger makes every discrepancy traceable. Result: 0 sales lost to network drops, 2× faster cash close.

**HRIS — HR Management Platform** *(Tauri, SvelteKit, Svelte 5, TypeScript, Laravel, MySQL)*
Native ~8MB desktop client (vs 80–150MB Electron) over a Laravel back office unifying payroll, leave, BPJS, benefits, discipline, and recruitment for all 1,000+ employees. Role-based auth, a single API client handling auth/timeouts/i18n errors, scheduled policy jobs, and Google Sheets sync. Result: 10 modules live, 0 standalone spreadsheets.

**Membership — Loyalty & Ordering App** *(Laravel, PHP, MySQL, Sanctum, QRIS + BCA)*
A modern membership layer over a legacy POS that couldn't be modified — reads POS tables, writes only its own schema. Atomic checkout (cart validation, voucher check, order, async WhatsApp notify — all or nothing), BCA VA + QRIS rails, and HMAC-SHA256 on every public ID so enumeration fails at the API boundary. Result: 0 raw integer IDs exposed, 0 counter steps to pay.

**FARS — Multi-Department Operations Platform** *(Laravel 11, PHP 8.2, MySQL, Firebase)*
Modular platform behind one login for HR, finance, procurement approvals, IT, marketing, and general services. Three databases split by purpose (operational / production / analytics) keep reporting queries off the live screens; a Sanctum-secured versioned API lets the HRIS and mobile app read/write the same data. Result: 4-stage auditable approvals, 14+ role levels, 6 departments unified.

**Dea Bakery Careers — Recruitment Platform** *(SvelteKit, TypeScript, Laravel API, MySQL)*
Pre-rendered SvelteKit front end (CDN-fast on mobile data) over a Laravel API across 3 regions, with six psychometric tests (CFIT, DISC, Kraepelin, PAPI, RMIB, MSDT) running token-gated in-browser and an 8-stage recruiter pipeline. Result: 0 paper forms. Live at karir.deabakery.co.id.

**AI-Powered Company Dashboard** *(Mastra, Ollama, Llama 3.2, SvelteKit, MySQL)*
On-premise LLM agent answering plain-language business questions on the internal dashboard. Mastra handles orchestration; a custom SQL tool constrains the agent to read-only SELECT queries behind a safety gate; answers stream token-by-token. Result: 0 external API calls, <3s first token, 100% data on-premise, Rp 0 inference cost.

---

## ADDITIONAL PROJECTS

- **Outlet — Franchise Operations System** *(Laravel 11)* — Multi-tenant single-deployment platform with per-outlet data isolation, a unified status workflow across modules, and JSON columns for variable-shape data.
- **Pusdiklat — Training Center Management** *(Laravel 12)* — One record per trainee with score-driven pass/fail status, trigger-maintained inventory stock, and service-layer attendance logic backed by DB views.
- **Psikotes — Psychometric Assessment Platform** *(Laravel 12, Chart.js)* — Encodes the actual scoring algorithms for 7 instruments (Kraepelin metrics, MSDT matrix, PAPI's 19 dimensions, RMIB, CFIT) — instant reports vs. days of manual scoring. Live at psikotes.deabakery.co.id.
- **Personal Account — HRIS Client App** *(Flutter, Laravel, MySQL)* — Mobile self-service for all 1,000+ employees with API-enforced GPS geofencing on attendance. Published on Google Play.
- **WhatsApp & Telegram Bot Microservices** *(Laravel, WhatsApp/Telegram APIs)* — Independently deployable bots over a shared business service with queue-first webhook dispatch. 80% less manual message handling.
- **Koperasi Kosada Internal System** *(Laravel, Node.js, Baileys)* — Cooperative system with a persistent Node socket and queued WhatsApp notifications with exponential-backoff retry.
- **KPI System — Perum Jasa Tirta I** *(CodeIgniter 3)* — Internal KPI tracking system.
- **Bank Daus — PLN Internal System** *(Full-Stack Web)* — Internal operations web system.

---

## EDUCATION

**Bachelor of Engineering, Computer Software Engineering (Scholarship)**
Universiti Tun Hussein Onn Malaysia (UTHM) — 2020
- GPA: 3.58
- Awarded Best Proceedings Article (UTHM)

---

## CERTIFICATIONS

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

**Academic Honors:** National University Debate Championship (NUDC 2019) — Provincial Finalist; 3rd Place Technical Support — Lomba Kompetensi Siswa (Malang).

---

## VOLUNTEERING & COMMUNITY

- **Super Mentor — Dealls (Jobs & Mentoring, YC W22)** *(Aug 2024 – Present)* — Volunteer 1-on-1 mentor offering career and technical guidance to Indonesia's youth and professionals.
- **Qur'an Coordinator — Dea Bakery** *(Sep 2022 – Present)* — Teach Qur'anic recitation to employees and built a Google Sheets system to track daily progress.
- **Featured Qur'anic Reciter — Dea Bakery** *(2024, 2025)* — Selected as Qori to recite at company events at Grand Mercure Hotel, Malang.
- **Foundational Qur'anic Studies Instructor — Pemkab Malang** *(Dec 2018 – Jan 2019)* — Guided students at Pondok Pesantren Balesari in foundational Qur'anic literacy.

---

## LANGUAGES

English (Fluent) | Indonesian (Native) | Javanese (Fluent) | Melayu (Conversational)
