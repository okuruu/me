# UD84 Perbaikan Pesanan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let panel staff correct an unverified order — customer details, salesperson, notes, quantities, added and removed products — in one atomic save that records who changed what.

**Architecture:** One new Laravel endpoint (`POST /UD84/Pesanan/Update`) validates the whole order, computes a human-readable change list, and applies header and line changes inside a single transaction, reconciling lines **in place** rather than rewriting them. Two existing endpoints are repaired (delete gains a verified-order guard and an audit snapshot; verify gets a correct message and a re-verify guard). The frontend turns the existing read-only detail drawer on `panel/pesanan` into an editor and shows the audit trail beneath it.

**Tech Stack:** Laravel 11 (query builder, no Eloquent models for `ud84_*`), PHPUnit feature tests with `DatabaseTransactions`, SvelteKit 2 + Svelte 5 runes, DaisyUI/Tailwind, svelte-sonner toasts.

**Spec:** `me/docs/superpowers/specs/2026-08-06-ud84-perbaikan-pesanan-design.md`

## Global Constraints

- **Never `RefreshDatabase`** in a test. It runs `migrate:fresh`, which drops every `ud84_*` table; none are covered by migrations, so they do not come back. Use `DatabaseTransactions`.
- **Never `php artisan migrate`.** This stage adds no schema at all — `ud84_transaksi_log` already exists.
- **Never `git add -A` in `Marmyadose`.** Stage files by explicit path.
- **`php artisan route:clear` after touching `routes/api.php`.** A cached route file makes new routes 404 with no error on screen.
- **`me/src/library/resources/phraseBox.ts` must read `isProduction = true` in every commit.** Flip to `false` only for local browser testing and flip it back. Restore with `git checkout -- <file>`, not `sed`, which rewrites CRLF to LF.
- **All API responses use HTTP 200** with `{status, message, data}` — `status: "error"` carries failures. This is the house style; do not introduce 4xx.
- **All user-facing copy is Indonesian.** Code comments and commit messages are English.
- **`npm run check` must stay at 0 errors / 6 warnings.** More warnings means something regressed.
- **Backend baseline is 54 passed / 1 failed.** The failure is the pre-existing `ExampleTest` on `GET /`. Do not fix it; do not count it as new.
- **Product identity is `ud84_master_produk.ID`,** carried as `KODE_ITEM` on `ud84_pesanan_detail`. Never match products by name.

---

## File Structure

| File | Responsibility |
|---|---|
| `Marmyadose/app/Http/Controllers/UD84/Pesanan.php` | Modify. Gains `updatePesanan` plus four private helpers; `removeItem` and `validateItem` repaired; `getPesanan` and `getItems` gain one field each. |
| `Marmyadose/routes/api.php` | Modify. Two route lines. |
| `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php` | Create. Every test for this stage. |
| `me/src/routes/ud84/panel/pesanan/+page.svelte` | Modify. Drawer becomes an editor; audit trail panel added. |
| `me/docs/deployment/2026-08-06-ud84-perbaikan-pesanan-deploy.md` | Create. Runbook — no SQL, two files, one cache clear. |

`Pesanan.php` is ~190 lines today and will roughly double. That is still a single-purpose file (everything about orders) and matches how `Transaksi.php` is organised, so it stays one file.

---

### Task 1: Additive API fields and the Riwayat route

The editor cannot work without these: a dropdown cannot be populated from a salesperson's display name, and lines cannot be diffed by an identifier the client was never sent. `getItems` also currently throws on an order whose product was deleted, which makes such an order impossible even to view.

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Pesanan.php:65-143` (`getPesanan`, `getItems`)
- Modify: `Marmyadose/routes/api.php:157-161`
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `getPesanan` rows gain `SALES_ID: int|null`; `getItems` rows gain `KODE_ITEM: int` and `ADA: bool`; route `POST /api/UD84/Pesanan/Riwayat` returns `data: []` of `ud84_transaksi_log` rows, newest first.

- [ ] **Step 1: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`:

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
class PerbaikanPesananTest extends TestCase
{
    use DatabaseTransactions;

    private function seedProduct(array $overrides = []): object
    {
        $id = DB::table('ud84_master_produk')->insertGetId(array_merge([
            'NAMA'            => 'PRODUK PESANAN '.uniqid(),
            'STOK'            => 1000,
            'TIPE'            => 'Set',
            'STATUS_JUAL'     => 'Katalog dan Penjualan',
            'DISTRIBUTOR'     => 'TES',
            'HARGA_PABRIK'    => 5000,
            'HARGA_JUAL'      => 10000,
            'JUMLAH_PER_ITEM' => 10,
            'HARGA_PER_ITEM'  => 1200,
        ], $overrides));

        return DB::table('ud84_master_produk')->where('ID', $id)->first();
    }

    private function seedSalesperson(string $status = 'Aktif'): int
    {
        return (int) DB::table('ud84_sales')->insertGetId([
            'NAMA'       => 'Sales Pesanan '.uniqid(),
            'STATUS'     => $status,
            'CREATED_AT' => '2026-08-06 10:00:00',
        ]);
    }

    /** Lines default to an OLD created date, so date preservation is observable. */
    private function seedOrder(array $rekap = [], array $lines = []): string
    {
        $kode = 'ubah'.uniqid();

        DB::table('ud84_pesanan_rekap')->insert(array_merge([
            'NAMA'       => 'Pelanggan Tes',
            'WHATSAPP'   => '08123456789',
            'SALES'      => null,
            'CATATAN'    => 'Catatan awal',
            'VALID'      => null,
            'KODE'       => $kode,
            'CREATED_AT' => '2026-03-01 09:00:00',
        ], $rekap));

        foreach ($lines as $line) {
            DB::table('ud84_pesanan_detail')->insert(array_merge([
                'KODE'       => $kode,
                'KODE_ITEM'  => 0,
                'JUMLAH'     => 1,
                'CREATED_AT' => '2026-03-01 09:00:00',
            ], $line));
        }

        return $kode;
    }

    public function test_the_order_list_carries_the_salesperson_id(): void
    {
        $salesId = $this->seedSalesperson();
        $kode    = $this->seedOrder(['SALES' => $salesId]);

        $rows = $this->postJson('/api/UD84/Pesanan/Retrieve', [
            'start' => '2026-03-01 00:00:00',
            'end'   => '2026-03-01 23:59:59',
        ])->assertStatus(200)->json('data');

        $found = collect($rows)->firstWhere('KODE', $kode);

        $this->assertNotNull($found);
        $this->assertSame($salesId, $found['SALES_ID']);
    }

    public function test_order_items_carry_their_product_id(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $items = $this->postJson('/api/UD84/Pesanan/Retrieve-Items', ['ID' => $kode])
            ->assertStatus(200)->json('data');

        $this->assertSame($produk->ID, $items[0]['KODE_ITEM']);
        $this->assertTrue($items[0]['ADA']);
    }

    public function test_a_line_whose_product_is_gone_is_marked_not_found(): void
    {
        $kode = $this->seedOrder([], [['KODE_ITEM' => 999999, 'JUMLAH' => 2]]);

        $items = $this->postJson('/api/UD84/Pesanan/Retrieve-Items', ['ID' => $kode])
            ->assertStatus(200)->json('data');

        $this->assertFalse($items[0]['ADA']);
        $this->assertSame(999999, $items[0]['KODE_ITEM']);
        $this->assertSame(2, $items[0]['JUMLAH']);
    }

