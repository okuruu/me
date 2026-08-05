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

Plus three correctness fixes found in the code being touched (§4) and one workflow gap (§5.4).

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

ud84_penjualan_rekap(
  ID, `UNIQUE`, NAMA, CASH int, KEMBALIAN int, DP int, POTONGAN int,
  JATUH_TEMPO date, KETERANGAN, TOTAL int, MEMBER,
  CREATED_AT, UPDATED_AT
)

ud84_master_produk(
  ID, NAMA, STOK int, TIPE varchar(10), STATUS_JUAL enum,
  DISTRIBUTOR, HARGA_PABRIK, HARGA_JUAL, JUMLAH_PER_ITEM smallint,
  HARGA_PER_ITEM, DESKRIPSI, GAMBAR, CREATED_AT, UPDATED_AT
)
```

`ud84_master_produk.TIPE` is the unit of the whole item (`Set`, `Dus`, `Karton`, `Bal`, `Pieces`, …) and `JUMLAH_PER_ITEM` is how many pieces that unit contains. `STOK` is counted in pieces: selling one `Satuan` deducts `JUMLAH_PER_ITEM` from stock, selling one `Pieces` deducts 1.

Value semantics that matter for the totals block:

- `penjualan_detail.HARGA_TERJUAL` is the **line total**, not a unit price — `postPenjualan` writes the POS's `TOTAL`, which is `(unit price − discounts) × quantity`
- `penjualan_detail.POTONGAN_PERSEN` holds the **rupiah value** of the percentage discount per unit, not the percentage
- `penjualan_rekap.TOTAL` is already **net** of the invoice-level `POTONGAN` — `postPenjualan` writes `$total - $potongan`
- `penjualan_rekap.KEMBALIAN` is computed as `CASH − (TOTAL − POTONGAN)` and **ignores DP**, so it is wrong whenever DP is used

The export contains 69 rows in `ud84_penjualan_detail` and 37 in `ud84_penjualan_rekap`. Every existing detail row has `JUMLAH = 1`. Detail IDs begin at 66, so most historical `rekap` rows have **no matching detail rows** — reprinting an old nota already yields an empty item table today.

App locale is `id` (`config/app.php:81`, no `APP_LOCALE` override), so Carbon's `translatedFormat('d F Y')` produces `05 Agustus 2026`.

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
| Unit-price display fix (§4.1) | **Included** |
| Invoice-level potongan fix (§4.2) | **Included** |
| Outstanding balance line (§4.3) | **Included** |
| Post-sale print path (§5.4) | **Included** |
| Schema delivery | **Migration file for version control + matching `.sql` to paste into phpMyAdmin.** `php artisan migrate` is not run on production |

### Rationale on the two that carry risk

**Legacy units render as a dash.** The alternative — inferring the unit by matching `HARGA_ASLI` against the product's current `HARGA_JUAL` or `HARGA_PER_ITEM` — works only while a price is unchanged since the sale. Where a price has moved, it prints a confidently wrong unit on a customer-facing document with no signal that it guessed. A dash is never wrong.

**Signature drops the store-side line.** The current nota has two unlabeled 50-dot placeholders. The replacement keeps only the customer's, which is what "hemat tempat" asks for. If the store ever needs to counter-sign, this has to be revisited — it is a deliberate removal, not an oversight.

---

## 3. Architecture

Split the container from the layouts:

```
me/src/routes/ud84/panel/nota/[id]/+page.svelte       container: fetch, paper toggle, print buttons
me/src/components/content/ud84/nota/NotaDL.svelte      110×220mm layout
me/src/components/content/ud84/nota/NotaThermal.svelte 58mm receipt layout
me/src/components/content/ud84/nota/types.ts           shared Receipt / Detail / Ringkasan interfaces
```

One fetch, one data shape, two renderers. Each layout is understandable on its own and changing one cannot break the other. This follows the existing `components/content/ud84/analisa/` convention.

**Money is derived on the server, not in the layouts.** `getInvoices` returns a `ringkasan` block with every figure the totals section prints (§4.3). The layouts only decide which lines to show. This gives one implementation instead of two, makes it testable under PHPUnit against the real database, and removes any chance of DL and thermal disagreeing about what the customer owes.

The container owns:

- the `UD84/Get-Invoices/{ID}` fetch (unchanged endpoint, extended payload)
- `paper: 'DL' | 'Thermal'` state, defaulting to `'DL'`, persisted to `localStorage` under `ud84-nota-paper` so an operator printing thermal all day does not re-select each time
- two print buttons — **Cetak DL** and **Cetak 58mm** — each setting `paper`, then printing
- the `@page` rule injection

The selected layout renders on screen as well as in print, so the operator sees what they will get. Print buttons carry `.no-print`.

### Page size injection

`@page` cannot be scoped to a CSS class, so the container injects it:

```svelte
<svelte:head>
  {@html `<style>@page { size: ${pageSize}; margin: ${pageMargin}; }</style>`}
