# Deploy: UD84 Nota & Print

**Date:** 2026-08-06
**What ships:** unit (satuan) on each receipt line, QRIS block, compact signature, DL 110×220mm + 58mm thermal printing, three corrected money figures, and a print button straight from the POS.
**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

---

## Read this first

**The order is not optional.** SQL → backend → frontend.

| If you deploy… | What happens |
|---|---|
| SQL first, then backend, then frontend | Correct. Nothing breaks at any point. |
| Backend before the SQL | **Every sale fails.** `postPenjualan` writes to a column that does not exist yet, so the whole transaction rolls back and the cashier gets a server error on every checkout. |
| Frontend before the backend | **The nota page breaks completely.** It reads a `ringkasan` block the old backend does not send, and throws on both papers. |

The SQL is safe to apply days in advance — the column is nullable and additive, so the **current** backend code keeps working normally against the new schema. If you want to de-risk, apply the SQL now and upload the code later.

---

## Step 0 — Back up first

Both of these, before touching anything.

1. **Database.** In phpMyAdmin, select the database, choose **Export → Custom**, tick the tables `ud84_penjualan_detail`, `ud84_penjualan_rekap`, `ud84_master_produk`, `ud84_member`, and export as SQL. Keep the file.
2. **Backend files.** Download the current copies of the two files you are about to replace, so you can put them back in seconds:
   - `app/Http/Controllers/UD84/Report.php`
   - `app/Http/Controllers/UD84/Penjualan.php`

---

## Step 1 — Run the SQL in phpMyAdmin

Open phpMyAdmin on cPanel, select the UD84 database (`u1643348_esdelfron`), open the **SQL** tab, and run:

```sql
ALTER TABLE `ud84_penjualan_detail`
  ADD COLUMN `SATUAN` varchar(20) DEFAULT NULL AFTER `NAMA`;
```

Then confirm it landed. Run this and check you get one row back saying `varchar(20)` and `YES`:

```sql
SHOW COLUMNS FROM `ud84_penjualan_detail` LIKE 'SATUAN';
```

Every existing row will have `SATUAN` as `NULL`. That is expected and correct — those sales never recorded a unit, and old receipts will print a dash in that column rather than guessing.

> **Never run `php artisan migrate` on this database.** Its `migrations` table holds only the project's original Laravel 9/10-era entries, while `database/migrations/` now contains Laravel 11-style files that are not recorded there. `migrate` would try to create the `users` table, which already exists, and fail. The `.sql` above is the only supported way to apply this change. There is a migration file in the repo purely so the schema history is written down; it is never executed.

---

## Step 2 — Upload the backend files

### ⚠️ Do not zip the whole `Marmyadose` folder

That folder currently contains **unrelated, unfinished work** of yours that is not part of this release and has never been tested:

```
app/DTO/General.php          app/DTO/Responses.php       app/DTO/Test.php
app/Http/Controllers/Authenticate.php
app/Http/Controllers/Clyfar/Result.php
app/Http/Controllers/Kosada/Kredit.php
app/Http/Controllers/POS/EMoney.php
app/Http/Controllers/POS/Master.php
app/Http/Controllers/POS/Penjualan.php
app/Http/Controllers/POS/Transaksi.php
routes/api.php               routes/web.php
app/Models/Kosada/           (whole folder, untracked)
```

Zipping the directory would push all of that live alongside the receipt fix. Build the zip from the explicit list below instead.

### Files to include

Only these two are required:

```
app/Http/Controllers/UD84/Report.php
app/Http/Controllers/UD84/Penjualan.php
```

Optionally include these two for the record — they change nothing at runtime:

```
database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql
database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php
```

Do **not** upload `tests/` — those are development-only and never run on the server.

### How to build the zip

From `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git archive --format=zip --output=../ud84-nota-backend.zip ud84-nota-print \
  app/Http/Controllers/UD84/Report.php \
  app/Http/Controllers/UD84/Penjualan.php \
  database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql \
  database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php
```

`git archive` takes the files from the committed branch, so your uncommitted work-in-progress cannot leak into the zip even by accident. The zip lands at `D:\Coedes\Production\ud84-nota-backend.zip` with the correct folder structure inside.

### Upload and extract

1. cPanel → **File Manager** → navigate to the Laravel project root (the folder containing `app`, `routes`, `artisan`).
2. **Upload** `ud84-nota-backend.zip`.
3. Right-click it → **Extract**, into that same folder. Confirm overwrite when asked.
4. Delete the zip from the server afterwards.
5. Clear Laravel's caches. If cPanel has **Terminal**, run from the project root:
   ```
   php artisan config:clear
   php artisan cache:clear
   ```
   If there is no Terminal, delete the contents of `bootstrap/cache/` **except** `.gitignore`. Do not delete the folder itself.

---

## Step 3 — Deploy the frontend

The frontend is on Vercel and deploys automatically — no zip, no upload.

**Before you push, confirm one line.** Open `src/library/resources/phraseBox.ts` and check the first line reads:

```ts
const isProduction: boolean = true;
```

That flag was temporarily set to `false` during local testing so the app talked to a local server. It has been restored to `true`, but check it anyway — if `false` ever ships, the live POS points at `http://localhost` and nothing works at all.

Then push the branch and let Vercel build:

```bash
cd "D:/Coedes/Production/me"
git checkout main
git merge ud84-nota-print
git push
```

Wait for the Vercel deployment to finish before testing.

---

## Step 4 — Verify on production

Do this with a **real but small test sale** you are willing to have in the books, or one you can correct afterwards.

### 4a. Make a test sale

On `/ud84/panel/retail`, ring up a sale that exercises everything at once:

