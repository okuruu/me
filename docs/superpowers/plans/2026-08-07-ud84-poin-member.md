# UD84 Poin Member Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the loyalty rule to 1 point per 1.000.000 of cash, and give the panel a page for seeing member balances and adjusting them by hand.

**Architecture:** One constant change in `config/ud84.php`, which every point-touching path already reads. A new `Poin` controller with two endpoints — read the balances, adjust one — where adding is an atomic increment and subtracting is a conditional decrement, so a balance cannot go negative between a read and a write. A new panel page renders the list and calls them.

**Tech Stack:** Laravel 11 (query builder, no Eloquent models for `ud84_*`), PHPUnit feature tests with `DatabaseTransactions`, SvelteKit 2 + Svelte 5 runes, DaisyUI/Tailwind, svelte-sonner.

**Spec:** `me/docs/superpowers/specs/2026-08-07-ud84-poin-member-design.md`

## Global Constraints

- **No schema.** `ud84_member.POINT` already exists. No `ALTER TABLE`, no migration, no new table.
- **No record of adjustments.** The owner decided against storing who adjusted what. Do not add an audit row, an operator field or a reason box — their absence is the design, not an oversight.
- **Never `RefreshDatabase`** in a test — it runs `migrate:fresh`, which would permanently drop every `ud84_*` table, none of which are covered by migrations. Use `DatabaseTransactions`.
- **Never `php artisan migrate`.**
- **Never `git add -A` in `Marmyadose`** — it holds unrelated work. Stage by explicit path.
- **`php artisan route:clear` after touching `routes/api.php`**, or new routes 404 with no error on screen.
- **All responses are HTTP 200** with `{status, message, data}`; `status: "error"` carries failures. No 4xx.
- **User-facing copy is Indonesian.** Comments and commit messages are English.
- **`npm run check` must stay at 0 errors / 6 warnings.**
- **Backend baseline is 130 passed / 1 failed.** That failure is the pre-existing `ExampleTest` on `GET /`, which also fails on `main`. Do not fix it, do not count it.
- **`ud84_member.POINT` is a `smallint`** — maximum 32.767. Strict mode turns an overflow into a server error, so the ceiling is guarded rather than discovered.

---

## File Structure

| File | Responsibility |
|---|---|
| `Marmyadose/config/ud84.php` | Modify. One constant. |
| `Marmyadose/app/Http/Controllers/UD84/Poin.php` | Create. Both endpoints and nothing else. |
| `Marmyadose/routes/api.php` | Modify. Two route lines. |
| `Marmyadose/tests/Feature/UD84/PoinMemberTest.php` | Create. Every test for this item. |
| `me/src/routes/ud84/panel/poin/+page.svelte` | Create. The dashboard. |
| `me/src/components/content/ud84/UD84Navigation.svelte` | Modify. One nav link. |
| `me/docs/deployment/2026-08-07-ud84-poin-member-deploy.md` | Create. Runbook — no SQL, three files, one cache clear. |

A separate `Poin` controller rather than extending `Member`: the two endpoints are about balances, not member records, and `Member.php` already carries create/delete/sales-create. One file, one subject.

---

### Task 1: The earning rule

The whole of `Instruction.md` item 10's first half. One constant, and the tests that pin what it means.