</svelte:head>
```

- DL: `size: 110mm 220mm; margin: 6mm`
- Thermal: `size: 58mm ${measuredHeight}mm; margin: 2mm`

**Thermal height is measured, not `auto`.** CSS Paged Media grammar for `size` is `auto | <length>{1,2} | <page-size> || [portrait | landscape]` — mixing a length with the `auto` keyword (`size: 58mm auto`) is not valid, and `size: 58mm` alone means a 58×58mm square page, which would slice the receipt into fragments. So before printing thermal, the container measures the rendered receipt node with `getBoundingClientRect().height`, converts px to mm at 96px = 25.4mm, adds 6mm of tail feed, and injects that height. This must happen after the layout has rendered — set `paper`, `await tick()`, measure, inject, then `window.print()`.

### Print CSS

- `-webkit-print-color-adjust: exact; print-color-adjust: exact;` so the QRIS image and rules render rather than being dropped as background decoration
- **`+layout.svelte` chrome must be neutralised.** The `/ud84` layout wraps every page in `.ud84-root` with `min-h-screen bg-base-200` and renders `<Toaster />` outside the slot. Under `@media print`: force the wrapper background to transparent, drop `min-height`, and hide the toaster container — otherwise a stray toast prints onto the nota and the page carries a grey background
- DaisyUI card chrome (`shadow`, `bg-base-100`, card padding) suppressed under `@media print`
- `font-variant-numeric: tabular-nums` on all currency so columns align without depending on a monospace font
- DL base font 9pt, thermal 8pt

### Date handling

All dates come from the backend as pre-formatted strings (`Carbon::translatedFormat('d F Y')` under locale `id`). The frontend does **not** parse `CREATED_AT` with `new Date()`. MySQL's `"2026-08-05 22:54:04"` has no `T` separator and is not reliably parseable across browsers; the backend already formats it correctly, so the frontend just prints the string.

The customer block and the signature line both use the existing `tanggal` field. No new date field is added.

---

## 4. Correctness fixes

Three defects in `Report::getInvoices`, all in the function this sub-project already modifies, all affecting what a customer sees on a printed document.

### 4.1 Quantity is double-counted in the Jumlah column

`getInvoices` (`Report.php:246-252`) treats `HARGA_TERJUAL` as a unit price when it stores the line total:

```php
"HARGA"  => $data->HARGA_TERJUAL,                  // labeled "Harga"; is the line total
"JUMLAH" => $data->HARGA_TERJUAL * $data->JUMLAH,  // line total × qty → double-counts
"total"  => array_sum($totalSum)                   // sums HARGA_TERJUAL → correct
```

Every row in the export has `JUMLAH = 1`, which makes this invisible in existing data. At quantity 2 the nota prints `Qty 2 | Harga Rp 38.000 | Jumlah Rp 76.000` under a footer total of `Rp 38.000` — a printed document contradicting itself.

**Fix** — derive the unit price from the stored discount columns rather than by division:

```php
"HARGA"  => $data->HARGA_ASLI - $data->POTONGAN_PERSEN - $data->POTONGAN_RUPIAH,
"JUMLAH" => $data->HARGA_TERJUAL,
```

Since `POTONGAN_PERSEN` holds the rupiah value of the percentage discount per unit, this reproduces exactly the post-discount unit price the POS used, and multiplying by quantity reproduces `HARGA_TERJUAL` by construction.

Verified against export data:

| Row | HARGA_ASLI | POTONGAN_PERSEN | POTONGAN_RUPIAH | Derived unit | JUMLAH | HARGA_TERJUAL |
|---|---|---|---|---|---|---|
| 66 | 19 000 | 0 | 0 | 19 000 | 1 | 19 000 ✓ |
| 69 | 518 000 | 0 | 3 000 | 515 000 | 1 | 515 000 ✓ |

Integer subtraction throughout — no rounding artifact, unlike `HARGA_TERJUAL / JUMLAH`, which would print `33 × 3 = 99` against a stored total of `100`.

Display-layer only; no stored data changes.

### 4.2 Invoice-level potongan is missing from the nota

`postPenjualan` stores `rekap.TOTAL = $total − $potongan`, but `getInvoices` returns `total` as the sum of detail line totals — the figure **before** the invoice-level discount. When `POTONGAN > 0` the nota prints a total higher than what the customer owes, with nothing explaining the difference.

Latent in current data (every exported row has `POTONGAN` at 0 or null), but wrong the first time a discount is applied.

**Fix** — the totals block adapts to whether a potongan exists:

- `POTONGAN = 0` → one line, **Total** = `rekap.TOTAL`
- `POTONGAN > 0` → three lines, **Total Barang** = sum of line totals, **Potongan** = `rekap.POTONGAN`, **Total Tagihan** = `rekap.TOTAL`

This also repairs historical reprints. Because most old `rekap` rows have no surviving detail rows, the sum of line totals is `0` for them; today's nota therefore prints `Total Rp 0` against a real transaction. Anchoring the headline figure to `rekap.TOTAL` prints `Rp 36.000` instead — correct, where today it is zero.

### 4.3 No outstanding balance shown, and stored KEMBALIAN is unreliable

QRIS on the receipt is there so a customer can settle what they owe. The nota currently never states an outstanding amount, which makes the QRIS block decorative.

Stored `rekap.KEMBALIAN` cannot be used: `postPenjualan` computes it as `CASH − (TOTAL − POTONGAN)`, ignoring `DP` entirely. Export row 27 shows the consequence — `CASH 0, DP 17500, TOTAL 17500, KEMBALIAN −17500`: fully paid via DP, yet the stored change is negative.

**Fix** — `getInvoices` returns a `ringkasan` block carrying every figure the totals section prints:

```php
"ringkasan" => [
    "TOTAL_BARANG"  => $sumOfLineTotals,
    "POTONGAN"      => $rekap->POTONGAN ?? 0,
    "TOTAL_TAGIHAN" => $rekap->TOTAL ?? 0,
    "CASH"          => $rekap->CASH ?? 0,
    "DP"            => $rekap->DP ?? 0,
    "SISA"          => max(0, $totalTagihan - ($cash + $dp)),
    "KEMBALIAN"     => max(0, ($cash + $dp) - $totalTagihan),
]
```

`SISA` renders as "Sisa Tagihan" and `KEMBALIAN` as "Kembalian"; each is suppressed when zero, so a transaction that balances exactly shows neither. Stored `rekap.KEMBALIAN` is ignored and left untouched — repairing the write path is sub-project 2.

Resulting totals block, potongan case:

```
Total Barang            Rp 1.802.000
Potongan              − Rp    50.000
─────────────────────────────────────
Total Tagihan           Rp 1.752.000
Pembayaran Cash         Rp 1.600.000
Pembayaran DP           Rp   100.000
─────────────────────────────────────
Sisa Tagihan            Rp    52.000
```

Cash and DP lines render only when non-zero.

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

**Deploy order matters:** the `ALTER TABLE` must be applied *before* the new backend code ships. `postPenjualan` writes to `SATUAN` and would fail on every sale if the column is absent; `getInvoices` reads it and would error on every nota.

### 5.2 `Penjualan::postPenjualan`

Two changes:

**Store the unit at sale time**, resolving it the same way the stock arithmetic already does:

- `TIPE === 'Pieces'` → `'Pcs'`
- otherwise → the master product's `TIPE` (`Set`, `Dus`, `Karton`, …)

This requires moving the `ud84_master_produk` lookup **above** the `ud84_penjualan_detail` insert. It currently runs after (line 73), because only the stock update needed it.

**Return the transaction's `UNIQUE`** in the success response, so the POS can offer to print the nota it just created (§5.4):

```php
'data' => ['UNIQUE' => $uniqueID]
```

Additive — no existing consumer reads `data` from this endpoint.

The product lookup remains keyed by `NAMA`, matching existing behaviour. Switching it to ID is a correctness improvement but touches stock arithmetic, which belongs to sub-project 2.

### 5.3 `Report::getInvoices`

- return `SATUAN` on each row of `data[]`
- apply the three fixes in §4
- **guard the not-found case.** `$dataRekap->NAMA` is dereferenced at line 241 without checking that the row exists, so an unknown or mistyped `UNIQUE` produces a 500 and a blank screen. Return `status: "error"` with a clear message instead, and have the container render "Nota tidak ditemukan" rather than an empty nota

Response shape after the change:

```
data: {
  tanggal, tuan, alamat, point,
  total,                                  sum of line totals (kept for compatibility)
  data:      [ { QUANTITY, NAMA, SATUAN, HARGA, JUMLAH } ],
  ringkasan: { TOTAL_BARANG, POTONGAN, TOTAL_TAGIHAN, CASH, DP, SISA, KEMBALIAN },
  rekap:     { ...ud84_penjualan_rekap row }
}
```

`total` is retained unchanged so nothing else reading this endpoint breaks; the nota reads `ringkasan` exclusively.

`SATUAN` is `null` for pre-migration rows; the frontend renders `-` on DL and omits the unit on thermal. No route changes — `GET /UD84/Get-Invoices/{ID}` keeps its signature.

### 5.4 Post-sale print path

**The gap:** `retail/+page.svelte` `doSubmit` currently toasts success and clears the cart. It never navigates to the nota, and `postPenjualan` returns no identifier. To print the sale just made, an operator has to open Transaksi, date-search for it, and click Cetak Ulang. Two print buttons on the nota page therefore only help on reprints — the primary path, printing at the point of sale, does not reach them at all.

**Fix:** with `UNIQUE` now returned (§5.2), the success toast carries a **Cetak Nota** action that opens `/ud84/panel/nota/{UNIQUE}` in a new tab. `window.open`, not `goto`, so the POS stays on the retail screen ready for the next customer.

Requires `doSubmit` to destructure `data` alongside `status` and `message`. Contained: one destructure, one toast action.

---

## 6. Layouts

### 6.1 DL — 110×220mm

- header: `UD84` and WhatsApp admin number
- customer block: Pelanggan, Alamat, Tanggal, Poin
- item table gaining a **Satuan** column: `Qty | Satuan | Nama Barang | Harga | Jumlah`
- totals block per §4.2 and §4.3
- QRIS block, centred, ~28mm
- signature block, right-aligned

`Harga` is the post-discount unit price, `Jumlah` the line total.

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
Sisa Tagihan       Rp     2.000
--------------------------------
        [ QRIS ]
--------------------------------
    Malang, 05 Agustus 2026
           Penerima,


    (__________________)
```