- **quantity 2 or more** on at least one line — this is the defect that was fixed
- at least one product whose unit is `Set`, `Dus` or `Karton` (not `Pieces`)
- a **cash amount below the total**, so there is money still owed
- optionally a value in **Potongan**

On success you now get a **Cetak Nota** button on the confirmation toast. Click it — the receipt opens in a new tab and the POS stays where it is, ready for the next customer.

### 4b. Check the numbers on screen

| Check | What you should see |
|---|---|
| Satuan column | Shows `Set` (or whatever unit you sold), not a dash. This is the first sale to record a unit. |
| **Harga × Qty = Jumlah** | Must reconcile on every line. **This is the whole point of the release** — before this fix, a quantity of 100 printed a line total 100× too high. |
| Potongan | If you entered one, you see `Total Barang`, `Potongan`, `Total Tagihan` as three lines. If not, a single `Total`. |
| Sisa Tagihan | Equals total minus what was paid. This is what the QRIS is there to collect. |
| QRIS block | Visible, currently the placeholder marked **BUKAN KODE ASLI**. |

### 4c. Print on both papers

Press **Cetak DL**, then **Cetak 58mm**, from the same page without reloading.

- **DL** should come out at 110 × 220 mm with nothing clipped at the right edge — check the **Jumlah** column in particular, it sits closest to the margin.
- **58mm thermal** should be **one continuous strip**, with the signature line and the QRIS block on that same strip. If the signature comes out on a second piece, see *Tuning the thermal length* below.
- Neither should print a grey background, the app navigation, or a floating notification.

### 4d. Check an old receipt still reprints

Go to **Transaksi**, find any sale from before today, and press **Cetak Ulang**. It should print with a dash in the Satuan column and correct totals. Old sales never recorded a unit, so a dash is right — it is not a fault.

---

## Tuning the thermal length

The thermal receipt's page length is calculated from the rendered content, then padded. Two numbers control it, both near the top of:

```
src/routes/ud84/panel/nota/[id]/+page.svelte
```

```ts
const TAIL_FEED_MM = 6;    // blank strip after the signature so the cutter does not shear it
const PRINT_SAFETY = 1.02; // small flat cushion
```

These were measured in Chrome against two receipts (2 and 3 items) and verified single-page there — but **a real thermal printer was not available**, and neither was a long receipt. If on your actual printer:

- the **signature or QRIS is cut off**, or it spills onto a second strip → raise `TAIL_FEED_MM` (try 12, then 18)
- **too much blank paper** feeds after each receipt → lower `TAIL_FEED_MM` (try 4, then 2)

Change one number, push, and print again. Please test with a **long receipt (5+ items)** as well as a short one — the long case is the one that was never measured.

---

## Step 5 — Swap in the real QRIS

Until you do this, every printed receipt carries a placeholder image clearly stamped **BUKAN KODE ASLI**. It is deliberately impossible to mistake for a working code, but it is still on customer receipts — so treat this as urgent once the merchant QRIS is issued.

To swap it:

1. Save the real QRIS as a **PNG**, ideally square and at least 600 × 600.
2. Replace `me/static/images/qris.png` with it, keeping that exact filename.
3. Commit and push. No code change is needed.
4. **Hard-refresh** the nota page (Ctrl+F5) after deploying. The filename never changes, so browsers will otherwise keep showing the cached placeholder. Confirm the new code appears before printing anything for a customer.
5. Scan it with a real phone before handing a receipt to anyone.

If you ever need to regenerate the placeholder, run `php scripts/generate-qris-placeholder.php` from the `me` folder.

---

## Rollback

**If the backend misbehaves:** re-upload the two original `Report.php` and `Penjualan.php` files you saved in Step 0, and clear the caches again. The `SATUAN` column can stay — it is nullable, so the old code ignores it completely. Nothing else needs undoing.

**If the frontend misbehaves:** in the Vercel dashboard, open the project's **Deployments** tab, find the previous working deployment and choose **Promote to Production**. That is faster than a git revert.

**If you truly need the column gone** (you should not):

```sql
ALTER TABLE `ud84_penjualan_detail` DROP COLUMN `SATUAN`;
```

Only do this after rolling the backend back, or every sale will fail.

---

## Known limits of this release

Stated plainly so nothing surprises you later.

- **Old receipts show a dash for Satuan.** The unit was never recorded before today and cannot be recovered reliably — a price may have changed since the sale, which would make any guess wrong on a printed document. A dash is never wrong.
- **Very old receipts show no line items.** Some historical sales no longer have their detail rows in the database. Their totals still print correctly, because those come from the sale summary rather than the lines.
- **No physical printer was tested.** All print verification was done through Chrome at the exact paper sizes. Page geometry is correct; how your specific printer feeds, cuts and dithers is not something that could be checked from here. See *Tuning the thermal length*.
- **`PRINT_SAFETY` rests on two sample receipts.** Both short. A 5+ item receipt is unmeasured.
- **A popup blocker would silence the Cetak Nota button.** It fires from a real click so browsers normally allow it, but if nothing opens, use Transaksi → Cetak Ulang instead.

## Known issues deliberately left alone

Found while working, out of scope for this release, queued for the next one:

- `postPenjualan` matches products by **name, not ID**. Two products sharing a name, or a rename between sale and lookup, would corrupt stock.
- A cart line with an unrecognised unit type would reuse the **previous line's stock adjustment** against the wrong product. The POS only ever sends valid values today, so it cannot currently trigger.
- The stored `KEMBALIAN` column is wrong whenever a deposit was used — it ignores DP entirely. The receipt no longer reads it (it derives the figure correctly instead), but the stored value is still wrong for anything else that reads it.
- Percentage discounts that do not land on a whole rupiah can make a printed line differ by a rupiah or two, because the discount is rounded before storage. Whole-rupiah prices are unaffected.