**Files:**
- Modify: `Marmyadose/config/ud84.php:24`
- Test: `Marmyadose/tests/Feature/UD84/PoinMemberTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `config('ud84.poin_per_rupiah') === 1000000`.

- [ ] **Step 1: Write the failing tests**

Create `Marmyadose/tests/Feature/UD84/PoinMemberTest.php`:

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
class PoinMemberTest extends TestCase
{
    use DatabaseTransactions;

    private function seedMember(int $poin = 0): object
    {
        $id = DB::table('ud84_member')->insertGetId([
            'NAMA'       => 'MEMBER POIN '.uniqid(),
            'LOKASI'     => 'Singosari',
            'ALAMAT'     => 'Jl. Tes',
            'WHATSAPP'   => '08123456789',
            'POINT'      => $poin,
            'CREATED_AT' => '2026-08-07 10:00:00',
        ]);

        return DB::table('ud84_member')->where('ID', $id)->first();
    }

    private function seedProduct(): object
    {
        $id = DB::table('ud84_master_produk')->insertGetId([
            'NAMA'            => 'PRODUK POIN '.uniqid(),
            'STOK'            => 1000,
            'TIPE'            => 'Pcs',
            'STATUS_JUAL'     => 'Katalog dan Penjualan',
            'DISTRIBUTOR'     => 'TES',
            'HARGA_PABRIK'    => 5000,
            'HARGA_JUAL'      => 10000,
            'JUMLAH_PER_ITEM' => 1,
            'HARGA_PER_ITEM'  => 10000,
        ]);

        return DB::table('ud84_master_produk')->where('ID', $id)->first();
    }

    /** Rings up a sale through the real POS endpoint, paid in cash. */
    private function jual(object $member, int $cash)
    {
        $produk = $this->seedProduct();

        return $this->postJson('/api/UD84/Penjualan/Saving-Receipt', [
            'DP'          => 0,
            'CASH'        => $cash,
            'POTONGAN'    => 0,
            'JATUH_TEMPO' => null,
            'TOTAL'       => 10000,
            'KETERANGAN'  => 'Uji poin',
            'MEMBER'      => $member->ID,
            'CART'        => [[
                'ID'              => $produk->ID,
                'NAMA'            => $produk->NAMA,
                'QUANTITY'        => 1,
                'TOTAL'           => 10000,
                'HARGA_ASLI'      => 10000,
                'POTONGAN_RUPIAH' => 0,
                'POTONGAN_PERSEN' => 0,
                'TIPE'            => 'Pieces',
            ]],
        ]);
    }

    private function poinSekarang(object $member): int
    {
        return (int) DB::table('ud84_member')->where('ID', $member->ID)->value('POINT');
    }

    public function test_the_rate_is_one_point_per_one_million(): void
    {
        $this->assertSame(1000000, (int) config('ud84.poin_per_rupiah'));
    }

    public function test_cash_just_under_a_million_earns_nothing(): void
    {
        $member = $this->seedMember();

        $this->jual($member, 999999);

        $this->assertSame(0, $this->poinSekarang($member));
    }

    public function test_cash_of_exactly_a_million_earns_one_point(): void
    {
        $member = $this->seedMember();

        $this->jual($member, 1000000);

        $this->assertSame(1, $this->poinSekarang($member));
    }

    public function test_points_accrue_in_multiples(): void
    {
        $member = $this->seedMember();

        // Two and a half million is two whole points; the remainder does not
        // round up.
        $this->jual($member, 2500000);

        $this->assertSame(2, $this->poinSekarang($member));
    }

    public function test_the_sale_records_the_points_it_granted(): void
    {
        $member = $this->seedMember();

        $this->jual($member, 2000000);

        $poin = DB::table('ud84_penjualan_rekap')->where('NAMA', $member->NAMA)->value('POIN');

        $this->assertSame(2, (int) $poin);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "D:/Coedes/Production/Marmyadose" && php artisan test --filter=PoinMemberTest`
Expected: FAIL — the constant is still 500000, so the rate assertion fails and 999.999 wrongly earns 1 point.

- [ ] **Step 3: Change the constant**

In `config/ud84.php`, replace the value and bring its comment up to date:

```php
    /*
    |--------------------------------------------------------------------------
    | Poin member
    |--------------------------------------------------------------------------
    |
    | Rupiah of cash payment required to earn one point. A sale grants
    | floor(CASH / poin_per_rupiah) points.
    |
    | Changing this value affects future sales only. The number of points a
    | sale granted is stored on ud84_penjualan_rekap.POIN at the time of sale,
    | and a cancellation reverses that stored figure -- so an old sale always
    | gives back exactly what it gave, whatever this value is today.
    |
    | Sales predating the POIN column have it null; cancelling one of those
    | falls back to recomputing from CASH with the value below, and records
    | that it did so in ud84_transaksi_log.CATATAN_SISTEM.
    |
    */

    'poin_per_rupiah' => 1000000,
```

