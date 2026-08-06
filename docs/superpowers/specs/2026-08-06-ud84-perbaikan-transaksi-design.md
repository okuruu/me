# UD84 Perbaikan Transaksi — Design

**Date:** 2026-08-06
**Sub-project:** 2 of 4, **Stage 3**
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Scope

Sub-project 2 was resolved with the owner into three stages:

| Stage | What | Status |
|---|---|---|
| 1 | Cancel a whole invoice + audit infrastructure | ✅ Merged |
| 2 | Correct an unverified pesanan (order) | ✅ Merged |
| **3** | **Correct a completed transaksi, including line items** | **This document** |

This is what `Instruction.md` asks for in one line — *"Penambahan Perbaikan Transaksi: Koreksi data transaksi cepat dan akurat"* — and it is the highest-risk stage in the project. Stage 2 edited a document that touched neither stock nor money. This edits a sale: goods have left the shop, money has changed hands, points have been granted, and nine report sites already read the result.

Today the only correction available on a completed sale is cancelling it and ringing it up again, which changes the receipt number the customer is holding.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Approach | **Edit in place**, one atomic save, one `UNIQUE` |
| What an edit does to money | **Recomputes `TOTAL`**, and `CASH`/`DP`/`POTONGAN` are correctable in the same save |
| What an edit does to points | **Recomputes and settles the difference**, including moving them when the customer name changes |
| Which sales allow line editing | **Only those where every line resolves and records its unit** — others get header and money only |
| Stock going negative | **Allowed and reported**, not blocked |
| Corrected nota | **Prints the new figures, marked as a correction** |
| Reason | **Required** |
| Cancelled sales | **Not correctable at all** |

**Why edit in place rather than cancel-and-re-ring.** Automating "void it and make a new one" would reuse two already-tested paths and write almost no new financial logic. It also mints a new `UNIQUE`, so the receipt number the customer holds stops matching, the replacement lands in today's revenue rather than the original sale's period unless its date is forged, and correcting one quantity leaves two rows in the books forever. The receipt number is the customer's reference here, so that cost outweighs the machinery saved.

**Why not an adjustment ledger.** Never modifying the sale and deriving its current state by summing corrections is the most truthful model. It also requires every reader — nine report sites, both nota layouts, the list, the analysis view — to sum instead of read. That is a rewrite of code this project has only just stabilised, for a shop that needs a correction screen.

---

## 3. What the data allows, and what that means for the schedule

Established by querying the local database, not assumed.

| Measure | Count |
|---|---|
| Completed sales | 29 |
| Detail lines | 57 |
| Lines with no usable `KODE` | 52 |
| Lines with no `SATUAN` | 56 |
| Lines whose `KODE` resolves to no product | 52 |
| **Sales where every line resolves *and* records its unit** | **1** |

That one sale was rung up during this morning's verification. **No historical sale qualifies for line editing.**

It is worse than "legacy data" implies. `KODE` is not the binding constraint — `postPenjualan` has written it since March 2025 (`c4a57fb`), which is why the 52 lines missing it are simply the ones older than that. The newly-recorded field is **`SATUAN`**, first written by `c877a72` as part of the **nota-print** work, which is **merged but not deployed**. So on the day Stage 3 ships, no sale in production will qualify, and the line editor will do nothing until the nota-print release goes live and new sales accumulate behind it.

This is not a reason to change the gate. Guessing which product a line meant, months later, would attach stock movement to a product chosen from memory — the same silent corruption Stage 1 refused to risk when it declined to guess a missing unit. The feature is built correctly now and becomes useful as qualifying sales accumulate. **The owner should expect the item editor to be inert at first**, and the deployment guide must say so plainly, or its absence will read as a broken release.

---

## 4. What is editable

**Every active sale — header and money:**

`NAMA` (the customer/member), `KETERANGAN`, `JATUH_TEMPO`, `CASH`, `DP`, `POTONGAN`.

Two of those accept emptiness, because the schema already stores it:

- **A blank `NAMA` is stored as `UMUM`**, which is what the list already displays for a sale with no customer, and what `postPenjualan` writes. `UMUM` is not a member, so a sale corrected to it grants no points and gives back whatever it had granted.
- **A blank `JATUH_TEMPO` clears the due date** rather than being refused. The column is nullable and most sales have no due date at all.

**Sales that qualify — the lines as well:**

Per line: the product, the unit, `JUMLAH`, `HARGA_ASLI`, `POTONGAN_PERSEN`, `POTONGAN_RUPIAH`. Lines may be added and removed.

**A sale qualifies when every stored line** has a `KODE` resolving to a live `ud84_master_produk` row **and** a non-empty `SATUAN`. A sale that does not qualify shows its lines read-only, naming the first line that blocks it and the reason.

**A cancelled sale is correctable by nothing.** It is void; `STATUS` records that, and every report already excludes it.