    public function test_the_order_audit_trail_is_readable_by_order_code(): void
    {
        $kode = $this->seedOrder();

        DB::table('ud84_transaksi_log')->insert([
            'UNIQUE_TRANSAKSI' => $kode,
            'AKSI'             => 'Edit Pesanan',
            'OPERATOR'         => 'Tester',
            'CATATAN_SISTEM'   => 'Contoh',
            'CREATED_AT'       => '2026-08-06 10:00:00',
        ]);

        $rows = $this->postJson('/api/UD84/Pesanan/Riwayat', ['KODE' => $kode])
            ->assertStatus(200)->assertJson(['status' => 'success'])->json('data');

        $this->assertCount(1, $rows);
        $this->assertSame('Edit Pesanan', $rows[0]['AKSI']);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "D:/Coedes/Production/Marmyadose" && php artisan test --filter=PerbaikanPesananTest`
Expected: FAIL — `SALES_ID` and `KODE_ITEM` are undefined array keys, and `/api/UD84/Pesanan/Riwayat` returns 404.

- [ ] **Step 3: Add the two fields**

In `Pesanan.php`, inside `getPesanan`'s loop, add `SALES_ID` beside the resolved name:

```php
            $useDB[] = [
                "NAMA"          => $DB->NAMA,
                "WHATSAPP"      => $DB->WHATSAPP,
                "SALES"         => $salesName->NAMA ?? '-',
                "SALES_ID"      => $DB->SALES === null ? null : (int) $DB->SALES,
                "CATATAN"       => $DB->CATATAN,
                "KODE"          => $DB->KODE,
                "VALID"         => $DB->VALID,
                "CREATED_AT"    => $DB->CREATED_AT
            ];
```

Replace the body of `getItems`'s loop so a deleted product no longer throws:

```php
            $useCarts = [];
            foreach($DB as $DB) {
                $findItem = DB::table('ud84_master_produk')->where('ID', $DB->KODE_ITEM)->first();

                // A product deleted since the order was placed used to throw
                // here, which made the order impossible even to open. The line
                // is reported as unresolvable instead, so it can be removed.
                if (empty($findItem)) {
                    $useCarts[] = [
                        "KODE_ITEM"         => (int) $DB->KODE_ITEM,
                        "ADA"               => false,
                        "NAMA"              => "Produk #{$DB->KODE_ITEM} tidak ditemukan",
                        "JUMLAH"            => (int) $DB->JUMLAH,
                        "STOK"              => 0,
                        "SATUAN"            => '-',
                        "HARGA_PER_ITEM"    => 0,
                        "HARGA_JUAL"        => 0,
                        "DISTRIBUTOR"       => '-'
                    ];
                    continue;
                }

                $useCarts[] = [
                    "KODE_ITEM"         => (int) $DB->KODE_ITEM,
                    "ADA"               => true,
                    "NAMA"              => $findItem->NAMA,
                    "JUMLAH"            => (int) $DB->JUMLAH,
                    "STOK"              => $findItem->STOK,
                    "SATUAN"            => $findItem->TIPE,
                    "HARGA_PER_ITEM"    => $findItem->HARGA_PER_ITEM,
                    "HARGA_JUAL"        => $findItem->HARGA_JUAL,
                    "DISTRIBUTOR"       => $findItem->DISTRIBUTOR
                ];
            }
```

- [ ] **Step 4: Add the Riwayat route**

`Transaksi::riwayatTransaksi` already reads `ud84_transaksi_log` by `UNIQUE_TRANSAKSI` and is not specific to sales. Add one line to `routes/api.php`, directly beneath the existing pesanan routes (after `Route::post('/UD84/Pesanan/Validate-Order', ...)`):

```php
// Same reader as the transaction audit trail -- ud84_transaksi_log is keyed by
// UNIQUE_TRANSAKSI, which for an order is its KODE. Routed separately so the
// pesanan page is not calling a URL named after transactions.
Route::post('/UD84/Pesanan/Riwayat', [UD84_Transaksi::class, 'riwayatTransaksi']);
```

`UD84_Transaksi` is already imported at the top of the file for the cancel routes. Verify with `grep -n "use App\\\\Http\\\\Controllers\\\\UD84\\\\Transaksi" routes/api.php` before adding; if it is missing, add the import too.

- [ ] **Step 5: Clear the route cache and run the tests**

Run: `php artisan route:clear && php artisan test --filter=PerbaikanPesananTest`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/UD84/Pesanan.php routes/api.php tests/Feature/UD84/PerbaikanPesananTest.php
git commit -m "Expose the order fields an editor needs

SALES_ID beside the salesperson's display name, because a dropdown cannot
be populated from a name, and KODE_ITEM on each line, because lines cannot
be diffed by an identifier the client was never sent.

getItems also stops throwing on an order whose product was deleted. It
used to read NAMA off a null, which made such an order impossible even to
open -- unviewable and therefore unfixable. The line comes back marked
ADA: false so it can be removed."
```

---

### Task 2: The update endpoint

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Pesanan.php` (add `updatePesanan` and four private helpers after `postPesanan`)
- Modify: `Marmyadose/routes/api.php`
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`

**Interfaces:**
- Consumes: nothing from Task 1 in code; the same test helpers.
- Produces: `POST /api/UD84/Pesanan/Update` taking `KODE, NAMA, WHATSAPP, SALES, CATATAN, ITEMS[{KODE_ITEM, JUMLAH}], OPERATOR, ALASAN` and returning `{status, message, data: {CATATAN: string[]}}`. Private helpers `gagal(string): JsonResponse`, `bacaSales(mixed): ?int`, `namaSales(?int): string`, `ringkasPerubahan(object, Collection, array, array, array): array`.

- [ ] **Step 1: Write the failing tests**

Append to `PerbaikanPesananTest.php`:

```php
    private function ubah(string $kode, array $payload = [])
    {
        return $this->postJson('/api/UD84/Pesanan/Update', array_merge([
            'KODE'     => $kode,
            'NAMA'     => 'Pelanggan Tes',
            'WHATSAPP' => '08123456789',
            'SALES'    => null,
            'CATATAN'  => 'Catatan awal',
            'ITEMS'    => [],
            'OPERATOR' => 'Tester',
            'ALASAN'   => '',
        ], $payload));
    }

    public function test_a_header_edit_updates_the_order_and_records_one_audit_row(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, [
            'NAMA'    => 'Pelanggan Baru',
            'CATATAN' => 'Antar sore',
            'ITEMS'   => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]],
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', [
            'KODE' => $kode, 'NAMA' => 'Pelanggan Baru', 'CATATAN' => 'Antar sore',
        ]);

        $log = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $kode)->get();

        $this->assertCount(1, $log);
        $this->assertSame('Edit Pesanan', $log[0]->AKSI);
        $this->assertSame('Tester', $log[0]->OPERATOR);
        $this->assertStringContainsString("Nama pelanggan: 'Pelanggan Tes' -> 'Pelanggan Baru'", $log[0]->CATATAN_SISTEM);
    }

    public function test_changing_a_quantity_leaves_the_line_created_date_alone(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 5]]])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $line = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->first();

        $this->assertSame(5, (int) $line->JUMLAH);
        // ud84_analisa_sales dates every line by this column. Rewriting the
        // line would move an old order's contribution into today.
        $this->assertStringStartsWith('2026-03-01', (string) $line->CREATED_AT);
    }

    public function test_an_item_can_be_added_and_another_removed(): void
    {
        $lama = $this->seedProduct();
        $baru = $this->seedProduct();
        $kode = $this->seedOrder([], [['KODE_ITEM' => $lama->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $baru->ID, 'JUMLAH' => 2]]])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseMissing('ud84_pesanan_detail', ['KODE' => $kode, 'KODE_ITEM' => $lama->ID]);
        $this->assertDatabaseHas('ud84_pesanan_detail', ['KODE' => $kode, 'KODE_ITEM' => $baru->ID, 'JUMLAH' => 2]);

        $catatan = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $kode)->value('CATATAN_SISTEM');

        $this->assertStringContainsString("Item '{$baru->NAMA}' ditambahkan (2)", $catatan);
        $this->assertStringContainsString("Item '{$lama->NAMA}' dihapus", $catatan);
    }

    public function test_the_salesperson_can_be_changed(): void
    {
        $produk  = $this->seedProduct();
        $salesId = $this->seedSalesperson();
        $kode    = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]]);

        $this->ubah($kode, [
            'SALES' => $salesId,
            'ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]],
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'SALES' => $salesId]);
    }

    public function test_the_before_and_after_snapshots_are_stored(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 9]]]);

        $log = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $kode)->first();

        $sebelum = json_decode($log->SEBELUM, true);
        $sesudah = json_decode($log->SESUDAH, true);

        $this->assertSame(3, (int) $sebelum['detail'][0]['JUMLAH']);
        $this->assertSame(9, (int) $sesudah['detail'][0]['JUMLAH']);
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `php artisan test --filter=PerbaikanPesananTest`
Expected: FAIL — `/api/UD84/Pesanan/Update` returns 404.

- [ ] **Step 3: Add the route**

In `routes/api.php`, beneath the other pesanan routes:

```php
Route::post('/UD84/Pesanan/Update', [UD84_Pesanan::class, 'updatePesanan']);
```

- [ ] **Step 4: Write the helpers**

Add these private methods at the bottom of `Pesanan.php`, before the closing brace:

```php
    private function gagal(string $pesan)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $pesan,
        ], 200);
    }

    /** "Tanpa Sales" arrives as null or an empty string; both mean no salesperson. */
    private function bacaSales($nilai): ?int
    {
        return ($nilai === null || $nilai === '') ? null : (int) $nilai;
    }

    private function namaSales(?int $id): string
    {
        if ($id === null) {
            return 'Tanpa Sales';
        }

        return DB::table('ud84_sales')->where('ID', $id)->value('NAMA') ?? "Sales #{$id}";
    }

    /**
     * A plain-language list of what this edit changes, built BEFORE anything is
     * written. It doubles as the check for an edit that changes nothing: an
     * empty list means there is nothing to save, and an audit trail full of
     * empty entries is worse than no entry.
     */
    private function ringkasPerubahan(object $rekap, $detail, array $baru, array $diminta, array $namaProduk): array
    {
        $catatan = [];

        $header = [
            'NAMA'     => 'Nama pelanggan',
            'WHATSAPP' => 'WhatsApp',
            'CATATAN'  => 'Keterangan',
        ];

        foreach ($header as $kolom => $label) {
            $lama = (string) ($rekap->$kolom ?? '');
            $isi  = (string) ($baru[$kolom] ?? '');

            if ($lama !== $isi) {
                $catatan[] = "{$label}: '{$lama}' -> '{$isi}'";
            }
        }

        $salesLama = $rekap->SALES === null ? null : (int) $rekap->SALES;

        if ($salesLama !== $baru['SALES']) {
            $catatan[] = "Sales: '".$this->namaSales($salesLama)."' -> '".$this->namaSales($baru['SALES'])."'";
        }

        $lamaItem = [];

        foreach ($detail as $line) {
            $lamaItem[(int) $line->KODE_ITEM] = (int) $line->JUMLAH;
        }

        foreach ($diminta as $kodeItem => $jumlah) {
            $nama = $namaProduk[$kodeItem];

            if (!isset($lamaItem[$kodeItem])) {
                $catatan[] = "Item '{$nama}' ditambahkan ({$jumlah})";
            } elseif ($lamaItem[$kodeItem] !== $jumlah) {
                $catatan[] = "Jumlah '{$nama}': {$lamaItem[$kodeItem]} -> {$jumlah}";
            }
        }

        foreach ($lamaItem as $kodeItem => $jumlah) {
            if (!isset($diminta[$kodeItem])) {
                $nama = DB::table('ud84_master_produk')->where('ID', $kodeItem)->value('NAMA') ?? "Produk #{$kodeItem}";
                $catatan[] = "Item '{$nama}' dihapus";
            }
        }

        return $catatan;
    }