- [ ] **Step 4: Clear the config cache and run the tests**

A cached config would keep serving the old value.

Run: `php artisan config:clear && php artisan test --filter=PoinMemberTest`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add config/ud84.php tests/Feature/UD84/PoinMemberTest.php
git commit -m "Earn one point per million rupiah of cash

Instruction.md item 10. One constant, because earning, cancellation and
correction all read it -- they cannot drift apart.

The cash condition it asks for needs no code: points have always been
computed from CASH rather than TOTAL, so a sale settled partly by deposit
earns on what was actually handed over.

Existing balances stay as they are, and each sale stores what it granted,
so a sale made under the old rate still gives back exactly what it gave."
```

---

### Task 2: Reading the balances

**Files:**
- Create: `Marmyadose/app/Http/Controllers/UD84/Poin.php`
- Modify: `Marmyadose/routes/api.php`
- Test: `Marmyadose/tests/Feature/UD84/PoinMemberTest.php`

**Interfaces:**
- Consumes: `seedMember(int $poin = 0): object` from Task 1.
- Produces: `GET /api/UD84/Poin/Retrieve` returning `data: { MEMBER: [{ID, NAMA, LOKASI, WHATSAPP, POINT}], TOTAL: int }`, members ordered by `POINT` descending then `NAMA` ascending.

- [ ] **Step 1: Write the failing tests**

Append to `PoinMemberTest.php`:

```php
    private function daftarPoin(): array
    {
        return $this->getJson('/api/UD84/Poin/Retrieve')
            ->assertStatus(200)->assertJson(['status' => 'success'])->json('data');
    }

    public function test_the_list_returns_every_member_with_a_balance(): void
    {
        $member = $this->seedMember(7);

        $data  = $this->daftarPoin();
        $found = collect($data['MEMBER'])->firstWhere('ID', $member->ID);

        $this->assertNotNull($found);
        $this->assertSame(7, (int) $found['POINT']);
        $this->assertSame($member->NAMA, $found['NAMA']);
        $this->assertSame('Singosari', $found['LOKASI']);
    }

    public function test_a_member_with_no_points_is_still_listed(): void
    {
        $member = $this->seedMember(0);

        // Excluding them would make giving anyone their first point impossible.
        $this->assertNotNull(collect($this->daftarPoin()['MEMBER'])->firstWhere('ID', $member->ID));
    }

    public function test_the_list_is_ordered_by_balance_highest_first(): void
    {
        $this->seedMember(3);
        $this->seedMember(9);

        $poin = collect($this->daftarPoin()['MEMBER'])->pluck('POINT')->map(fn ($p) => (int) $p)->all();

        $urut = $poin;
        rsort($urut);

        $this->assertSame($urut, $poin);
    }

    public function test_the_total_is_every_balance_added_up(): void
    {
        $data = $this->daftarPoin();

        $jumlah = collect($data['MEMBER'])->sum(fn ($m) => (int) $m['POINT']);

        $this->assertSame($jumlah, (int) $data['TOTAL']);
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `php artisan test --filter=PoinMemberTest`
Expected: FAIL — `/api/UD84/Poin/Retrieve` returns 404.

- [ ] **Step 3: Create the controller**

`Marmyadose/app/Http/Controllers/UD84/Poin.php`:

```php
<?php

namespace App\Http\Controllers\UD84;

use DB;
use Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Member loyalty points.
 *
 * Points are earned automatically at checkout -- see Penjualan::postPenjualan
 * and config('ud84.poin_per_rupiah') -- and reversed by cancelling or
 * correcting a sale. This controller covers the other half: seeing what
 * members have, and adjusting it by hand when someone claims something at the
 * counter.
 *
 * Adjustments are deliberately not recorded. The owner chose a screen that
 * stays simple over one that keeps a trail; the consequence, that a disputed
 * balance has nothing to check against, is documented in the design.
 */
class Poin extends Controller
{
    /** The smallint ceiling on ud84_member.POINT. */
    private const BATAS_POIN = 32767;

    public function getPoin()
    {
        $member = DB::table('ud84_member')
            ->orderByDesc('POINT')
            ->orderBy('NAMA')
            ->get(['ID', 'NAMA', 'LOKASI', 'WHATSAPP', 'POINT']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Loaded',
            'data'    => [
                'MEMBER' => $member,
                'TOTAL'  => (int) DB::table('ud84_member')->sum('POINT'),
            ],
        ], 200);
    }
}
```

- [ ] **Step 4: Add the route**

In `routes/api.php`, beneath the existing `/UD84/Member/*` block, adding the import at the top of the file beside the other `UD84` imports:

```php
use App\Http\Controllers\UD84\Poin as UD84_Poin;
```

```php
// UD84 - Poin Member
Route::get('/UD84/Poin/Retrieve', [UD84_Poin::class, 'getPoin']);
```

- [ ] **Step 5: Clear routes and run the tests**

Run: `php artisan route:clear && php artisan test --filter=PoinMemberTest`
Expected: PASS, 9 tests.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/UD84/Poin.php routes/api.php tests/Feature/UD84/PoinMemberTest.php
git commit -m "Read member point balances

Its own controller rather than an addition to Member: these two endpoints
are about balances, not member records, and Member.php already carries
create, delete and sales-create.

Members holding no points are listed too -- excluding them would make it
impossible to give anyone their first point."
```

---

### Task 3: Adjusting a balance

**Files:**
- Modify: `Marmyadose/app/Http/Controllers/UD84/Poin.php`
- Modify: `Marmyadose/routes/api.php`
- Test: `Marmyadose/tests/Feature/UD84/PoinMemberTest.php`

**Interfaces:**
- Consumes: `seedMember`, `daftarPoin` from Tasks 1-2.
- Produces: `POST /api/UD84/Poin/Adjust` taking `{ID, JUMLAH, ARAH}` where `ARAH` is `'Tambah'` or `'Kurang'`, returning `data: { POINT: int }` — the balance after the change.

- [ ] **Step 1: Write the failing tests**

Append to `PoinMemberTest.php`:

```php
    private function ubahPoin(array $payload = [])
    {
        return $this->postJson('/api/UD84/Poin/Adjust', array_merge([
            'JUMLAH' => 1,
            'ARAH'   => 'Tambah',
        ], $payload));
    }

    public function test_adding_raises_the_balance_and_returns_it(): void
    {
        $member = $this->seedMember(4);

        $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 3, 'ARAH' => 'Tambah'])
            ->assertStatus(200)
            ->assertJson(['status' => 'success', 'data' => ['POINT' => 7]]);

        $this->assertSame(7, $this->poinSekarang($member));
    }

    public function test_subtracting_lowers_the_balance(): void
    {
        $member = $this->seedMember(10);

        $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 4, 'ARAH' => 'Kurang'])
            ->assertStatus(200)
            ->assertJson(['status' => 'success', 'data' => ['POINT' => 6]]);

        $this->assertSame(6, $this->poinSekarang($member));
    }

    public function test_subtracting_the_whole_balance_is_allowed(): void
    {
        $member = $this->seedMember(5);

        $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 5, 'ARAH' => 'Kurang'])
            ->assertStatus(200)->assertJson(['status' => 'success']);

        $this->assertSame(0, $this->poinSekarang($member));
    }

    public function test_subtracting_more_than_the_balance_is_refused_and_names_it(): void
    {
        $member = $this->seedMember(2);

        $response = $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 5, 'ARAH' => 'Kurang'])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertStringContainsString('2', $response->json('message'));
        $this->assertSame(2, $this->poinSekarang($member));
    }

    public function test_an_unknown_member_is_refused(): void
    {
        $this->ubahPoin(['ID' => 999999, 'JUMLAH' => 1, 'ARAH' => 'Tambah'])
            ->assertStatus(200)->assertJson(['status' => 'error']);
    }

    public function test_zero_and_negative_and_fractional_amounts_are_refused(): void
    {
        $member = $this->seedMember(3);

        foreach ([0, -2, 1.5, 'dua'] as $jumlah) {
            $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => $jumlah, 'ARAH' => 'Tambah'])
                ->assertStatus(200)->assertJson(['status' => 'error']);
        }

        $this->assertSame(3, $this->poinSekarang($member));
    }

    public function test_an_unrecognised_direction_is_refused(): void
    {
        $member = $this->seedMember(3);

        $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 1, 'ARAH' => 'Ganti'])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(3, $this->poinSekarang($member));
    }

    public function test_adding_past_the_column_ceiling_is_refused_rather_than_crashing(): void
    {
        $member = $this->seedMember(32000);

        // POINT is a smallint; strict mode would turn the overflow into an
        // unexplained server error rather than a message anyone can act on.
        $this->ubahPoin(['ID' => $member->ID, 'JUMLAH' => 1000, 'ARAH' => 'Tambah'])
            ->assertStatus(200)->assertJson(['status' => 'error']);

        $this->assertSame(32000, $this->poinSekarang($member));
    }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `php artisan test --filter=PoinMemberTest`
