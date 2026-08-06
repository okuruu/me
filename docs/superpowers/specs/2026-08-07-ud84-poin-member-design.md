# UD84 Poin Member — Design

**Date:** 2026-08-07
**Sub-project:** 4 — `Instruction.md` item 10
**Repos:** `me` (SvelteKit frontend), `Marmyadose` (Laravel backend)

---

## 1. Scope

`Instruction.md` asks for one thing:

> *Untuk setiap transaksi senilai 1 juta rupiah mendapatkan 1 point berlaku kelipatan dengan syarat pembayaran tunai dan buatkan dashboardnya*

Two deliverables: the earning rule moves to 1 point per 1.000.000 of cash, and there is a screen for looking at points.

**Deliberately not built:** a reward catalogue, a redemption flow, or a record of who adjusted what. The owner's instruction was that redemption happens as a conversation at the counter — the customer picks something, the staff take the points off by hand. This design does exactly that and no more.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Earning rate | **1 point per 1.000.000** of cash, in multiples |
| Existing balances | **Left alone** — earned under the old rule, not rewritten |
| Redemption | **Manual adjustment only**, no catalogue and no rules |
| Adjustment shape | **Add or subtract an amount**, never "set the balance to N" |
| Record of adjustments | **None** — the owner's explicit call |
| Where it lives | **A new `/ud84/panel/poin` page** in the panel nav |

**On the absence of a record.** Every other mutating action in this project stores who did it, when and why. This one will not, at the owner's decision. The consequence is worth stating once, plainly: when a customer says *"I had twelve points last month"*, there will be nothing to check against, and a mistyped adjustment leaves no trace of having happened. That is an accepted trade for a screen the owner wants to stay simple.

**Why add-or-subtract rather than typing the new balance.** It matches how the exchange actually goes at the counter — *"that's three points off"* — and it is written as a single conditional statement, so two staff adjusting the same member at once cannot silently overwrite each other. Typing an absolute value is a read-modify-write by hand, and with no record kept, an overwrite would be both silent and untraceable.

---

## 3. The rule

`config/ud84.php`:

```php
'poin_per_rupiah' => 1000000,   // was 500000
```

That constant is already read by all three places that touch points — `Penjualan::postPenjualan` when a sale grants them, `Transaksi::kembalikanPoin` when a cancellation takes them back, and `Transaksi::selaraskanPoin` when a correction settles the difference. They cannot drift apart, which is why the change is one line.

**The cash condition is already satisfied.** Points have always been computed from `rekap.CASH`, never from `TOTAL`, so a sale settled by deposit earns on what was actually paid in cash. `Instruction.md`'s *"dengan syarat pembayaran tunai"* needs no new code.

**History is not rewritten.** Balances stay as they are, and each sale stores what it granted in `rekap.POIN`, so cancelling a sale made under the old rule still gives back exactly what that sale gave. Sales predating the `POIN` column fall back to recomputing from `CASH` — under the *new* constant, which is a known and accepted imprecision for rows that never recorded the figure.

Boundary, pinned by test: `CASH` of 999.999 earns 0; 1.000.000 earns 1; 2.500.000 earns 2.

---

## 4. Endpoints

### 4.1 Reading

`GET /UD84/Poin/Retrieve` → `Poin::getPoin`

```
data: {
  MEMBER: [ { ID, NAMA, LOKASI, WHATSAPP, POINT } ],   // highest balance first, then name
  TOTAL:  int                                          // every member's points added up
}
```

Members with zero points are included. Excluding them would make it impossible to give anyone their first point.

### 4.2 Adjusting

`POST /UD84/Poin/Adjust` → `Poin::adjustPoin`

```
ID       ud84_member.ID
JUMLAH   how many points, a whole number of at least 1
ARAH     'Tambah' or 'Kurang'
```

Returns the resulting balance so the screen shows what the database now holds rather than what it assumed.

**Adding** is an atomic `increment`. **Subtracting** is a conditional decrement:

```php
$terpengaruh = DB::table('ud84_member')
    ->where('ID', $id)->where('POINT', '>=', $jumlah)
    ->decrement('POINT', $jumlah);
```

If that matches no row, the balance was too low and the request is refused, naming what the member actually has. One statement, so two operators adjusting at once cannot drive a balance below zero between a read and a write — and nothing is clamped silently, which matters when there is no record to explain a clamp afterwards.

### 4.3 Refusals

All return `status: "error"` at HTTP 200, matching the rest of the panel.

| Case | Why |
|---|---|
| Member not found | — |
| `JUMLAH` not a whole number ≥ 1 | Zero is not an adjustment, and a negative one is what `ARAH` is for |
| `ARAH` neither `Tambah` nor `Kurang` | — |
| Subtracting more than the balance | Refused naming the balance, rather than clamped in silence |
| Adding beyond 32.767 | `ud84_member.POINT` is a `smallint`; strict mode would turn the overflow into an unexplained server error |

The ceiling is not a real constraint on earning — 32.767 points is 32,7 milyar of cash — but a mistyped manual addition reaches it easily.

---

## 5. The page

`/ud84/panel/poin`, added to the panel navigation beside Member.

- Total points issued across all members, at the top.
- A table of members ordered by balance, highest first: name, location, WhatsApp, points.
- Per row, an amount box and **Tambah** / **Kurang** buttons.
- A name filter, because the member list will grow.
- After an adjustment: a toast, and the list reloads from the server rather than being patched locally, so the number on screen is the number stored.

Nothing else. No charts, no history panel, no export — none of it would have data to show, since points carry no history.

**One known quirk it inherits:** `UD84Navigation.svelte` hardcodes `activeMenu = 'Transaksi'`, so every panel page highlights "Transaksi" in the nav, and the new Poin entry will be no exception. Pre-existing and already recorded in the handoff; not fixed here, but worth knowing so it is not mistaken for a fault in this page.

---

## 6. Verification

**Backend** — feature tests with `DatabaseTransactions`, never `RefreshDatabase`:

- the earning boundary: 999.999 grants nothing, 1.000.000 grants one, 2.500.000 grants two
- the list returns balances highest first and a total matching their sum
- adding increases the balance and returns it
- subtracting decreases it
- subtracting more than the balance is refused, naming the balance, and the balance is unchanged
- an unknown member, a zero or negative or fractional amount, and an unrecognised direction are each refused with nothing written
- adding beyond the `smallint` ceiling is refused rather than crashing

**Frontend** — `npm run check` stays at 0 errors / 6 warnings, and the page is walked in a real browser: adjust a member up, adjust down, watch the total follow, and see a too-large subtraction refused with its message.

---

## 7. Out of scope, and one observation

Out of scope: reward catalogues, redemption rules, expiry, tiers, any record of manual adjustments, and any change to how a sale attaches a member.

**An observation, not a proposal.** The nota already prints a `point` line showing the member's balance *at the moment of printing* — not the points that sale earned. With the rate halving, a customer comparing two receipts will see that number move by amounts that do not match their arithmetic. Changing it is not part of this item; it is worth knowing before someone asks.
