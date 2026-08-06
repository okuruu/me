# Deploy: UD84 Perbaikan Pesanan

**Date:** 2026-08-06
**What ships:** the ability to correct an unverified order from the panel — its customer name, WhatsApp, salesperson and note, and its item lines: quantities changed, products added, lines removed — saved in one atomic request and recorded in the audit trail with who did it, when, why, and a plain-language list of exactly what changed.

**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

This is Stage 2 of the sub-project. It is a **separate release** from `2026-08-06-ud84-cancel-invoice-deploy.md`, and that one **must already be live** — see the next section. It is not optional or advisory; this release does not work at all without it.

---

## Read this first

### This release adds no SQL. It borrows someone else's table.

There is **no schema change here at all** — nothing to run in phpMyAdmin, no backup of a table you are about to alter. That makes this a short deploy, but it hides the one real dependency:

Every edit writes an audit row into **`ud84_transaksi_log`**, and the new **Riwayat** panel reads from it. That table ships with the **cancel-invoice release**, not this one.

| If the cancel-invoice release is… | What happens here |
|---|---|
| Already live | Correct. Nothing to do. |
| **Not live yet** | **Every edit fails.** The save runs inside a transaction that ends with an insert into a table that does not exist, so the whole edit rolls back and the operator sees *"Perubahan gagal disimpan, tidak ada yang berubah."* Nothing is corrupted — but nothing can be corrected either. |

There is a **second** dependency on the same release, easy to miss because it is not a table. One of the two new routes points at a controller this release does not ship:

```php
Route::post('/UD84/Pesanan/Riwayat', [UD84_Transaksi::class, 'riwayatTransaksi']);
```

`app/Http/Controllers/UD84/Transaksi.php` came with the cancel-invoice release. If it is not on the server, uploading this release's `routes/api.php` leaves a route pointing at a class that does not exist, and the drawer's audit panel errors on every open.

**Check both before you start.** In phpMyAdmin:

```sql
SHOW TABLES LIKE 'ud84_transaksi_log';
```

and in File Manager, confirm `app/Http/Controllers/UD84/Transaksi.php` exists. One table row and one file — then continue. If either is missing, stop and deploy the cancel-invoice release first.

### Deploy order

Backend → frontend. There is no SQL step to get wrong.

| If you deploy… | What happens |
|---|---|
| Backend, then frontend | Correct. |
| Frontend before the backend | The Pesanan page lists and opens orders normally, but **Ubah Pesanan** fails with a connection error toast and the drawer's Riwayat panel stays empty, because `/UD84/Pesanan/Update` and `/UD84/Pesanan/Riwayat` do not exist yet. Nothing is corrupted; the editor just does not work. |
| Backend only, no frontend | Completely harmless. The two new routes sit there unused. Every existing screen behaves exactly as before. |

The backend half is safe to upload days in advance.

---

## Step 0 — Back up first

No database export is needed — this release writes no schema and, until somebody actually edits an order, no data.

**Backend files.** Download the current copies of the two files you are about to replace:

- `app/Http/Controllers/UD84/Pesanan.php`
- `routes/api.php`

That is the whole rollback kit. Keep them until you have finished Step 3.

---

## Step 1 — Upload the backend files

### ⚠️ Do not zip the whole `Marmyadose` folder

Build the zip from the explicit list below. `git archive` takes the files from the committed branch, so nothing uncommitted can leak in.

### Files to include

```
app/Http/Controllers/UD84/Pesanan.php   (updatePesanan + the change-list summariser)
routes/api.php                          (two new /UD84/Pesanan/* routes)
```

That is all. Two files.

> **A note on `routes/api.php` and `POS/EMoney.php`.** The committed `routes/api.php` includes `POS/Report/Delete-EMoney` and `POS/Report/Update-EMoney`, which point at methods on `app/Http/Controllers/POS/EMoney.php`. That is the same dependency the cancel-invoice runbook called out, and it has not changed in this release — nothing here touches either file. Because the cancel release must already be live, `EMoney.php` is already on the server and there is nothing to do. **If you are not certain that release's upload included it**, add `app/Http/Controllers/POS/EMoney.php` to the zip below; re-uploading an identical file costs nothing and a `routes/api.php` without it leaves two routes pointing at methods the server does not have.

Do **not** upload `tests/` — those are development-only and never run on the server. `tests/Feature/UD84/PerbaikanPesananTest.php` is the only other file this release touches.

### How to build the zip