Expected: FAIL — `/api/UD84/Poin/Adjust` returns 404.

- [ ] **Step 3: Add the route**

```php
Route::post('/UD84/Poin/Adjust', [UD84_Poin::class, 'adjustPoin']);
```

- [ ] **Step 4: Write the method**

Add to `Poin.php` after `getPoin`:

```php
    /**
     * Hand adjustment, the counter's half of the programme: a customer claims
     * something and the staff take the points off.
     *
     * Adding is an atomic increment. Subtracting is a CONDITIONAL decrement --
     * one statement that only matches a row whose balance is high enough -- so
     * two operators adjusting the same member at once cannot drive a balance
     * below zero between a read and a write, and nothing is clamped in
     * silence. With no record kept, a silent clamp would be unexplainable
     * afterwards.
     */
    public function adjustPoin(Request $request)
    {
        $id     = (int) $request->input('ID');
        $arah   = trim((string) $request->input('ARAH'));
        $jumlah = $request->input('JUMLAH');

        if (!is_numeric($jumlah) || (float) $jumlah != (int) $jumlah || (int) $jumlah < 1) {
            return $this->gagal('Jumlah poin harus berupa angka bulat minimal 1.');
        }

        $jumlah = (int) $jumlah;

        if ($arah !== 'Tambah' && $arah !== 'Kurang') {
            return $this->gagal('Pilih tambah atau kurang.');
        }

        $member = DB::table('ud84_member')->where('ID', $id)->first(['ID', 'NAMA', 'POINT']);

        if (empty($member)) {
            return $this->gagal('Member tidak ditemukan.');
        }

        try {
            if ($arah === 'Tambah') {
                $saldo = (int) ($member->POINT ?? 0);

                if ($saldo + $jumlah > self::BATAS_POIN) {
                    return $this->gagal('Poin melebihi batas maksimal '.self::BATAS_POIN.'.');
                }

                DB::table('ud84_member')->where('ID', $id)->increment('POINT', $jumlah, [
                    'UPDATED_AT' => now(),
                ]);
            } else {
                $terpengaruh = DB::table('ud84_member')
                    ->where('ID', $id)
                    ->where('POINT', '>=', $jumlah)
                    ->decrement('POINT', $jumlah, ['UPDATED_AT' => now()]);

                if ($terpengaruh === 0) {
                    $saldo = (int) DB::table('ud84_member')->where('ID', $id)->value('POINT');

                    return $this->gagal("Poin '{$member->NAMA}' hanya {$saldo}, tidak bisa dikurangi {$jumlah}.");
                }
            }

            $saldoBaru = (int) DB::table('ud84_member')->where('ID', $id)->value('POINT');

            return response()->json([
                'status'  => 'success',
                'message' => 'Poin berhasil diperbarui.',
                'data'    => ['POINT' => $saldoBaru],
            ], 200);
        } catch (\Throwable $e) {
            Log::info($e);

            return $this->gagal('Poin gagal diperbarui.');
        }
    }

    private function gagal(string $pesan)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $pesan,
        ], 200);
    }
```

