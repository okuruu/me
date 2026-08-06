# UD84 Cancel Invoice & Perbaikan Transaksi — Design

**Date:** 2026-08-06
**Sub-project:** 2 of 4
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Scope

`Instruction.md` gives two one-line bullets:

- *Cancel Invoice: Batalkan & kelola retur transaksi tanpa ribet*
- *Penambahan Perbaikan Transaksi: Koreksi data transaksi cepat dan akurat*

Resolved with the owner into three stages, each independently shippable:

| Stage | What | Risk |
|---|---|---|
| **1** | Cancel a whole invoice + audit trail infrastructure | High — mutates stock, points and every revenue figure |
| **2** | Correct an unverified pesanan (order) | Low — orders touch neither stock nor money |
| **3** | Correct a completed transaksi, including line items | Highest — stock re-adjustment on every edit |

**This document specifies Stage 1.** Stages 2 and 3 get their own specs; Stage 3 depends on the audit and stock-reversal machinery built here.

Per-item returns from an invoice are **out of scope** for all three stages. They need a refund/credit model that does not exist anywhere in the system. The existing Logistik → Retur flow (`stocksAdmin`, `ud84_logistics`) already adjusts stock for returned goods, it simply is not linked to an invoice.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Cancel granularity | **Whole invoice only** |
| What a cancel reverses | **Stock and points**, with a reversing `ud84_logs` entry rather than deleting the original |
| Cancelled visibility | **Hidden from lists** unless a "show cancelled" filter is ticked; **excluded from every revenue figure** |
| Access control | **No gate** — anyone with panel access can cancel; every action is recorded with operator, time and reason |
| Item editing on legacy transactions (Stage 3) | **Not offered.** Header fields plus cancel only, with the reason shown |

---

## 3. Why legacy transactions cannot support item-level editing

Established by querying the local database, not assumed:

- **21 of 57** detail lines reference a product that no longer exists — resolvable neither by `KODE` nor by `NAMA`. There is nothing to return stock to.
- **56 of 57** detail lines have `SATUAN` null, so there is no record of whether the line was sold as loose pieces or as a whole `Set`/`Dus`. The stock multiplier is `JUMLAH_PER_ITEM`, commonly 10, so guessing wrong is wrong by an order of magnitude.
- The oldest rows have `KODE` empty entirely, because `postPenjualan` has always matched stock by `NAMA`; `KODE` was never load-bearing.

Only transactions written after the `SATUAN` column shipped carry both a reliable product reference and the unit. This constrains Stage 3, and it also constrains how much stock Stage 1 can restore — see §5.3.

---

## 4. Schema

Two changes, both additive.

```sql
ALTER TABLE `ud84_penjualan_rekap`
  ADD COLUMN `STATUS` enum('Aktif','Dibatalkan') NOT NULL DEFAULT 'Aktif' AFTER `UNIQUE`;

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
```

Existing rows default to `Aktif`, so nothing changes for current data.

`SEBELUM`/`SESUDAH` hold JSON snapshots of the rekap row and its detail lines. `CATATAN_SISTEM` records what the system itself did or could not do — specifically which lines had stock restored and which were skipped, and why. That distinction is the difference between an audit trail and a receipt.

---

## 5. Cancel behaviour

### 5.1 Endpoint

`POST /UD84/Daftar-Transaksi/Batal` → `Transaksi::batalTransaksi`

Input: `KODE` (the rekap `UNIQUE`), `ALASAN`, `OPERATOR`.

Refuses when: the transaction does not exist, it is already `Dibatalkan`, or `ALASAN` is blank. A cancellation with no stated reason is worth less than no cancellation, because it leaves the next person guessing.

All work runs inside one `DB::transaction`. Any failure rolls back stock, points and status together — a half-cancelled invoice is worse than a failed one.

### 5.2 Point reversal

`postPenjualan` grants `floor(CASH / 500000)` points when `CASH > 0`, incrementing `ud84_member.POINT` where the trimmed name matches. Cancelling deducts the same amount, computed the same way from the stored `CASH`.

**Clamped at zero.** If the member has spent or otherwise lost points since, decrementing could drive the balance negative; the balance floors at 0 and `CATATAN_SISTEM` records that the full amount could not be deducted.

The 500 000 divisor is what the code currently does. Sub-project 4 changes the earning rule to 1 000 000; when it does, reversal must change with it. Both use the same constant so they cannot drift.

### 5.3 Stock restoration, and its honest limits

For each detail line, resolve the product by `KODE` first, falling back to `NAMA`. Then determine how many pieces to return:

| Line state | Pieces returned |
|---|---|
| `SATUAN = 'Pcs'` | `JUMLAH` |
| `SATUAN` set, not `'Pcs'` | `JUMLAH × JUMLAH_PER_ITEM` |
| `SATUAN` null | **nothing** — unit unknown |
| product unresolvable | **nothing** — no row to credit |

