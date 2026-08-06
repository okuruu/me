# UD84 Perbaikan Transaksi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let panel staff correct a completed sale — customer, notes, due date, money, and (where the sale qualifies) its line items — in one atomic save that re-adjusts stock, settles member points, and records what it did.

**Architecture:** One new Laravel endpoint (`POST /UD84/Daftar-Transaksi/Perbaiki`) validates the whole sale, computes a change list, and applies header, money, line, stock and point changes inside a single transaction. Lines are reconciled by row `ID`; stock is netted **per product** before any write. A qualification gate decides whether line editing is offered at all. The nota learns a sale was corrected from the audit row, so nothing ships as schema.

**Tech Stack:** Laravel 11 (query builder, no Eloquent models for `ud84_*`), PHPUnit feature tests with `DatabaseTransactions`, SvelteKit 2 + Svelte 5 runes, DaisyUI/Tailwind, svelte-sonner.

**Spec:** `me/docs/superpowers/specs/2026-08-06-ud84-perbaikan-transaksi-design.md`

## Global Constraints

- **This stage ships no schema.** No `ALTER TABLE`, no new table, no migration. If a task seems to need one, stop and re-read the spec.
- **Never `RefreshDatabase`** in a test — it runs `migrate:fresh`, dropping every `ud84_*` table permanently, none of which are covered by migrations. Use `DatabaseTransactions`.
- **Never `php artisan migrate`.**
- **Never `git add -A` in `Marmyadose`** — it holds unrelated work. Stage by explicit path.
- **`php artisan route:clear` after touching `routes/api.php`**, or the new route 404s with no error on screen.
- **`me/src/library/resources/phraseBox.ts` must read `isProduction = true` in every commit.** Flip to `false` only for local browser testing, and restore with `git checkout -- <file>`, never `sed` (which rewrites CRLF and leaves the file dirty with an empty diff).
- **All API responses use HTTP 200** with `{status, message, data}`; `status: "error"` carries failures. No 4xx.
- **User-facing copy is Indonesian.** Comments and commit messages are English.
- **`npm run check` must stay at 0 errors / 6 warnings.**
- **Backend baseline is 84 passed / 1 failed.** That failure is the pre-existing `ExampleTest` on `GET /`, which also fails on `main`. Do not fix it, do not count it.
- **Two figures are always derived, never accepted from the client:** `HARGA_TERJUAL = (HARGA_ASLI - POTONGAN_PERSEN - POTONGAN_RUPIAH) × JUMLAH`, and `TOTAL = sum(HARGA_TERJUAL) - POTONGAN`.
- **Pieces for stock** are `JUMLAH` when a line's `SATUAN` is `'Pcs'`, and `JUMLAH × JUMLAH_PER_ITEM` otherwise. Getting this wrong is wrong by a factor commonly of ten.
- **Products are identified by `ud84_master_produk.ID`**, stored on a line as `KODE`. Never match by name.

---

## File Structure

| File | Responsibility |
|---|---|
| `Marmyadose/app/Http/Controllers/UD84/Transaksi.php` | Modify. Gains the qualification gate, `perbaikiTransaksi`, and its private helpers, beside the existing cancel machinery it reuses. |
| `Marmyadose/app/Http/Controllers/UD84/Report.php` | Modify. `detailTransaksi` reports whether line editing is allowed; `getInvoices` reports whether the sale was corrected. |
| `Marmyadose/routes/api.php` | Modify. One route line. |
| `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php` | Create. Every test for this stage. |
| `me/src/components/content/ud84/nota/types.ts` | Modify. Two fields on `Receipt`. |
| `me/src/components/content/ud84/nota/NotaDL.svelte` | Modify. Correction banner. |
| `me/src/components/content/ud84/nota/NotaThermal.svelte` | Modify. Correction banner. |
| `me/src/routes/ud84/panel/transaksi/+page.svelte` | Modify. The correction editor in the existing drawer. |
| `me/docs/deployment/2026-08-06-ud84-perbaikan-transaksi-deploy.md` | Create. Runbook — no SQL, three files, one cache clear. |

`Transaksi.php` is 266 lines and will roughly double. That is still one subject — everything that changes a completed sale after the fact — and it keeps the cancel and correction paths, which share the pieces-per-line rule and the audit table, in one file.

`transaksi/+page.svelte` is ~520 lines and will grow by ~200. It stays one file for this stage: the correction editor is tightly coupled to the drawer state it lives in, and splitting it mid-stage would risk more than it saves. **If it passes ~800 lines, the next stage to touch it should extract the drawer into a component.**

---

### Task 1: The qualification gate

Whether a sale can have its lines edited is a question two callers ask — the endpoint, before accepting `ITEMS`, and the detail screen, to decide what to render. It is written once.

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Transaksi.php`
- Modify: `Marmyadose/app/Http/Controllers/UD84/Report.php` (`detailTransaksi`, ~:244-256)
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `Transaksi::syaratUbahItem(string $unique): array` returning `[bool $boleh, ?string $alasan]`. `detailTransaksi`'s response gains `KOREKSI => ['DAPAT_UBAH_ITEM' => bool, 'ALASAN' => string|null]`.

- [ ] **Step 1: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`:

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
class PerbaikanTransaksiTest extends TestCase
{
    use DatabaseTransactions;

    private function seedProduct(array $overrides = []): object
    {
        $id = DB::table('ud84_master_produk')->insertGetId(array_merge([
            'NAMA'            => 'PRODUK KOREKSI '.uniqid(),
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

    private function seedMember(string $nama, int $poin = 0): int
    {
        return (int) DB::table('ud84_member')->insertGetId([
            'NAMA'       => $nama,
            'POINT'      => $poin,
            'CREATED_AT' => '2026-08-06 10:00:00',
        ]);
    }

    /** Lines default to an OLD created date, so date preservation is observable. */
    private function seedSale(array $rekap = [], array $lines = []): string
    {
        $unique = 'koreksi'.uniqid();

        DB::table('ud84_penjualan_rekap')->insert(array_merge([
            'UNIQUE'     => $unique,
            'STATUS'     => 'Aktif',
            'NAMA'       => 'UMUM',
            'CASH'       => 0,
            'KEMBALIAN'  => 0,
            'DP'         => 0,
            'POTONGAN'   => 0,
            'TOTAL'      => 0,
            'MEMBER'     => 'UMUM',
            'POIN'       => 0,
            'CREATED_AT' => '2026-03-01 09:00:00',
        ], $rekap));

        foreach ($lines as $line) {
            DB::table('ud84_penjualan_detail')->insert(array_merge([
                'UNIQUE'          => $unique,
                'KODE'            => null,
                'NAMA'            => 'BARANG TES',
                'SATUAN'          => 'Pcs',
                'JUMLAH'          => 1,
                'HARGA_ASLI'      => 0,
                'HARGA_TERJUAL'   => 0,
                'POTONGAN_PERSEN' => 0,
                'POTONGAN_RUPIAH' => 0,
                'CREATED_AT'      => '2026-03-01 09:00:00',
            ], $line));
        }

        return $unique;
    }

    private function koreksiBlock(string $unique): array
    {
        return $this->getJson('/api/UD84/Daftar-Transaksi/Detail-Transaksi/'.$unique)
            ->assertStatus(200)->json('data.KOREKSI');
    }

    public function test_a_sale_whose_lines_all_resolve_allows_item_editing(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale([], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs', 'JUMLAH' => 2,
        ]]);

        $koreksi = $this->koreksiBlock($unique);

        $this->assertTrue($koreksi['DAPAT_UBAH_ITEM']);
        $this->assertNull($koreksi['ALASAN']);
    }

    public function test_a_line_without_a_unit_blocks_item_editing_and_says_which(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale([], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => null, 'JUMLAH' => 2,
        ]]);

        $koreksi = $this->koreksiBlock($unique);

        $this->assertFalse($koreksi['DAPAT_UBAH_ITEM']);
        $this->assertStringContainsString($produk->NAMA, $koreksi['ALASAN']);
        $this->assertStringContainsString('satuan', $koreksi['ALASAN']);
    }

    public function test_a_line_whose_product_is_gone_blocks_item_editing(): void
    {
        $unique = $this->seedSale([], [[
            'KODE' => 999999, 'NAMA' => 'PRODUK HILANG', 'SATUAN' => 'Pcs', 'JUMLAH' => 1,
        ]]);

        $koreksi = $this->koreksiBlock($unique);

        $this->assertFalse($koreksi['DAPAT_UBAH_ITEM']);
        $this->assertStringContainsString('PRODUK HILANG', $koreksi['ALASAN']);
    }

    public function test_a_line_with_no_product_reference_blocks_item_editing(): void
    {
        $unique = $this->seedSale([], [[
            'KODE' => null, 'NAMA' => 'BARANG LAMA', 'SATUAN' => 'Pcs', 'JUMLAH' => 1,
        ]]);

        $this->assertFalse($this->koreksiBlock($unique)['DAPAT_UBAH_ITEM']);
    }

