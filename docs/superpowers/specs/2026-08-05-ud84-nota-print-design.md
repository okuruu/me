# UD84 Nota & Print — Design

**Date:** 2026-08-05
**Sub-project:** 1 of 4 (Nota & Print)
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Context

`Instruction.md` lists twelve feature requests across five independent subsystems. That scope was decomposed into four sub-projects, each getting its own spec, plan, and implementation cycle:

1. **Nota & Print** — this document
2. Cancel Invoice & Perbaikan Transaksi
3. Sales — harga jual, pengajuan discount, dashboard sales
4. Point system + dashboard

Icon redesign and QRIS merchant registration are design/business deliverables, not covered by any of the four.

This sub-project covers four bullets from the brief:

- QRIS di Nota (placeholder image in the static folder)
- Format Tanda Tangan (tidier, more compact)
- Fleksibilitas Cetak (DL paper and 58mm thermal, two print buttons)
- Munculkan satuan item di nota

Plus one correctness fix found in the code being touched (§4).

### Current state

The nota lives at `me/src/routes/ud84/panel/nota/[id]/+page.svelte` — 191 lines mixing data fetching, layout, and print concerns. It fetches `GET UD84/Get-Invoices/{ID}` and renders a single layout with one `window.print()` button.

There is no print CSS beyond a `.no-print` rule: no `@page`, no page size, no width constraint. Printing produces whatever the browser defaults to.

`ud84_penjualan_detail` has no column for the unit of sale. The POS sends `TIPE` (`'Satuan'` or `'Pieces'`) with every cart line, but `Penjualan::postPenjualan` uses it only for stock arithmetic and never stores it.

### Schema facts

From `ud84_db.sql` (phpMyAdmin export of `u1643348_esdelfron`, MariaDB 10.11 on cPanel):

```sql
ud84_penjualan_detail(
  ID, `UNIQUE`, KODE smallint, NAMA varchar(200), JUMLAH int,
  HARGA_ASLI int, HARGA_TERJUAL int,
  POTONGAN_PERSEN int, POTONGAN_RUPIAH int,
  CREATED_AT, UPDATED_AT
)

ud84_master_produk(
  ID, NAMA, STOK int, TIPE varchar(10), STATUS_JUAL enum,
  DISTRIBUTOR, HARGA_PABRIK, HARGA_JUAL, JUMLAH_PER_ITEM smallint,
  HARGA_PER_ITEM, DESKRIPSI, GAMBAR, CREATED_AT, UPDATED_AT
)
```

`ud84_master_produk.TIPE` is the unit of the whole item (`Set`, `Dus`, `Karton`, `Bal`, `Pieces`, …) and `JUMLAH_PER_ITEM` is how many pieces that unit contains. `STOK` is counted in pieces: selling one `Satuan` deducts `JUMLAH_PER_ITEM` from stock, selling one `Pieces` deducts 1.

The export contains 69 rows in `ud84_penjualan_detail` and 37 in `ud84_penjualan_rekap`. Every existing detail row has `JUMLAH = 1`.

---

## 2. Decisions

| Question | Decision |
|---|---|
| DL paper size | DL envelope, **110×220mm** |
| Thermal layout | **Separate compact layout**, not the DL table scaled down |
| Unit for legacy rows | **Blank / dash.** Store going forward only; never infer |
| Signature format | **Customer signature only, right-aligned**, with city and date line |
| Signature city/date | **"Malang, <transaction date>"** — uses `CREATED_AT`, so reprints keep the original date |
| QRIS placement | **Both papers, always shown**, regardless of payment state |
| QRIS asset | **Generated placeholder**, swapped by replacing the file |
| Price-display fix (§4) | **Included** in this sub-project |
| Schema delivery | **Migration file for version control + matching `.sql` to paste into phpMyAdmin.** `php artisan migrate` is not run on production |

### Rationale on the two that carry risk

**Legacy units render as a dash.** The alternative — inferring the unit by matching `HARGA_ASLI` against the product's current `HARGA_JUAL` or `HARGA_PER_ITEM` — works only while a price is unchanged since the sale. Where a price has moved, it prints a confidently wrong unit on a customer-facing document with no signal that it guessed. A dash is never wrong.

**Signature drops the store-side line.** The current nota has two unlabeled 50-dot placeholders. The replacement keeps only the customer's, which is what "hemat tempat" asks for. If the store ever needs to counter-sign, this has to be revisited — it is a deliberate removal, not an oversight.

---

## 3. Architecture

Split the container from the layouts:

