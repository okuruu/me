# UD84 Nota & Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Print the UD84 nota correctly on both DL (110×220mm) and 58mm thermal paper, with per-line units, a QRIS block, a compact signature, and totals that actually reconcile.

**Architecture:** The nota route becomes a thin container that fetches once, owns a `DL | Thermal` toggle, and injects the `@page` rule; two sibling components render the two papers. All money is derived server-side in `Report::getInvoices` and returned as a `ringkasan` block, so the two layouts cannot disagree and the arithmetic is covered by PHPUnit against the real database.

**Tech Stack:** SvelteKit 2 / Svelte 5 (runes), Tailwind 3 + DaisyUI 4, Laravel 11.45.1, MySQL/MariaDB, PHPUnit.

**Spec:** `me/docs/superpowers/specs/2026-08-05-ud84-nota-print-design.md`

## Global Constraints

- **Two repos.** Frontend is `D:\Coedes\Production\me`, backend is `D:\Coedes\Production\Marmyadose`. They are separate git repos; commit in each independently.
- **`Marmyadose` has unrelated uncommitted work** (`POS/EMoney.php`, `Kosada/Kredit.php`, `POS/Transaksi.php`, `routes/api.php`, `routes/web.php`, `app/DTO/*`, `app/Models/Kosada/`). **Never use `git add -A` or `git commit -a` in `Marmyadose`.** Stage only the exact paths named in each task.
- **Never use `RefreshDatabase` in a test.** It runs `migrate:fresh`, which drops every `ud84_*` table. None of them are covered by migrations, so they would not come back. Use `Illuminate\Foundation\Testing\DatabaseTransactions`.
- **Never run `php artisan migrate`** against `dao` or production. `artisan` has never been run on either database, so there is no `migrations` table, and running it would fire Laravel's three default migrations and collide with the existing `users` table. Schema changes are applied by executing the `.sql` file directly.
- **Local database:** `127.0.0.1:3306`, database `dao`, user `root`, password `root`. `.env` already points at it.
- **Pre-existing test failure:** `php artisan test` reports 1 passed / 1 failed before any work starts — `ExampleTest::test_the_application_returns_a_successful_response` fails on `GET /`. It is unrelated. Do not fix it, and do not count it as a regression.
- **API path prefix is `/api`** — routes in `routes/api.php` are served at `/api/UD84/...`.
- **App locale is `id`**, so `Carbon::translatedFormat('d F Y')` yields `05 Agustus 2026`.
- **Currency:** `rupiahFormatter` (existing) prints `Rp 1.802.000`. `numberFormatter` (added in Task 6) prints `1.802.000`.
- **Indonesian UI copy.** All customer-facing and operator-facing strings are Indonesian, matching the existing pages.

---

## File Structure

**Backend (`Marmyadose`)**

| File | Responsibility |
|---|---|
| `database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql` | The statement actually executed, locally and on production |
| `database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php` | Version-control record of the same change; never executed |
| `app/Http/Controllers/UD84/Report.php` | `getInvoices`: units, corrected line arithmetic, `ringkasan`, not-found guard |
| `app/Http/Controllers/UD84/Penjualan.php` | `postPenjualan`: persist `SATUAN`, return `UNIQUE` |
| `tests/Feature/UD84/GetInvoicesTest.php` | Covers every figure the nota prints |
| `tests/Feature/UD84/PostPenjualanTest.php` | Covers unit persistence and the returned identifier |

**Frontend (`me`)**

| File | Responsibility |
|---|---|
| `src/components/content/ud84/nota/types.ts` | Shared `Receipt` / `Detail` / `Ringkasan` / `Rekap` interfaces |
| `src/components/content/ud84/nota/NotaDL.svelte` | 110×220mm layout, self-contained print CSS |
| `src/components/content/ud84/nota/NotaThermal.svelte` | 58mm layout, self-contained print CSS |
| `src/routes/ud84/panel/nota/[id]/+page.svelte` | Fetch, paper toggle, `@page` injection, thermal height measurement |
| `src/routes/ud84/+layout.svelte` | Suppress wrapper background and toaster when printing |
| `src/routes/ud84/panel/retail/+page.svelte` | Offer the nota after a completed sale |
| `src/library/utils/useFormat.ts` | Add `numberFormatter` |
| `scripts/generate-qris-placeholder.php` | Regenerate the placeholder image |
| `static/images/qris.png` | The placeholder itself; overwritten by the real QRIS |

---

## Task 1: SATUAN column

**Files:**
- Create: `Marmyadose/database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql`
- Create: `Marmyadose/database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php`

**Interfaces:**
- Consumes: nothing
- Produces: column `ud84_penjualan_detail.SATUAN varchar(20) NULL`, read by Task 2 and written by Task 3

- [ ] **Step 1: Confirm the column does not already exist**

```bash
cd "D:/Coedes/Production/Marmyadose"
php artisan tinker --execute="echo implode(',', \Illuminate\Support\Facades\Schema::getColumnListing('ud84_penjualan_detail'));"
```

Expected: a list **without** `SATUAN`. If `SATUAN` is already present, stop and report — the local database is not in the state this plan assumes.

- [ ] **Step 2: Write the SQL file**

Create `Marmyadose/database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql`:

```sql
-- UD84 Nota & Print — unit of sale on each sales detail line.
--
-- Apply this in phpMyAdmin BEFORE deploying the matching backend code.
-- postPenjualan writes SATUAN and getInvoices reads it; without the column
-- every sale and every nota fails.
--
-- Do NOT run `php artisan migrate` on this database. There is no migrations
-- table, so Laravel's three default migrations would run and collide with the
-- existing `users` table.

ALTER TABLE `ud84_penjualan_detail`
  ADD COLUMN `SATUAN` varchar(20) DEFAULT NULL AFTER `NAMA`;
```

- [ ] **Step 3: Write the migration file**

Create `Marmyadose/database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Version-control record for the SATUAN column.
 *
 * This migration is intentionally NOT executed. Neither the local `dao`
 * database nor production has a `migrations` table, so running `artisan
 * migrate` would also run Laravel's default migrations and collide with the
 * existing `users` table. The change is applied by executing
 * database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql directly.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ud84_penjualan_detail', function (Blueprint $table) {
            $table->string('SATUAN', 20)->nullable()->after('NAMA');
        });
    }

    public function down(): void
    {
        Schema::table('ud84_penjualan_detail', function (Blueprint $table) {
            $table->dropColumn('SATUAN');
        });
    }
};
```

- [ ] **Step 4: Apply the SQL to the local database**

```bash
cd "D:/Coedes/Production/Marmyadose"
php -r "
\$p = new PDO('mysql:host=127.0.0.1;port=3306;dbname=dao','root','root');
\$p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
\$p->exec(file_get_contents('database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql'));
echo 'applied'.PHP_EOL;
"
```

Expected: `applied`

- [ ] **Step 5: Verify the column landed with the right type and position**

```bash
php artisan tinker --execute="
foreach (DB::select('SHOW COLUMNS FROM ud84_penjualan_detail') as \$c) {
    echo \$c->Field.' '.\$c->Type.' null='.\$c->Null.PHP_EOL;
}"
```

Expected: `SATUAN varchar(20) null=YES`, positioned immediately after `NAMA`.

- [ ] **Step 6: Verify existing rows survived as NULL**

```bash
php artisan tinker --execute="
echo 'rows: '.DB::table('ud84_penjualan_detail')->count().PHP_EOL;
echo 'null SATUAN: '.DB::table('ud84_penjualan_detail')->whereNull('SATUAN')->count().PHP_EOL;"
```