Item name on its own line (long names are common — `SAOS LOMBOK BAHAGIA 620 ML` is 26 characters), then quantity, unit, unit price, and line total on the next. Where `SATUAN` is null the unit is omitted rather than showing a dash inline: `2 x 865.000`.

Alamat and Poin are dropped from thermal — the roll is for over-the-counter receipts, and vertical space is the constraint being optimised. Cash, DP, Sisa Tagihan, and Kembalian lines render only when non-zero.

Item lines use a plain thousands separator, not the `Rp`-prefixed currency format, to save horizontal space. `useFormat.ts` gains a `numberFormatter` (`Intl.NumberFormat('id-ID')`) alongside the existing `rupiahFormatter`; totals keep the `Rp` prefix.

### 6.3 Signature block

Both papers:

```
        Malang, 05 Agustus 2026
        Penerima,


        (__________________)
```

Right-aligned on DL, centred on thermal. Date is the backend-formatted `tanggal` string, so a reprint months later still shows the transaction date.

---

## 7. QRIS asset

`me/static/images/qris.png` — 600×600 PNG generated with PHP GD (confirmed available in the local PHP install).

Content: a QR-like block grid with three position markers, overprinted with **`QRIS PLACEHOLDER`** and **`BUKAN KODE ASLI`** in high-contrast text. It must be impossible to mistake for a scannable code if it reaches production before the real merchant QRIS is issued.

