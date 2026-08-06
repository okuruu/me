# Deploy: UD84 Cancel Invoice

**Date:** 2026-08-06
**What ships:** the ability to void a completed transaction from the panel — returning its goods to stock, taking back the points it granted, removing it from every revenue figure, and recording who did it, when and why.

**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

This is a **separate release** from `2026-08-06-ud84-nota-print-deploy.md` (nota & print + sales management). That one must already be live — this release edits the same `Report.php` and `Penjualan.php` and assumes their earlier changes are present. If the nota release has not gone out yet, deploy it first, or you will silently roll it back.

---

## Read this first

**The order is not optional.** SQL → backend → frontend.

| If you deploy… | What happens |
|---|---|
| SQL first, then backend, then frontend | Correct. Nothing breaks at any point. |
| Backend before the SQL | **Every sale fails.** `postPenjualan` now writes a `POIN` column that does not exist yet, so the whole insert rolls back and the cashier gets a server error on every checkout. |
| Frontend before the backend | The Transaksi page still lists and prints normally, but opening any detail drawer shows a connection error toast and the **Batalkan** button fails, because `/UD84/Daftar-Transaksi/Batal` and `/Riwayat` do not exist yet. Nothing is corrupted; it just does not work. |

The SQL is safe to apply days in advance. All four statements are additive or widening, and the **current** live backend keeps working normally against the new schema — it simply never writes the new columns.

---

## Step 0 — Back up first

1. **Database.** phpMyAdmin → select the database → **Export → Custom** → tick `ud84_penjualan_rekap`, `ud84_penjualan_detail`, `ud84_master_produk`, `ud84_member`, `ud84_logs`, `ud84_pesanan_rekap` → export as SQL. Keep the file. This release writes to the first five; `ud84_pesanan_rekap` is there because of the fifth statement in Step 1.
2. **Backend files.** Download the current copies of what you are about to replace:
   - `app/Http/Controllers/UD84/Report.php`
   - `app/Http/Controllers/UD84/Penjualan.php`
   - `app/Http/Controllers/POS/EMoney.php`
   - `routes/api.php`

---

## Step 1 — Run the SQL in phpMyAdmin

Open phpMyAdmin on cPanel, select the UD84 database (`u1643348_esdelfron`), open the **SQL** tab and run all five statements. The first four are stored in the repo at `database/sql/2026_08_06_add_cancel_invoice.sql` and the fifth at `database/sql/2026_08_06_widen_pesanan_sales.sql`, both with the reasoning inline.

**The fifth statement has nothing to do with cancelling invoices.** It is an unrelated defect found while running this release's tests, included here only because it is the same trip to phpMyAdmin and needs no code change at all. It is called out separately below so that if anything goes wrong you know which statement belongs to which problem.

```sql
ALTER TABLE `ud84_penjualan_rekap`
  ADD COLUMN `STATUS` enum('Aktif','Dibatalkan') NOT NULL DEFAULT 'Aktif' AFTER `UNIQUE`;

ALTER TABLE `ud84_penjualan_rekap`
  ADD COLUMN `POIN` smallint(6) DEFAULT NULL AFTER `MEMBER`;

ALTER TABLE `ud84_penjualan_detail`
  MODIFY COLUMN `KODE` int(11) DEFAULT NULL;

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

-- Unrelated to cancel invoice. See "The fifth statement" below.
ALTER TABLE `ud84_pesanan_rekap`
  MODIFY COLUMN `SALES` int(11) DEFAULT NULL;
```

Then confirm all five landed:

```sql
SHOW COLUMNS FROM `ud84_penjualan_rekap` LIKE 'STATUS';
SHOW COLUMNS FROM `ud84_penjualan_rekap` LIKE 'POIN';
SHOW COLUMNS FROM `ud84_penjualan_detail` LIKE 'KODE';
SHOW TABLES LIKE 'ud84_transaksi_log';
SHOW COLUMNS FROM `ud84_pesanan_rekap` LIKE 'SALES';
```