Expected: both numbers equal (56 rows, 56 null).

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/Marmyadose"
git add database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql database/migrations/2026_08_05_000000_add_satuan_to_ud84_penjualan_detail.php
git commit -m "Add SATUAN column to ud84_penjualan_detail

Records the unit each line was sold in. Nullable so the 56 existing rows
stay valid and render as a dash on reprints.

Applied via raw SQL, not artisan migrate: neither database has a
migrations table, so migrate would run Laravel's defaults and collide
with the existing users table."
```

---

## Task 2: getInvoices — units, corrected arithmetic, ringkasan, not-found guard

**Files:**
- Create: `Marmyadose/tests/Feature/UD84/GetInvoicesTest.php`
- Modify: `Marmyadose/app/Http/Controllers/UD84/Report.php:238-268` (`getInvoices`)

**Interfaces:**
- Consumes: `ud84_penjualan_detail.SATUAN` from Task 1
- Produces: `GET /api/UD84/Get-Invoices/{ID}` responding with
  `data.data[] = { QUANTITY:int, NAMA:string, SATUAN:string|null, HARGA:int, JUMLAH:int }`
  and `data.ringkasan = { TOTAL_BARANG:int, POTONGAN:int, TOTAL_TAGIHAN:int, CASH:int, DP:int, SISA:int, KEMBALIAN:int }`.
  Tasks 5, 6 and 7 render these fields.

- [ ] **Step 1: Record the test baseline**

```bash
cd "D:/Coedes/Production/Marmyadose"
php artisan test 2>&1 | tail -5
```

Expected: `Tests: 1 failed, 1 passed`. Write the number down; it must not get worse.

- [ ] **Step 2: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/GetInvoicesTest.php`:

```php
<?php

namespace Tests\Feature\UD84;

use DB;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

/**
 * DatabaseTransactions — NOT RefreshDatabase. RefreshDatabase would run
 * migrate:fresh and drop every ud84_* table; none are covered by migrations,
 * so they would not come back.
 */
class GetInvoicesTest extends TestCase
{
    use DatabaseTransactions;

    private function seedInvoice(array $rekap = [], array $details = []): string
    {
        $unique = 'test'.uniqid();

        DB::table('ud84_penjualan_rekap')->insert(array_merge([
            'UNIQUE'     => $unique,
            'NAMA'       => 'UMUM',
            'CASH'       => 0,
            'KEMBALIAN'  => 0,
            'DP'         => 0,
            'POTONGAN'   => 0,
            'TOTAL'      => 0,
            'MEMBER'     => 'UMUM',
            'CREATED_AT' => '2026-08-05 10:00:00',
        ], $rekap));

        foreach ($details as $detail) {
            DB::table('ud84_penjualan_detail')->insert(array_merge([
                'UNIQUE'          => $unique,
                'KODE'            => 1,
                'NAMA'            => 'BARANG TES',
                'SATUAN'          => null,
                'JUMLAH'          => 1,
                'HARGA_ASLI'      => 0,
                'HARGA_TERJUAL'   => 0,
                'POTONGAN_PERSEN' => 0,
                'POTONGAN_RUPIAH' => 0,
                'CREATED_AT'      => '2026-08-05 10:00:00',
            ], $detail));
        }

        return $unique;
    }

    private function fetch(string $unique): array
    {
        return $this->getJson('/api/UD84/Get-Invoices/'.$unique)->json('data');
    }

    /**
     * Mirrors real row 64ca60eb59cb1: 100 units at 8.000 = 800.000.
     * The old code printed Harga 800.000 and Jumlah 80.000.000.
     */
    public function test_line_total_is_not_multiplied_by_quantity_twice(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 800000],
            [['JUMLAH' => 100, 'HARGA_ASLI' => 8000, 'HARGA_TERJUAL' => 800000]]
        );

        $line = $this->fetch($unique)['data'][0];

        $this->assertSame(8000, $line['HARGA']);
        $this->assertSame(800000, $line['JUMLAH']);
        $this->assertSame($line['JUMLAH'], $line['HARGA'] * $line['QUANTITY']);
    }

    /** Both discount columns are per-unit rupiah values. */
    public function test_unit_price_subtracts_both_discount_columns(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 1010000],
            [[
                'JUMLAH' => 2, 'HARGA_ASLI' => 518000, 'HARGA_TERJUAL' => 1010000,
                'POTONGAN_PERSEN' => 10000, 'POTONGAN_RUPIAH' => 3000,
            ]]
        );

        $line = $this->fetch($unique)['data'][0];

        $this->assertSame(505000, $line['HARGA']);
        $this->assertSame(1010000, $line['JUMLAH']);
    }

    public function test_satuan_is_returned_when_present(): void
    {
        $unique = $this->seedInvoice([], [['SATUAN' => 'Set']]);

        $this->assertSame('Set', $this->fetch($unique)['data'][0]['SATUAN']);
    }

    public function test_satuan_is_null_for_legacy_rows(): void
    {
        $unique = $this->seedInvoice([], [['SATUAN' => null]]);

        $this->assertNull($this->fetch($unique)['data'][0]['SATUAN']);
    }

    public function test_ringkasan_without_potongan(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 100000, 'POTONGAN' => 0],
            [['JUMLAH' => 1, 'HARGA_ASLI' => 100000, 'HARGA_TERJUAL' => 100000]]
        );

        $ringkasan = $this->fetch($unique)['ringkasan'];

        $this->assertSame(100000, $ringkasan['TOTAL_BARANG']);
        $this->assertSame(0, $ringkasan['POTONGAN']);
        $this->assertSame(100000, $ringkasan['TOTAL_TAGIHAN']);
    }

    public function test_ringkasan_with_potongan_reports_net_total(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 1752000, 'POTONGAN' => 50000],
            [['JUMLAH' => 1, 'HARGA_ASLI' => 1802000, 'HARGA_TERJUAL' => 1802000]]
        );

        $ringkasan = $this->fetch($unique)['ringkasan'];

        $this->assertSame(1802000, $ringkasan['TOTAL_BARANG']);
        $this->assertSame(50000, $ringkasan['POTONGAN']);
        $this->assertSame(1752000, $ringkasan['TOTAL_TAGIHAN']);
    }

    public function test_sisa_tagihan_when_underpaid(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 1752000, 'CASH' => 1600000, 'DP' => 100000]
        );

        $ringkasan = $this->fetch($unique)['ringkasan'];

        $this->assertSame(52000, $ringkasan['SISA']);
        $this->assertSame(0, $ringkasan['KEMBALIAN']);
    }

    public function test_kembalian_when_overpaid(): void
    {
        $unique = $this->seedInvoice(['TOTAL' => 100000, 'CASH' => 150000]);

        $ringkasan = $this->fetch($unique)['ringkasan'];

        $this->assertSame(50000, $ringkasan['KEMBALIAN']);
        $this->assertSame(0, $ringkasan['SISA']);
    }

    /**
     * Real row 27: CASH 0, DP 17500, TOTAL 17500, stored KEMBALIAN -17500.
     * Fully paid via DP; the stored column ignores DP and must not be used.
     */
    public function test_dp_counts_as_payment_and_stored_kembalian_is_ignored(): void
    {
        $unique = $this->seedInvoice(
            ['TOTAL' => 17500, 'CASH' => 0, 'DP' => 17500, 'KEMBALIAN' => -17500]
        );

        $ringkasan = $this->fetch($unique)['ringkasan'];

        $this->assertSame(0, $ringkasan['SISA']);
        $this->assertSame(0, $ringkasan['KEMBALIAN']);
    }

    public function test_unknown_invoice_returns_error_instead_of_crashing(): void
    {
        $response = $this->getJson('/api/UD84/Get-Invoices/tidak-ada-nota');

        $response->assertStatus(200);
        $response->assertJson(['status' => 'error']);
        $this->assertNull($response->json('data'));
    }
}
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
php artisan test --filter=GetInvoicesTest
```