Replacement procedure: overwrite `me/static/images/qris.png` with the real QRIS PNG and redeploy. No code change, no filename change.

The generator is committed at `me/scripts/generate-qris-placeholder.php` so the placeholder can be regenerated. It lives outside `static/` deliberately — anything under `static/` is served verbatim, and a `.php` file there would be published as readable source.

Rendered at ~28mm on DL and ~35mm on thermal. Thermal printers are 1-bit, so the placeholder is drawn in pure black on white with no greys, to dither predictably.

---

## 8. Files changed

**Frontend (`me`)**

| File | Action |
|---|---|
| `src/routes/ud84/panel/nota/[id]/+page.svelte` | rewritten as container |
| `src/components/content/ud84/nota/NotaDL.svelte` | new |
| `src/components/content/ud84/nota/NotaThermal.svelte` | new |
| `src/components/content/ud84/nota/types.ts` | new |
| `src/routes/ud84/+layout.svelte` | print-mode neutralisation of wrapper and toaster |
| `src/routes/ud84/panel/retail/+page.svelte` | Cetak Nota action on the success toast |
| `src/library/utils/useFormat.ts` | add `numberFormatter` |
| `static/images/qris.png` | new |
| `scripts/generate-qris-placeholder.php` | new (generator, not served) |

**Backend (`Marmyadose`)**