### 4.1 Two figures are always derived, never typed

```
HARGA_TERJUAL = (HARGA_ASLI - POTONGAN_PERSEN - POTONGAN_RUPIAH) × JUMLAH
TOTAL         = sum(HARGA_TERJUAL) - POTONGAN
```

Verified against stored data: `TOTAL` reconciles with its lines on every sale checked.

This is deliberate. Sub-project 1's headline defect was a printed line where price × quantity did not equal the line total. A screen that let someone type the total back in by hand would reintroduce exactly that, and no test would catch it because both numbers would be "what the operator entered".

`KEMBALIAN` is recomputed as `CASH - TOTAL`, which is what `postPenjualan` writes at sale time. That stored figure is already wrong whenever a deposit was used — it ignores `DP` — and the nota derives its own rather than reading it. Recomputing it the same way keeps a correction from introducing a *new* inconsistency; fixing the underlying one is out of scope here.

### 4.2 A line's unit is a choice, because it sets the stock multiplier

`postPenjualan` stores `'Pcs'` when a line was sold loose, and the product's `TIPE` otherwise. The editor offers exactly those two for each line — `Pcs`, or that product's own unit.

Pieces returned to or taken from stock are `JUMLAH` when the unit is `'Pcs'`, and `JUMLAH × JUMLAH_PER_ITEM` otherwise. Getting this wrong is wrong by a factor commonly of ten, which is why the unit is chosen explicitly rather than inferred.

---

## 5. Behaviour

### 5.1 Endpoint

`POST /UD84/Daftar-Transaksi/Perbaiki` → `Transaksi::perbaikiTransaksi`

```
KODE        the sale's UNIQUE
NAMA, KETERANGAN, JATUH_TEMPO
CASH, DP, POTONGAN
ITEMS       omitted entirely for a header-only correction; otherwise every line
            the sale should end up with:
              ID                 the ud84_penjualan_detail row, or absent for a new line
              KODE_ITEM          ud84_master_produk.ID
              SATUAN             'Pcs' or the product's TIPE
              JUMLAH
              HARGA_ASLI, POTONGAN_PERSEN, POTONGAN_RUPIAH
OPERATOR    from localStorage Auth
ALASAN      required
```

All work runs in one `DB::transaction`. Any failure rolls back stock, points, lines and header together — a half-corrected sale is worse than a failed correction.

### 5.2 Lines are identified by row ID

Reconciliation matches on `ud84_penjualan_detail.ID`: an entry with a known `ID` updates that row, an entry without one is inserted, and a stored row absent from the payload is deleted.

**Not by product.** Two lines of the same product are legitimate — five at full price and two discounted is something the POS produces — and a map keyed by product would collapse them. Stage 2 hit exactly that defect and had to refuse the situation outright; identifying by row makes it a non-issue here.

`CREATED_AT` on a surviving line is never touched, for the same reason it is not touched in Stage 2: it is the date the line reports under.

### 5.3 Stock nets per product before anything is written

For each product, sum the pieces across all stored lines and across all payload lines. The difference is applied once per product:

| Difference | Meaning | Written |
|---|---|---|
| more pieces now | more goods left the shop | `STOK` decreases; `ud84_logs` row with `KELUAR` = the difference |
| fewer pieces now | goods came back | `STOK` increases; `ud84_logs` row with `MASUK` = the difference |
| zero | nothing to do | nothing |

`ASAL = 'Perbaikan Transaksi'`, with the resulting `STOK_FINAL`. The sale's original log rows are never edited or deleted — the stock card reads as a history.

Netting before writing is what makes a product moving between lines safe: changing a line from X to Y is a return to X and a withdrawal from Y in the same transaction, and two lines of one product cannot fight each other.

**Stock may go negative.** `postPenjualan` already subtracts without a floor, so a sale can drive stock negative today; refusing here would block a correction that is probably right while leaving the same outcome reachable through the POS. A negative figure is a visible instruction to recount, and the API returns every product whose stock ended below zero so the UI can say so.

### 5.4 Points recompute and settle the difference

New points are `floor(CASH / config('ud84.poin_per_rupiah'))` — the same constant earning and cancellation share, so the three cannot drift apart.

| Case | What happens |
|---|---|
| Same member | Balance moves by `new − stored`, not by the whole amount |
| Customer name changed | The old member gives back the sale's stored points; the new member receives the new points |
| Member not found | Nothing moves, and `CATATAN_SISTEM` says which name could not be found |
| Deduction exceeds balance | Floors at zero, and records that the full amount could not be taken |

The sale's `POIN` is updated to the new figure, so it keeps meaning "what this sale granted".

### 5.5 Refusals

All return `status: "error"` at HTTP 200, matching the house style.