Expected: FAIL. `test_unknown_invoice_returns_error_instead_of_crashing` errors on a null property access; the arithmetic and `ringkasan` tests fail on wrong or missing keys.

- [ ] **Step 4: Rewrite `getInvoices`**

Replace `getInvoices` in `Marmyadose/app/Http/Controllers/UD84/Report.php` (currently lines 238-268) with:

```php
    public function getInvoices($ID){
        $dataRekap = DB::table('ud84_penjualan_rekap')->where('UNIQUE',$ID)->first();

        if (empty($dataRekap)) {
            return response()->json([
                "status"    => "error",
                "message"   => "Nota tidak ditemukan."
            ],200);
        }

        $dataDetail = DB::table('ud84_penjualan_detail')->where('UNIQUE',$ID)->get();
        $dataMember = DB::table('ud84_member')->where('NAMA', $dataRekap->NAMA)->first();

        $listDetail = [];
        $totalSum   = [];
        foreach($dataDetail as $data){
            // HARGA_TERJUAL is the line total, not a unit price. Rebuild the
            // unit price from the discount columns rather than dividing, so
            // HARGA * QUANTITY always reproduces JUMLAH exactly.
            $hargaSatuan = (int)$data->HARGA_ASLI - (int)$data->POTONGAN_PERSEN - (int)$data->POTONGAN_RUPIAH;

            $listDetail[] = [
                "QUANTITY"  => (int)$data->JUMLAH,
                "NAMA"      => $data->NAMA,
                "SATUAN"    => $data->SATUAN,
                "HARGA"     => $hargaSatuan,
                "JUMLAH"    => (int)$data->HARGA_TERJUAL
            ];
            $totalSum[] = (int)$data->HARGA_TERJUAL;
        }

        $totalBarang  = array_sum($totalSum);
        $potongan     = (int)($dataRekap->POTONGAN ?? 0);
        $totalTagihan = (int)($dataRekap->TOTAL ?? 0);
        $cash         = (int)($dataRekap->CASH ?? 0);
        $dp           = (int)($dataRekap->DP ?? 0);
        $dibayar      = $cash + $dp;

        return response()->json([
            "status" => "success",
            "message" => "Loaded",
            "data"  => [
                "tanggal"   => !empty($dataRekap->CREATED_AT) ? Carbon::parse($dataRekap->CREATED_AT)->translatedFormat('d F Y') : Carbon::now()->translatedFormat('d F Y'),
                "tuan"      => $dataRekap->NAMA ?? '-',
                "total"     => $totalBarang,
                "data"      => $listDetail,
                "ringkasan" => [
                    // rekap.TOTAL is already net of POTONGAN (see postPenjualan).
                    // Stored rekap.KEMBALIAN ignores DP and is deliberately unused.
                    "TOTAL_BARANG"  => $totalBarang,
                    "POTONGAN"      => $potongan,
                    "TOTAL_TAGIHAN" => $totalTagihan,
                    "CASH"          => $cash,
                    "DP"            => $dp,
                    "SISA"          => max(0, $totalTagihan - $dibayar),
                    "KEMBALIAN"     => max(0, $dibayar - $totalTagihan),
                ],
                "rekap"     => $dataRekap,
                "alamat"    => empty($dataMember->ALAMAT) ? '-' : $dataMember->ALAMAT,
                "point"     => empty($dataMember->POINT) ? 0 : $dataMember->POINT
            ]
        ],200);
    }
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
php artisan test --filter=GetInvoicesTest
```

Expected: PASS, 10 tests.

- [ ] **Step 6: Confirm no regression in the wider suite**

```bash
php artisan test 2>&1 | tail -5
```

Expected: 11 passed, 1 failed — the same pre-existing `ExampleTest` failure from Step 1, nothing new.

- [ ] **Step 7: Check the fix against real production-shaped data**

```bash
php artisan tinker --execute="
\$r = app()->call([new App\Http\Controllers\UD84\Report, 'getInvoices'], ['ID' => '64ca60eb59cb1']);
\$d = \$r->getData(true)['data'];
foreach (\$d['data'] as \$line) {
    echo \$line['NAMA'].' qty='.\$line['QUANTITY'].' harga='.\$line['HARGA'].' jumlah='.\$line['JUMLAH'];
    echo (\$line['HARGA'] * \$line['QUANTITY'] === \$line['JUMLAH']) ? '  OK' : '  MISMATCH';
    echo PHP_EOL;
}
echo 'TOTAL_BARANG='.\$d['ringkasan']['TOTAL_BARANG'].' TOTAL_TAGIHAN='.\$d['ringkasan']['TOTAL_TAGIHAN'].PHP_EOL;"
```

Expected: every line `OK`, `harga=8000 jumlah=800000` and `harga=23000 jumlah=575000`, `TOTAL_BARANG=1375000` matching `TOTAL_TAGIHAN=1375000`.

- [ ] **Step 8: Commit**

```bash
cd "D:/Coedes/Production/Marmyadose"
git add app/Http/Controllers/UD84/Report.php tests/Feature/UD84/GetInvoicesTest.php
git commit -m "Fix nota figures and return unit plus payment summary

getInvoices treated HARGA_TERJUAL as a unit price when it stores the
line total, so the Jumlah column multiplied quantity in twice. Real
transaction 64ca60eb59cb1 printed line totals of 80.000.000 and
14.375.000 under a footer of 1.375.000.

Also adds a ringkasan block so the nota can show the invoice-level
POTONGAN it previously ignored, and an outstanding balance for the QRIS
to settle. Stored KEMBALIAN is unusable there because it ignores DP.

Unknown invoice IDs now return an error instead of dereferencing null."
```

---

## Task 3: postPenjualan — persist SATUAN, return UNIQUE

**Files:**
- Create: `Marmyadose/tests/Feature/UD84/PostPenjualanTest.php`
- Modify: `Marmyadose/app/Http/Controllers/UD84/Penjualan.php:61-109`

**Interfaces:**
- Consumes: `ud84_penjualan_detail.SATUAN` from Task 1
- Produces: `POST /api/UD84/Penjualan/Saving-Receipt` returning `data.UNIQUE` (string), consumed by Task 8

- [ ] **Step 1: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/PostPenjualanTest.php`:

```php
<?php

namespace Tests\Feature\UD84;

use DB;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

/**
 * DatabaseTransactions — NOT RefreshDatabase. The controller opens its own
 * transaction; MySQL nests that as a savepoint and the outer rollback still
 * removes everything this test writes.
 */
class PostPenjualanTest extends TestCase
{
    use DatabaseTransactions;

    private function seedProduct(string $tipe, int $perItem = 10): object
    {
        $id = DB::table('ud84_master_produk')->insertGetId([
            'NAMA'            => 'PRODUK TES '.uniqid(),
            'STOK'            => 1000,
            'TIPE'            => $tipe,
            'STATUS_JUAL'     => 'Katalog dan Penjualan',
            'DISTRIBUTOR'     => 'TES',
            'HARGA_PABRIK'    => 5000,
            'HARGA_JUAL'      => 10000,
            'JUMLAH_PER_ITEM' => $perItem,
            'HARGA_PER_ITEM'  => 1200,
        ]);

        return DB::table('ud84_master_produk')->where('ID', $id)->first();
    }