- [ ] **Step 5: Clear routes and run the tests**

Run: `php artisan route:clear && php artisan test --filter=PoinMemberTest`
Expected: PASS, 17 tests.

- [ ] **Step 6: Run the whole suite**

Run: `php artisan test`
Expected: 147 passed, 1 failed (the pre-existing `ExampleTest`).

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/UD84/Poin.php routes/api.php tests/Feature/UD84/PoinMemberTest.php
git commit -m "Adjust a member's points by hand

Redemption happens as a conversation at the counter, so the system offers
add and subtract and nothing else -- no catalogue, no rules.

Subtracting is a conditional decrement rather than a read-modify-write:
one statement that only matches a balance high enough to cover it. Two
staff adjusting the same member at once therefore cannot take it below
zero, and a request that would have is refused naming what the member
actually has, rather than clamped in silence -- which, with no record
kept, nobody could explain afterwards.

The smallint ceiling is guarded because strict mode would otherwise turn
a mistyped addition into an unexplained server error."
```

---

### Task 4: The page

**Files:**
- Create: `me/src/routes/ud84/panel/poin/+page.svelte`
- Modify: `me/src/components/content/ud84/UD84Navigation.svelte:45`

**Interfaces:**
- Consumes: `GET UD84/Poin/Retrieve` and `POST UD84/Poin/Adjust` (Tasks 2-3).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Create the page**

`me/src/routes/ud84/panel/poin/+page.svelte`:

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Member {
        ID: number;
        NAMA: string;
        LOKASI: string | null;
        WHATSAPP: string | null;
        POINT: number;
    }

    let daftarMember: Member[] = $state([]);
    let totalPoin: number = $state(0);
    let pencarian: string = $state('');

    // How many points the operator is about to add or take off, keyed by
    // member ID so every row keeps its own box.
    let jumlahPoin: Record<number, number> = $state({});

    // The row currently mid-request, so its two buttons can be disabled
    // without freezing the whole table.
    let sedangUbah: number | null = $state(null);

    let hasilCari: Member[] = $derived(
        pencarian.trim() === ''
            ? daftarMember
            : daftarMember.filter((m) => m.NAMA.toLowerCase().includes(pencarian.trim().toLowerCase()))
    );

    onMount(async () => muatPoin());

    async function muatPoin(): Promise<void> {
        const data = await useFetch('UD84/Poin/Retrieve');

        daftarMember = data?.MEMBER ?? [];
        totalPoin = Number(data?.TOTAL ?? 0);
    }

    async function ubahPoin(member: Member, arah: 'Tambah' | 'Kurang'): Promise<void> {
        const jumlah = Number(jumlahPoin[member.ID] ?? 0);

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            toast.error("Isi jumlah poin, minimal 1");
            return;
        }

        sedangUbah = member.ID;

        const { status, message } = await db({
            ID: member.ID,
            JUMLAH: jumlah,
            ARAH: arah,
        }, 'UD84/Poin/Adjust');

        sedangUbah = null;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        jumlahPoin[member.ID] = 0;

        // Reloaded rather than patched locally, so the number on screen is the
        // number the database holds.
        await muatPoin();
    }
</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">

        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Poin Member</h3>
            <div class="text-right">
                <span class="label-text block font-medium">Total Poin Terbit</span>
                <span class="text-2xl font-extrabold text-primary">{totalPoin}</span>
            </div>
        </div>

        <p class="text-sm text-base-content/60">
            Poin bertambah otomatis setiap pembayaran tunai kelipatan Rp 1.000.000.
            Gunakan tombol di bawah untuk menambah atau mengurangi poin secara manual.
        </p>

        <div class="mt-4">
            <label for="cariMember" class="label-text mb-1 block font-medium">Cari Member</label>
            <input id="cariMember" type="text" bind:value={pencarian} class="input input-bordered input-sm w-full sm:max-w-xs" placeholder="Nama member"/>
        </div>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama Member</th>
                        <th class="hidden md:table-cell">Lokasi</th>
                        <th class="hidden lg:table-cell">WhatsApp</th>
                        <th class="text-center">Poin</th>
                        <th class="text-center">Ubah Poin</th>
                    </tr>
                </thead>
                <tbody>
                    {#each hasilCari as member, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td class="text-left font-medium">{member.NAMA}</td>
                            <td class="hidden md:table-cell">{member.LOKASI ?? '-'}</td>
                            <td class="hidden lg:table-cell">{member.WHATSAPP ?? '-'}</td>
                            <td class="text-center">
                                {#if member.POINT > 0}
                                    <span class="badge badge-primary badge-lg font-extrabold">{member.POINT}</span>
                                {:else}
                                    <span class="text-base-content/50">0</span>
                                {/if}
                            </td>
                            <td>
                                <div class="flex flex-wrap items-center justify-center gap-1">
                                    <input type="number" min="1" bind:value={jumlahPoin[member.ID]} class="input input-bordered input-sm w-20 text-center" placeholder="0"/>
                                    <button type="button" onclick={() => ubahPoin(member, 'Tambah')} class="btn btn-sm btn-primary" disabled={sedangUbah === member.ID}>Tambah</button>
                                    <button type="button" onclick={() => ubahPoin(member, 'Kurang')} class="btn btn-sm btn-error" disabled={sedangUbah === member.ID}>Kurang</button>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="text-center text-base-content/60">Tidak ada member</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
</div>
</div>
```

