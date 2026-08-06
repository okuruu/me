<script lang="ts">
    import { onMount } from "svelte";
    import { Carbon, currencySanitizer, rupiahFormatter } from "../../../../library/utils/useFormat";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import Drawer from "../../../../components/shared/Drawer.svelte";
    import Rupiah from "../../../../components/shared/Rupiah.svelte";
    import { toast } from "svelte-sonner";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import RiwayatPanel from "../../../../components/shared/RiwayatPanel.svelte";
    import { operatorSaatIni } from "../../../../library/utils/useAuth";
    import type { Riwayat } from "../../../../library/types/riwayat";

    type Status = "Aktif" | "Dibatalkan";

    interface Transaksi {
        ID: string;
        STATUS: Status;
        TANGGAL: string;
        JATUH_TEMPO: string;
        NAMA: string;
        NOMINAL: number;
        DP: number;
        BAYAR_TUNAI: number;
        POTONGAN: number;
        KEMBALIAN: number;
    }

    interface Rekap {
        ID: number;
        UNIQUE: string;
        STATUS: Status;
        NAMA: string;
        CASH: number;
        DP: number;
        JATUH_TEMPO: string;
        KETERANGAN: string | null;
        TOTAL: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    interface Detail {
        ID: number;
        UNIQUE: string;
        KODE: string | null;
        NAMA: string;
        JUMLAH: number;
        HARGA_ASLI: number;
        HARGA_TERJUAL: number;
        POTONGAN_PERSEN: number;
        POTONGAN_RUPIAH: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    let daftarTransaksi: Transaksi[] = $state([]);

    let rekapTransaksi: Rekap = $state({
        ID: 0,
        UNIQUE: '',
        STATUS: 'Aktif',
        NAMA: '',
        CASH: 0,
        DP: 0,
        JATUH_TEMPO: '',
        KETERANGAN: '',
        TOTAL: 0,
        CREATED_AT: '',
        UPDATED_AT: ''
    });
    let detailTransaksi: Detail[] = $state([]);
    let riwayatTransaksi: Riwayat[] = $state([]);

    let nominalTransaksi:number     = $state(0);
    let nominalDP:number            = $state(0);
    let nominalTunai:number         = $state(0);
    let nominalPotongan: number     = $state(0);
    let nominalKembalian: number    = $state(0);

    let useDP: string = $state('');;

    let isDrawer: boolean = $state(false);

    // Cancelled sales are hidden until this is ticked; the backend keeps them
    // out of the totals either way.
    let tampilkanBatal: boolean = $state(false);

    // The cancel confirmation lives inside the drawer rather than in a modal:
    // the Drawer closes on any mousedown outside its panel, so a separate
    // dialog element would take the drawer down with it.
    let isBatalForm: boolean = $state(false);
    let alasanBatal: string = $state('');
    let sedangMembatalkan: boolean = $state(false);

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    onMount(async () => doPost());

    async function getDetail(id: string): Promise <Array<Detail>>{
        const getResponse = await useFetch('UD84/Daftar-Transaksi/Detail-Transaksi/' + id);
        detailTransaksi = getResponse.detail;
        rekapTransaksi = getResponse.rekap;
        useDP = rupiahFormatter.format(rekapTransaksi.TOTAL - rekapTransaksi.DP)
        isBatalForm = false;
        alasanBatal = '';
        await getRiwayat(id);
        isDrawer = !isDrawer;
        return detailTransaksi;
    }

    async function getRiwayat(id: string): Promise <void> {
        const { status, data } = await db({ KODE: id }, 'UD84/Daftar-Transaksi/Riwayat');
        riwayatTransaksi = status === "error" ? [] : (data ?? []);
    }

    async function updateDownPayment(): Promise <void> {
        toast('Update: Down Payment', {
            description: 'Apakah anda yakin?',
            action: {
            label: 'Ya, Update',
                onClick: async () => {

                    const { status, message } = await db({
                        KODE: rekapTransaksi.UNIQUE,
                        DP: currencySanitizer(useDP),
                        OLD_DP: rekapTransaksi.DP,
                    }, 'UD84/Daftar-Transaksi/Update-DP');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.success(message);
                    doPost();
                }
            },
        })
    }

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            start: useInput.startDate,
            end: useInput.endDate,
            TAMPILKAN_BATAL: tampilkanBatal,
        }, 'UD84/Daftar-Transaksi/Search');

        if (status === "error") {
            toast.error(message);
            return;
        }

        daftarTransaksi     = data.data;
        nominalTransaksi    = data.TRANSAKSI;
        nominalDP           = data.DP;
        nominalTunai        = data.BAYAR_TUNAI
        nominalPotongan     = data.POTONGAN;
        nominalKembalian    = data.KEMBALIAN;
    }

    function reverseData(): Transaksi[] {
        daftarTransaksi = daftarTransaksi.reverse();
        return daftarTransaksi;
    }

    async function batalkanTransaksi(): Promise <void> {
        if (alasanBatal.trim() === '') {
            toast.error("Alasan pembatalan wajib diisi");
            return;
        }

        sedangMembatalkan = true;

        const { status, message, data } = await db({
            KODE: rekapTransaksi.UNIQUE,
            ALASAN: alasanBatal,
            OPERATOR: operatorSaatIni(),
        }, 'UD84/Daftar-Transaksi/Batal');

        sedangMembatalkan = false;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);

        // Stock that could not be returned is the one thing here nobody may
        // miss, so this toast waits to be dismissed instead of expiring.
        const gagalRestok: string[] = data?.GAGAL_RESTOK ?? [];

        if (gagalRestok.length > 0) {
            toast.warning(`Stok untuk ${gagalRestok.length} item tidak dikembalikan otomatis`, {
                description: `${gagalRestok.join(', ')} — silakan sesuaikan lewat Logistik.`,
                duration: Number.POSITIVE_INFINITY,
                closeButton: true,
                action: {
                    label: 'Mengerti',
                    onClick: () => {}
                },
            });
        }

        isBatalForm = false;
        alasanBatal = '';
        rekapTransaksi.STATUS = 'Dibatalkan';

        await getRiwayat(rekapTransaksi.UNIQUE);
        await doPost();
    }