    private function sell(object $product, string $tipeJual): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/api/UD84/Penjualan/Saving-Receipt', [
            'MEMBER'      => 'UMUM',
            'DP'          => 0,
            'CASH'        => 20000,
            'POTONGAN'    => 0,
            'JATUH_TEMPO' => null,
            'TOTAL'       => 20000,
            'KETERANGAN'  => 'Test',
            'CART'        => [[
                'ID'              => $product->ID,
                'NAMA'            => $product->NAMA,
                'QUANTITY'        => 2,
                'TOTAL'           => 20000,
                'HARGA_ASLI'      => 10000,
                'POTONGAN_PERSEN' => 0,
                'POTONGAN_RUPIAH' => 0,
                'TIPE'            => $tipeJual,
            ]],
        ]);
    }

    public function test_response_returns_the_transaction_unique(): void
    {
        $product  = $this->seedProduct('Set');
        $response = $this->sell($product, 'Satuan');

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);

        $unique = $response->json('data.UNIQUE');
        $this->assertIsString($unique);
        $this->assertNotEmpty($unique);
        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique]);
    }

    public function test_satuan_sale_stores_the_master_unit(): void
    {
        $product = $this->seedProduct('Set');
        $unique  = $this->sell($product, 'Satuan')->json('data.UNIQUE');

        $line = DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->first();

        $this->assertSame('Set', $line->SATUAN);
    }

    public function test_pieces_sale_stores_pcs(): void
    {
        $product = $this->seedProduct('Karton');
        $unique  = $this->sell($product, 'Pieces')->json('data.UNIQUE');

        $line = DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->first();

        $this->assertSame('Pcs', $line->SATUAN);
    }

    /** Selling one Satuan must still deduct JUMLAH_PER_ITEM pieces. */
    public function test_stock_arithmetic_is_unchanged(): void
    {
        $product = $this->seedProduct('Set', 10);
        $this->sell($product, 'Satuan');

        $after = DB::table('ud84_master_produk')->where('ID', $product->ID)->first();

        $this->assertSame(1000 - (2 * 10), (int)$after->STOK);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd "D:/Coedes/Production/Marmyadose"
php artisan test --filter=PostPenjualanTest
```

Expected: FAIL — `data.UNIQUE` is null and `SATUAN` is null. `test_stock_arithmetic_is_unchanged` should already PASS; it is a guard against breaking behaviour while moving the lookup.

- [ ] **Step 3: Move the product lookup above the insert and store the unit**

In `Marmyadose/app/Http/Controllers/UD84/Penjualan.php`, replace the body of the `foreach($request->input('CART') as $data){ ... }` loop (currently lines 61-103) with:

```php
            foreach($request->input('CART') as $data){
                // Looked up before the insert: the detail row now records the
                // unit as well, not just the stock update further down.
                $item     = DB::table('ud84_master_produk')->where('NAMA',$data['NAMA'])->first();
                $tipeItem = $data['TIPE'];

                DB::table('ud84_penjualan_detail')->insert([
                    "UNIQUE"          => $uniqueID,
                    "KODE"            => $data['ID'],
                    "NAMA"            => $data['NAMA'],
                    "SATUAN"          => $tipeItem === 'Pieces' ? 'Pcs' : ($item->TIPE ?? null),
                    "JUMLAH"          => $data['QUANTITY'],
                    "HARGA_ASLI"      => $data['HARGA_ASLI'],
                    "HARGA_TERJUAL"   => $data['TOTAL'],
                    "POTONGAN_PERSEN" => $data['POTONGAN_PERSEN'],
                    "POTONGAN_RUPIAH" => $data['POTONGAN_RUPIAH'],
                ]);

                $logEntries = [];

                if($tipeItem == 'Pieces'){
                    $stokDecrease = [
                        "STOK"  => $item->STOK - $data['QUANTITY']
                    ];
                } else if($tipeItem == 'Satuan'){
                    $stokDecrease = [
                        "STOK"  => $item->STOK - ( $data['QUANTITY'] * $item->JUMLAH_PER_ITEM )
                    ];
                }

                $logEntries[] = [
                    "KODE_ITEM"  => $data['ID'],
                    "NAMA_ITEM"  => $data['NAMA'],
                    "ASAL"       => 'Retail',
                    "MASUK"      => 0,
                    "KELUAR"     => $item->STOK - $stokDecrease['STOK'],
                    "STOK_FINAL" => $stokDecrease['STOK'],
                    "CREATED_AT" => now()
                ];

                if (!empty($logEntries)) {
                    DB::table('ud84_logs')->insert($logEntries);
                }

                DB::table('ud84_master_produk')->where('NAMA',$data['NAMA'])->update($stokDecrease);
            }
```

- [ ] **Step 4: Return the transaction identifier**

In the same file, replace the success response (currently lines 106-109) with:

```php
            return response()->json([
                'status'    => 'success',
                'message'   => 'Data tersimpan!',
                'data'      => ['UNIQUE' => $uniqueID]
            ],200);
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
php artisan test --filter=PostPenjualanTest
```

Expected: PASS, 4 tests.

- [ ] **Step 6: Confirm no regression**

```bash
php artisan test 2>&1 | tail -5
```

Expected: 15 passed, 1 failed — still only the pre-existing `ExampleTest` failure.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/Marmyadose"
git add app/Http/Controllers/UD84/Penjualan.php tests/Feature/UD84/PostPenjualanTest.php
git commit -m "Store unit of sale and return the transaction identifier

The POS already sent TIPE with every cart line but it was only used for
stock arithmetic and never persisted, so the nota had no unit to print.
Pieces sales store Pcs, everything else stores the master product's TIPE.

The product lookup moves above the insert since the detail row now needs
it too. Stock arithmetic is unchanged and covered by a test.

postPenjualan also returns the new UNIQUE so the POS can offer to print
the nota it just created."
```

---

## Task 4: QRIS placeholder image

**Files:**
- Create: `me/scripts/generate-qris-placeholder.php`
- Create: `me/static/images/qris.png`

**Interfaces:**
- Consumes: nothing
- Produces: `/images/qris.png`, referenced by Tasks 6 and 7

- [ ] **Step 1: Write the generator**

Create `me/scripts/generate-qris-placeholder.php`:

```php
<?php
/**
 * Generates the QRIS placeholder printed on the UD84 nota.
 *
 * Run from the repo root:  php scripts/generate-qris-placeholder.php
 * Output:                  static/images/qris.png
 *
 * The image is deliberately overprinted with "QRIS PLACEHOLDER" and
 * "BUKAN KODE ASLI" so it cannot be mistaken for a scannable code if it
 * reaches production before the real merchant QRIS is issued.
 *
 * To install the real QRIS: overwrite static/images/qris.png. No code change.
 *
 * This file lives outside static/ on purpose — anything under static/ is
 * served verbatim, and a .php file there would be published as source.
 */

$size    = 600;
$modules = 25;
$font    = __DIR__.'/../static/fonts/Inter-Bold.ttf';
$output  = __DIR__.'/../static/images/qris.png';

if (!extension_loaded('gd')) {
    fwrite(STDERR, "GD extension is required\n");
    exit(1);
}
if (!is_file($font)) {
    fwrite(STDERR, "Font not found: $font\n");
    exit(1);
}

$img   = imagecreatetruecolor($size, $size);
$white = imagecolorallocate($img, 255, 255, 255);
$black = imagecolorallocate($img, 0, 0, 0);
imagefilledrectangle($img, 0, 0, $size, $size, $white);

$cell   = intdiv($size, $modules + 2);
$offset = $cell;

// Deterministic module grid, so regenerating produces an identical file.
mt_srand(8484);
for ($y = 0; $y < $modules; $y++) {
    for ($x = 0; $x < $modules; $x++) {
        if (mt_rand(0, 1) === 1) {
            imagefilledrectangle(
                $img,
                $offset + $x * $cell,
                $offset + $y * $cell,
                $offset + ($x + 1) * $cell - 1,
                $offset + ($y + 1) * $cell - 1,
                $black
            );
        }
    }
}

// Position markers, as on a real QR code.
$marker = function (int $px, int $py) use ($img, $cell, $black, $white): void {
    imagefilledrectangle($img, $px, $py, $px + 7 * $cell, $py + 7 * $cell, $black);
    imagefilledrectangle($img, $px + $cell, $py + $cell, $px + 6 * $cell, $py + 6 * $cell, $white);
    imagefilledrectangle($img, $px + 2 * $cell, $py + 2 * $cell, $px + 5 * $cell, $py + 5 * $cell, $black);
};
$marker($offset, $offset);
$marker($offset + ($modules - 7) * $cell, $offset);
$marker($offset, $offset + ($modules - 7) * $cell);

// Warning band across the middle.
$bandTop    = intdiv($size, 2) - 60;
$bandBottom = $bandTop + 120;
imagefilledrectangle($img, 0, $bandTop, $size, $bandBottom, $white);
imagefilledrectangle($img, 0, $bandTop, $size, $bandTop + 4, $black);
imagefilledrectangle($img, 0, $bandBottom - 4, $size, $bandBottom, $black);

$centre = function (string $text, int $pt, int $baseline) use ($img, $font, $black, $size): void {
    $box   = imagettfbbox($pt, 0, $font, $text);
    $width = $box[2] - $box[0];
    imagettftext($img, $pt, 0, intdiv($size - $width, 2), $baseline, $black, $font, $text);
};
$centre('QRIS PLACEHOLDER', 30, $bandTop + 52);
$centre('BUKAN KODE ASLI', 22, $bandTop + 96);

imagepng($img, $output);
imagedestroy($img);

echo "written: $output\n";
```

- [ ] **Step 2: Run it**

```bash
cd "D:/Coedes/Production/me"
php scripts/generate-qris-placeholder.php
```

Expected: `written: .../static/images/qris.png`

- [ ] **Step 3: Verify the image**

```bash
php -r "\$s = getimagesize('static/images/qris.png'); echo \$s[0].'x'.\$s[1].' '.\$s['mime'].PHP_EOL;"
```

Expected: `600x600 image/png`

- [ ] **Step 4: Confirm the warning text is legible**

Open `me/static/images/qris.png` and read it. Both lines must be clearly readable. If the text is clipped or overlaps the module grid, adjust the `$pt` sizes in `$centre(...)` and regenerate. Do not proceed with an image whose warning cannot be read — the whole point is that it can never be mistaken for a real code.

- [ ] **Step 5: Commit**

```bash
cd "D:/Coedes/Production/me"
git add scripts/generate-qris-placeholder.php static/images/qris.png
git commit -m "Add QRIS placeholder image and its generator

Overprinted with BUKAN KODE ASLI so it cannot be mistaken for scannable
if it reaches production before the real merchant QRIS is issued.
Installing the real one is a straight file overwrite, no code change.

Generator lives outside static/ because static/ is served verbatim."
```

---

## Task 5: Shared nota types

**Files:**
- Create: `me/src/components/content/ud84/nota/types.ts`

**Interfaces:**
- Consumes: the `getInvoices` response shape from Task 2
- Produces: `Receipt`, `Detail`, `Ringkasan`, `Rekap`, `emptyReceipt` — imported by Tasks 6, 7 and 8

- [ ] **Step 1: Write the types**

Create `me/src/components/content/ud84/nota/types.ts`:

```ts
export interface Detail {
    QUANTITY: number;
    NAMA: string;
    SATUAN: string | null;
    HARGA: number;
    JUMLAH: number;
}

/**
 * Every figure the totals block prints, derived server-side in
 * Report::getInvoices so DL and thermal cannot disagree.
 *
 * TOTAL_TAGIHAN is rekap.TOTAL, which is already net of POTONGAN.
 * SISA and KEMBALIAN are derived from CASH + DP; the stored
 * rekap.KEMBALIAN ignores DP and is not used.
 */
export interface Ringkasan {
    TOTAL_BARANG: number;
    POTONGAN: number;
    TOTAL_TAGIHAN: number;
    CASH: number;
    DP: number;
    SISA: number;
    KEMBALIAN: number;
}

export interface Rekap {
    ID: number;
    UNIQUE: string;
    NAMA: string;
    CASH: number;
    DP: number;
    JATUH_TEMPO: string | null;
    KETERANGAN: string | null;
    TOTAL: number;
    CREATED_AT: string;
    UPDATED_AT: string | null;
}

export interface Receipt {
    tanggal: string;
    tuan: string;
    alamat: string;
    point: number;
    total: number;
    data: Detail[];
    ringkasan: Ringkasan;
    rekap: Rekap;
}

export const emptyReceipt: Receipt = {
    tanggal: '',
    tuan: '',
    alamat: '',
    point: 0,
    total: 0,
    data: [],
    ringkasan: {
        TOTAL_BARANG: 0,
        POTONGAN: 0,
        TOTAL_TAGIHAN: 0,
        CASH: 0,
        DP: 0,
        SISA: 0,
        KEMBALIAN: 0
    },
    rekap: {
        ID: 0,
        UNIQUE: '',
        NAMA: '',
        CASH: 0,
        DP: 0,
        JATUH_TEMPO: null,
        KETERANGAN: null,
        TOTAL: 0,
        CREATED_AT: '',
        UPDATED_AT: null
    }
};
```

- [ ] **Step 2: Record the svelte-check baseline, then verify no new errors**

```bash
cd "D:/Coedes/Production/me"
npm run check 2>&1 | tail -5
```

Record the error/warning counts. This is the baseline for every later frontend task; it must not get worse.

- [ ] **Step 3: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/components/content/ud84/nota/types.ts
git commit -m "Add shared nota types

Ringkasan mirrors the server-derived totals block so both paper layouts
render the same figures from the same source."
```

---

## Task 6: DL layout and container

**Files:**
- Create: `me/src/components/content/ud84/nota/NotaDL.svelte`
- Modify: `me/src/routes/ud84/panel/nota/[id]/+page.svelte` (full rewrite, currently 191 lines)

**Interfaces:**
- Consumes: `Receipt`, `emptyReceipt` (Task 5); `/images/qris.png` (Task 4); `GET UD84/Get-Invoices/{ID}` (Task 2)
- Produces: a container exposing `paper: 'DL' | 'Thermal'` and a `thermalNode` binding that Task 7 attaches its layout to

- [ ] **Step 1: Write the DL layout**

Create `me/src/components/content/ud84/nota/NotaDL.svelte`:

```svelte
<script lang="ts">
    import { rupiahFormatter } from "../../../../library/utils/useFormat";
    import type { Receipt } from "./types";

    let { receipt }: { receipt: Receipt } = $props();
</script>

<div class="nota-dl">
    <div class="flex items-start justify-between gap-3">
        <h2 class="text-xl font-extrabold text-error">UD84</h2>
        <span>WhatsApp Admin <b class="font-extrabold">0858-5500-9169</b></span>
    </div>

    <div class="mt-2 space-y-1">
        <div>Pelanggan: <b>{receipt.tuan}</b></div>
        <div>Alamat: <b>{receipt.alamat}</b></div>
        <div>Tanggal: <b>{receipt.tanggal}</b></div>
        <div>Poin Anda: <b>{receipt.point}</b></div>
    </div>

    <div class="divider my-2"></div>

    <table class="table table-sm w-full">
        <thead>
            <tr class="font-bold">
                <th class="text-center">Qty</th>
                <th>Satuan</th>
                <th>Nama Barang</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            {#each receipt.data as item}
                <tr>
                    <td class="text-center">{item.QUANTITY}</td>
                    <td>{item.SATUAN ?? '-'}</td>
                    <td>{item.NAMA}</td>
                    <td class="text-right">{rupiahFormatter.format(item.HARGA)}</td>
                    <td class="text-right">{rupiahFormatter.format(item.JUMLAH)}</td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5" class="text-center">Tidak ada rincian barang</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="divider my-2"></div>

    <div class="space-y-1">
        {#if receipt.ringkasan.POTONGAN > 0}
            <div class="flex justify-between gap-3">
                <span>Total Barang</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.TOTAL_BARANG)}</span>
            </div>
            <div class="flex justify-between gap-3">
                <span>Potongan</span>
                <span>− {rupiahFormatter.format(receipt.ringkasan.POTONGAN)}</span>
            </div>
            <div class="flex justify-between gap-3 border-t border-base-300 pt-1 font-bold">
                <span>Total Tagihan</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.TOTAL_TAGIHAN)}</span>
            </div>
        {:else}
            <div class="flex justify-between gap-3 font-bold">
                <span>Total</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.TOTAL_TAGIHAN)}</span>
            </div>
        {/if}

        {#if receipt.ringkasan.CASH > 0}
            <div class="flex justify-between gap-3">
                <span>Pembayaran Cash</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.CASH)}</span>
            </div>
        {/if}
        {#if receipt.ringkasan.DP > 0}
            <div class="flex justify-between gap-3">
                <span>Pembayaran DP</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.DP)}</span>
            </div>
        {/if}
        {#if receipt.ringkasan.SISA > 0}
            <div class="flex justify-between gap-3 border-t border-base-300 pt-1 font-bold text-error">
                <span>Sisa Tagihan</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.SISA)}</span>
            </div>
        {/if}
        {#if receipt.ringkasan.KEMBALIAN > 0}
            <div class="flex justify-between gap-3 border-t border-base-300 pt-1 font-bold">
                <span>Kembalian</span>
                <span>{rupiahFormatter.format(receipt.ringkasan.KEMBALIAN)}</span>
            </div>
        {/if}
    </div>

    <div class="mt-3 flex flex-col items-center">
        <img src="/images/qris.png" alt="QRIS" class="qris" />
        <span class="mt-1 text-[7pt]">Scan untuk pembayaran QRIS</span>
    </div>

    <div class="mt-4 text-right">
        <div>Malang, {receipt.tanggal}</div>
        <div>Penerima,</div>
        <div class="mt-10">(__________________)</div>
    </div>
</div>

<style>
    .nota-dl {
        font-size: 9pt;
        line-height: 1.35;
        font-variant-numeric: tabular-nums;
    }
    .qris {
        width: 28mm;
        height: 28mm;
    }
    @media print {
        .nota-dl {
            width: 98mm;
            /* Without this the browser drops the QRIS and rule fills as
               background decoration when printing. */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
</style>
```

- [ ] **Step 2: Rewrite the container**

Replace `me/src/routes/ud84/panel/nota/[id]/+page.svelte` entirely with:

```svelte
<script lang="ts">
    import { onMount, tick } from "svelte";
    import { useFetch } from "../../../../../library/hooks/db";
    import NotaDl from "../../../../../components/content/ud84/nota/NotaDL.svelte";
    import { emptyReceipt, type Receipt } from "../../../../../components/content/ud84/nota/types";

    let { data } = $props();

    type Paper = "DL" | "Thermal";

    const STORAGE_KEY = "ud84-nota-paper";
    const DL_RULE = "@page { size: 110mm 220mm; margin: 6mm; }";

    let receipt: Receipt = $state(emptyReceipt);
    let loading: boolean = $state(true);
    let notFound: boolean = $state(false);

    let paper: Paper = $state("DL");
    let pageRule: string = $state(DL_RULE);

    onMount(async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "DL" || stored === "Thermal") {
            paper = stored;
        }

        // useFetch returns response.data, or undefined when the API replies
        // with status "error" (no data key), or null on a network failure.
        const response = await useFetch(`UD84/Get-Invoices/${data.id}`);

        if (!response) {
            notFound = true;
            loading = false;
            return;
        }

        receipt = response;
        loading = false;
    });

    function selectPaper(next: Paper): void {
        paper = next;
        localStorage.setItem(STORAGE_KEY, next);
    }

    async function printDl(): Promise<void> {
        selectPaper("DL");
        pageRule = DL_RULE;
        await tick();
        window.print();
    }
</script>

<svelte:head>
    {@html `<style>${pageRule}</style>`}
</svelte:head>

<div class="mx-auto w-full max-w-md px-4 py-8 sm:px-0">
    <div class="card bg-base-100 shadow-sm print:shadow-none">
        <div class="card-body print:p-0">

            <div class="no-print mb-4 flex flex-wrap items-center justify-end gap-2">
                <button type="button" class="btn btn-sm btn-primary" onclick={printDl}>
                    <img src="/icons/Printer.svg" class="h-5 w-5" alt="" />
                    Cetak DL
                </button>
            </div>

            {#if loading}
                <p class="text-center text-base-content/60">Memuat nota…</p>
            {:else if notFound}
                <p class="text-center font-bold text-error">Nota tidak ditemukan.</p>
            {:else}
                <NotaDl receipt={receipt} />
            {/if}

        </div>
    </div>
</div>

<style>
    @media print {
        .no-print, .no-print * {
            display: none !important;
        }
    }
</style>
```

- [ ] **Step 3: Verify svelte-check has not regressed**

```bash
cd "D:/Coedes/Production/me"
npm run check 2>&1 | tail -5
```

Expected: no worse than the Task 5 Step 2 baseline.

- [ ] **Step 4: Verify the DL nota in the browser**

```bash
cd "D:/Coedes/Production/me"
npm run dev
```

In a second terminal, serve the API:

```bash
cd "D:/Coedes/Production/Marmyadose"
php artisan serve
```

Open `http://localhost:5173/ud84/panel/nota/64ca60eb59cb1` and confirm on screen:

- two item rows, `Saos Tiga Anak Lombok` at Qty 100 / Harga Rp 8.000 / Jumlah Rp 800.000, and `Kecap Bader` at Qty 25 / Rp 23.000 / Rp 575.000
- **`Harga × Qty` equals `Jumlah` on every row** — this is the defect being fixed
- a single `Total` line of Rp 1.375.000 (this invoice has no POTONGAN)
- Satuan column shows `-` for both rows (legacy data)
- the QRIS placeholder renders with its warning text readable

- [ ] **Step 5: Verify the DL print output**

Press Ctrl+P. In print preview confirm:

- paper is 110×220mm (choose a custom/DL size if the dialog offers a picker; the `@page` rule sets it for the output regardless)
- the print buttons are gone
- the item table is not clipped horizontally
- the signature block reads `Malang, <date>` / `Penerima,` / `(__________________)`, right-aligned

- [ ] **Step 6: Verify the not-found path**

Open `http://localhost:5173/ud84/panel/nota/tidak-ada-nota`.

Expected: **Nota tidak ditemukan.** in red — not a blank page, not an empty nota.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/components/content/ud84/nota/NotaDL.svelte "src/routes/ud84/panel/nota/[id]/+page.svelte"
git commit -m "Split nota into container plus DL layout

The route becomes a thin container that fetches once, owns the paper
choice and injects the @page rule; DL rendering moves to its own
component. Adds the Satuan column, the QRIS block, the compact
right-aligned signature, and a totals block that shows the invoice-level
potongan and any outstanding balance.

Unknown invoice IDs now render a message instead of an empty nota."
```

---

## Task 7: Thermal layout and paper toggle

**Files:**
- Create: `me/src/components/content/ud84/nota/NotaThermal.svelte`
- Modify: `me/src/library/utils/useFormat.ts`
- Modify: `me/src/routes/ud84/panel/nota/[id]/+page.svelte`

**Interfaces:**
- Consumes: `Receipt` (Task 5), the container from Task 6
- Produces: `numberFormatter` exported from `useFormat.ts`

- [ ] **Step 1: Add the plain number formatter**

In `me/src/library/utils/useFormat.ts`, add below the existing `rupiahFormatter` declaration:

```ts
// Thousands separator without the Rp prefix — 58mm receipts cannot spare
// the horizontal space on item lines.
const numberFormatter = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
});
```

and add it to the export list at the bottom of the file:

```ts
export { likesCount, Carbon, capitalizeEachWord, rupiahFormatter, numberFormatter, currencySanitizer }
```

- [ ] **Step 2: Write the thermal layout**

Create `me/src/components/content/ud84/nota/NotaThermal.svelte`:

```svelte
<script lang="ts">
    import { numberFormatter, rupiahFormatter } from "../../../../library/utils/useFormat";
    import type { Receipt } from "./types";

    let { receipt }: { receipt: Receipt } = $props();
