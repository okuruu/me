# Deploy: UD84 Perbaikan Transaksi

**Date:** 2026-08-06
**What ships:** the ability to correct a *completed* sale from the panel — its customer name, keterangan, jatuh tempo, cash, DP and potongan, and, on sales that qualify, its item lines: quantities changed, prices and discounts changed, products added, lines removed. Everything saves in one atomic request. Stock, member points and the sale's total are recomputed to match, and the whole thing is recorded in the audit trail with who did it, when, why, and a plain-language list of exactly what changed. A corrected sale's nota then reprints with a **NOTA KOREKSI** mark and the correction date.

**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

This is Stage 3 — the last stage — of the sub-project. It is a **separate release** from `2026-08-06-ud84-cancel-invoice-deploy.md`, and that one **must already be live**. See the next section; it is not advisory.

---

## Read this first

### There is no SQL in this release. None at all.

**Nothing to run in phpMyAdmin. No table to alter, no column to add, no backup of a table you are about to change.**

Saying this early because the previous two releases both had a SQL step, and its absence here reads like a missing instruction. It is not. This release adds no schema of its own — it writes into `ud84_transaksi_log`, `ud84_logs`, `ud84_penjualan_rekap`, `ud84_penjualan_detail` and `ud84_master_produk`, all of which already exist on the server.

That makes this a two-step deploy: upload three backend files, clear the route cache, push the frontend.

### It requires the cancel-invoice release to be live — and, through it, the nota-print release

Not one dependency, three. Two come from **cancel-invoice** and break loudly. The third comes from **nota-print** and breaks silently, and it is the one worth understanding.

The practical deploy sequence does not change: cancel-invoice's own runbook already requires nota-print to be live before it. But it is worth knowing which dependency is there for which reason, because only one of them can be checked by looking at the data.

| # | What is needed | Where it comes from | What happens without it |
|---|---|---|---|
| 1 | Table **`ud84_transaksi_log`** | cancel-invoice SQL | Every correction fails. The save runs inside a transaction ending with an insert into a table that does not exist, so the whole correction rolls back and the operator sees a generic failure. Nothing is corrupted; nothing can be corrected either. Additionally the nota's **NOTA KOREKSI** mark reads this table, so `getInvoices` errors on every reprint. |
| 2 | **`config/ud84.php`** (the points constant) | cancel-invoice | `config('ud84.poin_per_rupiah')` returns null, so recalculating member points on a correction divides by zero or silently grants nothing. Points end up wrong on every correction to a member's sale. |
| 3 | **`postPenjualan` writing `SATUAN`** — the unit of sale — on each sale line | **nota-print**: the `SATUAN` column its SQL adds to `ud84_penjualan_detail`, and the `UD84/Penjualan.php` that fills it in | **No sale rung up before that release will ever qualify for item editing.** The gate has to know how many *pieces* a line represents, and a line sold as a whole `Set`/`Dus` is worth `JUMLAH_PER_ITEM` of them. With no recorded unit that cannot be known, so item editing stays unavailable and only header/money correction ever appears. |

**A note on `KODE`, the other half of the gate.** The gate also requires each line to name the product it sold, but `KODE` is **not** a dependency of any release in this sub-project — `postPenjualan` has written it since March 2025. It is already populated on every sale rung up in the last year and needs no checking. `SATUAN` is the field that is genuinely new.

**Check all three before you start.** In phpMyAdmin:

```sql
SHOW TABLES LIKE 'ud84_transaksi_log';
```

In File Manager, confirm `config/ud84.php` and `app/Http/Controllers/UD84/Transaksi.php` both exist. Then confirm that recently rung-up sales record their unit:

```sql
SELECT `UNIQUE`, KODE, NAMA, SATUAN
FROM ud84_penjualan_detail
ORDER BY ID DESC LIMIT 10;
```

**Read the `SATUAN` column, not `KODE`.** If `SATUAN` is filled in on the most recent rows (`Pcs`, `Set`, `Dus`…), dependency 3 is satisfied. If it is `NULL` on every recent row, the nota-print release's `Penjualan.php` is not on the server — fix that first, or this release's item editor will never turn on.

Do **not** read `KODE` as the signal. It has been populated since March 2025, so it will look healthy whether or not the real prerequisite is live. A pre-flight check that cannot fail is worse than no check at all: it gives false assurance exactly where you are looking for a real one.

### Expect the item editor to be inert at first. This is correct, not a fault.

**Read this paragraph before you test, or the release will look broken.**

Correcting a sale's *items* means recomputing stock, and recomputing stock needs two facts from every line: **which product** it sold (`KODE`) and **in what unit** (`SATUAN` — `Pcs`, or a whole `Set`/`Dus` worth `JUMLAH_PER_ITEM` pieces). A line missing either cannot be recounted without guessing, and guessing is wrong by a factor of ten or more, which would corrupt stock silently. So the system refuses.