```
me/src/routes/ud84/panel/nota/[id]/+page.svelte      container: fetch, paper toggle, print buttons
me/src/components/content/ud84/nota/NotaDL.svelte     110×220mm layout
me/src/components/content/ud84/nota/NotaThermal.svelte 58mm receipt layout
me/src/components/content/ud84/nota/types.ts          shared Receipt / Detail / Rekap interfaces
```

One fetch, one data shape, two renderers. Each layout is understandable on its own and changing one cannot break the other. This follows the existing `components/content/ud84/analisa/` convention.

The container owns:

- the `UD84/Get-Invoices/{ID}` fetch (unchanged endpoint, extended payload)
- `paper: 'DL' | 'Thermal'` state, defaulting to `'DL'`, persisted to `localStorage` under `ud84-nota-paper` so an operator printing thermal all day does not have to re-select each time
- two print buttons — **Cetak DL** and **Cetak 58mm** — each setting `paper` then calling `window.print()`
- the reactive `@page` rule

`@page` cannot be scoped to a CSS class, so the container injects it:

```svelte
<svelte:head>
  {@html `<style>@page { size: ${pageSize}; margin: ${pageMargin}; }</style>`}
</svelte:head>
```

- DL: `size: 110mm 220mm; margin: 6mm`
- Thermal: `size: 58mm auto; margin: 2mm` — `auto` height for continuous roll

The selected layout renders on screen as well as in print, so the operator sees what they will get. Print buttons carry `.no-print`.

### Print CSS

Applied in both layouts:

- `-webkit-print-color-adjust: exact; print-color-adjust: exact;` so the QRIS image and rules render rather than being dropped as background decoration
- DaisyUI card chrome (`shadow`, `bg-base-100`, card padding) suppressed under `@media print`
- `font-variant-numeric: tabular-nums` on all currency so columns align without depending on a monospace font being installed
- DL base font 9pt, thermal 8pt

---

## 4. Correctness fix: nota prints inconsistent numbers

### The defect

`Penjualan::postPenjualan` stores `HARGA_TERJUAL => $data['TOTAL']`, and the POS computes `TOTAL` as `(unit price − discounts) × quantity` (`retail/+page.svelte:99`). So **`HARGA_TERJUAL` holds the line total, not a unit price.**

`Report::getInvoices` (`Report.php:246-252`) treats it as a unit price:

```php
"HARGA"  => $data->HARGA_TERJUAL,                  // labeled "Harga"; is the line total
"JUMLAH" => $data->HARGA_TERJUAL * $data->JUMLAH,  // line total × qty → double-counts quantity
"total"  => array_sum($totalSum)                   // sums HARGA_TERJUAL → correct
```

Every row in the export has `JUMLAH = 1`, which makes the defect invisible in existing data. At quantity 2 the nota prints:

```
Qty 2 | Harga Rp 38.000 | Jumlah Rp 76.000
                          Total  Rp 38.000
```

A printed customer document that contradicts itself.

### The fix

Derive the unit price from the stored discount columns rather than by division:

```php
"HARGA"  => $data->HARGA_ASLI - $data->POTONGAN_PERSEN - $data->POTONGAN_RUPIAH,
"JUMLAH" => $data->HARGA_TERJUAL,
```

`POTONGAN_PERSEN` stores the **rupiah value** of the percentage discount per unit, not the percentage itself (`retail/+page.svelte:102` writes `doDiscount`, not the raw percent). So `HARGA_ASLI − POTONGAN_PERSEN − POTONGAN_RUPIAH` is exactly the post-discount unit price the POS used, and multiplying it by quantity reproduces `HARGA_TERJUAL` by construction.

Verified against export data:

| Row | HARGA_ASLI | POTONGAN_PERSEN | POTONGAN_RUPIAH | Derived unit | JUMLAH | HARGA_TERJUAL |
|---|---|---|---|---|---|---|
| 66 | 19 000 | 0 | 0 | 19 000 | 1 | 19 000 ✓ |
| 69 | 518 000 | 0 | 3 000 | 515 000 | 1 | 515 000 ✓ |

Integer subtraction throughout — no rounding artifact, unlike `HARGA_TERJUAL / JUMLAH` which would print `33 × 3 = 99` against a stored total of `100`.

This is display-layer only. No stored data changes, and the footer total (`array_sum` of `HARGA_TERJUAL`) already agrees with this reading.

### Guard

If a legacy row fails `HARGA × JUMLAH == HARGA_TERJUAL`, the line total shown is `HARGA_TERJUAL` regardless. `HARGA_TERJUAL` is what feeds the footer total, so the nota stays internally consistent even if a historical row's discount columns are incoherent.