</script>

<div class="nota-thermal">
    <div class="text-center">
        <div class="text-[12pt] font-extrabold">UD84</div>
        <div>WA Admin 0858-5500-9169</div>
    </div>

    <div class="rule"></div>

    <div>Pelanggan : {receipt.tuan}</div>
    <div>Tanggal&nbsp;&nbsp; : {receipt.tanggal}</div>

    <div class="rule"></div>

    {#each receipt.data as item}
        <div class="mt-1">{item.NAMA}</div>
        <div class="flex justify-between gap-2">
            <span>
                {item.QUANTITY}{item.SATUAN ? ` ${item.SATUAN}` : ''} x {numberFormatter.format(item.HARGA)}
            </span>
            <span>{numberFormatter.format(item.JUMLAH)}</span>
        </div>
    {:else}
        <div class="text-center">Tidak ada rincian barang</div>
    {/each}

    <div class="rule"></div>

    {#if receipt.ringkasan.POTONGAN > 0}
        <div class="flex justify-between gap-2">
            <span>Total Barang</span>
            <span>{rupiahFormatter.format(receipt.ringkasan.TOTAL_BARANG)}</span>
        </div>
        <div class="flex justify-between gap-2">
            <span>Potongan</span>
            <span>− {rupiahFormatter.format(receipt.ringkasan.POTONGAN)}</span>
        </div>
    {/if}

    <div class="flex justify-between gap-2 font-bold">
        <span>TOTAL</span>
        <span>{rupiahFormatter.format(receipt.ringkasan.TOTAL_TAGIHAN)}</span>
    </div>

    {#if receipt.ringkasan.CASH > 0}
        <div class="flex justify-between gap-2">
            <span>Tunai</span>
            <span>{rupiahFormatter.format(receipt.ringkasan.CASH)}</span>
        </div>
    {/if}
    {#if receipt.ringkasan.DP > 0}
        <div class="flex justify-between gap-2">
            <span>DP</span>
            <span>{rupiahFormatter.format(receipt.ringkasan.DP)}</span>
        </div>
    {/if}
    {#if receipt.ringkasan.SISA > 0}
        <div class="flex justify-between gap-2 font-bold">
            <span>Sisa Tagihan</span>
            <span>{rupiahFormatter.format(receipt.ringkasan.SISA)}</span>
        </div>
    {/if}
    {#if receipt.ringkasan.KEMBALIAN > 0}
        <div class="flex justify-between gap-2 font-bold">
            <span>Kembalian</span>
            <span>{rupiahFormatter.format(receipt.ringkasan.KEMBALIAN)}</span>
        </div>
    {/if}

    <div class="rule"></div>

    <div class="flex flex-col items-center">
        <img src="/images/qris.png" alt="QRIS" class="qris" />
        <span class="text-[6pt]">Scan untuk pembayaran QRIS</span>
    </div>

    <div class="rule"></div>

    <div class="text-center">
        <div>Malang, {receipt.tanggal}</div>
        <div>Penerima,</div>
        <div class="mt-10">(__________________)</div>
    </div>
</div>

<style>
    .nota-thermal {
        width: 54mm;
        margin: 0 auto;
        font-size: 8pt;
        line-height: 1.3;
        font-variant-numeric: tabular-nums;
    }
    .rule {
        border-top: 1px dashed #000;
        margin: 4px 0;
    }
    .qris {
        width: 35mm;
        height: 35mm;
    }
    @media print {
        .nota-thermal {
            /* Thermal heads are 1-bit; without this the dashed rules and the
               QRIS can be dropped as background decoration. */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
</style>
```

- [ ] **Step 3: Wire the toggle and measured page height into the container**

In `me/src/routes/ud84/panel/nota/[id]/+page.svelte`:

Add the thermal import beside the DL one:

```ts
    import NotaThermal from "../../../../../components/content/ud84/nota/NotaThermal.svelte";
```

Add a node binding beside the other state declarations:

```ts
    let thermalNode: HTMLDivElement | undefined = $state();
```

Add the thermal print handler below `printDl`:

```ts
    /**
     * `@page { size: 58mm auto }` is not valid CSS — the grammar does not allow
     * mixing a length with the auto keyword — and `size: 58mm` alone means a
     * 58x58mm square page, which would slice the receipt into fragments. So the
     * height is measured from the rendered node and written into the rule.
     */
    async function printThermal(): Promise<void> {
        selectPaper("Thermal");
        await tick();

        const heightPx = thermalNode?.getBoundingClientRect().height ?? 0;
        const heightMm = Math.ceil((heightPx / 96) * 25.4) + 6; // + tail feed

        pageRule = `@page { size: 58mm ${heightMm}mm; margin: 2mm; }`;
        await tick();
        window.print();
    }
```

Add the second button inside the `.no-print` toolbar, after the DL button:

```svelte
                <button type="button" class="btn btn-sm btn-secondary" onclick={printThermal}>
                    <img src="/icons/Printer.svg" class="h-5 w-5" alt="" />
                    Cetak 58mm
                </button>
```

Replace the single `<NotaDl receipt={receipt} />` line with the paper switch:

```svelte
                {#if paper === "Thermal"}
                    <div bind:this={thermalNode}>
                        <NotaThermal receipt={receipt} />
                    </div>
                {:else}
                    <NotaDl receipt={receipt} />
                {/if}
```

- [ ] **Step 4: Verify svelte-check has not regressed**

```bash
cd "D:/Coedes/Production/me"
npm run check 2>&1 | tail -5
```

Expected: no worse than the Task 5 Step 2 baseline.

- [ ] **Step 5: Verify the thermal layout on screen**

With `npm run dev` and `php artisan serve` running, open `http://localhost:5173/ud84/panel/nota/64ca60eb59cb1` and click **Cetak 58mm**, then cancel the print dialog.

Confirm on screen:

- the receipt is a narrow single column, roughly 54mm wide
- each item shows its name on one line and `qty x price ... total` on the next
- with legacy null `SATUAN`, the line reads `100 x 8.000` — no stray dash
- Alamat and Poin are absent

- [ ] **Step 6: Verify the thermal print output**

Press **Cetak 58mm** again and inspect print preview:

- the page is a single continuous strip, **not** paginated into squares
- there is no trailing blank page
- the QRIS and signature are inside the strip, not cut off

If the receipt paginates into 58×58mm squares, the height measurement did not reach the `@page` rule — check that `await tick()` runs both before measuring and after assigning `pageRule`.

- [ ] **Step 7: Verify the paper choice persists**

Reload the page. The last-used paper must still be selected. Confirm `localStorage` holds `ud84-nota-paper`.

- [ ] **Step 8: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/components/content/ud84/nota/NotaThermal.svelte src/library/utils/useFormat.ts "src/routes/ud84/panel/nota/[id]/+page.svelte"
git commit -m "Add 58mm thermal nota layout and paper toggle

58mm at 8pt is about 32 characters, so items stack instead of using the
DL table. Alamat and Poin are dropped to save roll.

Page height is measured from the rendered node because size: 58mm auto
is not valid CSS and size: 58mm alone means a 58x58mm square page, which
would slice the receipt into fragments."
```

---

## Task 8: Stop the app chrome printing onto the nota

**Files:**
- Modify: `me/src/routes/ud84/+layout.svelte`

**Interfaces:**
- Consumes: nothing
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Reproduce the problem**

Stop `php artisan serve`, leaving `npm run dev` running. Reload `http://localhost:5173/ud84/panel/nota/64ca60eb59cb1` — the failed fetch raises a connection toast via `handleFetchError`. Press Ctrl+P while that toast is still on screen.

Expected before the fix: the toast appears in print preview, and the page carries the grey `bg-base-200` background.

Restart `php artisan serve` afterwards.

- [ ] **Step 2: Add print-mode neutralisation**

In `me/src/routes/ud84/+layout.svelte`, add to the existing `<style>` block, after the `.ud84-root` rule:

```css
    @media print {
        /* The layout wrapper and the toaster are outside every page's own
           markup, so they print unless suppressed here. */
        .ud84-root {
            min-height: 0;
            background: transparent !important;
        }
        :global([data-sonner-toaster]) {
            display: none !important;
        }
    }
```

- [ ] **Step 3: Verify**

Repeat Step 1. In print preview:

- no toast is visible
- the page background is white, not grey

- [ ] **Step 4: Verify svelte-check has not regressed**

```bash
cd "D:/Coedes/Production/me"
npm run check 2>&1 | tail -5
```

Expected: no worse than the Task 5 Step 2 baseline.

- [ ] **Step 5: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/routes/ud84/+layout.svelte
git commit -m "Keep layout chrome off the printed nota

The /ud84 layout wraps every page in a grey full-height container and
renders the toaster outside the slot, so both printed onto the receipt."
```

---

## Task 9: Offer the nota after a completed sale

**Files:**
- Modify: `me/src/routes/ud84/panel/retail/+page.svelte:182-210` (`doSubmit`)

**Interfaces:**
- Consumes: `data.UNIQUE` from `POST UD84/Penjualan/Saving-Receipt` (Task 3); the nota route (Task 6)
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Confirm the gap**

Make a sale in the running app at `http://localhost:5173/ud84/panel/retail`. Observe that on success the cart clears and there is no way to reach the nota except via Transaksi → date search → Cetak Ulang.

- [ ] **Step 2: Capture the returned identifier and offer the nota**

In `me/src/routes/ud84/panel/retail/+page.svelte`, change the destructure in `doSubmit` from:

```ts
        const { status, message } = await db({
```

to:

```ts
        const { status, message, data } = await db({
```

and replace the success block:

```ts
        masterProduk = await useFetch('UD84/Master-Produk/Retrieve');
        toast.success(message);
        removeAll();
```

with:

```ts
        masterProduk = await useFetch('UD84/Master-Produk/Retrieve');

        const unique = data?.UNIQUE;

        if (unique) {
            toast.success(message, {
                action: {
                    label: 'Cetak Nota',
                    // New tab, so the POS stays on this screen for the next customer.
                    onClick: () => window.open(`/ud84/panel/nota/${unique}`, '_blank')
                }
            });
        } else {
            toast.success(message);
        }

        removeAll();
```

- [ ] **Step 3: Verify svelte-check has not regressed**

```bash
cd "D:/Coedes/Production/me"
npm run check 2>&1 | tail -5
```

Expected: no worse than the Task 5 Step 2 baseline.

- [ ] **Step 4: Verify end to end**

Make a sale with **quantity 2 or more** of a product whose `TIPE` is `Set`, paying **less than the total in cash**.

Then:

1. Click **Cetak Nota** on the success toast — a new tab opens on the nota
2. The Satuan column shows `Set` — this is the first sale to store a unit
3. `Harga × Qty` equals `Jumlah` on that row
4. **Sisa Tagihan** shows the shortfall
5. Print on both papers and confirm both agree on every figure

- [ ] **Step 5: Commit**

```bash
cd "D:/Coedes/Production/me"
git add src/routes/ud84/panel/retail/+page.svelte
git commit -m "Offer the nota straight after a sale

Retail cleared the cart and never surfaced the transaction, so printing
meant opening Transaksi and date-searching for the sale just made. The
two print buttons were unreachable at the point of sale."
```

---

## Deployment

Not a task — this is the handover checklist for shipping to production.

- [ ] Apply `Marmyadose/database/sql/2026_08_05_add_satuan_to_ud84_penjualan_detail.sql` in phpMyAdmin **first**. Backend code deployed before the column exists breaks every sale and every nota.
- [ ] Do **not** run `php artisan migrate` on production.
- [ ] Deploy `Marmyadose` (`Report.php`, `Penjualan.php`).
- [ ] Deploy `me`, including `static/images/qris.png`.
- [ ] Run the post-deploy check from the spec: one sale with quantity above 1, one product sold as `Satuan`, a non-zero `POTONGAN`, and cash below the total. Confirm on both papers that `Harga × Qty = Jumlah` per line, `Total Barang − Potongan = Total Tagihan`, and `Sisa Tagihan` matches what is owed.
- [ ] Replace `static/images/qris.png` with the real merchant QRIS as soon as it is issued. Until then, every printed nota carries a placeholder marked **BUKAN KODE ASLI**.

## Known limitations after this plan

- Reprints of most historical transactions show an empty item table — detail IDs start at 66 against 28 rekap rows locally, so the line data no longer exists. The totals are correct regardless because they come from `rekap.TOTAL`.
- Every pre-existing detail row shows `-` for Satuan. This is by design; the unit was never recorded and cannot be recovered reliably.
- Physical printer behaviour (feed, cut, dithering) is unverified. Chrome print preview at the right page size is a layout proxy only.