`KODE` has been recorded since March 2025, so it is the **unit** that decides this in practice, and only sales rung up **after the nota-print release went live** carry one. Every sale from before it will offer **Perbaiki Transaksi**, and pressing it will give **header and money fields with no item table**, plus a line of yellow text saying which item is missing what — for example *"Item 'ABC KECAP ASIN 620ML' tidak mencatat satuan penjualan, jadi jumlah pcs-nya tidak bisa dipastikan."* (Sales older than March 2025 fail the `KODE` half of the gate instead, and say so in their own words.)

On the local database this was measured: of 29 sales, **exactly one** qualified for item editing — the only one rung up with a unit recorded. Production will look the same on day one and will fill in naturally as new sales are made. Nothing needs to be done to "turn it on"; it turns itself on, one sale at a time.

Header and money correction works on **every** active sale from day one, including old ones. That is not a degraded mode — it is the correct answer for a sale whose items cannot be safely recounted.

### Deploy order

Backend → frontend. There is no SQL step to get wrong.

| If you deploy… | What happens |
|---|---|
| Backend, then frontend | Correct. |
| Frontend before the backend | The Transaksi drawer opens, but the **Perbaikan Transaksi** box behaves as if no sale qualifies (the `KOREKSI` block is missing from the detail response), and pressing **Simpan Perbaikan** fails with a connection error because `/UD84/Daftar-Transaksi/Perbaiki` does not exist. Nothing is corrupted. |
| Backend only, no frontend | Harmless. The new route sits unused; the detail endpoint returns one extra JSON block the old page ignores. Nota reprints gain the **NOTA KOREKSI** flag in their payload, which the old nota components also ignore. |

The backend half is safe to upload days in advance.

---

## Step 0 — Back up first

No database export is needed — this release writes no schema and, until somebody actually corrects a sale, no data.

**Backend files.** Download the current copies of the three files you are about to replace:

- `app/Http/Controllers/UD84/Transaksi.php`
- `app/Http/Controllers/UD84/Report.php`
- `routes/api.php`

That is the whole rollback kit. Keep them until you have finished Step 3.

---

## Step 1 — Upload the backend files

### ⚠️ Do not zip the whole `Marmyadose` folder

Build the zip from the explicit list below. `git archive` takes the files from the committed branch, so nothing uncommitted can leak in.

### Files to include

```
app/Http/Controllers/UD84/Transaksi.php   (perbaikiTransaksi + the item gate, stock and points logic)
app/Http/Controllers/UD84/Report.php      (detailTransaksi returns the gate; getInvoices flags a corrected nota)
routes/api.php                            (one new /UD84/Daftar-Transaksi/Perbaiki route)
```

That is all. Three files.

> **A note on `routes/api.php` and `POS/EMoney.php`.** The committed `routes/api.php` includes `POS/Report/Delete-EMoney` and `POS/Report/Update-EMoney`, which point at methods on `app/Http/Controllers/POS/EMoney.php`. That is the same dependency the cancel-invoice runbook called out, and nothing in this release touches either file. Because the cancel release must already be live, `EMoney.php` is already on the server and there is nothing to do. **If you are not certain that release's upload included it**, add `app/Http/Controllers/POS/EMoney.php` to the zip; re-uploading an identical file costs nothing, and a `routes/api.php` without it leaves two routes pointing at methods the server does not have.

Do **not** upload `tests/` — those are development-only and never run on the server. `tests/Feature/UD84/PerbaikanTransaksiTest.php` is the only other file this release touches.

### How to build the zip

Merge the branch to `main` first, then from `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git checkout main
git merge ud84-perbaikan-transaksi

git archive --format=zip --output=../ud84-perbaikan-transaksi-backend.zip main \
  app/Http/Controllers/UD84/Transaksi.php \
  app/Http/Controllers/UD84/Report.php \
  routes/api.php
```

The zip lands at `D:\Coedes\Production\ud84-perbaikan-transaksi-backend.zip` with the correct folder structure inside.

### Upload and extract

1. cPanel → **File Manager** → the Laravel project root (the folder containing `app`, `routes`, `artisan`).
2. **Upload** `ud84-perbaikan-transaksi-backend.zip`.
3. Right-click → **Extract** into that same folder. Confirm overwrite when asked.
4. Delete the zip from the server afterwards.

### Step 1b — Clear the route cache. This is mandatory.

This release adds **one** route:

```
POST /UD84/Daftar-Transaksi/Perbaiki  ->  Transaksi::perbaikiTransaksi
```