Merge the branch to `main` first, then from `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git checkout main
git merge ud84-perbaikan-pesanan

git archive --format=zip --output=../ud84-perbaikan-pesanan-backend.zip main \
  app/Http/Controllers/UD84/Pesanan.php \
  routes/api.php
```

The zip lands at `D:\Coedes\Production\ud84-perbaikan-pesanan-backend.zip` with the correct folder structure inside.

### Upload and extract

1. cPanel → **File Manager** → the Laravel project root (the folder containing `app`, `routes`, `artisan`).
2. **Upload** `ud84-perbaikan-pesanan-backend.zip`.
3. Right-click → **Extract** into that same folder. Confirm overwrite when asked.
4. Delete the zip from the server afterwards.

### Step 1b — Clear the route cache. This is mandatory.

This release adds **two** routes:

```
POST /UD84/Pesanan/Update     -> Pesanan::updatePesanan
POST /UD84/Pesanan/Riwayat    -> Transaksi::riwayatTransaksi
```

Laravel serves routes from `bootstrap/cache/routes-v7.php` when that file exists. Skip the clear and **both new routes return 404**: pressing **Simpan Perubahan** fails with a connection error, and the Riwayat panel never appears — with nothing in the UI to explain why.

This has already cost this project one full round of confused debugging on the cancel release. It is not hypothetical, and it is the single most likely way for this deploy to appear broken.

If cPanel has **Terminal**, run from the project root:

```
php artisan route:clear
```

If there is no Terminal, delete `bootstrap/cache/routes-v7.php` (or the contents of `bootstrap/cache/` **except** `.gitignore`; do not delete the folder itself). Laravel rebuilds on the next request.