```

- [ ] **Step 5: Write `updatePesanan`**

Add after `postPesanan` in `Pesanan.php`:

```php
    /**
     * Correcting an order rewrites nothing it does not have to. Lines are
     * reconciled in place: ud84_analisa_sales dates every line by
     * ud84_pesanan_detail.CREATED_AT, so deleting and re-inserting an untouched
     * line would move an old order's contribution into today, silently.
     */
    public function updatePesanan(Request $request)
    {
        $kode     = trim((string) $request->input('KODE'));
        $nama     = trim((string) $request->input('NAMA'));
        $whatsApp = trim((string) $request->input('WHATSAPP'));
        $catatan  = $request->input('CATATAN');
        $operator = trim((string) $request->input('OPERATOR'));
        $alasan   = trim((string) $request->input('ALASAN'));

        $rekap = DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->first();

        if (empty($rekap)) {
            return $this->gagal('Pesanan tidak ditemukan.');
        }

        if (!empty($rekap->VALID)) {
            return $this->gagal('Pesanan yang sudah diverifikasi tidak bisa diubah.');
        }

        if ($nama === '' || $whatsApp === '') {
            return $this->gagal('Nama dan WhatsApp pelanggan wajib diisi.');
        }

        $items = $request->input('ITEMS');

        if (!is_array($items) || count($items) === 0) {
            return $this->gagal('Pesanan harus punya minimal satu item.');
        }

        $diminta    = [];
        $namaProduk = [];

        foreach ($items as $item) {
            $kodeItem = (int) ($item['KODE_ITEM'] ?? 0);
            $jumlah   = (int) ($item['JUMLAH'] ?? 0);
            $produk   = DB::table('ud84_master_produk')->where('ID', $kodeItem)->first(['ID', 'NAMA']);

            if (empty($produk)) {
                return $this->gagal("Produk dengan kode {$kodeItem} tidak ditemukan lagi.");
            }

            if (isset($diminta[$kodeItem])) {
                return $this->gagal("Produk '{$produk->NAMA}' muncul dua kali.");
            }

            if ($jumlah <= 0) {
                return $this->gagal("Jumlah item '{$produk->NAMA}' harus lebih dari nol.");
            }

            $diminta[$kodeItem]    = $jumlah;
            $namaProduk[$kodeItem] = $produk->NAMA;
        }

        $salesLama = $rekap->SALES === null ? null : (int) $rekap->SALES;
        $salesBaru = $this->bacaSales($request->input('SALES'));

        // An order that already names a deactivated salesperson keeps them --
        // history stays intact. Only a CHANGE to one is refused.
        if ($salesBaru !== null && $salesBaru !== $salesLama) {
            $orang = DB::table('ud84_sales')->where('ID', $salesBaru)->first(['NAMA', 'STATUS']);

            if (empty($orang)) {
                return $this->gagal('Sales tidak ditemukan.');
            }

            if ($orang->STATUS === 'Nonaktif') {
                return $this->gagal("Sales '{$orang->NAMA}' sudah nonaktif.");
            }
        }

        $detail = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->get();

        $catatanSistem = $this->ringkasPerubahan($rekap, $detail, [
            'NAMA'     => $nama,
            'WHATSAPP' => $whatsApp,
            'CATATAN'  => $catatan,
            'SALES'    => $salesBaru,
        ], $diminta, $namaProduk);

        if (empty($catatanSistem)) {
            return $this->gagal('Tidak ada perubahan untuk disimpan.');
        }

        DB::beginTransaction();

        try {
            $sebelum = json_encode(['rekap' => $rekap, 'detail' => $detail], JSON_UNESCAPED_UNICODE);

            DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->update([
                'NAMA'       => $nama,
                'WHATSAPP'   => $whatsApp,
                'SALES'      => $salesBaru,
                'CATATAN'    => $catatan,
                'UPDATED_AT' => now(),
            ]);

            $lama = [];

            foreach ($detail as $line) {
                $lama[(int) $line->KODE_ITEM] = $line;
            }

            foreach ($diminta as $kodeItem => $jumlah) {
                if (!isset($lama[$kodeItem])) {
                    DB::table('ud84_pesanan_detail')->insert([
                        'KODE'       => $kode,
                        'KODE_ITEM'  => $kodeItem,
                        'JUMLAH'     => $jumlah,
                        'CREATED_AT' => now(),
                    ]);

                    continue;
                }

                if ((int) $lama[$kodeItem]->JUMLAH !== $jumlah) {
                    // CREATED_AT is deliberately untouched -- see the note above.
                    DB::table('ud84_pesanan_detail')->where('ID', $lama[$kodeItem]->ID)->update([
                        'JUMLAH'     => $jumlah,
                        'UPDATED_AT' => now(),
                    ]);
                }
            }

            foreach ($lama as $kodeItem => $line) {
                if (!isset($diminta[$kodeItem])) {
                    DB::table('ud84_pesanan_detail')->where('ID', $line->ID)->delete();
                }
            }

            $sesudahRekap  = DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->first();
            $sesudahDetail = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->get();

            DB::table('ud84_transaksi_log')->insert([
                'UNIQUE_TRANSAKSI' => $kode,
                'AKSI'             => 'Edit Pesanan',
                'OPERATOR'         => $operator !== '' ? $operator : 'Tidak diketahui',
                'ALASAN'           => $alasan !== '' ? $alasan : null,
                'CATATAN_SISTEM'   => implode("\n", $catatanSistem),
                'SEBELUM'          => $sebelum,
                'SESUDAH'          => json_encode(['rekap' => $sesudahRekap, 'detail' => $sesudahDetail], JSON_UNESCAPED_UNICODE),
                'CREATED_AT'       => now(),
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Pesanan berhasil diperbarui.',
                'data'    => ['CATATAN' => $catatanSistem],
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::info($e);

            return $this->gagal('Perubahan gagal disimpan, tidak ada yang berubah.');
        }
    }
```

- [ ] **Step 6: Clear routes and run the tests**

Run: `php artisan route:clear && php artisan test --filter=PerbaikanPesananTest`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/UD84/Pesanan.php routes/api.php tests/Feature/UD84/PerbaikanPesananTest.php
git commit -m "Correct an unverified order in one atomic save

Header and lines go in together or not at all. Lines are reconciled in
place rather than rewritten, because ud84_analisa_sales dates every line
by ud84_pesanan_detail.CREATED_AT: delete-and-reinsert would move a March
order's contribution into August, and nothing would report an error.

The change list is built before anything is written, which is also how an
edit that changes nothing is caught -- an empty list means there is
nothing to save."
```

---

### Task 3: The refusal matrix

Every guard from the spec, each asserting that nothing was written.

**Files:**
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`
- Modify (only if a test proves a guard missing): `Marmyadose/app/Http/Controllers/UD84/Pesanan.php`

**Interfaces:**
- Consumes: `ubah()`, `seedOrder()`, `seedProduct()`, `seedSalesperson()` from Tasks 1–2.
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Append to `PerbaikanPesananTest.php`:

```php
    public function test_an_unknown_order_is_refused(): void
    {
        $this->ubah('tidak-ada')->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_a_verified_order_cannot_be_edited(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder(['VALID' => 'Verified'], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, [
            'NAMA'  => 'Diubah Diam-diam',
            'ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 9]],
        ])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'NAMA' => 'Pelanggan Tes']);
        $this->assertDatabaseHas('ud84_pesanan_detail', ['KODE' => $kode, 'JUMLAH' => 3]);
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $kode]);
    }

    public function test_a_blank_customer_name_is_refused(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, [
            'NAMA'  => '   ',
            'ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]],
        ])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'NAMA' => 'Pelanggan Tes']);
    }

    public function test_a_blank_whatsapp_is_refused(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, [
            'WHATSAPP' => '',
            'ITEMS'    => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]],
        ])->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_an_order_cannot_be_emptied(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => []])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_detail', ['KODE' => $kode, 'KODE_ITEM' => $produk->ID]);
    }

    public function test_an_unknown_product_rolls_the_whole_edit_back(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, [
            'NAMA'  => 'Pelanggan Baru',
            'ITEMS' => [
                ['KODE_ITEM' => $produk->ID, 'JUMLAH' => 5],
                ['KODE_ITEM' => 999999, 'JUMLAH' => 1],
            ],
        ])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'NAMA' => 'Pelanggan Tes']);
        $this->assertDatabaseHas('ud84_pesanan_detail', ['KODE' => $kode, 'JUMLAH' => 3]);
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $kode]);
    }

    public function test_a_zero_quantity_is_refused(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 0]]])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_detail', ['KODE' => $kode, 'JUMLAH' => 3]);
    }

    public function test_the_same_product_twice_is_refused(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [
            ['KODE_ITEM' => $produk->ID, 'JUMLAH' => 2],
            ['KODE_ITEM' => $produk->ID, 'JUMLAH' => 4],
        ]])->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_reassigning_to_a_deactivated_salesperson_is_refused(): void
    {
        $produk  = $this->seedProduct();
        $nonAktif = $this->seedSalesperson('Nonaktif');
        $kode    = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]]);

        $this->ubah($kode, [
            'SALES' => $nonAktif,
            'ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]],
        ])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'SALES' => null]);
    }

    public function test_an_order_already_naming_a_deactivated_salesperson_can_still_be_edited(): void
    {
        $produk   = $this->seedProduct();
        $nonAktif = $this->seedSalesperson('Nonaktif');
        $kode     = $this->seedOrder(['SALES' => $nonAktif], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]]);

        $this->ubah($kode, [
            'NAMA'  => 'Pelanggan Baru',
            'SALES' => $nonAktif,
            'ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 1]],
        ])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'SALES' => $nonAktif, 'NAMA' => 'Pelanggan Baru']);
    }

    public function test_an_edit_that_changes_nothing_is_refused_and_writes_no_audit_row(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $kode]);
    }

    public function test_an_unresolvable_line_can_be_removed(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [
            ['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3],
            ['KODE_ITEM' => 999999, 'JUMLAH' => 1],
        ]);

        // The gone product is simply absent from the payload, so it never has
        // to resolve -- this is the only way out of such an order.
        $this->ubah($kode, ['ITEMS' => [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseMissing('ud84_pesanan_detail', ['KODE' => $kode, 'KODE_ITEM' => 999999]);
    }
```

- [ ] **Step 2: Run the tests**

Run: `php artisan test --filter=PerbaikanPesananTest`
Expected: all PASS — Task 2 implemented these guards. Any failure is a real defect in Task 2's code; fix it in `Pesanan.php` rather than weakening the test.

- [ ] **Step 3: Run the whole suite**

Run: `php artisan test`
Expected: 75 passed, 1 failed (the pre-existing `ExampleTest`).

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/UD84/PerbaikanPesananTest.php
git commit -m "Cover every refusal an order edit can hit

Each case asserts the order and its lines are exactly as they were and
that no audit row was written -- a guard that returns an error while
having already changed something is the failure worth catching.

Includes the way out of an order referencing a deleted product: the line
is absent from the payload rather than resolved, so removal succeeds
where keeping it is refused."
```

---

### Task 4: Delete gains a guard and a trace

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Pesanan.php:145-153` (`removeItem`)
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`

**Interfaces:**
- Consumes: `gagal()` from Task 2.
- Produces: `POST /api/UD84/Pesanan/Delete` now also accepts `OPERATOR` and `ALASAN`, and refuses verified orders.

- [ ] **Step 1: Write the failing tests**

```php
    public function test_deleting_an_order_records_what_was_deleted(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder([], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->postJson('/api/UD84/Pesanan/Delete', ['ID' => $kode, 'OPERATOR' => 'Tester'])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseMissing('ud84_pesanan_rekap', ['KODE' => $kode]);
        $this->assertDatabaseMissing('ud84_pesanan_detail', ['KODE' => $kode]);

        $log = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $kode)->first();

        $this->assertSame('Hapus Pesanan', $log->AKSI);
        $this->assertSame('Tester', $log->OPERATOR);

        // Decoded rather than string-matched: MySQL returns smallint columns
        // as strings under some PDO settings, so "JUMLAH":3 and "JUMLAH":"3"
        // are both possible and both correct.
        $sebelum = json_decode($log->SEBELUM, true);

        $this->assertSame(3, (int) $sebelum['detail'][0]['JUMLAH']);
        $this->assertSame($kode, $sebelum['rekap']['KODE']);
    }

    public function test_a_verified_order_cannot_be_deleted(): void
    {
        $produk = $this->seedProduct();
        $kode   = $this->seedOrder(['VALID' => 'Verified'], [['KODE_ITEM' => $produk->ID, 'JUMLAH' => 3]]);

        $this->postJson('/api/UD84/Pesanan/Delete', ['ID' => $kode, 'OPERATOR' => 'Tester'])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode]);
    }

    public function test_deleting_an_unknown_order_is_refused(): void
    {
        $this->postJson('/api/UD84/Pesanan/Delete', ['ID' => 'tidak-ada'])
            ->assertStatus(200)->assertJson(['status' => 'error']);
    }
```

- [ ] **Step 2: Run to verify they fail**

Run: `php artisan test --filter=PerbaikanPesananTest`
Expected: FAIL — deleting currently returns success for anything, writes no audit row, and happily deletes a verified order.

- [ ] **Step 3: Replace `removeItem`**

```php
    /**
     * Deleting used to succeed against anything, verified or not, and left no
     * trace at all. A verified order feeds ud84_analisa_sales, so removing one
     * moves sales figures exactly as editing one would -- the same hole by
     * another door.
     */
    public function removeItem(Request $request){
        $kode     = trim((string) $request->input('ID'));
        $operator = trim((string) $request->input('OPERATOR'));
        $alasan   = trim((string) $request->input('ALASAN'));

        $rekap = DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->first();

        if (empty($rekap)) {
            return $this->gagal('Pesanan tidak ditemukan.');
        }

        if (!empty($rekap->VALID)) {
            return $this->gagal('Pesanan yang sudah diverifikasi tidak bisa dihapus.');
        }

        DB::beginTransaction();

        try {
            $detail = DB::table('ud84_pesanan_detail')->where('KODE', $kode)->get();

            DB::table('ud84_transaksi_log')->insert([
                'UNIQUE_TRANSAKSI' => $kode,
                'AKSI'             => 'Hapus Pesanan',
                'OPERATOR'         => $operator !== '' ? $operator : 'Tidak diketahui',
                'ALASAN'           => $alasan !== '' ? $alasan : null,
                'CATATAN_SISTEM'   => 'Pesanan dihapus beserta '.count($detail).' item.',
                'SEBELUM'          => json_encode(['rekap' => $rekap, 'detail' => $detail], JSON_UNESCAPED_UNICODE),
                'SESUDAH'          => null,
                'CREATED_AT'       => now(),
            ]);

            DB::table('ud84_pesanan_detail')->where('KODE', $kode)->delete();
            DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->delete();

            DB::commit();

            return response()->json([
                "status"  => "success",
                "message" => "Pesanan berhasil dihapus."
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::info($e);

            return $this->gagal('Pesanan gagal dihapus.');
        }
    }
```

- [ ] **Step 4: Run the tests**

Run: `php artisan test --filter=PerbaikanPesananTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/UD84/Pesanan.php tests/Feature/UD84/PerbaikanPesananTest.php
git commit -m "Refuse deleting a verified order, and record deletions

A verified order feeds the sales analysis, so deleting one moves figures
exactly as editing one would. Editing was locked; deleting was the same
hole by another door.

Deletions now write their full snapshot to the audit trail before the
rows go, so an order that disappears can still be accounted for."
```

---

### Task 5: Verify says what it did

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Pesanan.php:155-164` (`validateItem`)
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanPesananTest.php`

**Interfaces:**
- Consumes: `gagal()` from Task 2.
- Produces: `POST /api/UD84/Pesanan/Validate-Order` refuses unknown and already-verified orders; success message reads *Pesanan berhasil diverifikasi.*

- [ ] **Step 1: Write the failing tests**

```php
    public function test_verifying_reports_verification_not_deletion(): void
    {
        $kode = $this->seedOrder();

        $this->postJson('/api/UD84/Pesanan/Validate-Order', ['ID' => $kode])
            ->assertStatus(200)
            ->assertJson(['status' => 'success', 'message' => 'Pesanan berhasil diverifikasi.']);

        $this->assertDatabaseHas('ud84_pesanan_rekap', ['KODE' => $kode, 'VALID' => 'Verified']);
    }

    public function test_verifying_twice_is_refused(): void
    {
        $kode = $this->seedOrder(['VALID' => 'Verified']);

        $this->postJson('/api/UD84/Pesanan/Validate-Order', ['ID' => $kode])
            ->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_verifying_an_unknown_order_is_refused(): void
    {
        $this->postJson('/api/UD84/Pesanan/Validate-Order', ['ID' => 'tidak-ada'])
            ->assertStatus(200)->assertJson(['status' => 'error']);
    }
```

- [ ] **Step 2: Run to verify they fail**

Run: `php artisan test --filter=PerbaikanPesananTest`
Expected: FAIL — the message currently reads "Pesanan berhasil dihapus." and every call returns success.

- [ ] **Step 3: Replace `validateItem`**

```php
    /**
     * The success message used to read "Pesanan berhasil dihapus." -- telling
     * the operator the opposite of what happened -- and re-verifying an
     * already-verified order was accepted silently.
     */
    public function validateItem(Request $request){
        $kode  = trim((string) $request->input('ID'));
        $rekap = DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->first();

        if (empty($rekap)) {
            return $this->gagal('Pesanan tidak ditemukan.');
        }

        if (!empty($rekap->VALID)) {
            return $this->gagal('Pesanan ini sudah diverifikasi sebelumnya.');
        }

        DB::table('ud84_pesanan_rekap')->where('KODE', $kode)->update([
            "VALID"      => "Verified",
            "UPDATED_AT" => now(),
        ]);

        return response()->json([
            "status"  => "success",
            "message" => "Pesanan berhasil diverifikasi."
        ], 200);
    }
```

- [ ] **Step 4: Run the whole suite**

Run: `php artisan test`
Expected: 81 passed, 1 failed (pre-existing `ExampleTest`).

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/UD84/Pesanan.php tests/Feature/UD84/PerbaikanPesananTest.php
git commit -m "Make verifying an order say so

The success message read 'Pesanan berhasil dihapus.' -- copy-paste text
telling the operator their order had been deleted when it had just been
verified. Re-verifying an already-verified order was also accepted
without complaint."
```

---

### Task 6: The editor

**Files:**
- Modify: `me/src/routes/ud84/panel/pesanan/+page.svelte` (whole file)

**Interfaces:**
- Consumes: `SALES_ID` (Task 1), `KODE_ITEM` and `ADA` (Task 1), `POST UD84/Pesanan/Update` (Task 2), `POST UD84/Pesanan/Riwayat` (Task 1), `POST UD84/Pesanan/Delete` with `OPERATOR` (Task 4).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace the `<script>` block**

The whole block, from `<script lang="ts">` to `</script>`:

```svelte
<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Drawer from "../../../../components/shared/Drawer.svelte";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Pesanan {
        NAMA: string;
        WHATSAPP: string;
        SALES: string;
        SALES_ID: number | null;
        CATATAN: string;
        KODE: string;
        VALID: string | null;
        CREATED_AT: string;
    }

    interface Carts {
        KODE_ITEM: number;
        ADA: boolean;
        NAMA: string;
        JUMLAH: number;
        STOK: number;
        SATUAN: string;
        HARGA_PER_ITEM: number;
        HARGA_JUAL: number;
        DISTRIBUTOR: string;
    }

    interface Staff {
        ID: number;
        NAMA: string;
        STATUS?: "Aktif" | "Nonaktif";
    }

    interface Produk {
        ID: number;
        NAMA: string;
    }

    interface Riwayat {
        ID: number;
        AKSI: string;
        OPERATOR: string | null;
        ALASAN: string | null;
        CATATAN_SISTEM: string | null;
        CREATED_AT: string;
    }

    let newData: Pesanan[] = $state([]);
    let carts: Carts[] = $state([]);
    let riwayat: Riwayat[] = $state([]);

    // The order the drawer is currently showing. Null until one is opened.
    let terpilih: Pesanan | null = $state(null);

    let isDrawer: boolean = $state(false);
    let isUbah: boolean = $state(false);
    let sedangMenyimpan: boolean = $state(false);

    let draft = $state({ NAMA: '', WHATSAPP: '', SALES: '' as string, CATATAN: '' });
    let alasanUbah: string = $state('');

    let daftarSales: Staff[] = $state([]);
    let daftarProduk: Produk[] = $state([]);
    let produkDipilih: string = $state('');

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    // Deactivated salespeople stay pickable only if this order already names
    // one, so an edit never silently reassigns the order to somebody else.
    let salesPilihan: Staff[] = $derived(
        daftarSales.filter((orang) => orang.STATUS !== "Nonaktif" || orang.ID === terpilih?.SALES_ID)
    );

    function operatorSaatIni(): string {
        try {
            const stored = localStorage.getItem('Auth');
            const parsed = stored ? JSON.parse(stored) : null;

            return typeof parsed?.name === 'string' ? parsed.name : '';
        } catch {
            return '';
        }
    }

    async function viewItem(pesanan: Pesanan): Promise <void> {
        const { status, message, data } = await db({
            ID: pesanan.KODE
        }, 'UD84/Pesanan/Retrieve-Items');

        if (status === "error") {
            toast.error(message);
            return;
        }

        terpilih = pesanan;
        carts = data ?? [];
        isUbah = false;
        alasanUbah = '';
        await getRiwayat(pesanan.KODE);
        isDrawer = true;
    }

    async function getRiwayat(kode: string): Promise <void> {
        const { status, data } = await db({ KODE: kode }, 'UD84/Pesanan/Riwayat');
        riwayat = status === "error" ? [] : (data ?? []);
    }

    async function mulaiUbah(): Promise <void> {
        if (!terpilih) return;

        draft = {
            NAMA: terpilih.NAMA ?? '',
            WHATSAPP: terpilih.WHATSAPP ?? '',
            SALES: terpilih.SALES_ID === null ? '' : String(terpilih.SALES_ID),
            CATATAN: terpilih.CATATAN ?? '',
        };

        if (daftarSales.length === 0) {
            daftarSales = await useFetch('UD84/Stocks/Staff') ?? [];
        }

        if (daftarProduk.length === 0) {
            daftarProduk = await useFetch('UD84/Master-Produk/Retrieve') ?? [];
        }

        isUbah = true;
    }

    function batalUbah(): void {
        isUbah = false;
        alasanUbah = '';
        produkDipilih = '';

        if (terpilih) {
            viewItem(terpilih);
        }
    }

    // Picking a product already on the order adds to that line. Two lines for
    // one product is a state the backend refuses, so it must be unreachable.
    function tambahItem(): void {
        const id = Number(produkDipilih);

        if (!id) {
            toast.error("Pilih produk dulu");
            return;
        }

        const sudahAda = carts.find((item) => item.KODE_ITEM === id);

        if (sudahAda) {
            sudahAda.JUMLAH = Number(sudahAda.JUMLAH) + 1;
            produkDipilih = '';
            return;
        }

        const produk = daftarProduk.find((item) => item.ID === id);

        if (!produk) {
            toast.error("Produk tidak ditemukan");
            return;
        }

        carts = [...carts, {
            KODE_ITEM: produk.ID,
            ADA: true,
            NAMA: produk.NAMA,
            JUMLAH: 1,
            STOK: 0,
            SATUAN: '-',
            HARGA_PER_ITEM: 0,
            HARGA_JUAL: 0,
            DISTRIBUTOR: '-',
        }];
        produkDipilih = '';
    }

    function hapusItem(index: number): void {
        carts = carts.filter((_, posisi) => posisi !== index);
    }

    async function simpanUbah(): Promise <void> {
        if (!terpilih) return;

        if (draft.NAMA.trim() === '' || draft.WHATSAPP.trim() === '') {
            toast.error("Nama dan WhatsApp pelanggan wajib diisi");
            return;
        }

        if (carts.length === 0) {
            toast.error("Pesanan harus punya minimal satu item");
            return;
        }

        sedangMenyimpan = true;

        const { status, message } = await db({
            KODE: terpilih.KODE,
            NAMA: draft.NAMA,
            WHATSAPP: draft.WHATSAPP,
            SALES: draft.SALES === '' ? null : Number(draft.SALES),
            CATATAN: draft.CATATAN,
            ITEMS: carts.map((item) => ({ KODE_ITEM: item.KODE_ITEM, JUMLAH: Number(item.JUMLAH) })),
            OPERATOR: operatorSaatIni(),
            ALASAN: alasanUbah,
        }, 'UD84/Pesanan/Update');

        sedangMenyimpan = false;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        isUbah = false;
        alasanUbah = '';
        await doPost();

        const segar = newData.find((row) => row.KODE === terpilih?.KODE);

        if (segar) {
            await viewItem(segar);
        }
    }

    async function removeItem(id: string, index: number): Promise <void> {
        toast('Apakah anda yakin untuk menghapus?', {
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: id,
                        OPERATOR: operatorSaatIni(),
                    }, 'UD84/Pesanan/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                    newData.splice(index, 1);

                    if (terpilih?.KODE === id) {
                        isDrawer = false;
                        terpilih = null;
                    }
                }
            },
        });
    }

    async function isValid(id: string, index: number): Promise <void> {
        toast('Apakah anda pesanan ini valid?', {
            action: {
                label: 'Ya, Validasi',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: id
                    }, 'UD84/Pesanan/Validate-Order');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                    newData[index].VALID = "Verified";

                    if (terpilih?.KODE === id) {
                        terpilih = { ...terpilih, VALID: "Verified" };
                        isUbah = false;
                    }
                }
            },
        });
    }

    function reverseData(): Pesanan[] {
        newData = newData.reverse();
        return newData;
    }

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            start: useInput.startDate,
            end: useInput.endDate,
        }, 'UD84/Pesanan/Retrieve');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
    }