---

## 5. Backend changes

### 5.1 Schema

```sql
ALTER TABLE `ud84_penjualan_detail`
  ADD COLUMN `SATUAN` varchar(20) DEFAULT NULL AFTER `NAMA`;
```

Nullable with no default, so the 69 existing rows remain valid and render as `-`. `varchar(20)` covers every value in `MasterProduk::getSatuan()` (longest: `Renceng`, `Kantong` — 7 characters) with headroom.

Delivered two ways:

- `Marmyadose/database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php` — committed for version control, with a working `down()`
- `Marmyadose/database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql` — the statement above, pasted into phpMyAdmin against production

The migration file is **not** run on production. `php artisan migrate` has never been run against this database, and doing so now would fire Laravel's three default migrations and collide with the existing `users` table. The file exists so the repo tells the truth about the schema; phpMyAdmin is the deployment path.

**Deploy order matters:** the `ALTER TABLE` must be applied *before* the new backend code ships. `postPenjualan` writes to `SATUAN` and would fail on every sale if the column is absent. `getInvoices` reads it and would 500 on every nota.

### 5.2 `Penjualan::postPenjualan`

Store the unit at sale time, resolving it the same way the stock arithmetic already does:

- `TIPE === 'Pieces'` → `'Pcs'`
- otherwise → the master product's `TIPE` (`Set`, `Dus`, `Karton`, …)

This requires moving the `ud84_master_produk` lookup **above** the `ud84_penjualan_detail` insert. It currently runs after (line 73), because only the stock update needed it.

The lookup is by `NAMA`, matching existing behaviour. Not changed here — switching it to `KODE`/`ID` is a correctness improvement but touches stock arithmetic, which belongs to sub-project 2.

### 5.3 `Report::getInvoices`

- add `SATUAN` to each row of the returned `data[]` array
- apply the price fix from §4

Response shape after the change:

```
data: {
  tanggal, tuan, alamat, point, total,
  data: [ { QUANTITY, NAMA, SATUAN, HARGA, JUMLAH } ],
  rekap: { ...ud84_penjualan_rekap row }
}
```

`SATUAN` is `null` for pre-migration rows; the frontend renders `-`.

No route changes. `GET /UD84/Get-Invoices/{ID}` keeps its signature.

---

## 6. Layouts

### 6.1 DL — 110×220mm

Same information as today, restructured:

- header: `UD84` and WhatsApp admin number
- customer block: Pelanggan, Alamat, Tanggal, Poin
- item table gaining a **Satuan** column: `Qty | Satuan | Nama Barang | Harga | Jumlah`
- totals: Total, Pembayaran Cash, Pembayaran DP
- QRIS block, centred, ~28mm
- signature block, right-aligned

`Harga` is the post-discount unit price and `Jumlah` the line total, per §4.

### 6.2 Thermal — 58mm

58mm at 8pt gives roughly 32 characters. A five-column bordered table is unreadable at that width, so items stack:

```
        UD84
  WA Admin 0858-5500-9169
--------------------------------
Pelanggan : mulya jaya 1
Tanggal   : 05 Agustus 2026
--------------------------------
AJINOMOTO 1 KG
  2 Set x 865.000    1.730.000
PANILI CAP MOBIL
  3 Pcs x  24.000       72.000
--------------------------------
TOTAL              Rp 1.802.000
Tunai              Rp 1.800.000
--------------------------------
        [ QRIS ]
--------------------------------
    Malang, 05 Agustus 2026
           Penerima,


    (__________________)
```

Item name on its own line (long product names are common — `SAOS LOMBOK BAHAGIA 620 ML` is 26 characters), then quantity, unit, unit price, and line total on the next. Where `SATUAN` is null the unit is omitted rather than showing a dash inline: `2 x 865.000`.

Alamat and Poin are dropped from thermal — the roll is for over-the-counter receipts where the address is not needed, and vertical space is the constraint being optimised.

DP line is shown only when non-zero, matching receipt convention.

### 6.3 Signature block

Both papers:

```
        Malang, 05 Agustus 2026
        Penerima,


        (__________________)
```

Right-aligned on DL, centred on thermal. Date from `rekap.CREATED_AT` formatted `d F Y` in Indonesian, so a reprint months later still shows the transaction date.

---

## 7. QRIS asset

`me/static/images/qris.png` — 600×600 PNG generated with PHP GD (confirmed available in the local PHP install).

Content: a QR-like block grid with three position markers, overprinted with **`QRIS PLACEHOLDER`** and **`BUKAN KODE ASLI`** in high-contrast text. It must be impossible to mistake for a scannable code if it reaches production before the real merchant QRIS is issued.