- [ ] **Step 2: Add the nav link**

In `me/src/components/content/ud84/UD84Navigation.svelte`, inside the `navLinks` snippet, directly after the Member link at line 45:

```svelte
    <a href="/ud84/panel/poin" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Poin' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Poin</a>
```

`activeMenu` is hardcoded to `'Transaksi'` in that component, so this link will not highlight when the page is open — a pre-existing quirk affecting every panel page, recorded in the handoff. Do not fix it here.

- [ ] **Step 3: Check types**

Run: `cd "D:/Coedes/Production/me" && npm run check`
Expected: `0 ERRORS 6 WARNINGS`.

- [ ] **Step 4: Commit**

```bash
git add src/routes/ud84/panel/poin/+page.svelte src/components/content/ud84/UD84Navigation.svelte
git commit -m "Add the member points page

Total issued at the top, members ordered by balance, and an amount box
with Tambah and Kurang on every row -- which is how the exchange goes at
the counter.

Members holding nothing are listed too, or nobody could ever be given
their first point. After an adjustment the list reloads from the server
rather than being patched locally, so the number on screen is the number
stored."
```

---

### Task 5: Browser verification and the runbook

**Files:**
- Create: `me/docs/deployment/2026-08-07-ud84-poin-member-deploy.md`
- Temporary (do not commit): a CDP script under the scratchpad

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Start the servers**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan route:clear && php artisan config:clear && php artisan serve --port=8000   # background
cd "D:/Coedes/Production/me" && npm run dev                                                                                     # background
```

Set `isProduction` to `false` in `me/src/library/resources/phraseBox.ts`, and **restore it with `git checkout -- src/library/resources/phraseBox.ts`** afterwards — never with `sed`, which rewrites the file's line endings and leaves it dirty with an empty diff.

- [ ] **Step 2: Give a member some points to look at**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
\$m = DB::table('ud84_member')->orderBy('ID')->first(['ID','NAMA','POINT']);
DB::table('ud84_member')->where('ID',\$m->ID)->update(['POINT'=>8]);
echo 'member '.\$m->ID.' '.\$m->NAMA.' was '.(int)\$m->POINT.' now 8'.PHP_EOL;"
```

