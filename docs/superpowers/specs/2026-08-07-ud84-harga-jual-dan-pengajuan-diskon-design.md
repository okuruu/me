# UD84 Harga Jual & Pengajuan Diskon — Design

**Date:** 2026-08-07
**Sub-project:** 3 — `Instruction.md` items 8 and 9
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Scope

Two lines from `Instruction.md`, built together because the second only makes sense once the first exists:

> *Sales dapat melihat harga jual pada menu Pesan Online di dalam rute /ud84*
> *Sales dapat melakukan pengajuan discount pada halaman rute /ud84 dan muncul di halaman .../ud84/panel/pesanan*

A salesperson taking an order can now see what each product sells for, and can write a discount request against any line. The request travels with the order and is read by whoever works it in the panel.

**Granting a discount is not automated.** The admin reads the request, decides, and types the real discount into Retail when ringing the order up — which is what they already do. The system carries the request; it does not price anything.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Where the price comes from | The **catalogue**, already loaded — nothing new is stored |
| Where a request attaches | **Per item**, not per order |
| What the request contains | **Free text** — whatever the salesperson wants to say |
| How the admin notices one | A **marker on the order row**, plus the text in the item drawer |
| Who decides | **The admin**, by hand, in Retail |

**Why the price is not stored on the order.** `HARGA_JUAL` lives on `ud84_master_produk` and is already in the catalogue payload the cart is built from. Copying it onto the order would create a second version of a number that can change, and nothing here needs the price as it stood when the order was placed.

**Why per item rather than per order.** The salesperson can now see a price per line, so that is where they will want to ask. A basket-level box would force *"diskon 5000 untuk yang botol kecil"* into prose the admin has to decode.

**Why free text.** The admin retypes the real figure into Retail regardless, so a structured amount buys nothing and costs expressiveness: *"5%"*, *"samakan harga bulan lalu"* and *"tolong dibantu bu"* are all things a salesperson will legitimately write.

---

## 3. Item 8 — the price column

`addToCarts` already finds the chosen product in `katalog` before pushing it onto the cart, and `UD84/Master-Produk/Katalog` returns `HARGA_JUAL` and `HARGA_PER_ITEM` for every entry. So the cart row carries the price, and the table gains a **Harga Jual** column rendered with the existing `rupiahFormatter`.

Nothing goes to the server for this item.

**One repair while in that table:** the empty-cart row spans `colspan="3"` against four columns today, and this change makes it five. It has been under-counting since before this work; it is corrected rather than made worse.

---

## 4. Item 9 — the discount request

### 4.1 Schema

One additive column:

```sql
ALTER TABLE `ud84_pesanan_detail`
  ADD COLUMN `DISKON` varchar(100) DEFAULT NULL AFTER `JUMLAH`;
```

Nullable, so every existing line simply has no request. 100 characters is enough for a sentence and short enough that the panel can show it in a table cell without wrapping into uselessness.

### 4.2 Writing one

Each cart row gains a text box beside its price. Whatever is typed rides along with that line when the order is submitted:

```
CARTS: [ { ID, NAMA, QUANTITY, DISKON } ]
```

`postPesanan` stores it on the detail row. An empty box stores `null`, not an empty string, so "no request" is one value rather than two.

The box is always visible rather than hidden behind a toggle. A control the salesperson has to discover is a control that goes unused.

### 4.3 Reading one

`Pesanan::getItems` returns `DISKON` per line, and the panel's item drawer shows it as a **Pengajuan Diskon** column.

**And so it is actually seen:** `Pesanan::getPesanan` reports `ADA_DISKON` per order — true when any of its lines carries a request — and the Pesanan list marks those rows. Without that, a request would sit unread unless somebody happened to open the drawer, which is the whole failure this item exists to prevent.

### 4.4 What it must survive

The panel's order editor (perbaikan pesanan, merged earlier today) reconciles lines **in place**: a surviving line is updated by `JUMLAH` alone, so a discount request lives through an admin adjusting quantities. A line the admin adds carries no request, which is correct — nobody asked for one.

Both are pinned by test rather than left to luck, because the editor's line-reconciliation is exactly the kind of code a later change could turn into a rewrite.

---

## 5. Verification

**Backend** — feature tests with `DatabaseTransactions`, never `RefreshDatabase`:

- an order posted with a request stores it on the right line
- a line with an empty request stores `null`
- `getItems` returns the request per line
- `getPesanan` reports `ADA_DISKON` true for an order carrying one and false for an order without
- editing an order's quantities through the panel editor leaves its requests intact
- a line the admin adds through that editor has no request

**Frontend** — `npm run check` stays at 0 errors / 6 warnings, and the flow is walked in a real browser: add two products, see their prices, write a request on one, submit, then find the order marked in the panel list and read the request in its drawer.

---

## 6. Out of scope

Applying a discount automatically; a state for the request (approved, rejected, pending); notifying anyone; per-salesperson identity, which `/ud84` still does not have — a request is attributed to the order and its named salesperson, not to whoever typed it; and any change to how Retail prices a sale.