Laravel serves routes from `bootstrap/cache/routes-v7.php` when that file exists. Skip the clear and **that route 404s**: pressing **Simpan Perbaikan** fails with a connection error and nothing in the UI explains why. The rest of the page keeps working, which makes it look like a bug in the save rather than a stale cache.

This has already cost this project one full round of confused debugging on the cancel release. It is not hypothetical, and it is the single most likely way for this deploy to appear broken.

If cPanel has **Terminal**, run from the project root:

```
php artisan route:clear
```

If there is no Terminal, delete `bootstrap/cache/routes-v7.php` (or the contents of `bootstrap/cache/` **except** `.gitignore`; do not delete the folder itself). Laravel rebuilds on the next request.

No `config:clear` is needed — this release adds no config file. It *reads* `config/ud84.php`, which the cancel release already shipped and cached.

---

## Step 2 — Deploy the frontend

The frontend is on Vercel and deploys automatically on push to `main`.

**Before you push, confirm one line.** Open `src/library/resources/phraseBox.ts` and check the first line reads:

```ts
const isProduction: boolean = true;
```

It is flipped to `false` during local testing and restored afterwards — check it anyway. If `false` ever ships, the live panel points at `http://localhost` and nothing works at all.

Then:

```bash
cd "D:/Coedes/Production/me"
git checkout main
git merge ud84-perbaikan-transaksi
git push
```

Wait for the Vercel deployment to finish before testing.

Four frontend files change: the Transaksi page (the editor), the two nota layouts and the nota type. Nothing else on the panel is touched.

---

## Step 3 — Verify on production

### 3a. Correct a small real sale's header and money

**Transaksi** → the list fills in on open for the current month; press the search button if you need a different range → pick a **small, recent, active** sale → **Lihat** opens the drawer.

Scroll to the blue **Perbaikan Transaksi** box and press **Perbaiki Transaksi**.

Change **Nama Pelanggan** — add a word so you can undo it. Fill in **Alasan Perbaikan**, e.g. *"Uji coba rilis, akan dikembalikan"*. Press **Simpan Perbaikan**.

| Check | What you should see |
|---|---|
| Success | A toast reads *Transaksi berhasil diperbaiki.* |
| The drawer reloads | It leaves edit mode; the list row behind it shows the new name. |
| **Riwayat Perubahan** | A panel below shows the badge *Perbaikan*, **your login name**, the timestamp, your *Alasan*, and a change list. |
| The change list is specific | Plain Indonesian, e.g. `Nama pelanggan: 'UMUM' -> 'PELANGGAN KOREKSI'` |
| Name recorded | The operator is your login name, not **"Tidak diketahui"**. If it says the latter, log out and back in — sessions opened before the cancel release stored a bare `true` instead of your name. |

Then **put it back**: press **Perbaiki Transaksi** again, restore the name, give a reason like *"Mengembalikan hasil uji coba"*, and save. Riwayat now shows two entries. **Leave them there** — the audit trail is a history, not a current-state view.

### 3b. Reprint that sale's nota and confirm the correction mark

Open the sale's **Cetak Ulang** (or go to `/ud84/panel/nota/<kode>`).

| Check | What you should see |
|---|---|
| DL paper | A boxed banner at the top: **NOTA KOREKSI — 06 Agustus 2026** (the date of the correction, not of the sale). |
| 58mm paper | Press **Cetak 58mm** — the same banner, wrapped to the narrow width, above the receipt. |
| Both figures | The nota's Total, Tunai and Sisa Tagihan reflect the corrected numbers. |

The mark comes from the audit row, so it appears on **every** reprint from then on, permanently. That is deliberate — a customer holding two notas for one sale should be able to see which one is the correction.

### 3c. Confirm an old sale offers header correction only

Open a sale from **before** the nota-print release — on day one that is every sale but the newest few.

| Check | What you should see |
|---|---|
| Still correctable | **Perbaiki Transaksi** is offered. |
| The reason is shown | Yellow text naming the item and what it is missing, e.g. *"Item 'X' tidak mencatat satuan penjualan…"*, plus *"Untuk transaksi ini hanya data pelanggan dan nominal yang bisa diubah."* |
| No item table | Pressing the button gives Nama Pelanggan, Keterangan, Pembayaran Tunai, DP, Potongan Lain, Alasan — and **no product rows and no Tambah Produk picker**. |

This is the expected state for almost every sale on day one. See "Expect the item editor to be inert at first" above.

### 3d. Once a qualifying sale exists, correct a quantity

After the first sale is rung up on the new POS code, come back and open it. The editor will now show the **item table**.

Raise one line's **Jumlah** by 1, give a reason, save.