Note the member's ID and original balance — Step 5 puts it back.

- [ ] **Step 3: Drive the page in headless Chrome**

Launch Chrome with `--headless=new --remote-debugging-port=9222 --user-data-dir=<scratchpad>/chrome-profile`, and drive it over CDP from Node using the driver in `me/docs/superpowers/plans/2026-08-06-ud84-perbaikan-pesanan.md`, Task 8 Step 3 — copy it verbatim, it needs no packages.

Open the tab on `about:blank` and navigate afterwards; `localStorage` on a tab opened directly at a URL throws `SecurityError`. Seed `localStorage.Auth` as `{"name":"Ibu Heridawati","privilege":"Administrator"}`, then go to `/ud84/panel/poin`. Svelte's `bind:value` ignores a bare `el.value = x` — follow every assignment with `new Event('input', { bubbles: true })`.

Assert, with screenshots:

1. The page lists members, the seeded one showing 8, and the header total equals the sum of the visible balances.
2. Typing `3` on that row and pressing **Tambah** gives a success toast, and the row and the total both rise by 3.
3. Typing `2` and pressing **Kurang** lowers both by 2.
4. Typing a number larger than the balance and pressing **Kurang** is refused with a toast naming what the member actually has, and the row does not change.
5. Pressing either button with the box empty is refused locally, without a request.
6. The search box filters the list by name.