| File | Action |
|---|---|
| `app/Http/Controllers/UD84/Penjualan.php` | store `SATUAN`; move master lookup above insert; return `UNIQUE` |
| `app/Http/Controllers/UD84/Report.php` | `getInvoices`: `SATUAN`, three fixes from §4, not-found guard |
| `database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php` | new |
| `database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql` | new |

`Marmyadose` has unrelated uncommitted work (POS/EMoney, Kosada/Kredit, POS/Transaksi, routes). Only the files above are staged; that work is left untouched. Committing the UD84 controllers will also record CRLF→LF normalisation, since the working copies use CRLF and `.gitattributes` normalises on commit.

---

## 9. Verification

A local MySQL instance is available at `127.0.0.1:3306`, database `dao`, carrying the same schema and comparable data (28 `rekap` rows, 56 `detail` rows, 409 products). `.env` already points at it. Laravel 11.45.1, PHPUnit runs.

**Backend — executable tests.** `tests/Feature/UD84/` gains real feature tests hitting the routes over HTTP, each seeding its own fixture rows.

> **Use the `DatabaseTransactions` trait, never `RefreshDatabase`.** `RefreshDatabase` runs `migrate:fresh`, which would drop every `ud84_*` table in the local database — none of them are covered by migrations, so they would not come back. `DatabaseTransactions` wraps each test and rolls back; the controllers' own `DB::beginTransaction()` calls nest as savepoints, which InnoDB handles correctly.

