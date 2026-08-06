# UD84 Harga Jual & Pengajuan Diskon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each cart line's selling price on Pesan Online, and let the salesperson write a free-text discount request per line that the panel surfaces to whoever works the order.

**Architecture:** The price is already in the catalogue payload the cart is built from, so item 8 is a column and no server change. Item 9 adds one nullable column to `ud84_pesanan_detail`, carried through `postPesanan`, returned by `getItems`, and summarised per order by `getPesanan` so the list can mark orders that have something to read.

**Tech Stack:** Laravel 11 (query builder), PHPUnit feature tests with `DatabaseTransactions`, SvelteKit 2 + Svelte 5 runes, DaisyUI/Tailwind.

**Spec:** `me/docs/superpowers/specs/2026-08-07-ud84-harga-jual-dan-pengajuan-diskon-design.md`

## Global Constraints

- **One schema change, additive:** `ud84_pesanan_detail.DISKON varchar(100) NULL`. It ships as a `.sql` file pasted into phpMyAdmin, never `php artisan migrate`.
- **Never `RefreshDatabase`** in a test — it runs `migrate:fresh`, permanently dropping every `ud84_*` table, none of which are covered by migrations. Use `DatabaseTransactions`.
- **Never `git add -A` in `Marmyadose`** — stage by explicit path.
- **`php artisan route:clear` after touching `routes/api.php`** — this plan does not add routes, but clear it if anything there changes.
- **All responses HTTP 200** with `{status, message, data}`; `status: "error"` carries failures.
- **User-facing copy is Indonesian.** Comments and commit messages are English.
- **`npm run check` must stay at 0 errors / 6 warnings.**
- **Backend baseline is 147 passed / 1 failed** — the pre-existing `ExampleTest` on `GET /`, which also fails on `main`. Do not fix it, do not count it.
- **An empty request stores `null`, never `''`** — "no request" must be one value, not two.

---

## File Structure

| File | Responsibility |
|---|---|
| `Marmyadose/database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql` | Create. The one schema change, with its reasoning. |
| `Marmyadose/app/Http/Controllers/UD84/Pesanan.php` | Modify. `postPesanan` stores the request; `getItems` returns it; `getPesanan` reports whether an order has one. |
| `Marmyadose/tests/Feature/UD84/PengajuanDiskonTest.php` | Create. Every test for item 9. |
| `me/src/routes/ud84/+page.svelte` | Modify. Price column, request box, and the payload field. |
| `me/src/routes/ud84/panel/pesanan/+page.svelte` | Modify. Request column in the drawer, marker on the list row. |
| `me/docs/deployment/2026-08-07-ud84-harga-jual-diskon-deploy.md` | Create. Runbook — one ALTER, two backend files, two frontend files. |

---

### Task 1: The schema and the backend

**Files:**
- Create: `Marmyadose/database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql`
- Modify: `Marmyadose/app/Http/Controllers/UD84/Pesanan.php` (`postPesanan`, `getPesanan`, `getItems`)
- Test: `Marmyadose/tests/Feature/UD84/PengajuanDiskonTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `ud84_pesanan_detail.DISKON`; `POST UD84/Penjualan/Order-Online` accepts `DISKON` per cart entry; `getItems` rows gain `DISKON: string|null`; `getPesanan` rows gain `ADA_DISKON: bool`.

- [ ] **Step 1: Apply the column locally**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
DB::statement('ALTER TABLE ud84_pesanan_detail ADD COLUMN DISKON varchar(100) DEFAULT NULL AFTER JUMLAH');
foreach(DB::select(\"SHOW COLUMNS FROM ud84_pesanan_detail WHERE Field = 'DISKON'\") as \$c){ echo json_encode(\$c).PHP_EOL; }"
```

- [ ] **Step 2: Record it as a .sql file**

`database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql`:

```sql
-- UD84 -- discount requests on an order line.
--
-- A salesperson taking an order on /ud84 can now see each product's selling
-- price, and write a free-text request against any line: "5%", "samakan harga
-- bulan lalu", "tolong dibantu bu". Whoever works the order in the panel reads
-- it and decides; nothing here prices anything.
--
-- Free text rather than an amount because the admin retypes the real figure
-- into Retail regardless, so a structured number buys nothing and cannot hold
-- half of what a salesperson actually asks for.
--
-- Nullable, so every existing line simply has no request. NULL means "none";
-- the endpoint stores NULL rather than '' so there is only one such value.
--
-- Do NOT run `php artisan migrate` on this database. See the note in
-- 2026_08_06_add_cancel_invoice.sql.

ALTER TABLE `ud84_pesanan_detail`
  ADD COLUMN `DISKON` varchar(100) DEFAULT NULL AFTER `JUMLAH`;
```