</script>
```

- [ ] **Step 2: Update the list row's view button**

`viewItem` now takes the row, not the code. In the table body, change:

```svelte
                                        <button type="button" onclick={() => viewItem(data.KODE)} class="btn btn-ghost btn-square btn-sm text-info">
```

to:

```svelte
                                        <button type="button" onclick={() => viewItem(data)} class="btn btn-ghost btn-square btn-sm text-info">
```

- [ ] **Step 3: Replace the drawer**

Replace everything from `<Drawer isOpen={isDrawer}` to the closing `</Drawer>`:

```svelte
<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = false}>
    <div class="w-full p-5">
        <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-lg font-bold">Detail Pesanan</h3>
            {#if terpilih?.VALID}
                <span class="badge badge-success">Verified</span>
            {/if}
        </div>

        <div class="divider my-3"></div>

        {#if isUbah}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label for="ubahNama" class="label-text mb-1 block font-medium">Nama Pelanggan</label>
                    <input id="ubahNama" type="text" bind:value={draft.NAMA} class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan"/>
                </div>
                <div>
                    <label for="ubahWhatsapp" class="label-text mb-1 block font-medium">WhatsApp</label>
                    <input id="ubahWhatsapp" type="text" bind:value={draft.WHATSAPP} class="input input-bordered input-sm w-full" placeholder="08xxxxxxxxxx"/>
                </div>
                <div>
                    <label for="ubahSales" class="label-text mb-1 block font-medium">Nama Sales</label>
                    <select id="ubahSales" bind:value={draft.SALES} class="select select-bordered select-sm w-full">
                        <option value="">Tanpa Sales</option>
                        {#each salesPilihan as orang}
                            <option value={String(orang.ID)}>{orang.NAMA}{orang.STATUS === "Nonaktif" ? ' (nonaktif)' : ''}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label for="ubahCatatan" class="label-text mb-1 block font-medium">Keterangan</label>
                    <input id="ubahCatatan" type="text" bind:value={draft.CATATAN} class="input input-bordered input-sm w-full" placeholder="Keterangan"/>
                </div>
            </div>
        {:else if terpilih}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <span class="label-text mb-1 block font-medium">Nama Pelanggan</span>
                    <p class="text-sm">{terpilih.NAMA}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">WhatsApp</span>
                    <p class="text-sm">{terpilih.WHATSAPP}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">Nama Sales</span>
                    <p class="text-sm">{terpilih.SALES}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">Keterangan</span>
                    <p class="text-sm">{terpilih.CATATAN}</p>
                </div>
            </div>
        {/if}

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
                        <th class="text-center">Jumlah Pesanan (Pcs)</th>
                        <th class="text-center">Stok</th>
                        <th>Satuan</th>
                        <th class="text-center">Harga Jual</th>
                        <th class="text-center">{isUbah ? 'Aksi' : 'Harga Per Pcs'}</th>
                    </tr>
                </thead>
                <tbody>
                    {#if carts.length === 0}
                        <tr>
                            <td colspan="7" class="text-center text-base-content/60">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each carts as item, index }
                            <tr class={item.ADA === false ? 'text-error' : ''}>
                                <td>{index + 1}</td>
                                <td class="text-left">
                                    {capitalizeEachWord(item.NAMA)} <br/>
                                    <span class="font-extrabold text-warning">[{item.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">
                                    {#if isUbah && item.ADA !== false}
                                        <input type="number" min="1" bind:value={item.JUMLAH} class="input input-bordered input-sm w-20 text-center"/>
                                    {:else}
                                        {item.JUMLAH}
                                    {/if}
                                </td>
                                <td class="text-center">
                                    {#if item.STOK < 30}
                                        <span class="font-extrabold text-error">{ item.STOK }</span>
                                    {:else}
                                        { item.STOK }
                                    {/if}
                                </td>
                                <td>{item.SATUAN}</td>
                                <td class="text-center">{rupiahFormatter.format(item.HARGA_JUAL)}</td>
                                <td class="text-center">
                                    {#if isUbah}
                                        <button type="button" onclick={() => hapusItem(index)} class="btn btn-ghost btn-sm text-error">Hapus</button>
                                    {:else}
                                        {rupiahFormatter.format(item.HARGA_PER_ITEM)}
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

        {#if isUbah}
            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div class="flex-1">
                    <label for="tambahProduk" class="label-text mb-1 block font-medium">Tambah Produk</label>
                    <select id="tambahProduk" bind:value={produkDipilih} class="select select-bordered select-sm w-full">
                        <option value="">Pilih produk</option>
                        {#each daftarProduk as produk}
                            <option value={String(produk.ID)}>{produk.NAMA}</option>
                        {/each}
                    </select>
                </div>
                <button type="button" onclick={tambahItem} class="btn btn-sm btn-primary">Tambah Item</button>
            </div>

            <div class="mt-3">
                <label for="alasanUbah" class="label-text mb-1 block font-medium">Alasan (opsional)</label>
                <input id="alasanUbah" type="text" bind:value={alasanUbah} class="input input-bordered input-sm w-full" placeholder="Contoh: Pelanggan menambah pesanan lewat WhatsApp"/>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
                <button type="button" onclick={simpanUbah} class="btn btn-sm btn-primary" disabled={sedangMenyimpan}>
                    {sedangMenyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onclick={batalUbah} class="btn btn-sm btn-ghost" disabled={sedangMenyimpan}>Batal</button>
            </div>
        {:else if terpilih && !terpilih.VALID}
            <div class="mt-4">
                <button type="button" onclick={mulaiUbah} class="btn btn-sm btn-primary">Ubah Pesanan</button>
            </div>
        {:else if terpilih}
            <p class="mt-4 text-sm text-base-content/70">
                Pesanan ini sudah diverifikasi, jadi tidak bisa diubah atau dihapus lagi.
                Angkanya sudah masuk ke laporan kinerja sales.
            </p>
        {/if}

        {#if riwayat.length > 0}
            <div class="divider my-3"></div>

            <h4 class="mb-2 font-bold">Riwayat Perubahan</h4>
            <div class="flex flex-col gap-3">
                {#each riwayat as catatan}
                    <div class="rounded-lg border border-base-300 p-3">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge badge-ghost">{catatan.AKSI}</span>
                            <span class="text-sm font-medium">{catatan.OPERATOR}</span>
                            <span class="text-sm text-base-content/60">{Carbon(catatan.CREATED_AT, "timestamp")}</span>
                        </div>
                        {#if catatan.ALASAN}
                            <p class="mt-2 text-sm"><span class="font-medium">Alasan:</span> {catatan.ALASAN}</p>
                        {/if}
                        {#if catatan.CATATAN_SISTEM}
                            <p class="mt-2 whitespace-pre-line text-sm text-base-content/70">{catatan.CATATAN_SISTEM}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</Drawer>
```

- [ ] **Step 4: Hide Hapus on a verified order**

In the table body, the delete button currently shows for every row. Wrap it so a verified order offers neither action:

```svelte
                                        {#if data.VALID === null}
                                            <button type="button" onclick={() => removeItem(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-error">
                                                <img src="/icons/Delete.svg" alt="Hapus Pesanan" height="16"/>
                                            </button>
                                            <button type="button" onclick={() => isValid(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-primary">
                                                <img src="/icons/Add.svg" alt="Validasi Pesanan" height="20"/>
                                            </button>
                                        {:else}
                                            <button type="button" class="btn btn-sm btn-success">Verified</button>
                                        {/if}
```

This replaces the existing delete button and the `{#if data.VALID === null}` block around the validate button — the delete button moves inside that same condition.

- [ ] **Step 5: Check types**

Run: `cd "D:/Coedes/Production/me" && npm run check`
Expected: `0 ERRORS 6 WARNINGS`. Anything more is a regression to fix before committing.

- [ ] **Step 6: Commit**

```bash
git add src/routes/ud84/panel/pesanan/+page.svelte
git commit -m "Edit an unverified order from the panel

The detail drawer becomes an editor: header fields, quantities, removals
and additions, saved together in one request. Picking a product already
on the order adds to that line, because two lines for one product is a
state the backend refuses -- it should not be reachable.

A verified order offers neither Ubah nor Hapus, and says why. Lines whose
product no longer exists show in red with only Hapus available, which is
the only way out of such an order.

The audit trail sits below, the same panel the Transaksi drawer uses."
```

---

### Task 7: Browser verification and the runbook

**Files:**
- Create: `me/docs/deployment/2026-08-06-ud84-perbaikan-pesanan-deploy.md`
- Temporary (do not commit): a CDP script under the scratchpad

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Start the servers and point the frontend at the local backend**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan route:clear && php artisan serve --port=8000   # background
cd "D:/Coedes/Production/me" && npm run dev                                                        # background
```

Then set `isProduction` to `false` in `me/src/library/resources/phraseBox.ts`. **Restore it with `git checkout -- src/library/resources/phraseBox.ts` when finished** — editing it with `sed` rewrites the file's line endings.

- [ ] **Step 2: Seed an order to edit**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
\$kode = 'verify'.uniqid();
DB::table('ud84_pesanan_rekap')->insert(['NAMA'=>'Pelanggan Verifikasi','WHATSAPP'=>'08123456789','SALES'=>null,'CATATAN'=>'Cek editor','VALID'=>null,'KODE'=>\$kode,'CREATED_AT'=>now()]);
\$produk = DB::table('ud84_master_produk')->orderBy('ID')->first(['ID','NAMA']);
DB::table('ud84_pesanan_detail')->insert(['KODE'=>\$kode,'KODE_ITEM'=>\$produk->ID,'JUMLAH'=>3,'CREATED_AT'=>now()]);
echo \$kode.' | '.\$produk->NAMA;"
```

- [ ] **Step 3: Drive the flow in headless Chrome**

Launch Chrome headless with CDP open:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new \
  --remote-debugging-port=9222 \
  --user-data-dir="<scratchpad>/chrome-profile" \
  --window-size=1440,1000 --no-first-run --disable-gpu about:blank
```

Drive it from Node — version 24 has a global `WebSocket`, so no puppeteer and nothing to install. Save this driver to the scratchpad as `cdp.mjs`:

```javascript
import { writeFileSync } from 'node:fs';

const HOST = 'http://127.0.0.1:9222';

export class Session {
    constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }

    static async open(url) {
        const tab = await (await fetch(`${HOST}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
        const s = new Session(ws);
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id && s.pending.has(msg.id)) {
                const { ok, no } = s.pending.get(msg.id);
                s.pending.delete(msg.id);
                msg.error ? no(new Error(JSON.stringify(msg.error))) : ok(msg.result);
            }
        };
        s.tabId = tab.id;
        await s.send('Page.enable');
        await s.send('Runtime.enable');
        return s;
    }

    send(method, params = {}) {
        const id = ++this.id;
        return new Promise((ok, no) => {
            this.pending.set(id, { ok, no });
            this.ws.send(JSON.stringify({ id, method, params }));
            setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); no(new Error(`timeout: ${method}`)); } }, 30000);
        });
    }

    async eval(expression) {
        const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
        return r.result.value;
    }

    async goto(url) {
        await this.send('Page.navigate', { url });
        await this.waitFor(`document.readyState === 'complete'`);
    }

    async waitFor(expr, { timeout = 15000 } = {}) {
        const started = Date.now();
        while (Date.now() - started < timeout) {
            try { if (await this.eval(`!!(${expr})`)) return true; } catch { /* mid-navigation */ }
            await new Promise(r => setTimeout(r, 250));
        }
        throw new Error(`waitFor timed out: ${expr}`);
    }

    async clickText(selector, text) {
        const done = await this.eval(`(() => {
            const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
                .find(e => e.textContent.trim().includes(${JSON.stringify(text)}));
            if (!el) return false;
            el.click();
            return true;
        })()`);
        if (!done) throw new Error(`no ${selector} containing "${text}"`);
    }

    /** bind:value ignores a bare assignment -- Svelte listens for the event. */
    async type(selector, value) {
        await this.eval(`(() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            el.value = ${JSON.stringify(value)};
            el.dispatchEvent(new Event('input', { bubbles: true }));
        })()`);
    }

    async screenshot(path) {
        const r = await this.send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path, Buffer.from(r.data, 'base64'));
    }

    async close() { this.ws.close(); await fetch(`${HOST}/json/close/${this.tabId}`); }
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
```

Then a script that walks the flow. **Open `about:blank` first and navigate afterwards** — `localStorage` on a tab opened directly at a URL throws `SecurityError`:

```javascript
import { Session, sleep } from './cdp.mjs';

const APP = 'http://localhost:5173';
const OUT = '<scratchpad>';

const s = await Session.open('about:blank');
await s.goto(`${APP}/ud84/panel`);
await s.eval(`localStorage.setItem('Auth', JSON.stringify({ name: 'Ibu Heridawati', privilege: 'Administrator' }))`);
await s.goto(`${APP}/ud84/panel/pesanan`);
await s.waitFor(`document.body.innerText.includes('Pelanggan Verifikasi')`);

// Open the seeded order's drawer: the view button is the last action button.
await s.eval(`(() => {
    const row = [...document.querySelectorAll('tbody tr')].find(r => r.innerText.includes('Pelanggan Verifikasi'));
    row.querySelectorAll('button')[row.querySelectorAll('button').length - 1].click();
})()`);
await s.waitFor(`document.querySelector('.drawer.open')`);
await sleep(600);
await s.screenshot(`${OUT}/01-drawer.png`);

await s.clickText('.drawer button', 'Ubah Pesanan');
await s.waitFor(`document.querySelector('#ubahNama')`);

await s.type('#ubahNama', 'Pelanggan Sudah Dikoreksi');
await s.eval(`(() => {
    const qty = document.querySelector('.drawer input[type=number]');
    qty.value = '5';
    qty.dispatchEvent(new Event('input', { bubbles: true }));
})()`);

// Add the second product in the picker, then save.
await s.eval(`(() => {
    const pick = document.querySelector('#tambahProduk');
    pick.value = [...pick.options].filter(o => o.value !== '')[1].value;
    pick.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await s.clickText('.drawer button', 'Tambah Item');
await s.type('#alasanUbah', 'Pelanggan menambah pesanan lewat WhatsApp');
await s.clickText('.drawer button', 'Simpan Perubahan');

await s.waitFor(`document.querySelector('.drawer').innerText.includes('Riwayat Perubahan')`);
await sleep(1000);
await s.screenshot(`${OUT}/02-after-edit.png`);

console.log(await s.eval(`(() => {
    const drawer = document.querySelector('.drawer').innerText.replace(/\\s+/g, ' ');
    return {
        namaBaru: drawer.includes('Pelanggan Sudah Dikoreksi'),
        riwayat: drawer.includes('Riwayat Perubahan'),
        operator: drawer.includes('Ibu Heridawati'),
        perubahan: drawer.includes('Jumlah'),
        baris: document.querySelectorAll('.drawer tbody tr').length,
    };
})()`));

await s.close();
```

Assert, with screenshots at each step:

1. The seeded order appears; its **view** button opens the drawer showing the header and one line at quantity 3.
2. **Ubah Pesanan** turns the header into inputs. Setting a value needs a real event: `el.value = x; el.dispatchEvent(new Event('input', { bubbles: true }))` — Svelte's `bind:value` ignores a bare assignment.
3. Change the customer name, set the quantity to 5, add a second product, save.
4. The success toast appears; the drawer reloads showing quantity 5 and two lines; **Riwayat Perubahan** lists the operator, the reason if given, and a change list naming the quantity change and the addition.
5. Verify the order from the list, reopen it: **Ubah Pesanan** and the delete button are both gone, replaced by the explanation.

- [ ] **Step 4: Confirm the database agrees**

The order is found by the name it was seeded with, so nothing has to be pasted between steps:

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
\$kode = DB::table('ud84_pesanan_rekap')->where('KODE','like','verify%')->orderByDesc('ID')->value('KODE');
echo json_encode(DB::table('ud84_pesanan_rekap')->where('KODE',\$kode)->first()).PHP_EOL;
foreach(DB::table('ud84_pesanan_detail')->where('KODE',\$kode)->get() as \$d){ echo json_encode(\$d).PHP_EOL; }
foreach(DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI',\$kode)->get() as \$l){ echo \$l->AKSI.' | '.\$l->OPERATOR.' | '.\$l->CATATAN_SISTEM.PHP_EOL; }"
```

Expected: the edited header, the reconciled lines, and one `Edit Pesanan` audit row whose `CATATAN_SISTEM` matches what the drawer showed.

- [ ] **Step 5: Clean up**

Delete the seeded order, its lines and its audit rows. Stop the servers and Chrome. Restore `phraseBox.ts` with `git checkout --`. Confirm `git status --short` shows only intended files.

- [ ] **Step 6: Write the runbook**

Create `me/docs/deployment/2026-08-06-ud84-perbaikan-pesanan-deploy.md` covering:

- **No SQL at all.** This stage adds no schema. It does require `ud84_transaksi_log`, which ships with the cancel-invoice release — **that release must be live first**, or every edit fails on an insert into a table that does not exist.
- Backend files: `app/Http/Controllers/UD84/Pesanan.php` and `routes/api.php`, built with `git archive` from `main` so uncommitted work cannot leak. Note that `routes/api.php` still needs `app/Http/Controllers/POS/EMoney.php` beside it, for the reason given in the cancel runbook.
- **`php artisan route:clear` is mandatory** — two new routes.
- Frontend: confirm `isProduction = true`, merge, push, let Vercel build.
- Verification on production: edit a real unverified order, confirm the change list in Riwayat, confirm a verified order offers neither Ubah nor Hapus.
- Rollback: re-upload the previous `Pesanan.php` and `routes/api.php`, clear the route cache. No data migration to undo; audit rows written in the meantime are harmless and worth keeping.
- Known limits: editing is unverified-only and panel-only; a line whose product was deleted can only be removed, not corrected; deleting an order is still permanent, though now recorded.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/me"
git add docs/deployment/2026-08-06-ud84-perbaikan-pesanan-deploy.md
git commit -m "Add the deployment guide for perbaikan pesanan

No schema of its own, but it depends on ud84_transaksi_log, so the
cancel-invoice release has to be live first -- otherwise every edit fails
on an insert into a table that does not exist. Route cache clear is
mandatory again; two new routes."
```

---

## Definition of Done

- `php artisan test` → 81 passed, 1 failed (the pre-existing `ExampleTest` on `GET /`)
- `npm run check` → 0 errors, 6 warnings
- The flow walked in a real browser, with the database confirmed to agree afterwards
- `phraseBox.ts` reads `isProduction = true` in every commit
- Both repos clean; local database left as it was found
- Handoff updated: Stage 2 done, Stage 3 next