Expect `enum('Aktif','Dibatalkan')` / `NO` / default `Aktif`; `smallint(6)` / `YES`; `int(11)` / `YES`; one table row; and `int(11)` / `YES`.

**What each one is for:**

- **`STATUS`** — every existing sale becomes `Aktif`, so no report changes until something is actually cancelled.
- **`POIN`** — records how many points a sale granted, so cancelling gives back exactly that. Existing rows stay `NULL`, meaning "granted before this column existed"; cancelling one of those recomputes from `CASH` and says so in the audit note.
- **`KODE` widening** — it holds `ud84_master_produk.ID` but was `smallint(6)`, capped at 32767. Product IDs are around 466 today so it has never been hit, but cancellation now resolves the product by `KODE` to return stock. A truncated ID would silently credit a **different** product.

**The fifth statement — `ud84_pesanan_rekap.SALES`.**

The same kind of defect as the `KODE` widening, in a different table, and it belongs to no release — it is here because it costs nothing to run while you are already in phpMyAdmin.

`SALES` records which salesperson took an order, storing `ud84_sales.ID`. That ID is an `int` that counts upward forever: every salesperson ever created consumes one permanently, and deleting a salesperson does **not** give theirs back. The column holding it was `tinyint` — a ceiling of 127.

There are two salespeople today, so nothing is broken now. The Sales management page that shipped in the previous release is what makes the 128th a question of when rather than if. When that day comes, the database refuses the value outright rather than rounding it down, so **every order placed with that salesperson from the public Pesan Online page would fail** with a server error, and no existing order would be affected or point anywhere new.

Widening the column is the whole fix. No code reads or writes it differently, and there is nothing to verify beyond the `SHOW COLUMNS` above.

> **Never run `php artisan migrate` on this database.** Its `migrations` table holds only the project's original Laravel 9/10-era rows, while `database/migrations/` now contains Laravel 11-style files that are not recorded there. `migrate` would try to create the `users` table, which already exists, and fail. The `.sql` above is the only supported way to apply this. The migration file in the repo exists purely so the schema history is written down; it is never executed.

---

## Step 2 — Upload the backend files

### ⚠️ Do not zip the whole `Marmyadose` folder

Build the zip from the explicit list below. `git archive` takes the files from the committed branch, so nothing uncommitted can leak in.

### Files to include

```
app/Http/Controllers/UD84/Transaksi.php   (NEW — cancel + audit trail)
app/Http/Controllers/UD84/Report.php      (nine read sites now exclude cancelled sales)
app/Http/Controllers/UD84/Penjualan.php   (stores POIN, matches stock by product ID)
app/Http/Controllers/POS/EMoney.php       (see the note below — required)
config/ud84.php                           (NEW — the points-per-rupiah constant)
routes/api.php                            (two new /UD84/Daftar-Transaksi/* routes)
```

> **Why `EMoney.php` is on this list.** The committed `routes/api.php` now includes `POS/Report/Delete-EMoney` and `POS/Report/Update-EMoney`, which point at `deleteTransaction` and `updateTransactionDate` on `POS\EMoney`. Those two methods were added purely by appending to that file — nothing existing in it changed — and no live screen calls the new routes yet. Uploading `routes/api.php` without it would leave two routes pointing at methods the server does not have. Ship them together and the file stays consistent.

Optionally include these for the record — they change nothing at runtime:

```
database/sql/2026_08_06_add_cancel_invoice.sql
database/migrations/2026_08_06_000001_add_cancel_invoice.php
```

Do **not** upload `tests/` — those are development-only and never run on the server.

### How to build the zip

From `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git archive --format=zip --output=../ud84-cancel-backend.zip main \
  app/Http/Controllers/UD84/Transaksi.php \
  app/Http/Controllers/UD84/Report.php \
  app/Http/Controllers/UD84/Penjualan.php \
  app/Http/Controllers/POS/EMoney.php \
  config/ud84.php \
  routes/api.php \
  database/sql/2026_08_06_add_cancel_invoice.sql \
  database/migrations/2026_08_06_000001_add_cancel_invoice.php
```