- [ ] **Step 3: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/PengajuanDiskonTest.php`:

```php
<?php

namespace Tests\Feature\UD84;

use DB;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

/**
 * DatabaseTransactions — NOT RefreshDatabase. RefreshDatabase runs
 * migrate:fresh, which would drop every ud84_* table; none are covered by
 * migrations, so they would not come back.
 */
class PengajuanDiskonTest extends TestCase
{
    use DatabaseTransactions;

    private function seedProduct(): object
    {
        $id = DB::table('ud84_master_produk')->insertGetId([
            'NAMA'            => 'PRODUK DISKON '.uniqid(),
            'STOK'            => 100,
            'TIPE'            => 'Pcs',
            'STATUS_JUAL'     => 'Katalog dan Penjualan',
            'DISTRIBUTOR'     => 'TES',
            'HARGA_PABRIK'    => 5000,
            'HARGA_JUAL'      => 12000,
            'JUMLAH_PER_ITEM' => 1,
            'HARGA_PER_ITEM'  => 12000,
        ]);

        return DB::table('ud84_master_produk')->where('ID', $id)->first();
    }

    /** Places an order through the real public endpoint. */
    private function pesan(array $carts, string $nama = 'Pelanggan Diskon')
    {
        return $this->postJson('/api/UD84/Penjualan/Order-Online', [
            'NAMA'     => $nama,
            'WHATSAPP' => '08123456789',
            'SALES'    => null,
            'NOTES'    => 'Uji diskon',
            'CARTS'    => $carts,
        ]);
    }

    private function kodePesananTerakhir(): string
    {
        return (string) DB::table('ud84_pesanan_rekap')->orderByDesc('ID')->value('KODE');
    }