No `config:clear` is needed this time — this release adds no config file.

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
git merge ud84-perbaikan-pesanan
git push
```

Wait for the Vercel deployment to finish before testing.

**One change outside the Pesanan page.** The Transaksi page was refactored in this release: its inline audit-trail markup and its `operatorSaatIni()` helper moved into shared files (`components/shared/RiwayatPanel.svelte`, `library/utils/useAuth.ts`) so the Pesanan page could reuse them. This is a pure extraction — the rendered output and behaviour are identical — but it does mean the Transaksi page's code changed, so give it the quick regression check in Step 3d.

---

## Step 3 — Verify on production

### 3a. Edit a real unverified order

**Pesanan** → set the date range and press the search button (this page loads its list only when you search — it does not fill in on open) → find an order **without** the green *Verified* badge → the blue **Lihat Item** button on the right opens the drawer.

Press **Ubah Pesanan**. The header block turns from text into input boxes.

Make three changes at once, so you can confirm they are saved together:

1. Change **Nama Pelanggan** — add a word to it, so you can undo it afterwards.
2. Change a line's **Jumlah Pesanan** to a different number.
3. Pick a product under **Tambah Produk** and press **Tambah Item**.

Fill in **Alasan (opsional)**, e.g. *"Uji coba rilis, akan dikembalikan"*. Press **Simpan Perubahan**.

| Check | What you should see |
|---|---|
| Success | A toast reads *Pesanan berhasil diperbarui.* |
| The drawer reloads | It leaves edit mode and shows the **new** name, the **new** quantity, and the added product as a second line. |
| One save, not three | All three changes appear together. If only some landed, stop and roll back. |
| **Riwayat Perubahan** | A panel appears below the items showing the badge *Edit Pesanan*, **your login name**, the timestamp, your *Alasan*, and a change list. |
| The change list is specific | It names each change in plain Indonesian, e.g.<br>`Nama pelanggan: 'Budi' -> 'Budi Santoso'`<br>`Jumlah 'TEH CAP BANDULAN': 3 -> 5`<br>`Item 'ABC KCP ASIN 131 ML' ditambahkan (1)` |
| Name recorded | The operator is your login name, not **"Tidak diketahui"**. If it says the latter, log out and back in — sessions opened before the cancel release stored a bare `true` instead of your name. |

Then **put the order back**: press **Ubah Pesanan** again, restore the name and quantity, remove the product you added with its red **Hapus**, give a reason like *"Mengembalikan hasil uji coba"*, and save. The Riwayat will now show two entries. **That is correct and they should be left there** — the audit trail is a history, not a current-state view.

### 3b. Check a verified order offers neither Ubah nor Hapus

Find an order **with** the green *Verified* badge and open its drawer.

| Check | What you should see |
|---|---|
| No editing | There is **no Ubah Pesanan button**. In its place: *"Pesanan ini sudah diverifikasi, jadi tidak bisa diubah atau dihapus lagi. Angkanya sudah masuk ke laporan kinerja sales."* |
| No deleting | In the list, that row's red delete button is gone too — it shows a green **Verified** button instead. |
| History survives | If that order was edited before it was verified, its **Riwayat Perubahan** is still shown. |

The backend refuses both actions independently of the buttons being hidden, so a verified order is safe even from someone calling the API directly.

### 3c. Check the refusals that protect the data

Worth one minute, on an unverified order:

| Try this | Expected refusal |
|---|---|
| Clear **Nama Pelanggan** or **WhatsApp**, save | *Nama dan WhatsApp pelanggan wajib diisi* |
| **Hapus** every line, save | *Pesanan harus punya minimal satu item* |
| Save without changing anything | *Tidak ada perubahan untuk disimpan.* |
| Press **Batal** after making changes | The drawer returns to the values it had before, instantly, with nothing saved. |

Picking a product that is already on the order does **not** create a second line — it adds 1 to the existing one. That is deliberate; two lines for one product is a state the backend refuses (see Known limits).

### 3d. Check the Transaksi page still works

Its audit panel was refactored in this release. Open **Transaksi**, open any cancelled sale's drawer, and confirm the **Riwayat Perubahan** panel still renders its badge, operator, reason and system note exactly as before. Nothing else on that page changed.

### 3e. Check ordinary order-taking is untouched

Place a small order through the public **Pesan Online** page and confirm it arrives in the list. Nothing about `postPesanan` changed in this release, but it lives in the same file that was replaced — this confirms it.

---

## Rollback

**If the backend misbehaves:** re-upload the original `app/Http/Controllers/UD84/Pesanan.php` and `routes/api.php` from Step 0, then **clear the route cache again** (`php artisan route:clear`, or delete `bootstrap/cache/routes-v7.php`).

**There is no data migration to undo.** No schema changed, and no existing column is written differently. The only new data is `ud84_transaksi_log` rows with `AKSI = 'Edit Pesanan'`, and any edits already made stay applied to the orders — the rollback removes the *ability* to edit, not the edits themselves.

**Leave those audit rows.** They are a truthful record of corrections that really happened, the old code ignores them completely, and the cancel-invoice release still reads the same table for its own rows. Deleting them would only destroy history.

**If the frontend misbehaves:** Vercel dashboard → **Deployments** → previous working deployment → **Promote to Production**. Faster than a git revert.

---

## Known limits of this release

Stated plainly so nothing surprises you later.

- **Unverified orders only.** Once an order is verified its numbers are in the sales performance report, so it is frozen — no editing and no deleting. Correcting a verified order means fixing it in phpMyAdmin by hand.
- **Panel only.** The customer cannot change their own order from the Pesan Online page. Corrections go through whoever is on the panel.
- **A line whose product was deleted can only be removed, not corrected.** It shows in red as *"Produk #123 tidak ditemukan"* with no quantity box, because there is no product left to price, count stock for, or name. Removing it and adding the correct product is the whole repair.
- **Deleting an order is still permanent** — but it is now recorded. Deletion writes a `Hapus Pesanan` audit row naming the operator before the rows go, so a deletion can be traced afterwards even though it cannot be undone from the UI.
- **An order with two rows for the same product is refused outright**, with a message telling the operator to contact the admin. This is old data, and the public order form can still produce it: `postPesanan` has never deduplicated its cart. Mapping such an order's lines by product would silently collapse one of the two rows, so the edit refuses rather than guessing which row is real. Fixing one means merging the duplicate rows in phpMyAdmin.
- **A salesperson can be kept but not switched to, once deactivated.** An order that already names a deactivated salesperson keeps them, so history stays intact; *changing* an order to a deactivated one is refused.
- **No access gate.** Anyone who can open the panel can edit an unverified order. Every edit records who, when, why and exactly what changed — that audit trail is the control that exists in its place, and it is the reason the **Alasan** box is worth filling in even though it is optional.
- **Concurrent edits are not locked.** Two people editing the same order in the same few seconds can have one overwrite the other's line changes. Both edits are recorded in Riwayat, so it is visible after the fact. In a single-shop panel this is unlikely enough to accept.
- **Editing an order never touches stock.** Orders are not sales; stock moves when the order is rung up in Retail. Changing a quantity here changes what will be sold, not what is on the shelf.

---

## What this release does not include

**Perbaikan Transaksi** — correcting a *completed* transaction's items — is Stage 3 of this sub-project and is **not** in this release. Cancel-and-re-ring, from the cancel-invoice release, is still the way to fix a wrong sale.