Lines that cannot be restored are **skipped, not guessed**, and each is named in `CATATAN_SISTEM` with the reason. The API returns that list so the UI can tell the operator plainly: *"Stok untuk 2 item tidak dikembalikan otomatis — silakan sesuaikan lewat Logistik."*

This is the deliberate consequence of §3. Guessing the multiplier would corrupt stock silently; refusing to guess corrupts nothing and tells someone.

Every restored line writes a **new** `ud84_logs` row with `ASAL = 'Batal Transaksi'`, `MASUK` = pieces returned, `KELUAR` = 0, and the resulting `STOK_FINAL`. The original sale's log row is never deleted or edited — the card should read as a history, not a corrected ledger.

### 5.4 What cancelling does not do

It does not touch `CASH`, `DP`, `TOTAL` or `POTONGAN` on the rekap row. The money that changed hands is a historical fact; `STATUS` records that the sale was voided. Refunds are a business action outside this system.

---

## 6. Read sites — all nine

A `STATUS` column is worthless unless every consumer honours it. `ud84_penjualan_detail` has no status of its own, so detail-level queries join to the rekap.

| Location | Change |
|---|---|
| `commonCharts` | `where STATUS = 'Aktif'` on the monthly omset sum |
| `omsetDetail` | join rekap, exclude cancelled, for both the item breakdown and the operational figures |
| `daftarTransaksi` | exclude cancelled unless `TAMPILKAN_BATAL` is set; totals always exclude |
| `searchTransaksi` | same |
| `detailTransaksi` | still returns a cancelled transaction, and now returns its `STATUS` |
| `getInvoices` | same — the nota needs to know, so it can print as void |
| `singleItemReport` | join rekap, exclude cancelled |
| `singleItem` | join rekap, exclude cancelled |
| `updateDP` | refuse on a cancelled transaction |

**Totals always exclude cancelled sales, even when the list is showing them.** A list that displays a cancelled row and then adds it into the footer would be worse than not showing it at all.

---

## 7. Frontend

**`transaksi/+page.svelte`**
- A **Tampilkan Dibatalkan** toggle beside the existing A-Z control. Off by default.
- Cancelled rows render greyed with a `Dibatalkan` badge and no Cetak Ulang link.
- A **Batalkan** action in the detail drawer, opening a confirmation that requires a reason. Operator name comes from the `Auth` entry in `localStorage`.
- After a successful cancel, any skipped-stock warning is surfaced as a toast that must be dismissed, not a transient one.

**Nota (`NotaDL`, `NotaThermal`)**
- When `STATUS = 'Dibatalkan'`, both papers print a clear **DIBATALKAN** banner. A voided sale must never reprint as a normal receipt.

---

## 8. Deliberate repairs to existing logic

The owner granted latitude to fix inconsistent source logic where it obstructs correct behaviour. Applied narrowly:

- **`postPenjualan` will write `KODE` and match stock by product ID rather than `NAMA`.** Cancellation has to find the product again later; matching by name means a rename between sale and cancel silently fails to restore stock. This also fixes the latent corruption noted in sub-project 1, where two products sharing a name adjust the wrong row.
- **`$stokDecrease` will be initialised per loop iteration.** It currently persists across iterations, so a cart line with an unrecognised `TIPE` would reapply the previous line's decrement to a different product.

Both are small, both are in code Stage 1 depends on, and both would otherwise make cancellation unreliable. Anything not in this list stays as it is.

---

## 9. Verification

Local MySQL (`dao`) is available and Laravel tests run against it with `DatabaseTransactions` — never `RefreshDatabase`, which would drop every `ud84_*` table.

Feature tests must cover:

- cancel marks the transaction `Dibatalkan` and is refused a second time
- cancel with a blank reason is refused
- stock is restored for a `Pcs` line and for a `Satuan` line, with the `JUMLAH_PER_ITEM` multiplier applied
- a line with null `SATUAN` restores nothing and is reported in `CATATAN_SISTEM`
- a line whose product is gone restores nothing and is reported
- points are deducted, and clamp at zero rather than going negative
- a reversing `ud84_logs` row is written and the original is untouched
- a cancelled sale disappears from `commonCharts`, `daftarTransaksi`, `searchTransaksi`, `omsetDetail`, `singleItem` and `singleItemReport`
- list totals exclude cancelled sales even when the list is showing them
- `updateDP` refuses on a cancelled transaction
- the whole operation rolls back cleanly on failure, leaving stock, points and status unchanged

Frontend: `npm run check` must stay at 0 errors / 6 warnings, and both papers must print the DIBATALKAN banner, verified in headless Chrome.

---

## 10. Out of scope

Per-item returns and refunds; Stage 2 (perbaikan pesanan); Stage 3 (perbaikan transaksi); the point-rule change to 1 000 000 (sub-project 4); sales performance dashboard, discount pengajuan and harga jual visibility (sub-project 3).