- [ ] **Step 4: Confirm the database agrees**

```bash
cd "D:/Coedes/Production/Marmyadose" && php artisan tinker --execute="
foreach(DB::table('ud84_member')->orderByDesc('POINT')->limit(5)->get(['ID','NAMA','POINT']) as \$m){ echo json_encode(\$m).PHP_EOL; }
echo 'total='.DB::table('ud84_member')->sum('POINT').PHP_EOL;"
```

- [ ] **Step 5: Clean up**

Put the member's `POINT` back to what Step 2 reported. Stop the servers and Chrome. Restore `phraseBox.ts` with `git checkout --`. Confirm `git status --short` in both repos shows only intended files.

- [ ] **Step 6: Write the runbook**

Create `me/docs/deployment/2026-08-07-ud84-poin-member-deploy.md` covering:

- **No SQL at all.** `ud84_member.POINT` already exists. Say this early — three of the four earlier releases had a SQL step.
- **`php artisan config:clear` is mandatory, and is the whole point of the release.** The new rate lives in `config/ud84.php`, and a stale `bootstrap/cache/config.php` would keep granting a point per 500.000 with nothing on screen to suggest it. `route:clear` too, for the two new routes.
- **It depends on the cancel-invoice release being live**, because `config/ud84.php` ships with that one. Without it, `config('ud84.poin_per_rupiah')` reads null and a sale grants no points at all.
- Backend files: `config/ud84.php`, `app/Http/Controllers/UD84/Poin.php` (new), `routes/api.php` — built with `git archive` from `main` so uncommitted work cannot leak. `routes/api.php` still needs `app/Http/Controllers/POS/EMoney.php` beside it, for the reason given in the cancel runbook.
- Frontend: confirm `isProduction = true`, merge, push, let Vercel build.
- **What the owner should expect to see:** existing balances are untouched, and from the moment this is live a sale earns half what it used to. Nothing recalculates history. On local data no member had any points at all, so the page may look empty for a while — that is the programme starting, not a fault.
- **Adjustments are not recorded**, by decision. State it in the runbook so it is not discovered during a dispute.
- Rollback: put `poin_per_rupiah` back to `500000`, re-upload the previous `routes/api.php`, delete `Poin.php`, and clear both caches. Points granted at the new rate stay granted — reverting the constant does not revisit past sales.

- [ ] **Step 7: Commit**

```bash
cd "D:/Coedes/Production/me"
git add docs/deployment/2026-08-07-ud84-poin-member-deploy.md
git commit -m "Add the deployment guide for member points

config:clear is the release. The new rate lives in config/ud84.php, and a
stale config cache would go on granting a point per 500.000 with nothing
on screen to suggest anything was wrong.

Says plainly that balances are not recalculated, that adjustments are not
recorded, and that a nearly empty page at first is the programme starting
rather than a fault."
```

---

## Definition of Done

- `php artisan test` → 147 passed, 1 failed (the pre-existing `ExampleTest` on `GET /`)
- `npm run check` → 0 errors, 6 warnings
- The page walked in a real browser, with the database confirmed to agree
- `phraseBox.ts` reads `isProduction = true` in every commit
- Both repos clean; the member touched during verification restored to its original balance
- Handoff updated after the merge: item 10 done, three items left
