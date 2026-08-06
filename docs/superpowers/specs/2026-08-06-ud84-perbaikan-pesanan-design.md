# UD84 Perbaikan Pesanan — Design

**Date:** 2026-08-06
**Sub-project:** 2 of 4, **Stage 2**
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Scope

Sub-project 2 was resolved with the owner into three stages:

| Stage | What | Status |
|---|---|---|
| 1 | Cancel a whole invoice + audit infrastructure | ✅ Merged |
| **2** | **Correct an unverified pesanan (order)** | **This document** |
| 3 | Correct a completed transaksi, including line items | Next |

An order is a request, not a sale. It moves no stock and takes no money, and `ud84_analisa_sales` — the view behind sales performance — counts only orders where `VALID = 'Verified'`. An unverified order therefore appears in no report at all, which is what makes correcting one the low-risk stage and a sensible place to build the editing machinery Stage 3 will reuse.

Today the only correction available is **Hapus**, which deletes the order and its lines outright. Every fix — a mistyped WhatsApp number, "make it 5 not 3", one more product — costs the whole order and whatever record it was.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Which orders can be edited | **Unverified only** (`VALID` is null) |
| What is editable | **Header and items**: customer, WhatsApp, salesperson, notes, plus changing quantities, removing lines and adding products |
| Where | **Panel only** (`/ud84/panel/pesanan`) |
| Audit | Operator, before/after and a change list, **always**; reason **optional** |
| Verified orders | Locked against editing **and against deletion** |

**Why unverified only.** Verification is what admits an order into `ud84_analisa_sales`. Editing a verified order would move sales figures for periods someone may already have reported on, silently. Un-verifying was considered and rejected as unnecessary complexity for a problem nobody has yet.

**Why panel only.** The sales-facing view on `/ud84` sits behind one shared password with a name chosen from a dropdown, so "their own orders" is not something the system can currently enforce, and an audit trail there could record only which name was picked — not who picked it. The panel has real accounts, and the login now keeps the operator's name (Stage 1). Item 9 of `Instruction.md` will raise the same identity question; it is worth solving once, properly, rather than twice badly.

**Why the reason is optional.** Cancelling a sale demands one because it voids money that changed hands. An order is a working document, and demanding a justification for every quantity tweak trains people to type "x".

---

## 3. What an edit is

One atomic save of the whole order: four header fields plus the complete item list. The backend diffs that against what is stored and applies the difference inside one transaction.

Abandoning an edit writes nothing. A half-applied order is not reachable.

### Refusals

All return `status: "error"` with HTTP 200, matching the rest of the panel.

| Case | Message | Why |
|---|---|---|
| Order not found | Pesanan tidak ditemukan. | — |
| Already verified | Pesanan yang sudah diverifikasi tidak bisa diubah. | §2 |
| `NAMA` or `WHATSAPP` blank | Nama dan WhatsApp pelanggan wajib diisi. | The public order form requires both. An edit must not be able to produce an order the form could not |
| No items | Pesanan harus punya minimal satu item. | An order with nothing in it is a deleted order, and deleting is a separate deliberate act |
| A product no longer in master produk | Produk '<nama>' tidak ditemukan lagi. | Refuse the whole edit rather than silently drop a line |
| `JUMLAH` ≤ 0 | Jumlah item harus lebih dari nol. | Removing a line is done by removing it, not by counting to zero |
| Same product twice | Produk '<nama>' muncul dua kali. | The UI adds to the existing line instead, so this means something upstream is wrong |
| Reassigning to a `Nonaktif` salesperson | Sales tersebut sudah nonaktif. | They are already hidden from the public order form. An order that **already** names one keeps them — history stays intact |
| Nothing changed | Tidak ada perubahan untuk disimpan. | An audit trail full of empty edits is worse than no entry |

---

## 4. Backend

### 4.1 Endpoint

`POST /UD84/Pesanan/Update` → `Pesanan::updatePesanan`

```
KODE        the order code (ud84_pesanan_rekap.KODE)
NAMA        customer name
WHATSAPP    customer number
SALES       ud84_sales.ID, or null
CATATAN     notes
ITEMS       [{ KODE_ITEM, JUMLAH }, ...]   KODE_ITEM is ud84_master_produk.ID
OPERATOR    from localStorage Auth, as with cancellation
ALASAN      optional
```

`SALES` is the salesperson's **ID**, not their name, and is nullable — "Tanpa Sales" is a legitimate order, and `ud84_pesanan_rekap.SALES` is already null for those.

`NAMA` and `WHATSAPP` are checked for being **non-blank only**. The public order form applies no format rule to either, and an edit screen is the wrong place to start rejecting numbers that the front door accepts.

A successful edit stamps `UPDATED_AT` on the rekap row as well as on any line whose quantity changed.

### 4.2 The item diff, and why it is not a rewrite

Lines are matched by `KODE_ITEM` and reconciled in place:

| Case | Action |
|---|---|
| In both | `UPDATE JUMLAH` if it changed, `UPDATED_AT` stamped |
| Only in the payload | `INSERT` with `CREATED_AT = now()` |
| Only in the database | `DELETE` |