The zip lands at `D:\Coedes\Production\ud84-cancel-backend.zip` with the correct folder structure inside.

### Upload and extract

1. cPanel → **File Manager** → the Laravel project root (the folder containing `app`, `routes`, `artisan`).
2. **Upload** `ud84-cancel-backend.zip`.
3. Right-click → **Extract** into that same folder. Confirm overwrite when asked.
4. Delete the zip from the server afterwards.
5. **Clear the caches. Both `route:clear` and `config:clear` are mandatory this time.**

   This release adds two routes **and** a new config file. Laravel serves routes from `bootstrap/cache/routes-v7.php` and config from `bootstrap/cache/config.php` when those files exist. Skip the clear and:
   - the **Batalkan** button returns 404 with no explanation on screen, and
   - `config('ud84.poin_per_rupiah')` reads as null, so a cancellation silently deducts **zero points**.

   The route cache has already cost one full round of confused debugging on this project. It is not hypothetical.

   If cPanel has **Terminal**, run from the project root:
   ```
   php artisan route:clear
   php artisan config:clear
   php artisan cache:clear
   ```

   If there is no Terminal, delete the contents of `bootstrap/cache/` **except** `.gitignore`. Do not delete the folder itself. Laravel rebuilds them on the next request.

---

## Step 3 — Deploy the frontend

The frontend is on Vercel and deploys automatically.

**Before you push, confirm one line.** Open `src/library/resources/phraseBox.ts` and check the first line reads:

```ts
const isProduction: boolean = true;
```

It was flipped to `false` during local testing and restored afterwards — check it anyway. If `false` ever ships, the live POS points at `http://localhost` and nothing works at all.

Then:

```bash
cd "D:/Coedes/Production/me"
git checkout main
git merge ud84-cancel-invoice
git push
```

Wait for the Vercel deployment to finish before testing.

**One behaviour change outside the Transaksi page:** the login screen now stores the operator's name in `localStorage.Auth` instead of a bare `true`, so cancellations can record who performed them. Everyone stays logged in across the deploy; sessions opened *before* it simply have no name attached, and any cancellation they make is recorded as **"Tidak diketahui"**. Logging out and back in fixes that for good. Nothing else reads that value.

---

## Step 4 — Verify on production

Cancelling is **not reversible from the UI**. Verify with a **small test sale you make yourself**, never with a customer's.

### 4a. Make a test sale to cancel

On `/ud84/panel/retail`, ring up a small sale — one product, quantity 2, sold as `Set` or `Dus` if you have one, paid in cash. Note the product's current stock from **Master Produk** first.

### 4b. Cancel it

**Transaksi** → find the sale → **Lihat** → scroll to **Pembatalan Transaksi** → **Batalkan Transaksi**.

| Check | What you should see |
|---|---|
| Reason required | Pressing **Ya, Batalkan Transaksi** with the box empty is refused. |
| Success | A toast reads *Transaksi berhasil dibatalkan*, and the drawer heading gains a red **Dibatalkan** badge. |
| Audit trail | **Riwayat Perubahan** appears below, showing your name, the time, your reason, and a system note like *Stok 'X' dikembalikan 12 pcs (16 → 28)*. |
| Name recorded | The operator is your login name, not "Tidak diketahui". If it says the latter, log out and back in — see Step 3. |
| DP form gone | The **Pelunasan DP** field disappears for a cancelled sale. The backend refuses it too. |

### 4c. Check the sale actually reversed

