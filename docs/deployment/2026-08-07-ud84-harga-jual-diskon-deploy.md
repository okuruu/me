# Deploy: UD84 Harga Jual & Pengajuan Diskon

**Date:** 2026-08-07
**What ships:** a salesperson taking an order on `/ud84` now sees each product's **selling price**, and can write a **discount request** on any line. Whoever works the order in the panel sees which orders carry a request, and reads it in the item drawer.

**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

---

## Read this first

**One `ALTER TABLE`, and it is additive.** Every existing order line simply has no request. Nothing else about ordering changes.

**No new routes.** `route:clear` is harmless but not required here — the endpoints that changed already existed.

**Granting a discount is still manual, by design.** The system carries the request; the admin reads it, decides, and types the real discount into Retail when ringing the order up. Nothing here prices anything.

---

## Step 0 — Back up first

1. **Database.** phpMyAdmin → select the database → **Export → Custom** → tick `ud84_pesanan_detail` → export as SQL. It is the only table this release changes.
2. **Backend file.** Download the current copy of `app/Http/Controllers/UD84/Pesanan.php`.

---

## Step 1 — Run the SQL in phpMyAdmin

Open phpMyAdmin, select the UD84 database (`u1643348_esdelfron`), open the **SQL** tab, and run:

```sql
ALTER TABLE `ud84_pesanan_detail`
  ADD COLUMN `DISKON` varchar(100) DEFAULT NULL AFTER `JUMLAH`;
```

Confirm it landed:

```sql
SHOW COLUMNS FROM `ud84_pesanan_detail` LIKE 'DISKON';
```

Expect `varchar(100)` / `YES` / default `NULL`.

The same statement, with its reasoning, is in the repo at `database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql`.

> **Never run `php artisan migrate` on this database.** Its `migrations` table holds only the project's original Laravel 9/10-era rows, while `database/migrations/` contains Laravel 11-style files that are not recorded there. `migrate` would try to create the `users` table, which already exists, and fail.

---

## Step 2 — Upload the backend file

```
app/Http/Controllers/UD84/Pesanan.php
```

That is the only backend file this release changes. Optionally include `database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql` for the record — it changes nothing at runtime.

Build the zip from the committed branch so uncommitted work cannot leak in. From `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git archive --format=zip --output=../ud84-diskon-backend.zip main \
  app/Http/Controllers/UD84/Pesanan.php \
  database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql
```

Upload it in cPanel → **File Manager** → the Laravel project root (the folder holding `app`, `routes`, `artisan`), right-click → **Extract**, confirm overwrite, then delete the zip from the server.

**Order matters against the previous releases.** `Pesanan.php` is also changed by the perbaikan-pesanan release. If that one has not gone out yet, deploy it first — uploading its older copy of this file afterwards would remove the discount request handling and the order editor together.

---

## Step 3 — Deploy the frontend

**Before pushing, confirm one line.** `src/library/resources/phraseBox.ts` must read:

```ts
const isProduction: boolean = true;
```

Then:

```bash
cd "D:/Coedes/Production/me"
git checkout main
git merge ud84-harga-jual-diskon
git push
```

---

## Step 4 — Verify on production

### 4a. The salesperson's side

Open `/ud84`, press **Pesan Online**, and enter the sales password.

| Check | What you should see |
|---|---|
| Harga Jual column | A new column in the cart, between the product name and the quantity. |
| A product with a price | Its selling price, formatted as rupiah. |
| A product without one | **"Belum ada harga"**, not "Rp 0" — see the note below. |
| Pengajuan Diskon column | A text box on every row, with a placeholder like `mis. 5% / 5000`. |
| Placing an order | Write something in one box, leave another empty, and submit. It saves as before. |

### 4b. The panel's side

Open `/ud84/panel/pesanan` and search the current date range.

| Check | What you should see |
|---|---|
| Diskon column | New column after Nama. The order you just placed shows **Ada pengajuan**; orders without a request show a dash. |
| The drawer | Open that order's items. **Pengajuan Diskon** shows your text against the right product, and a dash against the line you left empty. |
| Editing the order | Change a quantity through **Ubah Pesanan** and save. The request must still be there afterwards. |

That last check matters most: it is the one thing about this feature that could break silently later.

---

## What to expect afterwards

**Over half the catalogue has no selling price recorded.** On the development database, 207 of 409 products available for ordering have `HARGA_JUAL` of zero or null. Those rows show **"Belum ada harga"** rather than "Rp 0", because a price of zero and a price nobody has entered are different things and a salesperson should not read one as the other. If the shop wants prices visible for those products, they need entering in **Master Produk** — no code change will conjure them.

**Existing orders show no requests**, because none were ever written. That is the column starting empty, not a fault.

**Nothing is calculated from a request.** It is free text: `5%`, `5000`, `samakan harga bulan lalu` are all equally valid, and all equally uncomputed. The admin decides.

---

## Rollback

Re-upload the `Pesanan.php` you saved in Step 0. **The column can stay** — it is nullable, nothing else reads it, and the old code neither writes nor returns it. Requests already written stay in the database and simply stop being displayed.

For the frontend: Vercel dashboard → **Deployments** → the previous working deployment → **Promote to Production**.

---

## Known limits of this release

- **A request has no state.** There is no approved, rejected or pending — the admin reads it and acts. Nothing marks a request as dealt with, so an order keeps showing **Ada pengajuan** after the discount has been given.
- **A request is not attributed to a person.** `/ud84` is behind one shared password with a salesperson picked from a dropdown, so the request belongs to the order and to whichever salesperson that order names — not to whoever actually typed it.
- **Nothing notifies anyone.** The admin sees the request when they look at the order list.
- **100 characters.** Long enough for a sentence; a paragraph will be cut off.