| Case | Why |
|---|---|
| Sale not found | — |
| Sale is `Dibatalkan` | A void sale is corrected by nothing |
| `ITEMS` sent for a sale that does not qualify | §3 — the reason names the blocking line |
| `ITEMS` present but empty | A sale with no lines is a cancellation, which has its own button and its own audit action |
| A line `ID` that does not belong to this sale | Refuse rather than silently ignore |
| Unknown product, or a unit that is neither `Pcs` nor that product's `TIPE` | The multiplier would be a guess |
| `JUMLAH` ≤ 0 | Removing a line is done by removing it |
| `CASH`, `DP`, `POTONGAN`, `HARGA_ASLI` or either discount below zero | — |
| `POTONGAN` greater than the sum of the lines | It would make `TOTAL` negative |
| Blank `ALASAN` | A correction with no stated reason leaves the next person guessing |
| Nothing changed | An audit trail full of empty entries is worse than no entry |

Stock ending below zero is **not** a refusal. It is reported.

### 5.6 Audit

One row in `ud84_transaksi_log`: `AKSI = 'Perbaikan'`, the sale's `UNIQUE`, the operator, the reason, before/after JSON of the rekap row and its lines, and a plain-language change list:

```
Nama pelanggan: 'BU EKO' -> 'BU EKA'
Jumlah 'MTHR KCP INGGRS 135ML': 2 -> 3
Item 'SARIWANGI TEH 25S' ditambahkan (1 Pcs)
Stok 'MTHR KCP INGGRS 135ML' dikurangi 6 pcs (28 -> 22)
Total: Rp 100.000 -> Rp 150.000
Poin 'BU EKA' ditambah 1
```

The stock movements and the point settlement are in that list because they are the parts nobody can reconstruct from the two snapshots alone.

---

## 6. The nota

`getInvoices` reports a sale as corrected when a `Perbaikan` row exists for it, along with the latest such timestamp. Both papers print that where the `DIBATALKAN` banner sits — the new figures, marked as a correction with the date.

Two receipts for one sale showing different totals, with nothing on either explaining why, is how a dispute starts. A cancelled sale keeps printing its `DIBATALKAN` banner; the two marks are independent.

---

## 7. No schema

Stage 3 adds **no columns and no tables**. Stock adjustments go to `ud84_logs`, the audit to `ud84_transaksi_log`, and the nota derives the correction mark from that audit row rather than from a new flag. Nothing to run in phpMyAdmin.

It does depend on the cancel-invoice release being live — for `ud84_transaksi_log`, for `config/ud84.php`, and for `postPenjualan` writing `KODE` at all, without which no sale will ever qualify for line editing.

---

## 8. Frontend

**`transaksi/+page.svelte`**, in the drawer that already carries the cancel section and the audit panel:

- a **Perbaiki Transaksi** action beside **Batalkan Transaksi**, on active sales only
- edit mode: header and money fields, and either the line editor or the read-only line table with the reason it is locked
- each editable line: product, unit (`Pcs` or the product's own), quantity, unit price and the two discounts, with the line total shown but not editable
- add and remove lines; a running `TOTAL` that updates as figures change, so the operator sees the number before saving it
- a required reason
- after a save, any product left with negative stock is surfaced as a toast the operator must dismiss, naming them — the same treatment Stage 1 gives stock it could not return

It reuses `RiwayatPanel`, `operatorSaatIni` and the `Riwayat` type extracted in Stage 2 — their third consumer, which is what that extraction was for.

---

## 9. Verification

**Backend** — feature tests with `DatabaseTransactions`, never `RefreshDatabase`:

- header-only correction on a sale that does not qualify succeeds; a line edit on that same sale is refused, naming the blocking line
- `HARGA_TERJUAL` and `TOTAL` recompute from the corrected lines
- stock decreases when a quantity rises and increases when it falls, in pieces, with the `JUMLAH_PER_ITEM` multiplier applied for a non-`Pcs` unit
- stock nets across two lines of the same product, and across a product moving from one line to another
- stock going below zero is allowed, recorded, and reported back
- a surviving line keeps its `CREATED_AT`
- points settle up, settle down, move across a customer-name change, and floor at zero
- every refusal in §5.5, each asserting nothing was written
- the audit row records operator, reason, both snapshots and a change list naming the stock and point movements
- a failure mid-way rolls back stock, points, lines and header together
- a corrected sale reports itself as corrected to `getInvoices`

**Frontend** — `npm run check` stays at 0 errors / 6 warnings, and the flow is walked in a real browser over CDP: correct a qualifying sale's lines and confirm the drawer, the audit trail, the stock card and the database all agree; confirm a non-qualifying sale offers header editing but not lines; confirm a cancelled sale offers neither.

---

## 10. Out of scope

Per-item returns and refunds, which need a credit model that does not exist; correcting a cancelled sale; the `KEMBALIAN` column's existing `DP` defect; the point rule moving to 1.000.000 (sub-project 4); and any change to how the POS rings up a sale in the first place.