    public function test_a_sale_with_no_lines_at_all_blocks_item_editing(): void
    {
        $unique = $this->seedSale();

        $this->assertFalse($this->koreksiBlock($unique)['DAPAT_UBAH_ITEM']);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "D:/Coedes/Production/Marmyadose" && php artisan test --filter=PerbaikanTransaksiTest`
Expected: FAIL — `data.KOREKSI` is null, so every assertion on it errors.

- [ ] **Step 3: Write the gate**

Add to `Transaksi.php`, as a **public static** method so `Report` can call it without duplicating the rule (place it directly after `riwayatTransaksi`):

```php
    /**
     * Whether a sale's lines can be edited at all.
     *
     * Editing a line means re-adjusting stock, and that needs two things the
     * older rows do not have: a KODE that still resolves to a product, and a
     * SATUAN saying whether the line was sold loose or as a whole Set/Dus.
     * Without the unit the multiplier is a guess, wrong by JUMLAH_PER_ITEM --
     * commonly ten -- so such a sale gets header and money correction only.
     *
     * Returns [bool $boleh, ?string $alasan]; the reason names the first line
     * that blocks it, because "this sale cannot be edited" without saying why
     * is a dead end for whoever reads it.
     */
    public static function syaratUbahItem(string $unique): array
    {
        $lines = DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->get();

        if ($lines->isEmpty()) {
            return [false, 'Transaksi ini tidak menyimpan rincian item, jadi itemnya tidak bisa diubah.'];
        }

        foreach ($lines as $line) {
            if (empty($line->KODE) || !DB::table('ud84_master_produk')->where('ID', $line->KODE)->exists()) {
                return [false, "Item '{$line->NAMA}' tidak terhubung ke produk yang masih ada, jadi stoknya tidak bisa dihitung ulang."];
            }

            if (empty($line->SATUAN)) {
                return [false, "Item '{$line->NAMA}' tidak mencatat satuan penjualan, jadi jumlah pcs-nya tidak bisa dipastikan."];
            }
        }

        return [true, null];
    }
```

- [ ] **Step 4: Report the gate on the detail screen**

In `Report.php`, add the import beside the others at the top of the file if it is not already there:

```php
use App\Http\Controllers\UD84\Transaksi as UD84_Transaksi;
```

`Report` and `Transaksi` share the `App\Http\Controllers\UD84` namespace, so the import may be unnecessary — check before adding one, and refer to the class as `Transaksi::syaratUbahItem(...)` if so.

Then replace `detailTransaksi`'s body:

```php
    public function detailTransaksi($ID){
        $rekap  = DB::table('ud84_penjualan_rekap')->where('UNIQUE',$ID)->first();
        $detail = DB::table('ud84_penjualan_detail')->where('UNIQUE',$ID)->get();

        // Whether the line editor may be offered at all, and if not, why --
        // decided by Transaksi so the endpoint and this screen cannot disagree.
        [$dapatUbahItem, $alasanKoreksi] = Transaksi::syaratUbahItem($ID);

        return response()->json([
            "status"    => "success",
            "message"   => "Loaded",
            "data"      => [
                "rekap"     => $rekap,
                "detail"    => $detail,
                "KOREKSI"   => [
                    "DAPAT_UBAH_ITEM" => $dapatUbahItem,
                    "ALASAN"          => $alasanKoreksi,
                ]
            ]
        ],200);
    }
```

- [ ] **Step 5: Run the tests**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/UD84/Transaksi.php app/Http/Controllers/UD84/Report.php tests/Feature/UD84/PerbaikanTransaksiTest.php
git commit -m "Decide once whether a sale's items can be corrected

Editing a line means re-adjusting stock, which needs a product that still
resolves and a unit saying whether the line was sold loose or as a whole
Set. Older rows have neither, so they get header and money correction
only.

The rule lives in one place because two callers ask it -- the correction
endpoint before accepting items, and the detail screen to decide what to
render -- and a disagreement between those two would offer an edit the
API then refuses.

The reason names the line that blocks it. 'This cannot be edited' without
saying why is a dead end for whoever reads it."
```

---

### Task 2: Correcting the header and the money

The tier every sale gets. No lines change here, so stock does not move — but `TOTAL`, `KEMBALIAN` and the member's points all do.

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Transaksi.php`
- Modify: `Marmyadose/routes/api.php`
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`

**Interfaces:**
- Consumes: `Transaksi::syaratUbahItem` (Task 1).
- Produces: `POST /api/UD84/Daftar-Transaksi/Perbaiki` taking `KODE, NAMA, KETERANGAN, JATUH_TEMPO, CASH, DP, POTONGAN, ITEMS (optional), OPERATOR, ALASAN`, returning `{status, message, data: {CATATAN: string[], STOK_MINUS: string[]}}`. Private helpers `gagal(string)`, `geserPoin(string, int): array`, `selaraskanPoin(object, string, int): array` returning `['POIN' => int, 'CATATAN' => string[]]`.

- [ ] **Step 1: Write the failing tests**

Append to `PerbaikanTransaksiTest.php`:

```php
    private function perbaiki(string $unique, array $payload = [])
    {
        return $this->postJson('/api/UD84/Daftar-Transaksi/Perbaiki', array_merge([
            'KODE'        => $unique,
            'NAMA'        => 'UMUM',
            'KETERANGAN'  => null,
            'JATUH_TEMPO' => null,
            'CASH'        => 0,
            'DP'          => 0,
            'POTONGAN'    => 0,
            'OPERATOR'    => 'Tester',
            'ALASAN'      => 'Salah input kasir',
        ], $payload));
    }

    public function test_a_header_correction_updates_the_sale_and_records_one_audit_row(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => 'BU EKA', 'KETERANGAN' => 'Antar sore'])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', [
            'UNIQUE' => $unique, 'NAMA' => 'BU EKA', 'KETERANGAN' => 'Antar sore',
        ]);

        $log = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $unique)->get();

        $this->assertCount(1, $log);
        $this->assertSame('Perbaikan', $log[0]->AKSI);
        $this->assertSame('Tester', $log[0]->OPERATOR);
        $this->assertSame('Salah input kasir', $log[0]->ALASAN);
    }

    public function test_the_total_is_recomputed_from_the_stored_lines_and_the_new_potongan(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['TOTAL' => 100000, 'CASH' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['CASH' => 100000, 'POTONGAN' => 10000])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $rekap = DB::table('ud84_penjualan_rekap')->where('UNIQUE', $unique)->first();

        $this->assertSame(90000, (int) $rekap->TOTAL);
        // KEMBALIAN is recomputed the way postPenjualan writes it at sale time.
        $this->assertSame(10000, (int) $rekap->KEMBALIAN);
    }

    public function test_points_settle_the_difference_when_cash_is_corrected(): void
    {
        $memberId = $this->seedMember('BU EKA '.uniqid(), 3);
        $nama     = DB::table('ud84_member')->where('ID', $memberId)->value('NAMA');
        $produk   = $this->seedProduct();
        $unique   = $this->seedSale(['NAMA' => $nama, 'CASH' => 1000000, 'POIN' => 2, 'TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        // 1.500.000 cash earns 3 points; the sale already granted 2, so the
        // member's balance moves by 1, not by 3.
        $this->perbaiki($unique, ['NAMA' => $nama, 'CASH' => 1500000])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(4, (int) DB::table('ud84_member')->where('ID', $memberId)->value('POINT'));
        $this->assertSame(3, (int) DB::table('ud84_penjualan_rekap')->where('UNIQUE', $unique)->value('POIN'));
    }

    public function test_points_move_between_members_when_the_customer_name_is_corrected(): void
    {
        $salahId = $this->seedMember('SALAH ORANG '.uniqid(), 5);
        $benarId = $this->seedMember('ORANG BENAR '.uniqid(), 1);
        $salah   = DB::table('ud84_member')->where('ID', $salahId)->value('NAMA');
        $benar   = DB::table('ud84_member')->where('ID', $benarId)->value('NAMA');
        $produk  = $this->seedProduct();
        $unique  = $this->seedSale(['NAMA' => $salah, 'CASH' => 1000000, 'POIN' => 2, 'TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => $benar, 'CASH' => 1000000])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(3, (int) DB::table('ud84_member')->where('ID', $salahId)->value('POINT'));
        $this->assertSame(3, (int) DB::table('ud84_member')->where('ID', $benarId)->value('POINT'));
    }

    public function test_a_point_deduction_floors_at_zero_and_says_so(): void
    {
        $memberId = $this->seedMember('SALDO TIPIS '.uniqid(), 1);
        $nama     = DB::table('ud84_member')->where('ID', $memberId)->value('NAMA');
        $produk   = $this->seedProduct();
        $unique   = $this->seedSale(['NAMA' => $nama, 'CASH' => 2000000, 'POIN' => 4, 'TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => $nama, 'CASH' => 0])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(0, (int) DB::table('ud84_member')->where('ID', $memberId)->value('POINT'));

        $catatan = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $unique)->value('CATATAN_SISTEM');

        $this->assertStringContainsString('saldo tidak mencukupi', $catatan);
    }

    public function test_a_blank_customer_name_is_stored_as_umum(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'BU EKA', 'TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => '   '])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'NAMA' => 'UMUM']);
    }

    public function test_the_before_and_after_snapshots_are_stored(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'SEBELUM', 'TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => 'SESUDAH']);

        $log     = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $unique)->first();
        $sebelum = json_decode($log->SEBELUM, true);
        $sesudah = json_decode($log->SESUDAH, true);

        $this->assertSame('SEBELUM', $sebelum['rekap']['NAMA']);
        $this->assertSame('SESUDAH', $sesudah['rekap']['NAMA']);
        $this->assertCount(1, $sebelum['detail']);
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: FAIL — `/api/UD84/Daftar-Transaksi/Perbaiki` returns 404.

- [ ] **Step 3: Add the route**

In `routes/api.php`, beneath the existing `/UD84/Daftar-Transaksi/Riwayat` line:

```php
Route::post('/UD84/Daftar-Transaksi/Perbaiki', [UD84_Transaksi::class, 'perbaikiTransaksi']);
```

- [ ] **Step 4: Write the point helpers**

Add to `Transaksi.php`, after `kembalikanPoin`:

```php
    private function gagal(string $pesan)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $pesan,
        ], 200);
    }

    /**
     * Moves one member's balance by a delta, flooring at zero.
     *
     * UMUM is not a member -- it is what a sale with no named customer stores
     * -- so points neither leave it nor arrive at it.
     */
    private function geserPoin(string $nama, int $delta): array
    {
        $catatan = [];
        $nama    = trim($nama);

        if ($delta === 0 || $nama === '' || strtoupper($nama) === 'UMUM') {
            return $catatan;
        }

        $member = DB::table('ud84_member')->whereRaw('TRIM(NAMA) = ?', [$nama])->first();

        if (empty($member)) {
            $catatan[] = "Poin tidak diubah: member '{$nama}' tidak ditemukan.";

            return $catatan;
        }

        $saldo = (int) ($member->POINT ?? 0);
        $baru  = $saldo + $delta;

        if ($baru < 0) {
            $catatan[] = "Poin '{$nama}' hanya dikurangi {$saldo} dari ".abs($delta).' karena saldo tidak mencukupi.';
            $baru      = 0;
        } elseif ($delta > 0) {
            $catatan[] = "Poin '{$nama}' ditambah {$delta}.";
        } else {
            $catatan[] = "Poin '{$nama}' dikurangi ".abs($delta).'.';
        }

        DB::table('ud84_member')->where('ID', $member->ID)->update([
            'POINT'      => $baru,
            'UPDATED_AT' => now(),
        ]);

        return $catatan;
    }

    /**
     * Settles points against the corrected sale.
     *
     * The balance moves by the DIFFERENCE against what this sale already
     * granted, never by the whole amount -- otherwise a correction would grant
     * the points twice. When the customer name changes the sale's points move
     * with it, because points sitting with the wrong person are not fixable any
     * other way short of cancelling the sale.
     *
     * Sales predating the POIN column have it null; what they granted is
     * recomputed from their stored CASH, the same fallback cancellation uses.
     */
    private function selaraskanPoin(object $rekap, string $namaBaru, int $cashBaru): array
    {
        $perPoin  = (int) config('ud84.poin_per_rupiah');
        $poinBaru = ($cashBaru > 0 && $perPoin > 0) ? (int) floor($cashBaru / $perPoin) : 0;

        if ($rekap->POIN !== null) {
            $poinLama = (int) $rekap->POIN;
        } else {
            $cashLama = (int) ($rekap->CASH ?? 0);
            $poinLama = ($cashLama > 0 && $perPoin > 0) ? (int) floor($cashLama / $perPoin) : 0;
        }

        $namaLama = trim((string) ($rekap->NAMA ?? ''));
        $namaBaru = trim($namaBaru);

        if ($namaLama === $namaBaru) {
            $catatan = $this->geserPoin($namaBaru, $poinBaru - $poinLama);
        } else {
            $catatan = array_merge(
                $this->geserPoin($namaLama, -$poinLama),
                $this->geserPoin($namaBaru, $poinBaru)
            );
        }

        return ['POIN' => $poinBaru, 'CATATAN' => $catatan];
    }