| Where | What you should see |
|---|---|
| **Master Produk** | Stock is back to what it was before the test sale. A `Set`/`Dus` line returns `quantity × isi per set` pieces, not the quantity. |
| **Kartu Stok** for that product | A **new** row with `Batal Transaksi` as the source and the returned amount as `Masuk`. The original sale's row is still there, unchanged — the card is a history, not a corrected ledger. |
| **Member points** (if the sale was under a member's name) | Reduced by what that sale granted. If they have since spent points, the balance stops at zero and the audit note says so rather than going negative. |
| **Transaksi list** | The cancelled sale is **gone** from the list. |
| **Tampilkan Dibatalkan** toggle | Tick it: the sale reappears greyed with a **Dibatalkan** badge and **no Cetak Ulang link** — and the **Total row still excludes it**. That is the important one. A list showing a cancelled row and counting it in the footer would be worse than hiding it. |
| **Analisa** / monthly omzet | The cancelled sale is no longer counted anywhere. |

### 4d. Check a voided nota cannot reprint as a normal one

The Cetak Ulang link is hidden for cancelled sales, but the nota URL still works if someone has it open or bookmarked. Open `/ud84/panel/nota/<UNIQUE>` for the cancelled sale directly: both papers must print a clear **TRANSAKSI DIBATALKAN** banner.

### 4e. Check normal work is untouched

Ring up one ordinary sale and print it. Nothing about a normal transaction changed in this release, but `postPenjualan` was edited — this confirms it.

---

## Rollback

**If the backend misbehaves:** re-upload the original `Report.php`, `Penjualan.php`, `EMoney.php` and `routes/api.php` from Step 0, delete `app/Http/Controllers/UD84/Transaksi.php` and `config/ud84.php`, and clear the caches again (`route:clear` and `config:clear` included).

All five schema changes can stay. `STATUS` defaults to `Aktif`, `POIN` is nullable, the widened `KODE` and `SALES` accept everything they accepted before, and `ud84_transaksi_log` is simply unused by the old code. **Leave them.** Any sale cancelled before the rollback stays marked `Dibatalkan` in the data but will be counted in revenue again by the old code, so note down anything you cancelled in the meantime.

The `SALES` widening in particular has no code attached to it in either direction — rolling the release back does not give you a reason to undo it, and undoing it would reintroduce the ceiling.

**If the frontend misbehaves:** Vercel dashboard → **Deployments** → previous working deployment → **Promote to Production**. Faster than a git revert.

---

## Known limits of this release

Stated plainly so nothing surprises you later.

- **Cancelling is whole-invoice only.** There is no per-item return. Returning part of an order still goes through Logistik → Retur, which adjusts stock without being linked to the invoice.
- **Cancelling does not refund.** `CASH`, `DP`, `TOTAL` and `POTONGAN` are left exactly as they were — money that changed hands is a historical fact. Handing money back is a business action outside this system.
- **Some stock cannot be returned automatically, by design.** A line whose product has since been deleted, or an older line that never recorded its unit (`SATUAN`), is **skipped rather than guessed**. The unit decides whether a line means 2 pieces or 2 × 6 pieces; guessing wrong corrupts stock silently, and by a factor of ten in the common case. When this happens you get a warning toast — **it stays on screen until you dismiss it** — naming every affected item, and the same list is written into the audit trail. **Those items must be adjusted by hand through Logistik.** Expect this on most sales made before 5 August 2026.
- **There is no access gate.** Anyone who can open the panel can cancel a sale. Every cancellation records who, when and why, which is the control that exists in its place.
- **Cancelling cannot be undone from the UI.** Reversing one means editing `ud84_penjualan_rekap.STATUS` back to `Aktif` in phpMyAdmin and correcting stock and points by hand. The audit row stays either way.
- **The point rule is 1 point per Rp 500.000 of cash**, which is what the code has always done. Sub-project 4 changes it to Rp 1.000.000. Both earning and reversal read the same constant in `config/ud84.php`, so they cannot drift apart — but a sale made under the old rule always gives back what it actually gave, because the figure is stored on the sale.

---

## What this release does not include

**Perbaikan Transaksi** — correcting a completed transaction's items — is Stage 3 of this sub-project and is **not** in this release. Cancel-and-re-ring is the way to fix a wrong sale today. Stage 2 (correcting an unverified order) is also still to come.