    public function test_a_request_written_on_a_line_is_stored_against_it(): void
    {
        $satu = $this->seedProduct();
        $dua  = $this->seedProduct();

        $this->pesan([
            ['ID' => $satu->ID, 'QUANTITY' => 2, 'DISKON' => 'minta 5%'],
            ['ID' => $dua->ID,  'QUANTITY' => 1, 'DISKON' => ''],
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        $kode = $this->kodePesananTerakhir();

        $this->assertSame('minta 5%', DB::table('ud84_pesanan_detail')
            ->where('KODE', $kode)->where('KODE_ITEM', $satu->ID)->value('DISKON'));

        // An empty box is "no request" -- one value, not two.
        $this->assertNull(DB::table('ud84_pesanan_detail')
            ->where('KODE', $kode)->where('KODE_ITEM', $dua->ID)->value('DISKON'));
    }

    public function test_an_order_placed_without_the_field_at_all_still_works(): void
    {
        $produk = $this->seedProduct();

        // The old cart payload, from a browser that has not reloaded.
        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 3]])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertNull(DB::table('ud84_pesanan_detail')
            ->where('KODE', $this->kodePesananTerakhir())->value('DISKON'));
    }

    public function test_the_item_list_returns_the_request(): void
    {
        $produk = $this->seedProduct();
        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 1, 'DISKON' => 'tolong dibantu bu']]);

        $items = $this->postJson('/api/UD84/Pesanan/Retrieve-Items', ['ID' => $this->kodePesananTerakhir()])
            ->assertStatus(200)->json('data');

        $this->assertSame('tolong dibantu bu', $items[0]['DISKON']);
    }

    public function test_the_order_list_flags_an_order_carrying_a_request(): void
    {
        $produk = $this->seedProduct();
        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 1, 'DISKON' => 'minta 10rb']]);
        $dengan = $this->kodePesananTerakhir();

        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 1]]);
        $tanpa = $this->kodePesananTerakhir();

        $rows = $this->postJson('/api/UD84/Pesanan/Retrieve', [
            'start' => now()->startOfDay()->toDateTimeString(),
            'end'   => now()->endOfDay()->toDateTimeString(),
        ])->assertStatus(200)->json('data');

        $this->assertTrue(collect($rows)->firstWhere('KODE', $dengan)['ADA_DISKON']);
        $this->assertFalse(collect($rows)->firstWhere('KODE', $tanpa)['ADA_DISKON']);
    }

    public function test_editing_an_orders_quantities_leaves_its_requests_intact(): void
    {
        $produk = $this->seedProduct();
        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 2, 'DISKON' => 'minta 5%']]);
        $kode = $this->kodePesananTerakhir();

        $baris = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->first();

        // The panel's order editor reconciles lines in place; a request must
        // live through an admin adjusting quantities.
        $this->postJson('/api/UD84/Pesanan/Update', [
            'KODE'     => $kode,
            'NAMA'     => 'Pelanggan Diskon',
            'WHATSAPP' => '08123456789',
            'SALES'    => null,
            'CATATAN'  => 'Uji diskon',
            'ITEMS'    => [['ID' => $baris->ID, 'KODE_ITEM' => $produk->ID, 'JUMLAH' => 7]],
            'OPERATOR' => 'Tester',
            'ALASAN'   => '',
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        $sesudah = DB::table('ud84_pesanan_detail')->where('ID', $baris->ID)->first();

        $this->assertSame(7, (int) $sesudah->JUMLAH);
        $this->assertSame('minta 5%', $sesudah->DISKON);
    }

    public function test_a_line_the_admin_adds_carries_no_request(): void
    {
        $produk = $this->seedProduct();
        $baru   = $this->seedProduct();
        $this->pesan([['ID' => $produk->ID, 'QUANTITY' => 2, 'DISKON' => 'minta 5%']]);
        $kode  = $this->kodePesananTerakhir();
        $baris = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->first();

        $this->postJson('/api/UD84/Pesanan/Update', [
            'KODE'     => $kode,
            'NAMA'     => 'Pelanggan Diskon',
            'WHATSAPP' => '08123456789',
            'SALES'    => null,
            'CATATAN'  => 'Uji diskon',
            'ITEMS'    => [
                ['ID' => $baris->ID, 'KODE_ITEM' => $produk->ID, 'JUMLAH' => 2],
                ['KODE_ITEM' => $baru->ID, 'JUMLAH' => 1],
            ],
            'OPERATOR' => 'Tester',
            'ALASAN'   => '',
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        // Nobody asked for a discount on the line the admin added.
        $this->assertNull(DB::table('ud84_pesanan_detail')
            ->where('KODE', $kode)->where('KODE_ITEM', $baru->ID)->value('DISKON'));
    }
}
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `php artisan test --filter=PengajuanDiskonTest`
Expected: FAIL — `DISKON` is never written or returned.

- [ ] **Step 5: Store the request when an order is placed**

In `Pesanan.php`'s `postPesanan`, replace the cart loop:

```php
            $useCarts = [];
            for($i = 0; $i < count($carts); $i++) {
                // An empty box is "no request". Stored as NULL rather than ''
                // so there is one such value instead of two.
                $diskon = trim((string) ($carts[$i]['DISKON'] ?? ''));

                $useCarts[] = [
                    "KODE"      => $unique,
                    "KODE_ITEM" => $carts[$i]['ID'],
                    "JUMLAH"    => $carts[$i]['QUANTITY'],
                    "DISKON"    => $diskon === '' ? null : $diskon,
                ];
            }
```

- [ ] **Step 6: Return it, and flag the orders that have one**

In `getItems`, add `DISKON` to both branches of the line builder — the resolved one and the `ADA: false` one — reading `$DB->DISKON`. The `get()` call at the top of that method selects specific columns, so widen it:

```php
            $DB = DB::table('ud84_pesanan_detail')->where('KODE', $id)->get(['KODE_ITEM', 'JUMLAH', 'DISKON']);
```

and give each `$useCarts[]` entry `"DISKON" => $DB->DISKON,`.

In `getPesanan`, report whether each order carries a request, beside the existing fields:

```php
            // Whether anything on this order is asking for a discount. Without
            // it the request sits unread unless somebody opens the drawer,
            // which is the whole failure this is meant to prevent.
            $adaDiskon = DB::table('ud84_pesanan_detail')
                ->where('KODE', $DB->KODE)
                ->whereNotNull('DISKON')
                ->where('DISKON', '!=', '')
                ->exists();
```

and add `"ADA_DISKON" => $adaDiskon,` to that row's array.

- [ ] **Step 7: Run the tests**

Run: `php artisan test --filter=PengajuanDiskonTest`
Expected: PASS, 6 tests.

- [ ] **Step 8: Run the whole suite**

Run: `php artisan test`
Expected: 153 passed, 1 failed (the pre-existing `ExampleTest`).

- [ ] **Step 9: Commit**

```bash
git add database/sql/2026_08_07_add_diskon_to_pesanan_detail.sql app/Http/Controllers/UD84/Pesanan.php tests/Feature/UD84/PengajuanDiskonTest.php
git commit -m "Carry a discount request on an order line

Free text rather than an amount: the admin retypes the real figure into
Retail regardless, so a structured number buys nothing and cannot hold
'samakan harga bulan lalu'.

An empty box stores NULL rather than '', so 'no request' is one value.

getPesanan reports whether an order carries any request at all, because
without it a request sits unread unless somebody happens to open the
drawer -- which is the failure this feature exists to prevent.

Two tests pin what it must survive: the panel's order editor reconciles
lines in place, so a request lives through an admin adjusting quantities,
and a line the admin adds carries none."
```

---

### Task 2: Pesan Online — the price and the box

**Files:**
- Modify: `me/src/routes/ud84/+page.svelte`

**Interfaces:**
- Consumes: `HARGA_JUAL` from `UD84/Master-Produk/Katalog` (already in the payload); `DISKON` accepted per cart entry by `UD84/Penjualan/Order-Online` (Task 1).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Widen the cart type and carry the price**

In the `<script>` block, extend the `Carts` interface:

```typescript
    interface Carts {
        ID: number;
        NAMA: string;
        QUANTITY: number;
        HARGA_JUAL: number;
        DISKON: string;
    }
```

In `addToCarts`, add both fields to the pushed entry — the price from the catalogue item it already looked up, and an empty request:

```typescript
            HARGA_JUAL: Number(item?.HARGA_JUAL ?? 0),
            DISKON: '',
```

- [ ] **Step 2: Send the request with the order**

In `completeTransaction`, the payload already sends `CARTS: carts`, and the cart entries now carry `DISKON`, so nothing changes there. Confirm by reading it — if it maps the cart rather than sending it whole, add `DISKON` to that map.

- [ ] **Step 3: Add the two columns**

In the cart table, add the headers between "Nama Produk" and "Jumlah (Pcs)":

```svelte
                    <th class="text-right">Harga Jual</th>
```

and after "Jumlah (Pcs)":

```svelte
                    <th class="text-center">Pengajuan Diskon</th>
```

Add the matching cells in the row, the price after the name and the box after the quantity:

```svelte
                            <td class="text-right whitespace-nowrap">{rupiahFormatter.format(carts.HARGA_JUAL)}</td>
```

```svelte
                            <td class="text-center">
                                <input type="text" maxlength="100" class="input input-bordered input-sm w-40" placeholder="mis. 5% / 5000" bind:value={carts.DISKON} />
                            </td>
```

Import `rupiahFormatter` alongside the existing `capitalizeEachWord` import from `../../library/utils/useFormat`.

Fix the empty-cart row, which spans 3 against what is now 6 columns:

```svelte
                        <td colspan="6" class="text-center">Keranjang Kosong</td>
```

- [ ] **Step 4: Check types**

Run: `cd "D:/Coedes/Production/me" && npm run check`
Expected: `0 ERRORS 6 WARNINGS`.

- [ ] **Step 5: Commit**

```bash
git add src/routes/ud84/+page.svelte
git commit -m "Show the selling price in the cart, and take a discount request

The price was already in the catalogue payload the cart is built from --
it just was not on screen, so a salesperson could not see what they were
selling.

The request box sits beside it, always visible rather than behind a
toggle: a control that has to be discovered is a control that goes
unused.

The empty-cart row has been spanning three columns against four since
before this change; corrected rather than made worse."
```

---

### Task 3: The panel side, verification and the runbook

**Files:**
- Modify: `me/src/routes/ud84/panel/pesanan/+page.svelte`
- Create: `me/docs/deployment/2026-08-07-ud84-harga-jual-diskon-deploy.md`

**Interfaces:**
- Consumes: `DISKON` from `UD84/Pesanan/Retrieve-Items` and `ADA_DISKON` from `UD84/Pesanan/Retrieve` (Task 1).
- Produces: nothing.

- [ ] **Step 1: Show the request in the drawer**

In `me/src/routes/ud84/panel/pesanan/+page.svelte`, add `DISKON: string | null;` to the `Carts` interface and `ADA_DISKON: boolean;` to the `Pesanan` interface.

Add a header to the drawer's item table, after "Jumlah Pesanan (Pcs)":

```svelte
                        <th class="text-center">Pengajuan Diskon</th>
```

and the matching cell in each row, after the quantity cell:

```svelte
                                <td class="text-center">
                                    {#if item.DISKON}
                                        <span class="badge badge-warning">{item.DISKON}</span>
                                    {:else}
                                        <span class="text-base-content/40">-</span>
                                    {/if}
                                </td>
```

The drawer's table has two `colspan` values for its empty and edit states — raise both by one to match the new column count.

- [ ] **Step 2: Mark the orders that carry one**

In the list table, add a header after "Nama":

```svelte
                        <th class="hidden sm:table-cell">Diskon</th>
```

and the cell after the name cell:

```svelte
                                <td class="hidden sm:table-cell">
                                    {#if data.ADA_DISKON}
                                        <span class="badge badge-warning">Ada pengajuan</span>
                                    {:else}
                                        <span class="text-base-content/40">-</span>
                                    {/if}
                                </td>
```

Raise the list's "Tidak ada data" `colspan` by one.

- [ ] **Step 3: Check types**

Run: `npm run check`
Expected: `0 ERRORS 6 WARNINGS`.

- [ ] **Step 4: Verify in a real browser**

Start the backend (`php artisan serve --port=8000`) and the frontend (`npm run dev`), setting `isProduction` to `false` in `me/src/library/resources/phraseBox.ts` and restoring it afterwards with `git checkout --`, never `sed`.

Drive it over CDP with the driver from `me/docs/superpowers/plans/2026-08-06-ud84-perbaikan-pesanan.md`, Task 8 Step 3. Open the tab on `about:blank` first; `localStorage` on a tab opened directly at a URL throws `SecurityError`. Svelte's `bind:value` ignores a bare assignment — follow every one with `new Event('input', {bubbles: true})`.

The order form on `/ud84` is behind a password: the cart appears after entering `uvx321`. Assert:

1. Adding two products shows each one's **Harga Jual** as a rupiah figure, not blank and not zero.
2. Typing a request on one line and submitting the order succeeds.
3. In `/ud84/panel/pesanan`, that order's row is marked **Ada pengajuan** and the other is not.
4. Opening its drawer shows the request text against the right product, and a dash against the one without.

- [ ] **Step 5: Clean up and confirm**

Delete the orders created during verification, along with their detail rows. Stop the servers and Chrome. Restore `phraseBox.ts`. Confirm `git status --short` in both repos shows only intended files.

- [ ] **Step 6: Write the runbook**

Create `me/docs/deployment/2026-08-07-ud84-harga-jual-diskon-deploy.md` covering: the single `ALTER TABLE` and its verification query; the two backend files (`app/Http/Controllers/UD84/Pesanan.php` and the `.sql` for the record); that **no new routes** are added so `route:clear` is advisory rather than mandatory here; the frontend merge; what to check on production (a salesperson sees prices, a request reaches the panel, an order without one is unmarked); and the rollback — re-upload the previous `Pesanan.php`; the column can stay, since nothing else reads it and it is nullable.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/routes/ud84/panel/pesanan/+page.svelte docs/deployment/2026-08-07-ud84-harga-jual-diskon-deploy.md
git commit -m "Surface discount requests in the panel

The request shows in the item drawer, and any order carrying one is
marked in the list -- an admin working through orders can see which have
something to read without opening every drawer.

Includes the deployment guide: one additive column, one backend file, and
a rollback where the column can simply stay."
```

---

## Definition of Done

- `php artisan test` → 153 passed, 1 failed (the pre-existing `ExampleTest` on `GET /`)
- `npm run check` → 0 errors, 6 warnings
- The flow walked in a real browser from writing a request to reading it in the panel
- `phraseBox.ts` reads `isProduction = true` in every commit
- Both repos clean; verification orders deleted
- Handoff updated after the merge: items 8 and 9 done