| Check | What you should see |
|---|---|
| The drawer reloads | The line shows the new quantity, and Total Transaksi has risen accordingly. |
| The change list names it | `Jumlah 'PRODUK': 2 Pcs -> 3 Pcs`, `Nilai 'PRODUK': Rp … -> Rp …`, `Total: Rp … -> Rp …` |
| **The stock card moved** | Go to **Logistik** → that product's stock card. There is a new row with **ASAL = `Perbaikan Transaksi`**, the piece count in KELUAR (or MASUK if you lowered the quantity), and a `STOK_FINAL` matching the product's current stock. |
| The audit names the stock move too | `Stok 'PRODUK' dikurangi 1 pcs (105 -> 104).` |

Then put the quantity back the same way, and confirm a second `Perbaikan Transaksi` row appears returning the stock. Two stock rows, both correct — the card is a ledger, not a state.

### 3e. Check ordinary selling and cancelling are untouched

Ring up one small real sale through **Retail** and confirm it lands in the list with the right stock movement, then open any cancelled sale and confirm its drawer still says it cannot be corrected. Nothing in `postPenjualan` or `batalTransaksi` changed, but `Transaksi.php` and `Report.php` were both replaced — this confirms it.

---

## Rollback

**If the backend misbehaves:** re-upload the original `app/Http/Controllers/UD84/Transaksi.php`, `app/Http/Controllers/UD84/Report.php` and `routes/api.php` from Step 0, then **clear the route cache again** (`php artisan route:clear`, or delete `bootstrap/cache/routes-v7.php`).

**There is no data migration to undo.** No schema changed and no existing column is written differently.

**Corrections already applied stay applied, and reverting the code does not put them back.** This is the important difference from the previous two releases. A correction is not a flag — it really moved stock, really moved member points, and really rewrote the sale's lines and total. Rolling back removes the *ability* to correct; it does not un-correct anything already corrected. If a correction was wrong, fix it with another correction while the code is still live, or by hand in phpMyAdmin afterwards.

**Leave the audit rows.** `ud84_transaksi_log` rows with `AKSI = 'Perbaikan'` and `ud84_logs` rows with `ASAL = 'Perbaikan Transaksi'` are a truthful record of things that really happened. The old code ignores the former completely and the latter is just another stock-card entry. Deleting them would only destroy history and desynchronise the stock card from `STOK`.

**If the frontend misbehaves:** Vercel dashboard → **Deployments** → previous working deployment → **Promote to Production**. Faster than a git revert.

---

## Known limits of this release

Stated plainly so nothing surprises you later.

- **Item editing is gated, and on day one almost nothing passes the gate.** A sale's lines can only be corrected if every line records both its product (`KODE`, written since March 2025) and its unit (`SATUAN`, written only since the nota-print release). The unit is the binding constraint. Locally that was 1 of 29. This resolves itself as new sales accumulate. Header and money correction is available on every active sale immediately.
- **Stock may go below zero, by design.** Raising a quantity past what is on the shelf is allowed — `postPenjualan` already subtracts without a floor, so refusing here would block a probably-correct fix while leaving the same outcome reachable through the POS. A negative figure is a visible instruction to recount. Every product left negative is named in a warning toast that stays on screen until dismissed.
- **The `KEMBALIAN` column keeps its existing DP defect.** A correction recomputes it exactly as `postPenjualan` writes it — `CASH - TOTAL`, ignoring DP — so a deposit sale's stored `KEMBALIAN` stays wrong in the same way it always was, and will show as a negative number in the list's Kembalian column when the corrected total exceeds the cash paid. This is deliberate: the correction refuses to invent a new inconsistency. **The nota derives its own Sisa Tagihan and does not read that column**, so what the customer is handed is correct.
- **A cancelled sale cannot be corrected.** The drawer says so and the endpoint refuses independently. Cancelling is final; re-ring instead.
- **The line editor changes only what it can price.** A line whose product no longer exists in Master Produk blocks item editing for the whole sale (with the reason shown), because its stock cannot be recounted. Header and money correction still work.
- **No access gate.** Anyone who can open the panel can correct a sale. Every correction records who, when, why and exactly what changed, including every stock and point movement — that audit trail is the control that exists in its place, and it is why **Alasan Perbaikan** is mandatory rather than optional here.
- **Concurrent corrections of different sales touching the same product are safe** — the product row is locked for the duration — but two people correcting the *same* sale within the same few seconds is not something the UI prevents. Both are recorded in Riwayat, so it is visible after the fact.
- **Potongan cannot exceed the goods total**, and no nominal may be negative. Both are refused with a message.

---

## What this completes

This is the last stage of the sub-project. With cancel-invoice, perbaikan-pesanan and this release all live, a wrong sale has three answers: cancel it (stock and points returned, excluded from omzet), correct it (stock and points adjusted, nota reprints marked), or, for an order not yet rung up, edit the pesanan.