Baseline before starting: `php artisan test` currently reports **1 passed, 1 failed** — `ExampleTest::test_the_application_returns_a_successful_response` fails on `GET /`. Pre-existing and unrelated; it must not be counted as a regression, and it must not be "fixed" as part of this work.

**The defect is live in local data, not hypothetical.** 27 detail rows have quantity above 1. Transaction `64ca60eb59cb1` currently makes the nota print line totals of `Rp 80.000.000` and `Rp 14.375.000` under a footer total of `Rp 1.375.000`. The corrected arithmetic reproduces `unit × qty = HARGA_TERJUAL` exactly on every one of those rows — verified before writing any code. These figures are used directly as test fixtures.

**Frontend — no test runner, and none is being added.** With totals derived server-side there is no pure frontend logic worth a runner; adding vitest to a production repo for zero units of logic is not justified. Frontend verification is:

- `npm run check` (svelte-check) — baseline captured *before* any edit; must not regress
- both layouts in Chrome print preview at 110×220mm and 58mm against real local invoices, covering: a multi-quantity line (`64ca60eb59cb1`), a line with both discount types, `POTONGAN > 0`, `POTONGAN = 0`, an outstanding balance, an overpayment, a DP-only payment, and a legacy row with null `SATUAN`
- thermal measured height yields one continuous page with no blank tail page
- a toast raised immediately before printing does not appear in print preview
- the QRIS placeholder is legible at print scale on both papers

**Still cannot be verified locally:** output from a physical 58mm thermal printer and a DL-loaded printer. Chrome print preview at the right page size is a good proxy for layout but says nothing about how a specific printer feeds, cuts, or dithers.

**Post-deploy check on production:** one sale with quantity above 1, one product sold as `Satuan`, a non-zero `POTONGAN`, and cash below the total. Confirm on both papers that `Harga × Qty = Jumlah` per line, `Total Barang − Potongan = Total Tagihan`, `Total Tagihan = rekap.TOTAL`, and `Sisa Tagihan` matches what is actually owed.

---

## 10. Deferred findings

Found while reading, deliberately **not** fixed here.

**`postPenjualan` matches products by `NAMA`, not ID.** Stock arithmetic and the master lookup both key on the product name. A rename between sale and lookup, or two products sharing a name, silently corrupts stock. Belongs to sub-project 2, which already touches stock movement.

**`postPenjualan` has no guard on unrecognised `TIPE`.** A cart line whose `TIPE` is neither `'Satuan'` nor `'Pieces'` leaves `$stokDecrease` unassigned and kills the request inside the transaction. It rolls back cleanly, so it fails safe, but surfaces as a generic 500. Sub-project 2.

**Stored `rekap.KEMBALIAN` is wrong whenever DP is used.** §4.3 works around it on the read side; repairing the write path and backfilling existing rows is sub-project 2.

**Most historical `rekap` rows have no detail rows.** Detail IDs start at 66 against 37 rekap rows, so reprints of older transactions show an empty item table. §4.2 makes the total correct regardless, but the item list stays empty. Whether that data is recoverable is a question for you, not a code fix.

**`AUTH_KEY` is hardcoded in `me/src/library/hooks/db.ts`** with the comment *"move to .env later"*, and the UD84 API routes carry no authentication middleware. Out of scope for all four sub-projects; raised because it is a production concern.

---

## 11. Out of scope

Cancel invoice and retur, perbaikan transaksi, sales dashboard, harga jual visibility for sales, discount pengajuan, point rule change and point dashboard, icon redesign, QRIS merchant registration.