**`CREATED_AT` on surviving lines is never touched, and this is the point.** `ud84_analisa_sales` is a view that dates every line by `ud84_pesanan_detail.CREATED_AT`:

```sql
select p.NAMA, p.DISTRIBUTOR, d.JUMLAH, p.HARGA_PER_ITEM,
       (d.JUMLAH * p.HARGA_PER_ITEM) as TOTAL,
       d.CREATED_AT, r.SALES
from ud84_pesanan_detail d
  left join ud84_master_produk p on p.ID = d.KODE_ITEM
  left join ud84_pesanan_rekap r on d.KODE = r.KODE
where r.VALID = 'Verified'
```

Deleting all lines and re-inserting them — the obvious implementation — would move every line of an edited order to today's date. Correct a March order in August and its contribution to March's sales performance disappears into August. Nothing would report an error; the numbers would simply be wrong.

### 4.3 Audit

One row in `ud84_transaksi_log`, the table Stage 1 introduced:

| Column | Value |
|---|---|
| `UNIQUE_TRANSAKSI` | the order's `KODE` |
| `AKSI` | `Edit Pesanan` |
| `OPERATOR` | the panel operator, `Tidak diketahui` when absent |
| `ALASAN` | optional, stored as given |
| `SEBELUM` / `SESUDAH` | JSON of the rekap row and its lines, before and after |
| `CATATAN_SISTEM` | a plain-language change list |

The change list is what makes this readable a year later:

```
Nama pelanggan: 'Yani' -> 'Yanti'
Jumlah 'MTHR KCP INGGRS 135ML': 3 -> 5
Item 'SARIWANGI TEH 25S' ditambahkan (2)
Item 'GULA PASIR 1KG' dihapus
```

### 4.4 Repairs to existing endpoints

Both are in code this stage depends on, and both are wrong today.

- **`removeItem` deletes any order, verified or not, leaving no trace.** Since verified orders are locked against editing, deleting one out from under `ud84_analisa_sales` is the same hole by another door. It now refuses a verified order, and writes an `AKSI = 'Hapus Pesanan'` audit row carrying the full snapshot before deleting.
- **`validateItem` reports "Pesanan berhasil dihapus." after verifying an order** — copy-paste text telling the operator the opposite of what happened — and re-verifies an already-verified order without complaint. The message is corrected and re-verification refused.

### 4.5 Two additive response fields

Neither screen can work without them.

- `getPesanan` returns `SALES_ID` beside the existing display name. A dropdown cannot be populated from a name, and the name is already resolved for display.
- `getItems` returns `KODE_ITEM`. Lines cannot be diffed by something the client was never told.

Both are additions to existing payloads; no current consumer is affected.

### 4.6 Reading the audit trail

`Transaksi::riwayatTransaksi` already reads `ud84_transaksi_log` by `UNIQUE_TRANSAKSI` and is not specific to sales. It gains a second route, `POST /UD84/Pesanan/Riwayat`, so the pesanan page is not calling a URL named after transactions. Same method, no new code.

---

## 5. Frontend

All of it in `me/src/routes/ud84/panel/pesanan/+page.svelte`.

The detail drawer, which today lists an order's items read-only, gains an **Ubah Pesanan** button when the order is unverified. Edit mode, in the same drawer:

- header fields become inputs — customer, WhatsApp, notes, and a salesperson dropdown from `UD84/Stocks/Staff` filtered to `Aktif`, plus the currently assigned person even if they are now `Nonaktif`, so an edit never silently reassigns an order
- each item row gets a quantity input and a remove button
- a product picker fed by `UD84/Master-Produk/Retrieve` adds a line; **picking a product already on the order increases that line** rather than creating a second one, which is what makes the duplicate refusal in §3 unreachable from the UI
- an optional reason box
- **Simpan Perubahan** and **Batal**

Below it, the audit-trail panel the Transaksi drawer established in Stage 1, reading `UD84/Pesanan/Riwayat`.

A verified order shows neither **Ubah** nor **Hapus**, with a line saying why.

The operator name comes from `localStorage.Auth`, read through the same guarded helper Stage 1 added.

---

## 6. Verification

**Backend** — feature tests with `DatabaseTransactions`, never `RefreshDatabase`:

- a header-only edit updates the fields and writes exactly one audit row
- a quantity change updates `JUMLAH` **and leaves that line's `CREATED_AT` untouched**
- adding a product inserts a line; removing one deletes it
- an unknown product rolls the whole edit back, leaving the order exactly as it was
- every refusal in §3, each asserting nothing was written
- the audit row records operator, reason, before/after and a readable change list
- deleting an order writes its snapshot; deleting a verified order is refused
- verifying an already-verified order is refused, and the success message says the order was verified

**Frontend** — `npm run check` stays at 0 errors / 6 warnings, and the flow is walked in a real browser over CDP as Stage 1 was: edit an order, confirm the list, drawer and audit trail agree afterwards, and confirm a verified order offers neither action.

---

## 7. Out of scope

Editing verified orders and un-verifying them; any editing from the sales-facing `/ud84` page, which waits on per-salesperson identity; converting an order into a sale, which is a separate flow that does not exist here; and Stage 3, which is the next document.