Replacement procedure: overwrite `me/static/images/qris.png` with the real QRIS PNG and redeploy. No code change, no filename change.

The generator is committed at `me/scripts/generate-qris-placeholder.php` so the placeholder can be regenerated. It lives outside `static/` deliberately — anything under `static/` is served verbatim, and a `.php` file there would be published as readable source.

Rendered at ~28mm on DL and ~35mm on thermal. Thermal printers are 1-bit; the placeholder is drawn in pure black on white with no greys so it dithers predictably.

---

## 8. Files changed

**Frontend (`me`)**

| File | Action |
|---|---|
| `src/routes/ud84/panel/nota/[id]/+page.svelte` | rewritten as container |
| `src/components/content/ud84/nota/NotaDL.svelte` | new |
| `src/components/content/ud84/nota/NotaThermal.svelte` | new |
| `src/components/content/ud84/nota/types.ts` | new |
| `static/images/qris.png` | new |
| `scripts/generate-qris-placeholder.php` | new (generator, not served) |

**Backend (`Marmyadose`)**

| File | Action |
|---|---|
| `app/Http/Controllers/UD84/Penjualan.php` | store `SATUAN`; move master lookup above insert |
| `app/Http/Controllers/UD84/Report.php` | `getInvoices` returns `SATUAN`; price fix |
| `database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php` | new |
| `database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql` | new |

`Marmyadose` has unrelated uncommitted work (POS/EMoney, Kosada/Kredit, POS/Transaksi, routes). Only the files above are staged; that work is left untouched. Note that committing the UD84 controllers will also record CRLF→LF normalisation, since the working copies use CRLF and `.gitattributes` normalises on commit.

---

## 9. Verification

Being explicit about what can and cannot be verified.

**No test infrastructure exists.** The frontend has no test runner in `package.json`. `Marmyadose/tests/` contains only Laravel's untouched `ExampleTest` scaffolding. No database is reachable locally — `127.0.0.1:3306` refuses connections and production is on cPanel shared hosting.

**Can be verified:**

- `npm run check` (svelte-check) passes with no new errors
- both layouts render in Chrome print preview at 110×220mm and 58mm with representative invoice data, including a multi-quantity line and a line with both discount types
- legacy rows (null `SATUAN`) render `-` on DL and omit the unit on thermal
- the QRIS placeholder renders legibly at print scale on both papers
- `php -l` passes on both modified controllers

**Cannot be verified before deployment:**

- that `postPenjualan` writes `SATUAN` correctly — requires a live database
- that `getInvoices` returns the new field — same
- actual output from a physical 58mm thermal printer and a DL-loaded printer

The backend changes are verified by reading only. This should be treated as unproven until a sale is made against the real database and its nota inspected on both papers.

**Post-deploy check:** make one test sale with a quantity above 1 and one product sold as `Satuan`, then print its nota on both papers and confirm `Harga × Qty = Jumlah` and the footer total matches `rekap.TOTAL`.

---

## 10. Deferred findings

Found while reading the code, deliberately **not** fixed here.

**`getInvoices` ignores invoice-level `POTONGAN`.** `postPenjualan` stores `ud84_penjualan_rekap.TOTAL = $total - $potongan`, but `getInvoices` returns `total` as the sum of detail line totals — the figure *before* the invoice-level discount. So when `POTONGAN > 0` the nota prints a total higher than what the customer actually owes, with no line explaining the difference.

Every row in the export has `POTONGAN` at 0 or null, so this is currently latent. The fix is small: add a `Potongan` line and show `rekap.TOTAL` as the final amount. It is deferred because it changes what the nota reports as owed, which deserves its own decision rather than riding along with a units change.

**`postPenjualan` matches products by `NAMA`, not ID.** Stock arithmetic and the master lookup both key on the product name. A rename between sale and lookup, or two products sharing a name, silently corrupts stock. Belongs to sub-project 2, which already touches stock movement.

**`postPenjualan` has no guard on unrecognised `TIPE`.** If a cart line arrives with a `TIPE` that is neither `'Satuan'` nor `'Pieces'`, `$stokDecrease` is never assigned and the request dies inside the transaction. It rolls back cleanly, so it fails safe, but the customer-facing error is a generic 500. Also sub-project 2.

---

## 11. Out of scope

Cancel invoice and retur, perbaikan transaksi, sales dashboard, harga jual visibility for sales, discount pengajuan, point rule change and point dashboard, icon redesign, QRIS merchant registration.