</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Daftar Transaksi: Rekap Penjualan</h3>
        </div>

        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" onsubmit={doPost}>
                <div>
                    <label for="startDate" class="label-text mb-1 block font-medium">Pencarian Awal</label>
                    <DatePlaceholder bind:value={useInput.startDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Awal"/>
                </div>
                <div>
                    <label for="endDate" class="label-text mb-1 block font-medium">Pencarian Akhir</label>
                    <DatePlaceholder bind:value={useInput.endDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Akhir"/>
                </div>
                <div class="flex items-end">
                    <button type="submit" class="btn btn-square btn-primary btn-sm">
                        <img src="/icons/Search.svg" class="h-5 w-5" alt="Search Toggle" />
                    </button>
                </div>
            </form>
            <div class="flex flex-wrap items-center gap-5 lg:pb-1">
                <label class="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" class="toggle toggle-sm" onchange={reverseData}/>
                    <span class="label-text font-bold">A-Z</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" class="toggle toggle-sm" bind:checked={tampilkanBatal} onchange={doPost}/>
                    <span class="label-text font-bold">Tampilkan Dibatalkan</span>
                </label>
            </div>
        </div>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th>Tanggal Transaksi</th>
                        <th class="hidden md:table-cell">Jatuh Tempo</th>
                        <th class="text-left">Nama Pelanggan</th>
                        <th>Nominal Transaksi</th>
                        <th class="hidden lg:table-cell">Potongan Lain</th>
                        <th>DP</th>
                        <th class="hidden lg:table-cell">Kembalian</th>
                        <th class="hidden md:table-cell">Bayar Tunai</th>
                        <th>Cetak Ulang</th>
                        <th>Lihat Detail Transaksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#if daftarTransaksi.length === 0}
                        <tr>
                            <td colspan="11" class="text-center text-base-content/60">Tidak ada data transaksi</td>
                        </tr>
                    {:else}
                        {#each daftarTransaksi as data, index}
                            <tr class={data.STATUS === 'Dibatalkan' ? 'text-base-content/40' : ''}>
                                <td>
                                    {#if data.JATUH_TEMPO !== '-'}
                                        {#if data.DP == data.NOMINAL}
                                            <span class="badge badge-success">{index + 1}</span>
                                        {:else}
                                            <span class="badge badge-error">{index + 1}</span>
                                        {/if}
                                    {:else}
                                        {index + 1}
                                    {/if}
                                </td>
                                <td>{data.TANGGAL}</td>
                                <td class="hidden md:table-cell">{data.JATUH_TEMPO}</td>
                                <td class="text-left font-medium">
                                    {data.NAMA}
                                    {#if data.STATUS === 'Dibatalkan'}
                                        <span class="badge badge-outline badge-error badge-sm ml-1 align-middle">Dibatalkan</span>
                                    {/if}
                                </td>
                                <td>{rupiahFormatter.format(data.NOMINAL)}</td>
                                <td class="hidden lg:table-cell">{rupiahFormatter.format(data.POTONGAN)}</td>
                                <td>
                                    {#if data.DP !== 0}
                                        <span class="badge badge-warning">{rupiahFormatter.format(data.DP)}</span>
                                    {:else}
                                        {rupiahFormatter.format(data.DP)}
                                    {/if}
                                </td>
                                <td class="hidden lg:table-cell">{rupiahFormatter.format(data.KEMBALIAN)}</td>
                                <td class="hidden md:table-cell">{rupiahFormatter.format(data.BAYAR_TUNAI)}</td>
                                <td>
                                    {#if data.STATUS === 'Dibatalkan'}
                                        <span class="text-xs text-base-content/50">Tidak dapat dicetak</span>
                                    {:else}
                                        <a href="/ud84/panel/nota/{data.ID}" target="_blank" class="btn btn-sm btn-info">
                                            <img src="/icons/Printer.svg" alt="Print" height="18" />
                                            Cetak Ulang
                                        </a>
                                    {/if}
                                </td>
                                <td>
                                    <button type="button" onclick={() => getDetail(data.ID)} class="btn btn-sm btn-primary">Lihat</button>
                                </td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="4" class="font-extrabold">Total</td>
                            <td class="font-extrabold text-success">{ rupiahFormatter.format(nominalTransaksi) }</td>
                            <td class="hidden font-extrabold text-error lg:table-cell">{ rupiahFormatter.format(nominalPotongan) }</td>
                            <td class="font-extrabold text-warning">{ rupiahFormatter.format(nominalDP) }</td>
                            <td class="hidden font-extrabold text-info lg:table-cell">{ rupiahFormatter.format(nominalKembalian) }</td>
                            <td class="hidden font-extrabold text-primary md:table-cell">{ rupiahFormatter.format(nominalTunai) }</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

    </div>
</div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="w-full p-5">
        <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-lg font-bold">Detail Transaksi</h3>
            {#if rekapTransaksi.STATUS === 'Dibatalkan'}
                <span class="badge badge-error">Dibatalkan</span>
            {/if}
        </div>

        <div class="divider my-3"></div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="totalTransaksi" class="label-text mb-1 block font-medium">Total Transaksi</label>
                <input type="text" id="totalTransaksi" class="input input-bordered input-sm w-full text-success" placeholder="Nama Pelanggan" value="{rupiahFormatter.format(rekapTransaksi.TOTAL)}" readonly/>
            </div>

            <div>
                <label for="nominalPembayaran" class="label-text mb-1 block font-medium">Pembayaran Cash</label>
                <input type="text" id="nominalPembayaran" class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan" value="{rupiahFormatter.format(rekapTransaksi.CASH)}" readonly/>
            </div>

            <div>
                <label for="jatuhTempo" class="label-text mb-1 block font-medium">Jatuh Tempo</label>
                <input type="text" id="jatuhTempo" class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan" value="{Carbon(rekapTransaksi.JATUH_TEMPO, "date")}" readonly/>
            </div>

            <div>
                <label for="keteranganTransaksi" class="label-text mb-1 block font-medium">Keterangan</label>
                <input type="text" id="keteranganTransaksi" class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan" value="{rekapTransaksi.KETERANGAN}" readonly/>
            </div>
        </div>

        {#if rekapTransaksi.STATUS !== 'Dibatalkan'}
            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div class="flex-1">
                    <label for="nominalDP" class="label-text mb-1 block font-medium">Pelunasan DP</label>
                    <Rupiah id="nominalDP" bind:value={useDP} useClass="input input-bordered input-sm w-full text-error"/>
                </div>
                <button type="button" onclick={updateDownPayment} class="btn btn-sm btn-primary">Simpan DP</button>
            </div>
        {/if}

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle">
                <thead>
                    <tr class="font-bold">
                        <th class="text-left">Nama Produk</th>
                        <th class="text-center">Jumlah</th>
                        <th>Harga Terjual</th>
                        <th>Potongan Persen</th>
                        <th>Potongan Rupiah</th>
                    </tr>
                </thead>
                <tbody>
                    {#each detailTransaksi as detail,index }
                        <tr>
                            <td class="text-left">
                                <span class="font-extrabold text-warning">{ detail.NAMA }</span> <br/>
                                <span>{ rupiahFormatter.format(detail.HARGA_ASLI) }</span>
                            </td>
                            <td class="text-center">{ detail.JUMLAH }</td>
                            <td>{ rupiahFormatter.format(detail.HARGA_TERJUAL) }</td>
                            <td>{ rupiahFormatter.format(detail.POTONGAN_PERSEN) }</td>
                            <td>{ rupiahFormatter.format(detail.POTONGAN_RUPIAH) }</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="divider my-3"></div>

        <div class="rounded-lg border border-error/30 p-4">
            <h4 class="mb-2 font-bold text-error">Pembatalan Transaksi</h4>

            {#if rekapTransaksi.STATUS === 'Dibatalkan'}
                <p class="text-sm text-base-content/70">
                    Transaksi ini sudah dibatalkan. Stok dan poin sudah dikembalikan sejauh yang bisa
                    dilakukan sistem — rinciannya ada pada riwayat di bawah.
                </p>
            {:else if !isBatalForm}
                <p class="mb-3 text-sm text-base-content/70">
                    Membatalkan transaksi akan mengembalikan stok dan poin, serta mengeluarkan transaksi ini
                    dari semua perhitungan omzet. Nominal pembayaran tidak diubah.
                </p>
                <button type="button" onclick={() => isBatalForm = true} class="btn btn-sm btn-error">Batalkan Transaksi</button>
            {:else}
                <label for="alasanBatal" class="label-text mb-1 block font-medium">Alasan Pembatalan</label>
                <textarea id="alasanBatal" bind:value={alasanBatal} rows="3" class="textarea textarea-bordered w-full" placeholder="Contoh: Pelanggan membatalkan pesanan, barang dikembalikan utuh"></textarea>
                <p class="mt-1 mb-3 text-sm text-base-content/60">
                    Alasan wajib diisi dan tercatat bersama nama operator serta waktu pembatalan.
                </p>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick={batalkanTransaksi} class="btn btn-sm btn-error" disabled={sedangMembatalkan}>
                        {sedangMembatalkan ? 'Memproses...' : 'Ya, Batalkan Transaksi'}
                    </button>
                    <button type="button" onclick={() => { isBatalForm = false; alasanBatal = ''; }} class="btn btn-sm btn-ghost" disabled={sedangMembatalkan}>Tidak Jadi</button>
                </div>
            {/if}
        </div>

        <RiwayatPanel entries={riwayatTransaksi} />
    </div>
</Drawer>