```

- [ ] **Step 5: Write `perbaikiTransaksi`, header and money only**

Add to `Transaksi.php` after `riwayatTransaksi`. **Task 3 extends this method**; write it now without the `ITEMS` branch:

```php
    /**
     * Correcting a completed sale, in place. One UNIQUE stays one sale: the
     * receipt number is the customer's reference, and cancel-and-re-ring would
     * change it, move the money into today's revenue, and leave two rows in the
     * books for one corrected quantity.
     */
    public function perbaikiTransaksi(Request $request)
    {
        $kode     = trim((string) $request->input('KODE'));
        $alasan   = trim((string) $request->input('ALASAN'));
        $operator = trim((string) $request->input('OPERATOR'));

        if ($alasan === '') {
            return $this->gagal('Alasan perbaikan wajib diisi.');
        }

        $rekap = DB::table('ud84_penjualan_rekap')->where('UNIQUE', $kode)->first();

        if (empty($rekap)) {
            return $this->gagal('Transaksi tidak ditemukan.');
        }

        if ($rekap->STATUS === 'Dibatalkan') {
            return $this->gagal('Transaksi yang sudah dibatalkan tidak bisa diperbaiki.');
        }

        $namaBaru   = trim((string) $request->input('NAMA'));
        $namaBaru   = $namaBaru === '' ? 'UMUM' : $namaBaru;
        $keterangan = $request->input('KETERANGAN');
        $jatuhTempo = $request->input('JATUH_TEMPO');
        $jatuhTempo = ($jatuhTempo === '' || $jatuhTempo === null) ? null : $jatuhTempo;

        $cash     = (int) $request->input('CASH', 0);
        $dp       = (int) $request->input('DP', 0);
        $potongan = (int) $request->input('POTONGAN', 0);

        if ($cash < 0 || $dp < 0 || $potongan < 0) {
            return $this->gagal('Nominal tidak boleh minus.');
        }

        $detailLama = DB::table('ud84_penjualan_detail')->where('UNIQUE', $kode)->get();
        $totalBarang = 0;

        foreach ($detailLama as $line) {
            $totalBarang += (int) $line->HARGA_TERJUAL;
        }

        if ($potongan > $totalBarang) {
            return $this->gagal('Potongan tidak boleh melebihi total barang.');
        }

        $total = $totalBarang - $potongan;
        // Recomputed exactly as postPenjualan writes it at sale time, so a
        // correction does not introduce a new inconsistency. That stored figure
        // ignores DP and is already wrong for deposit sales; the nota derives
        // its own and does not read it.
        $kembalian = $cash <= 0 ? 0 : $cash - $total;

        $catatan = $this->ringkasPerbaikan($rekap, [
            'NAMA'        => $namaBaru,
            'KETERANGAN'  => $keterangan,
            'JATUH_TEMPO' => $jatuhTempo,
            'CASH'        => $cash,
            'DP'          => $dp,
            'POTONGAN'    => $potongan,
            'TOTAL'       => $total,
        ]);

        if (empty($catatan)) {
            return $this->gagal('Tidak ada perubahan untuk disimpan.');
        }

        DB::beginTransaction();

        try {
            $sebelum = json_encode(['rekap' => $rekap, 'detail' => $detailLama], JSON_UNESCAPED_UNICODE);

            $poin = $this->selaraskanPoin($rekap, $namaBaru, $cash);
            $catatan = array_merge($catatan, $poin['CATATAN']);

            DB::table('ud84_penjualan_rekap')->where('UNIQUE', $kode)->update([
                'NAMA'        => $namaBaru,
                'MEMBER'      => $namaBaru,
                'KETERANGAN'  => $keterangan,
                'JATUH_TEMPO' => $jatuhTempo,
                'CASH'        => $cash,
                'DP'          => $dp,
                'POTONGAN'    => $potongan,
                'TOTAL'       => $total,
                'KEMBALIAN'   => $kembalian,
                'POIN'        => $poin['POIN'],
                'UPDATED_AT'  => now(),
            ]);

            $sesudahRekap  = DB::table('ud84_penjualan_rekap')->where('UNIQUE', $kode)->first();
            $sesudahDetail = DB::table('ud84_penjualan_detail')->where('UNIQUE', $kode)->get();

            DB::table('ud84_transaksi_log')->insert([
                'UNIQUE_TRANSAKSI' => $kode,
                'AKSI'             => 'Perbaikan',
                'OPERATOR'         => $operator !== '' ? $operator : 'Tidak diketahui',
                'ALASAN'           => $alasan,
                'CATATAN_SISTEM'   => implode("\n", $catatan),
                'SEBELUM'          => $sebelum,
                'SESUDAH'          => json_encode(['rekap' => $sesudahRekap, 'detail' => $sesudahDetail], JSON_UNESCAPED_UNICODE),
                'CREATED_AT'       => now(),
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Transaksi berhasil diperbaiki.',
                'data'    => [
                    'CATATAN'    => $catatan,
                    'STOK_MINUS' => [],
                ],
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::info($e);

            return $this->gagal('Perbaikan gagal disimpan, tidak ada perubahan yang tersimpan.');
        }
    }

    /**
     * The header and money half of the change list, built BEFORE anything is
     * written. An empty list is how an edit that changes nothing is caught.
     */
    private function ringkasPerbaikan(object $rekap, array $baru): array
    {
        $catatan = [];

        $teks = [
            'NAMA'        => 'Nama pelanggan',
            'KETERANGAN'  => 'Keterangan',
            'JATUH_TEMPO' => 'Jatuh tempo',
        ];

        foreach ($teks as $kolom => $label) {
            $lama = (string) ($rekap->$kolom ?? '');
            $isi  = (string) ($baru[$kolom] ?? '');

            if ($lama !== $isi) {
                $catatan[] = "{$label}: '{$lama}' -> '{$isi}'";
            }
        }

        $uang = [
            'CASH'     => 'Pembayaran tunai',
            'DP'       => 'DP',
            'POTONGAN' => 'Potongan',
            'TOTAL'    => 'Total',
        ];

        foreach ($uang as $kolom => $label) {
            $lama = (int) ($rekap->$kolom ?? 0);
            $isi  = (int) ($baru[$kolom] ?? 0);

            if ($lama !== $isi) {
                $catatan[] = "{$label}: Rp ".number_format($lama, 0, ',', '.').' -> Rp '.number_format($isi, 0, ',', '.');
            }
        }

        return $catatan;
    }
```

- [ ] **Step 6: Clear routes and run the tests**

Run: `php artisan route:clear && php artisan test --filter=PerbaikanTransaksiTest`
Expected: PASS, 12 tests.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/UD84/Transaksi.php routes/api.php tests/Feature/UD84/PerbaikanTransaksiTest.php
git commit -m "Correct a completed sale's header and money

Every active sale gets this tier, whatever state its line items are in.
TOTAL is recomputed from the stored lines and the corrected potongan, and
KEMBALIAN the same way postPenjualan writes it at sale time, so a
correction does not introduce a new inconsistency.

Points settle the difference against what the sale already granted rather
than being granted again, and they follow a corrected customer name --
points sitting with the wrong person cannot be fixed any other way short
of cancelling the sale. Deductions floor at zero and say so.

The change list is built before anything is written, which is also how an
edit that changes nothing is caught."
```

---

### Task 3: Correcting the lines, and moving the stock

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Transaksi.php` (`perbaikiTransaksi` gains the `ITEMS` branch; two new private helpers)
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`

**Interfaces:**
- Consumes: `syaratUbahItem` (Task 1), `gagal`, `selaraskanPoin`, `ringkasPerbaikan` (Task 2).
- Produces: private helpers `piecesBaris(string $satuan, int $jumlah, object $produk): ?int` and `terapkanStok(array $selisih): array` returning `['CATATAN' => string[], 'MINUS' => string[]]`.

- [ ] **Step 1: Write the failing tests**

Append to `PerbaikanTransaksiTest.php`:

```php
    /** The line ID of a sale's single stored line. */
    private function lineId(string $unique): int
    {
        return (int) DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->value('ID');
    }

    public function test_raising_a_quantity_takes_more_stock_and_recomputes_the_total(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 5, 'HARGA_ASLI' => 50000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(97, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertSame(250000, (int) DB::table('ud84_penjualan_rekap')->where('UNIQUE', $unique)->value('TOTAL'));
        $this->assertSame(250000, (int) DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->value('HARGA_TERJUAL'));
    }

    public function test_lowering_a_quantity_returns_stock(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 1, 'HARGA_ASLI' => 50000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $this->assertSame(101, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
    }

    public function test_a_set_line_moves_stock_by_the_per_item_multiplier(): void
    {
        $produk = $this->seedProduct(['STOK' => 100, 'TIPE' => 'Set', 'JUMLAH_PER_ITEM' => 6]);
        $unique = $this->seedSale(['TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Set',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        // 2 Set -> 3 Set is one more Set, which is six more pieces.
        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Set',
            'JUMLAH' => 3, 'HARGA_ASLI' => 50000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $this->assertSame(94, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
    }

    public function test_stock_nets_across_two_lines_of_the_same_product(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 100000], [
            ['KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs', 'JUMLAH' => 4, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 40000],
            ['KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs', 'JUMLAH' => 6, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 60000],
        ]);

        $ids = DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->orderBy('ID')->pluck('ID')->all();

        // One line up by 3, the other down by 3: ten pieces before, ten after,
        // so stock must not move at all and no log row is written.
        $this->perbaiki($unique, ['ITEMS' => [
            ['ID' => $ids[0], 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs', 'JUMLAH' => 7, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0],
            ['ID' => $ids[1], 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs', 'JUMLAH' => 3, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0],
        ]])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertSame(0, DB::table('ud84_logs')->where('KODE_ITEM', $produk->ID)->where('ASAL', 'Perbaikan Transaksi')->count());
    }

    public function test_a_product_moving_between_lines_returns_one_and_takes_the_other(): void
    {
        $lama = $this->seedProduct(['STOK' => 100]);
        $baru = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 40000], [[
            'KODE' => $lama->ID, 'NAMA' => $lama->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 4, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 40000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $baru->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 4, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $this->assertSame(104, (int) DB::table('ud84_master_produk')->where('ID', $lama->ID)->value('STOK'));
        $this->assertSame(96, (int) DB::table('ud84_master_produk')->where('ID', $baru->ID)->value('STOK'));
    }

    public function test_a_line_can_be_added_and_another_removed(): void
    {
        $lama = $this->seedProduct(['STOK' => 100]);
        $baru = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 40000], [[
            'KODE' => $lama->ID, 'NAMA' => $lama->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 4, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 40000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'KODE_ITEM' => $baru->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 5000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseMissing('ud84_penjualan_detail', ['UNIQUE' => $unique, 'KODE' => $lama->ID]);
        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $unique, 'KODE' => $baru->ID, 'JUMLAH' => 2]);
        $this->assertSame(104, (int) DB::table('ud84_master_produk')->where('ID', $lama->ID)->value('STOK'));
        $this->assertSame(98, (int) DB::table('ud84_master_produk')->where('ID', $baru->ID)->value('STOK'));
        $this->assertSame(10000, (int) DB::table('ud84_penjualan_rekap')->where('UNIQUE', $unique)->value('TOTAL'));
    }

    public function test_a_surviving_line_keeps_its_created_date(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['TOTAL' => 100000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 50000, 'HARGA_TERJUAL' => 100000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 3, 'HARGA_ASLI' => 50000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $line = DB::table('ud84_penjualan_detail')->where('UNIQUE', $unique)->first();

        $this->assertStringStartsWith('2026-03-01', (string) $line->CREATED_AT);
    }

    public function test_stock_may_go_negative_and_is_reported(): void
    {
        $produk = $this->seedProduct(['STOK' => 1]);
        $unique = $this->seedSale(['TOTAL' => 10000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 1, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 10000,
        ]]);

        $response = $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 6, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(-4, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertContains($produk->NAMA, $response->json('data.STOK_MINUS'));
    }

    public function test_a_stock_adjustment_writes_a_log_row_without_touching_the_original(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        DB::table('ud84_logs')->insert([
            'KODE_ITEM' => $produk->ID, 'NAMA_ITEM' => $produk->NAMA, 'ASAL' => 'Retail',
            'MASUK' => 0, 'KELUAR' => 2, 'STOK_FINAL' => 100, 'CREATED_AT' => '2026-03-01 09:00:00',
        ]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 5, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $koreksi = DB::table('ud84_logs')->where('KODE_ITEM', $produk->ID)->where('ASAL', 'Perbaikan Transaksi')->first();

        $this->assertSame(3, (int) $koreksi->KELUAR);
        $this->assertSame(0, (int) $koreksi->MASUK);
        $this->assertSame(97, (int) $koreksi->STOK_FINAL);

        // The sale's original movement is history and stays untouched.
        $asli = DB::table('ud84_logs')->where('KODE_ITEM', $produk->ID)->where('ASAL', 'Retail')->first();

        $this->assertSame(2, (int) $asli->KELUAR);
        $this->assertSame(100, (int) $asli->STOK_FINAL);
    }

    public function test_the_change_list_names_the_stock_movement(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 5, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]]);

        $catatan = DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI', $unique)->value('CATATAN_SISTEM');

        $this->assertStringContainsString("Stok '{$produk->NAMA}' dikurangi 3 pcs (100 -> 97)", $catatan);
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: FAIL — `ITEMS` is currently ignored, so quantities, totals and stock do not move.

- [ ] **Step 3: Write the two stock helpers**

Add to `Transaksi.php`, after `piecesUntukDikembalikan`:

```php
    /**
     * Pieces one line represents. STOK counts pieces, so a line sold as a whole
     * Set/Dus multiplies by JUMLAH_PER_ITEM.
     *
     * Returns null when the product does not record a per-item count and the
     * line is not loose -- the caller refuses rather than guessing, because
     * guessing is wrong by that very multiplier.
     */
    private function piecesBaris(string $satuan, int $jumlah, object $produk): ?int
    {
        if ($satuan === 'Pcs') {
            return $jumlah;
        }

        $perItem = (int) ($produk->JUMLAH_PER_ITEM ?? 0);

        return $perItem > 0 ? $jumlah * $perItem : null;
    }

    /**
     * Applies one net adjustment per product and records each on the stock card.
     *
     * $selisih maps product ID to the change in pieces sold: positive means more
     * goods left the shop, so STOK falls. Netting happens before this is called,
     * which is what makes a product moving between lines safe -- otherwise two
     * lines of one product would each apply their own adjustment and fight.
     *
     * Stock may end below zero. postPenjualan already subtracts without a floor,
     * so refusing here would block a correction that is probably right while
     * leaving the same outcome reachable through the POS; a negative figure is a
     * visible instruction to recount. Every such product is returned so the
     * operator can be told.
     */
    private function terapkanStok(array $selisih): array
    {
        $catatan = [];
        $minus   = [];

        foreach ($selisih as $produkId => $delta) {
            if ($delta === 0) {
                continue;
            }

            $produk = DB::table('ud84_master_produk')->where('ID', $produkId)->first();

            if (empty($produk)) {
                continue;
            }

            $stokAwal = (int) $produk->STOK;
            $stokBaru = $stokAwal - $delta;

            DB::table('ud84_master_produk')->where('ID', $produkId)->update([
                'STOK'       => $stokBaru,
                'UPDATED_AT' => now(),
            ]);

            DB::table('ud84_logs')->insert([
                'KODE_ITEM'  => $produkId,
                'NAMA_ITEM'  => $produk->NAMA,
                'ASAL'       => 'Perbaikan Transaksi',
                'MASUK'      => $delta < 0 ? abs($delta) : 0,
                'KELUAR'     => $delta > 0 ? $delta : 0,
                'STOK_FINAL' => $stokBaru,
                'CREATED_AT' => now(),
            ]);

            $arah      = $delta > 0 ? 'dikurangi' : 'ditambah';
            $catatan[] = "Stok '{$produk->NAMA}' {$arah} ".abs($delta)." pcs ({$stokAwal} -> {$stokBaru}).";

            if ($stokBaru < 0) {
                $minus[] = $produk->NAMA;
            }
        }

        return ['CATATAN' => $catatan, 'MINUS' => $minus];
    }
```

- [ ] **Step 4: Add the `ITEMS` branch to `perbaikiTransaksi`**

Insert this block immediately after the `$potongan < 0` check and **before** `$detailLama` is read, so validation still happens before any write:

```php
        $items = $request->input('ITEMS');

        if ($items !== null) {
            [$boleh, $alasanGate] = self::syaratUbahItem($kode);

            if (!$boleh) {
                return $this->gagal($alasanGate);
            }

            if (!is_array($items) || count($items) === 0) {
                return $this->gagal('Transaksi harus punya minimal satu item. Untuk mengosongkan, batalkan transaksinya.');
            }
        }
```

Then replace the `$totalBarang` calculation and everything downstream of it. The full replacement, from `$detailLama` to the `if (empty($catatan))` guard:

```php
        $detailLama = DB::table('ud84_penjualan_detail')->where('UNIQUE', $kode)->get();

        $idSah      = $detailLama->pluck('ID')->map(fn ($id) => (int) $id)->all();
        $barisBaru  = [];
        $totalBarang = 0;

        if ($items === null) {
            // Header-only correction: the stored lines stand as they are.
            foreach ($detailLama as $line) {
                $totalBarang += (int) $line->HARGA_TERJUAL;
            }
        } else {
            foreach ($items as $item) {
                $id       = isset($item['ID']) && $item['ID'] !== null ? (int) $item['ID'] : null;
                $produkId = (int) ($item['KODE_ITEM'] ?? 0);
                $satuan   = trim((string) ($item['SATUAN'] ?? ''));
                $jumlah   = (int) ($item['JUMLAH'] ?? 0);
                $harga    = (int) ($item['HARGA_ASLI'] ?? 0);
                $persen   = (int) ($item['POTONGAN_PERSEN'] ?? 0);
                $rupiah   = (int) ($item['POTONGAN_RUPIAH'] ?? 0);

                if ($id !== null && !in_array($id, $idSah, true)) {
                    return $this->gagal('Ada baris item yang bukan milik transaksi ini.');
                }

                $produk = DB::table('ud84_master_produk')->where('ID', $produkId)->first();

                if (empty($produk)) {
                    return $this->gagal("Produk dengan kode {$produkId} tidak ditemukan.");
                }

                if ($satuan !== 'Pcs' && $satuan !== (string) ($produk->TIPE ?? '')) {
                    return $this->gagal("Satuan '{$satuan}' tidak berlaku untuk produk '{$produk->NAMA}'.");
                }

                if ($jumlah <= 0) {
                    return $this->gagal("Jumlah item '{$produk->NAMA}' harus lebih dari nol.");
                }

                if ($harga < 0 || $persen < 0 || $rupiah < 0) {
                    return $this->gagal("Harga dan potongan item '{$produk->NAMA}' tidak boleh minus.");
                }

                $hargaSatuan = $harga - $persen - $rupiah;

                if ($hargaSatuan < 0) {
                    return $this->gagal("Potongan item '{$produk->NAMA}' melebihi harganya.");
                }

                $pieces = $this->piecesBaris($satuan, $jumlah, $produk);

                if ($pieces === null) {
                    return $this->gagal("Produk '{$produk->NAMA}' tidak mencatat isi per satuan, jadi stoknya tidak bisa dihitung.");
                }

                $barisBaru[] = [
                    'ID'              => $id,
                    'KODE'            => $produkId,
                    'NAMA'            => $produk->NAMA,
                    'SATUAN'          => $satuan,
                    'JUMLAH'          => $jumlah,
                    'HARGA_ASLI'      => $harga,
                    'POTONGAN_PERSEN' => $persen,
                    'POTONGAN_RUPIAH' => $rupiah,
                    'HARGA_TERJUAL'   => $hargaSatuan * $jumlah,
                    'PIECES'          => $pieces,
                ];

                $totalBarang += $hargaSatuan * $jumlah;
            }
        }

        if ($potongan > $totalBarang) {
            return $this->gagal('Potongan tidak boleh melebihi total barang.');
        }

        $total = $totalBarang - $potongan;
        // Recomputed exactly as postPenjualan writes it at sale time, so a
        // correction does not introduce a new inconsistency. That stored figure
        // ignores DP and is already wrong for deposit sales; the nota derives
        // its own and does not read it.
        $kembalian = $cash <= 0 ? 0 : $cash - $total;

        $catatan = $this->ringkasPerbaikan($rekap, [
            'NAMA'        => $namaBaru,
            'KETERANGAN'  => $keterangan,
            'JATUH_TEMPO' => $jatuhTempo,
            'CASH'        => $cash,
            'DP'          => $dp,
            'POTONGAN'    => $potongan,
            'TOTAL'       => $total,
        ]);

        if ($items !== null) {
            $catatan = array_merge($catatan, $this->ringkasBaris($detailLama, $barisBaru));
        }

        if (empty($catatan)) {
            return $this->gagal('Tidak ada perubahan untuk disimpan.');
        }
```

- [ ] **Step 5: Write the line change list**

Add to `Transaksi.php` after `ringkasPerbaikan`:

```php
    /** The line half of the change list, in the operator's language. */
    private function ringkasBaris($detailLama, array $barisBaru): array
    {
        $catatan = [];
        $lama    = [];

        foreach ($detailLama as $line) {
            $lama[(int) $line->ID] = $line;
        }

        $dipakai = [];

        foreach ($barisBaru as $baris) {
            if ($baris['ID'] === null) {
                $catatan[] = "Item '{$baris['NAMA']}' ditambahkan ({$baris['JUMLAH']} {$baris['SATUAN']})";

                continue;
            }

            $dipakai[] = $baris['ID'];
            $asal      = $lama[$baris['ID']];

            if ((int) $asal->KODE !== $baris['KODE']) {
                $catatan[] = "Item '{$asal->NAMA}' diganti menjadi '{$baris['NAMA']}'";
            }

            if ((int) $asal->JUMLAH !== $baris['JUMLAH'] || (string) $asal->SATUAN !== $baris['SATUAN']) {
                $catatan[] = "Jumlah '{$baris['NAMA']}': {$asal->JUMLAH} {$asal->SATUAN} -> {$baris['JUMLAH']} {$baris['SATUAN']}";
            }

            if ((int) $asal->HARGA_TERJUAL !== $baris['HARGA_TERJUAL']) {
                $catatan[] = "Nilai '{$baris['NAMA']}': Rp ".number_format((int) $asal->HARGA_TERJUAL, 0, ',', '.')
                    .' -> Rp '.number_format($baris['HARGA_TERJUAL'], 0, ',', '.');
            }
        }

        foreach ($lama as $id => $line) {
            if (!in_array($id, $dipakai, true)) {
                $catatan[] = "Item '{$line->NAMA}' dihapus";
            }
        }

        return $catatan;
    }
```

- [ ] **Step 6: Apply the lines and the stock inside the transaction**

In `perbaikiTransaksi`'s `try` block, insert this immediately after `$sebelum` is built and **before** `selaraskanPoin` is called:

```php
            $stok = ['CATATAN' => [], 'MINUS' => []];

            if ($items !== null) {
                // Pieces per product, before and after, netted before anything is
                // written -- a product moving between lines is a return to one and
                // a withdrawal from the other, and two lines of one product must
                // not fight each other.
                $selisih = [];

                foreach ($detailLama as $line) {
                    $produkLama = DB::table('ud84_master_produk')->where('ID', $line->KODE)->first();

                    if (empty($produkLama)) {
                        continue;
                    }

                    $piecesLama = $this->piecesBaris((string) $line->SATUAN, (int) $line->JUMLAH, $produkLama);
                    $selisih[(int) $line->KODE] = ($selisih[(int) $line->KODE] ?? 0) - (int) $piecesLama;
                }

                foreach ($barisBaru as $baris) {
                    $selisih[$baris['KODE']] = ($selisih[$baris['KODE']] ?? 0) + $baris['PIECES'];
                }

                $stok    = $this->terapkanStok($selisih);
                $catatan = array_merge($catatan, $stok['CATATAN']);

                $dipakai = [];

                foreach ($barisBaru as $baris) {
                    $isi = [
                        'KODE'            => $baris['KODE'],
                        'NAMA'            => $baris['NAMA'],
                        'SATUAN'          => $baris['SATUAN'],
                        'JUMLAH'          => $baris['JUMLAH'],
                        'HARGA_ASLI'      => $baris['HARGA_ASLI'],
                        'HARGA_TERJUAL'   => $baris['HARGA_TERJUAL'],
                        'POTONGAN_PERSEN' => $baris['POTONGAN_PERSEN'],
                        'POTONGAN_RUPIAH' => $baris['POTONGAN_RUPIAH'],
                        'UPDATED_AT'      => now(),
                    ];

                    if ($baris['ID'] === null) {
                        DB::table('ud84_penjualan_detail')->insert(array_merge($isi, [
                            'UNIQUE'     => $kode,
                            'CREATED_AT' => now(),
                        ]));

                        continue;
                    }

                    // CREATED_AT deliberately untouched: it is the date this line
                    // reports under.
                    DB::table('ud84_penjualan_detail')->where('ID', $baris['ID'])->update($isi);
                    $dipakai[] = $baris['ID'];
                }

                foreach ($detailLama as $line) {
                    if (!in_array((int) $line->ID, $dipakai, true)) {
                        DB::table('ud84_penjualan_detail')->where('ID', $line->ID)->delete();
                    }
                }
            }
```

Then change the success response's `STOK_MINUS` from the empty array Task 2 wrote to `$stok['MINUS']`.

- [ ] **Step 7: Run the tests**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: PASS, 22 tests.

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/UD84/Transaksi.php tests/Feature/UD84/PerbaikanTransaksiTest.php
git commit -m "Correct a sale's lines, and move the stock to match

Lines are reconciled by row ID, so two lines of one product are legitimate
-- five at full price and two discounted is something the POS produces --
and nothing can collapse them.

Stock nets per product before a single row is written. A product moving
from one line to another is a return to one and a withdrawal from the
other in the same transaction, and two lines of one product cannot fight
each other. Each product gets one adjustment and one stock-card row; the
sale's original movement is history and stays untouched.

Stock may end below zero, and every product it happens to is returned so
the operator can be told. The POS already subtracts without a floor, so
refusing here would block a correction that is probably right while
leaving the same outcome reachable through the till."
```

---

### Task 4: The refusal matrix

**Files:**
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`
- Modify (only if a test proves a guard missing): `Marmyadose/app/Http/Controllers/UD84/Transaksi.php`

**Interfaces:**
- Consumes: `perbaiki()`, `seedSale()`, `seedProduct()`, `lineId()` from Tasks 1-3.
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Append to `PerbaikanTransaksiTest.php`. Each asserts the sale, its lines, the stock and the audit table are all exactly as they were — a guard that refuses *after* writing something is the defect these exist to catch:

```php
    public function test_an_unknown_sale_is_refused(): void
    {
        $this->perbaiki('tidak-ada')->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_a_cancelled_sale_cannot_be_corrected(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['STATUS' => 'Dibatalkan', 'NAMA' => 'ASLI', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => 'DIUBAH'])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'NAMA' => 'ASLI']);
        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_a_blank_reason_is_refused(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'ASLI', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => 'DIUBAH', 'ALASAN' => '   '])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'NAMA' => 'ASLI']);
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_items_are_refused_on_a_sale_that_does_not_qualify(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => null,
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 5, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $unique, 'JUMLAH' => 2]);
        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_a_header_correction_still_works_on_a_sale_that_does_not_qualify(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'ASLI', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => null,
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['NAMA' => 'DIPERBAIKI'])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'NAMA' => 'DIPERBAIKI']);
    }

    public function test_an_empty_item_list_is_refused(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => []])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $unique, 'JUMLAH' => 2]);
    }

    public function test_a_line_id_from_another_sale_is_refused(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $lain   = $this->seedSale(['TOTAL' => 10000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 1, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 10000,
        ]]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($lain), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 9, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $lain, 'JUMLAH' => 1]);
        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
    }

    public function test_an_unknown_product_is_refused(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'KODE_ITEM' => 999999, 'SATUAN' => 'Pcs', 'JUMLAH' => 1,
            'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_a_unit_the_product_does_not_use_is_refused(): void
    {
        $produk = $this->seedProduct(['STOK' => 100, 'TIPE' => 'Set']);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Dus',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
    }

    public function test_a_zero_quantity_is_refused(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 0, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $unique, 'JUMLAH' => 2]);
    }

    public function test_negative_money_is_refused(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'ASLI', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['CASH' => -5000])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_a_potongan_larger_than_the_goods_is_refused(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['POTONGAN' => 25000])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'TOTAL' => 20000]);
    }

    public function test_an_item_discount_larger_than_its_price_is_refused(): void
    {
        $produk = $this->seedProduct(['STOK' => 100]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 8000, 'POTONGAN_RUPIAH' => 5000,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
    }

    public function test_a_product_with_no_per_item_count_cannot_be_sold_by_the_set(): void
    {
        $produk = $this->seedProduct(['STOK' => 100, 'TIPE' => 'Set', 'JUMLAH_PER_ITEM' => 0]);
        $unique = $this->seedSale(['TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        // Pieces would be a guess, and a guess here is wrong by the very
        // multiplier that is missing.
        $this->perbaiki($unique, ['ITEMS' => [[
            'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Set',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
        ]]])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    /**
     * Stock, points, lines and header must go in together or not at all. Every
     * guard runs before the transaction opens, so the only way to prove the
     * rollback is to make a write inside it fail: this listener throws the
     * moment the stock-card insert runs, which is after stock, points and the
     * header have already been written.
     */
    public function test_a_failure_midway_rolls_back_stock_points_lines_and_header(): void
    {
        $memberId = $this->seedMember('MEMBER ROLLBACK '.uniqid(), 5);
        $nama     = DB::table('ud84_member')->where('ID', $memberId)->value('NAMA');
        $produk   = $this->seedProduct(['STOK' => 100]);
        $unique   = $this->seedSale(['NAMA' => $nama, 'CASH' => 1000000, 'POIN' => 2, 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        DB::listen(function ($query) {
            if (str_contains($query->sql, 'insert into `ud84_logs`')) {
                throw new \RuntimeException('kegagalan buatan');
            }
        });

        $this->perbaiki($unique, [
            'NAMA'  => $nama,
            'CASH'  => 1500000,
            'ITEMS' => [[
                'ID' => $this->lineId($unique), 'KODE_ITEM' => $produk->ID, 'SATUAN' => 'Pcs',
                'JUMLAH' => 9, 'HARGA_ASLI' => 10000, 'POTONGAN_PERSEN' => 0, 'POTONGAN_RUPIAH' => 0,
            ]],
        ])->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(100, (int) DB::table('ud84_master_produk')->where('ID', $produk->ID)->value('STOK'));
        $this->assertSame(5, (int) DB::table('ud84_member')->where('ID', $memberId)->value('POINT'));
        $this->assertDatabaseHas('ud84_penjualan_detail', ['UNIQUE' => $unique, 'JUMLAH' => 2]);
        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'CASH' => 1000000, 'POIN' => 2]);
        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
    }

    public function test_a_correction_that_changes_nothing_is_refused(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'UMUM', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        // Every field already holds these values.
        $this->perbaiki($unique)->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertDatabaseMissing('ud84_transaksi_log', ['UNIQUE_TRANSAKSI' => $unique]);
        $this->assertDatabaseHas('ud84_penjualan_rekap', ['UNIQUE' => $unique, 'UPDATED_AT' => null]);
    }
```

- [ ] **Step 2: Run the tests**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: all PASS — Tasks 2 and 3 implemented these guards. **A failure means a real defect in the controller**; fix `Transaksi.php` rather than weakening the test, and say so in your report.

- [ ] **Step 3: Run the whole suite**

Run: `php artisan test`
Expected: 122 passed, 1 failed (the pre-existing `ExampleTest`).

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/UD84/PerbaikanTransaksiTest.php
git commit -m "Cover every refusal a correction can hit

Each case asserts the sale, its lines, the product's stock and the audit
table are all exactly as they were. A guard that returns an error after
having already moved stock is the failure worth catching, and only a
database assertion catches it.

Includes the pair that proves the two tiers are independent: items are
refused on a sale whose lines cannot be resolved, while a header
correction on that same sale still goes through."
```

---

### Task 5: The nota says it was corrected

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Report.php` (`getInvoices`, ~:258-322)
- Modify: `me/src/components/content/ud84/nota/types.ts`
- Modify: `me/src/components/content/ud84/nota/NotaDL.svelte`
- Modify: `me/src/components/content/ud84/nota/NotaThermal.svelte`
- Test: `Marmyadose/tests/Feature/UD84/PerbaikanTransaksiTest.php`

**Interfaces:**
- Consumes: the `Perbaikan` audit row written in Task 2.
- Produces: `getInvoices` response gains `dikoreksi: bool` and `dikoreksi_pada: string|null`; `Receipt` gains the same two fields.

- [ ] **Step 1: Write the failing test**

```php
    public function test_a_corrected_sale_reports_itself_as_corrected_to_the_nota(): void
    {
        $produk = $this->seedProduct();
        $unique = $this->seedSale(['NAMA' => 'ASLI', 'TOTAL' => 20000], [[
            'KODE' => $produk->ID, 'NAMA' => $produk->NAMA, 'SATUAN' => 'Pcs',
            'JUMLAH' => 2, 'HARGA_ASLI' => 10000, 'HARGA_TERJUAL' => 20000,
        ]]);

        $sebelum = $this->getJson('/api/UD84/Get-Invoices/'.$unique)->assertStatus(200)->json('data');

        $this->assertFalse($sebelum['dikoreksi']);
        $this->assertNull($sebelum['dikoreksi_pada']);

        $this->perbaiki($unique, ['NAMA' => 'DIPERBAIKI'])->assertJson(['status' => 'success']);

        $sesudah = $this->getJson('/api/UD84/Get-Invoices/'.$unique)->assertStatus(200)->json('data');

        $this->assertTrue($sesudah['dikoreksi']);
        $this->assertNotNull($sesudah['dikoreksi_pada']);
    }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: FAIL — `dikoreksi` is not a key in the response.

- [ ] **Step 3: Report it from `getInvoices`**

In `Report.php`'s `getInvoices`, after `$dataMember` is fetched:

```php
        // A correction is recorded, not flagged -- the audit row IS the fact, so
        // there is no column to keep in step with it.
        $dikoreksi = DB::table('ud84_transaksi_log')
            ->where('UNIQUE_TRANSAKSI', $ID)
            ->where('AKSI', 'Perbaikan')
            ->orderByDesc('ID')
            ->value('CREATED_AT');
```

Then, beside the existing `"dibatalkan"` key:

```php
                "dibatalkan" => $dataRekap->STATUS === 'Dibatalkan',
                "dikoreksi"  => !empty($dikoreksi),
                "dikoreksi_pada" => !empty($dikoreksi) ? Carbon::parse($dikoreksi)->translatedFormat('d F Y') : null,
```

- [ ] **Step 4: Run the test**

Run: `php artisan test --filter=PerbaikanTransaksiTest`
Expected: PASS, 39 tests.

- [ ] **Step 5: Add the fields to the receipt type**

In `me/src/components/content/ud84/nota/types.ts`, add to the `Receipt` interface beside `dibatalkan`:

```typescript
    dikoreksi: boolean;
    dikoreksi_pada: string | null;
```

and to `emptyReceipt`, beside `dibatalkan: false`:

```typescript
    dikoreksi: false,
    dikoreksi_pada: null,
```

- [ ] **Step 6: Print the banner on both papers**

In `NotaDL.svelte`, directly after the existing cancelled banner block:

```svelte
    {#if receipt.dikoreksi && !receipt.dibatalkan}
        <div class="void-banner">NOTA KOREKSI &mdash; {receipt.dikoreksi_pada}</div>
    {/if}
```

Add the identical block to `NotaThermal.svelte`, after its cancelled banner. Both files already style `.void-banner`, so no CSS changes are needed.

A cancelled sale keeps printing only its `DIBATALKAN` banner — that it was also corrected at some point is noise on a receipt for a sale that no longer counts.

- [ ] **Step 7: Check types**

Run: `cd "D:/Coedes/Production/me" && npm run check`
Expected: `0 ERRORS 6 WARNINGS`.

- [ ] **Step 8: Commit both repos**

```bash
cd "D:/Coedes/Production/Marmyadose"
git add app/Http/Controllers/UD84/Report.php tests/Feature/UD84/PerbaikanTransaksiTest.php
git commit -m "Tell the nota when a sale has been corrected

Derived from the audit row rather than a new column: the row is the fact,
so there is nothing to keep in step with it and this stage still ships no
schema."

cd "D:/Coedes/Production/me"
git add src/components/content/ud84/nota/types.ts src/components/content/ud84/nota/NotaDL.svelte src/components/content/ud84/nota/NotaThermal.svelte
git commit -m "Print a correction notice on both papers

Two receipts for one sale showing different totals, with nothing on
either explaining why, is how a dispute starts. A cancelled sale keeps
only its DIBATALKAN banner -- that it was also corrected once is noise on
a receipt for a sale that no longer counts."
```

---

### Task 6: The correction editor

**Files:**
- Modify: `me/src/routes/ud84/panel/transaksi/+page.svelte`

**Interfaces:**
- Consumes: `data.KOREKSI` from `Detail-Transaksi` (Task 1), `POST UD84/Daftar-Transaksi/Perbaiki` (Tasks 2-3), and from Stage 2's extraction: `operatorSaatIni()` from `library/utils/useAuth`, `RiwayatPanel`, the `Riwayat` type.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Extend the types and state**

In the `<script>` block, extend the `Detail` interface with the fields the editor needs (it currently stops at `UPDATED_AT`):

```typescript
    interface Detail {
        ID: number;
        UNIQUE: string;
        KODE: string | null;
        NAMA: string;
        SATUAN: string | null;
        JUMLAH: number;
        HARGA_ASLI: number;
        HARGA_TERJUAL: number;
        POTONGAN_PERSEN: number;
        POTONGAN_RUPIAH: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    interface Koreksi {
        DAPAT_UBAH_ITEM: boolean;
        ALASAN: string | null;
    }

    interface Produk {
        ID: number;
        NAMA: string;
        TIPE: string;
        HARGA_JUAL: number;
    }

    /** One row of the editor: a stored line carries its ID, a new one does not. */
    interface BarisKoreksi {
        ID: number | null;
        KODE_ITEM: number;
        NAMA: string;
        SATUAN: string;
        TIPE: string;
        JUMLAH: number;
        HARGA_ASLI: number;
        POTONGAN_PERSEN: number;
        POTONGAN_RUPIAH: number;
    }
```

Add the state, beside the existing cancel state:

```typescript
    let koreksi: Koreksi = $state({ DAPAT_UBAH_ITEM: false, ALASAN: null });

    let isKoreksiForm: boolean = $state(false);
    let sedangMemperbaiki: boolean = $state(false);
    let alasanKoreksi: string = $state('');

    let draftKoreksi = $state({ NAMA: '', KETERANGAN: '', JATUH_TEMPO: '', CASH: 0, DP: 0, POTONGAN: 0 });
    let barisKoreksi: BarisKoreksi[] = $state([]);

    let daftarProduk: Produk[] = $state([]);
    let produkDipilih: string = $state('');

    // What the operator will be saving, recomputed as they type, so the number
    // is on screen before it is committed rather than after.
    let totalBarangKoreksi: number = $derived(
        barisKoreksi.reduce((jumlah, baris) =>
            jumlah + Math.max(0, baris.HARGA_ASLI - baris.POTONGAN_PERSEN - baris.POTONGAN_RUPIAH) * baris.JUMLAH, 0)
    );
    let totalKoreksi: number = $derived(totalBarangKoreksi - draftKoreksi.POTONGAN);
```

- [ ] **Step 2: Capture the gate when the drawer opens**

In `getDetail`, after `rekapTransaksi = getResponse.rekap;`:

```typescript
        koreksi = getResponse.KOREKSI ?? { DAPAT_UBAH_ITEM: false, ALASAN: null };
        isKoreksiForm = false;
        alasanKoreksi = '';
        produkDipilih = '';
```

- [ ] **Step 3: Write the editor's functions**

Add after `batalkanTransaksi`:

```typescript
    async function mulaiKoreksi(): Promise <void> {
        draftKoreksi = {
            NAMA: rekapTransaksi.NAMA ?? '',
            KETERANGAN: rekapTransaksi.KETERANGAN ?? '',
            JATUH_TEMPO: rekapTransaksi.JATUH_TEMPO ?? '',
            CASH: Number(rekapTransaksi.CASH ?? 0),
            DP: Number(rekapTransaksi.DP ?? 0),
            POTONGAN: Number((rekapTransaksi as unknown as { POTONGAN?: number }).POTONGAN ?? 0),
        };

        barisKoreksi = detailTransaksi.map((baris) => ({
            ID: baris.ID,
            KODE_ITEM: Number(baris.KODE ?? 0),
            NAMA: baris.NAMA,
            SATUAN: baris.SATUAN ?? 'Pcs',
            TIPE: baris.SATUAN === 'Pcs' ? 'Pcs' : (baris.SATUAN ?? 'Pcs'),
            JUMLAH: Number(baris.JUMLAH),
            HARGA_ASLI: Number(baris.HARGA_ASLI),
            POTONGAN_PERSEN: Number(baris.POTONGAN_PERSEN),
            POTONGAN_RUPIAH: Number(baris.POTONGAN_RUPIAH),
        }));

        if (koreksi.DAPAT_UBAH_ITEM && daftarProduk.length === 0) {
            daftarProduk = await useFetch('UD84/Master-Produk/Retrieve') ?? [];
        }

        isKoreksiForm = true;
    }

    function batalKoreksi(): void {
        isKoreksiForm = false;
        alasanKoreksi = '';
        produkDipilih = '';
        barisKoreksi = [];
    }

    function tambahBaris(): void {
        const id = Number(produkDipilih);

        if (!id) {
            toast.error("Pilih produk dulu");
            return;
        }

        const produk = daftarProduk.find((item) => item.ID === id);

        if (!produk) {
            toast.error("Produk tidak ditemukan");
            return;
        }

        // A new line starts as loose pieces at the product's selling price --
        // both are changeable on the row before saving.
        barisKoreksi = [...barisKoreksi, {
            ID: null,
            KODE_ITEM: produk.ID,
            NAMA: produk.NAMA,
            SATUAN: 'Pcs',
            TIPE: produk.TIPE,
            JUMLAH: 1,
            HARGA_ASLI: Number(produk.HARGA_JUAL ?? 0),
            POTONGAN_PERSEN: 0,
            POTONGAN_RUPIAH: 0,
        }];
        produkDipilih = '';
    }

    function hapusBaris(index: number): void {
        barisKoreksi = barisKoreksi.filter((_, posisi) => posisi !== index);
    }

    async function simpanKoreksi(): Promise <void> {
        if (alasanKoreksi.trim() === '') {
            toast.error("Alasan perbaikan wajib diisi");
            return;
        }

        if (koreksi.DAPAT_UBAH_ITEM && barisKoreksi.length === 0) {
            toast.error("Transaksi harus punya minimal satu item");
            return;
        }

        if (koreksi.DAPAT_UBAH_ITEM && barisKoreksi.some((baris) => !(Math.floor(baris.JUMLAH) >= 1))) {
            toast.error("Jumlah setiap item harus minimal 1");
            return;
        }

        sedangMemperbaiki = true;

        const { status, message, data } = await db({
            KODE: rekapTransaksi.UNIQUE,
            NAMA: draftKoreksi.NAMA,
            KETERANGAN: draftKoreksi.KETERANGAN,
            JATUH_TEMPO: draftKoreksi.JATUH_TEMPO === '' ? null : draftKoreksi.JATUH_TEMPO,
            CASH: Number(draftKoreksi.CASH),
            DP: Number(draftKoreksi.DP),
            POTONGAN: Number(draftKoreksi.POTONGAN),
            ITEMS: koreksi.DAPAT_UBAH_ITEM
                ? barisKoreksi.map((baris) => ({
                    ID: baris.ID,
                    KODE_ITEM: baris.KODE_ITEM,
                    SATUAN: baris.SATUAN,
                    JUMLAH: Math.floor(Number(baris.JUMLAH)),
                    HARGA_ASLI: Number(baris.HARGA_ASLI),
                    POTONGAN_PERSEN: Number(baris.POTONGAN_PERSEN),
                    POTONGAN_RUPIAH: Number(baris.POTONGAN_RUPIAH),
                }))
                : null,
            OPERATOR: operatorSaatIni(),
            ALASAN: alasanKoreksi,
        }, 'UD84/Daftar-Transaksi/Perbaiki');

        sedangMemperbaiki = false;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);

        // Stock left below zero is the one thing here nobody may miss, so this
        // toast waits to be dismissed instead of expiring.
        const stokMinus: string[] = data?.STOK_MINUS ?? [];

        if (stokMinus.length > 0) {
            toast.warning(`Stok ${stokMinus.length} produk sekarang minus`, {
                description: `${stokMinus.join(', ')} — hitung ulang stoknya lewat Logistik.`,
                duration: Number.POSITIVE_INFINITY,
                closeButton: true,
                action: { label: 'Mengerti', onClick: () => {} },
            });
        }

        isKoreksiForm = false;
        alasanKoreksi = '';
        await getDetail(rekapTransaksi.UNIQUE);
        await doPost();
    }
```

- [ ] **Step 4: Render the editor**

In the drawer, insert this **between** the detail table and the `Pembatalan Transaksi` block:

```svelte
        <div class="divider my-3"></div>

        <div class="rounded-lg border border-info/30 p-4">
            <h4 class="mb-2 font-bold text-info">Perbaikan Transaksi</h4>

            {#if rekapTransaksi.STATUS === 'Dibatalkan'}
                <p class="text-sm text-base-content/70">
                    Transaksi yang sudah dibatalkan tidak bisa diperbaiki.
                </p>
            {:else if !isKoreksiForm}
                <p class="mb-3 text-sm text-base-content/70">
                    Memperbaiki transaksi akan menghitung ulang total, stok, dan poin member.
                    {#if !koreksi.DAPAT_UBAH_ITEM}
                        Untuk transaksi ini hanya data pelanggan dan nominal yang bisa diubah.
                    {/if}
                </p>
                {#if !koreksi.DAPAT_UBAH_ITEM && koreksi.ALASAN}
                    <p class="mb-3 text-sm text-warning">{koreksi.ALASAN}</p>
                {/if}
                <button type="button" onclick={mulaiKoreksi} class="btn btn-sm btn-info">Perbaiki Transaksi</button>
            {:else}
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <label for="koreksiNama" class="label-text mb-1 block font-medium">Nama Pelanggan</label>
                        <input id="koreksiNama" type="text" bind:value={draftKoreksi.NAMA} class="input input-bordered input-sm w-full" placeholder="UMUM"/>
                    </div>
                    <div>
                        <label for="koreksiKeterangan" class="label-text mb-1 block font-medium">Keterangan</label>
                        <input id="koreksiKeterangan" type="text" bind:value={draftKoreksi.KETERANGAN} class="input input-bordered input-sm w-full" placeholder="Keterangan"/>
                    </div>
                    <div>
                        <label for="koreksiCash" class="label-text mb-1 block font-medium">Pembayaran Tunai</label>
                        <input id="koreksiCash" type="number" min="0" bind:value={draftKoreksi.CASH} class="input input-bordered input-sm w-full"/>
                    </div>
                    <div>
                        <label for="koreksiDp" class="label-text mb-1 block font-medium">DP</label>
                        <input id="koreksiDp" type="number" min="0" bind:value={draftKoreksi.DP} class="input input-bordered input-sm w-full"/>
                    </div>
                    <div>
                        <label for="koreksiPotongan" class="label-text mb-1 block font-medium">Potongan Lain</label>
                        <input id="koreksiPotongan" type="number" min="0" bind:value={draftKoreksi.POTONGAN} class="input input-bordered input-sm w-full"/>
                    </div>
                </div>

                {#if koreksi.DAPAT_UBAH_ITEM}
                    <div class="mt-4 overflow-x-auto">
                        <table class="table table-sm align-middle">
                            <thead>
                                <tr class="font-bold">
                                    <th class="text-left">Produk</th>
                                    <th>Satuan</th>
                                    <th>Jumlah</th>
                                    <th>Harga</th>
                                    <th>Pot. %</th>
                                    <th>Pot. Rp</th>
                                    <th>Jumlah</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each barisKoreksi as baris, index}
                                    <tr>
                                        <td class="text-left">{baris.NAMA}</td>
                                        <td>
                                            <select bind:value={baris.SATUAN} class="select select-bordered select-sm">
                                                <option value="Pcs">Pcs</option>
                                                {#if baris.TIPE && baris.TIPE !== 'Pcs'}
                                                    <option value={baris.TIPE}>{baris.TIPE}</option>
                                                {/if}
                                            </select>
                                        </td>
                                        <td><input type="number" min="1" bind:value={baris.JUMLAH} class="input input-bordered input-sm w-20 text-center"/></td>
                                        <td><input type="number" min="0" bind:value={baris.HARGA_ASLI} class="input input-bordered input-sm w-28"/></td>
                                        <td><input type="number" min="0" bind:value={baris.POTONGAN_PERSEN} class="input input-bordered input-sm w-24"/></td>
                                        <td><input type="number" min="0" bind:value={baris.POTONGAN_RUPIAH} class="input input-bordered input-sm w-24"/></td>
                                        <td class="whitespace-nowrap">
                                            {rupiahFormatter.format(Math.max(0, baris.HARGA_ASLI - baris.POTONGAN_PERSEN - baris.POTONGAN_RUPIAH) * baris.JUMLAH)}
                                        </td>
                                        <td><button type="button" onclick={() => hapusBaris(index)} class="btn btn-ghost btn-xs text-error">Hapus</button></td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div class="flex-1">
                            <label for="koreksiProduk" class="label-text mb-1 block font-medium">Tambah Produk</label>
                            <select id="koreksiProduk" bind:value={produkDipilih} class="select select-bordered select-sm w-full">
                                <option value="">Pilih produk</option>
                                {#each daftarProduk as produk}
                                    <option value={String(produk.ID)}>{produk.NAMA}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="button" onclick={tambahBaris} class="btn btn-sm btn-primary">Tambah Item</button>
                    </div>
                {/if}

                <p class="mt-3 text-sm">
                    Total barang <b>{rupiahFormatter.format(totalBarangKoreksi)}</b>,
                    total setelah potongan <b class="text-success">{rupiahFormatter.format(totalKoreksi)}</b>
                </p>

                <div class="mt-3">
                    <label for="alasanKoreksi" class="label-text mb-1 block font-medium">Alasan Perbaikan</label>
                    <input id="alasanKoreksi" type="text" bind:value={alasanKoreksi} class="input input-bordered input-sm w-full" placeholder="Contoh: Kasir salah input jumlah"/>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" onclick={simpanKoreksi} class="btn btn-sm btn-info" disabled={sedangMemperbaiki}>
                        {sedangMemperbaiki ? 'Menyimpan...' : 'Simpan Perbaikan'}
                    </button>
                    <button type="button" onclick={batalKoreksi} class="btn btn-sm btn-ghost" disabled={sedangMemperbaiki}>Batal</button>
                </div>
            {/if}
        </div>
```

- [ ] **Step 5: Check types**

Run: `npm run check`
Expected: `0 ERRORS 6 WARNINGS`. If `rekapTransaksi.POTONGAN` reports as missing, add `POTONGAN: number;` to the `Rekap` interface rather than casting — the column exists and the cast in `mulaiKoreksi` is a workaround for its absence.

- [ ] **Step 6: Commit**

```bash
git add src/routes/ud84/panel/transaksi/+page.svelte
git commit -m "Correct a completed sale from the panel

The drawer gains a correction editor beside the cancel section: customer,
notes and the money on every active sale, plus the line items when the
sale's lines all resolve to a product and record their unit. The running
total updates as figures change, so the operator sees the number before
committing it rather than after.

A sale that cannot have its items edited says which line blocks it and
why, rather than hiding the option.

Stock left below zero after a correction is surfaced as a toast that
waits to be dismissed -- the same treatment cancellation gives stock it
could not return."
```

---

### Task 7: Browser verification and the runbook

**Files:**
- Create: `me/docs/deployment/2026-08-06-ud84-perbaikan-transaksi-deploy.md`
- Temporary (do not commit): a CDP script under the scratchpad

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Start the servers**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan route:clear && php artisan serve --port=8000   # background
cd "D:/Coedes/Production/me" && npm run dev                                                        # background
```

Set `isProduction` to `false` in `me/src/library/resources/phraseBox.ts`, and **restore it with `git checkout -- src/library/resources/phraseBox.ts`** when finished — never with `sed`, which rewrites the file's line endings.

- [ ] **Step 2: Seed a sale that qualifies for item editing**

Local data has exactly one such sale and it is needed elsewhere, so make your own:

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
\$produk = DB::table('ud84_master_produk')->where('STOK','>',50)->first(['ID','NAMA','TIPE','JUMLAH_PER_ITEM','STOK','HARGA_JUAL']);
\$kode = 'verify'.uniqid();
DB::table('ud84_penjualan_rekap')->insert(['UNIQUE'=>\$kode,'STATUS'=>'Aktif','NAMA'=>'UMUM','CASH'=>100000,'KEMBALIAN'=>0,'DP'=>0,'POTONGAN'=>0,'TOTAL'=>100000,'MEMBER'=>'UMUM','POIN'=>0,'KETERANGAN'=>'Verifikasi koreksi','CREATED_AT'=>now()]);
DB::table('ud84_penjualan_detail')->insert(['UNIQUE'=>\$kode,'KODE'=>\$produk->ID,'NAMA'=>\$produk->NAMA,'SATUAN'=>'Pcs','JUMLAH'=>2,'HARGA_ASLI'=>50000,'HARGA_TERJUAL'=>100000,'POTONGAN_PERSEN'=>0,'POTONGAN_RUPIAH'=>0,'CREATED_AT'=>now()]);
echo \$kode.' | produk '.\$produk->ID.' '.\$produk->NAMA.' stok '.\$produk->STOK;"
```

- [ ] **Step 3: Drive the flow in headless Chrome**

Launch Chrome with `--headless=new --remote-debugging-port=9222 --user-data-dir=<scratchpad>/chrome-profile` and drive it over CDP from Node — version 24 has a global `WebSocket`, so nothing needs installing. Reuse the driver from the perbaikan-pesanan plan (`me/docs/superpowers/plans/2026-08-06-ud84-perbaikan-pesanan.md`, Task 8 Step 3) verbatim; it is the same harness.

Two traps already paid for on this app:
1. Open the tab on `about:blank` and navigate afterwards — `localStorage` on a tab opened directly at a URL throws `SecurityError`.
2. Svelte's `bind:value` ignores a bare `el.value = x`; follow every assignment with `new Event('input', { bubbles: true })`, and `change` for a `<select>`.

Seed `localStorage.Auth` as `{"name":"Ibu Heridawati","privilege":"Administrator"}`, go to `/ud84/panel/transaksi`, and press the search button — the date range defaults to the current month, and the seeded sale is dated today.

Assert, with screenshots:

1. The seeded sale's **Lihat** opens the drawer, which offers **Perbaiki Transaksi**.
2. Pressing it shows the header and money fields **and** the line table, because this sale qualifies.
3. Change the customer name, raise the quantity from 2 to 5, add a second product, type a reason, save.
4. The success toast appears, the drawer reloads showing the new figures, and **Riwayat Perubahan** lists a `Perbaikan` entry naming the operator, the reason, the quantity change, the added item, the stock movements and the new total.
5. Open a sale that does **not** qualify (any older one): **Perbaiki Transaksi** is still offered, the reason it cannot have its items edited is shown, and pressing it gives header and money fields with **no** line table.
6. Open the nota for the corrected sale at `/ud84/panel/nota/<kode>` and confirm both papers print **NOTA KOREKSI** with the date.

- [ ] **Step 4: Confirm the database agrees**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
\$kode = DB::table('ud84_penjualan_rekap')->where('UNIQUE','like','verify%')->orderByDesc('ID')->value('UNIQUE');
echo json_encode(DB::table('ud84_penjualan_rekap')->where('UNIQUE',\$kode)->first()).PHP_EOL;
foreach(DB::table('ud84_penjualan_detail')->where('UNIQUE',\$kode)->get() as \$d){ echo json_encode(\$d).PHP_EOL; }
foreach(DB::table('ud84_logs')->where('ASAL','Perbaikan Transaksi')->orderByDesc('ID')->limit(4)->get() as \$l){ echo json_encode(\$l).PHP_EOL; }
foreach(DB::table('ud84_transaksi_log')->where('UNIQUE_TRANSAKSI',\$kode)->get() as \$t){ echo \$t->AKSI.' | '.\$t->OPERATOR.' | '.\$t->ALASAN.PHP_EOL.\$t->CATATAN_SISTEM.PHP_EOL; }"
```

Expected: the corrected header and money, the reconciled lines with the surviving line's `CREATED_AT` unchanged, one `Perbaikan Transaksi` stock row per affected product with a correct `STOK_FINAL`, and one `Perbaikan` audit row whose change list matches what the drawer showed.

- [ ] **Step 5: Clean up**

Delete the seeded sale, its lines, its stock rows and its audit rows, and restore the affected products' `STOK` to what it was before Step 2. Stop the servers and Chrome. Restore `phraseBox.ts` with `git checkout --`. Confirm `git status --short` in both repos shows only intended files.

- [ ] **Step 6: Write the runbook**

Create `me/docs/deployment/2026-08-06-ud84-perbaikan-transaksi-deploy.md` covering:

- **No SQL at all.** Nothing to run in phpMyAdmin. Say this early — the previous two releases both had a SQL step, and its absence here will otherwise read as a missing instruction.
- **It requires the cancel-invoice release to be live**, for three separate reasons: `ud84_transaksi_log` (the audit rows), `config/ud84.php` (the points constant), and `postPenjualan` writing `KODE` at all — without the third, **no sale will ever qualify for item editing**.
- **Expect the item editor to be inert at first**, and say why in plain words: item editing needs a sale whose lines record both their product and their unit, and only sales rung up after the cancel-invoice release qualify. Existing sales get header and money correction, which is not a fault. Without this paragraph the release reads as broken.
- Backend files: `app/Http/Controllers/UD84/Transaksi.php`, `app/Http/Controllers/UD84/Report.php`, `routes/api.php` — built with `git archive` from `main`. `routes/api.php` still needs `app/Http/Controllers/POS/EMoney.php` beside it, for the reason given in the cancel runbook.
- **`php artisan route:clear` is mandatory** — one new route.
- Frontend: confirm `isProduction = true`, merge, push, let Vercel build.
- Verification on production: correct a small real sale's header, check the audit trail, reprint and confirm the NOTA KOREKSI mark; then, once a qualifying sale exists, correct a quantity and check the stock card gained a `Perbaikan Transaksi` row.
- Rollback: re-upload the previous `Transaksi.php`, `Report.php` and `routes/api.php`, clear the route cache. No data migration to undo. Corrections already applied stay applied — stock and points were moved for real, and reverting the code does not put them back.
- Known limits: item editing gated as above; stock may go negative by design and is reported; the `KEMBALIAN` column keeps its existing DP defect; correcting a cancelled sale is refused.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/me"
git add docs/deployment/2026-08-06-ud84-perbaikan-transaksi-deploy.md
git commit -m "Add the deployment guide for perbaikan transaksi

No SQL at all, which is worth saying early after two releases that both
had one. It does depend on cancel-invoice being live for three separate
reasons, the third being that postPenjualan only writes KODE from that
release onward -- without it no sale will ever qualify for item editing.

Says plainly that the item editor will be inert at first and why, because
a release that appears to do nothing reads as broken."
```

---

## Definition of Done

- `php artisan test` → 123 passed, 1 failed (the pre-existing `ExampleTest` on `GET /`)
- `npm run check` → 0 errors, 6 warnings
- The flow walked in a real browser, with the database confirmed to agree afterwards
- `phraseBox.ts` reads `isProduction = true` in every commit
- Both repos clean; local database left as it was found, including product stock
- Handoff updated: Stage 3 done, sub-project 2 complete
