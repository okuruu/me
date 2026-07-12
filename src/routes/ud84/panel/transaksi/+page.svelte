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

    interface Transaksi {
        ID: string;
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

    let nominalTransaksi:number     = $state(0);
    let nominalDP:number            = $state(0);
    let nominalTunai:number         = $state(0);
    let nominalPotongan: number     = $state(0);
    let nominalKembalian: number    = $state(0);

    let useDP: string = $state('');;

    let isDrawer: boolean = $state(false);

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    onMount(async () => doPost());

    async function initializePage(): Promise <void>{
        const doResponse    = await useFetch('UD84/Daftar-Transaksi');
        daftarTransaksi     = doResponse.data;
        nominalTransaksi    = doResponse.TRANSAKSI;
        nominalDP           = doResponse.DP;
        nominalTunai        = doResponse.BAYAR_TUNAI;
        nominalPotongan     = doResponse.POTONGAN;
        nominalKembalian    = doResponse.KEMBALIAN;
    }

    async function getDetail(id: string): Promise <Array<Detail>>{
        const getResponse = await useFetch('UD84/Daftar-Transaksi/Detail-Transaksi/' + id);
        detailTransaksi = getResponse.detail;
        rekapTransaksi = getResponse.rekap;
        useDP = rupiahFormatter.format(rekapTransaksi.TOTAL - rekapTransaksi.DP)
        isDrawer = !isDrawer;
        return detailTransaksi;
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
                    initializePage();
                }
            },
        })
    }

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            start: useInput.startDate,
            end: useInput.endDate,
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
            <label class="flex cursor-pointer items-center gap-2 lg:pb-1">
                <input type="checkbox" class="toggle toggle-sm" onchange={reverseData}/>
                <span class="label-text font-bold">A-Z</span>
            </label>
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
                            <tr>
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
                                <td class="text-left font-medium">{data.NAMA}</td>
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
                                    <a href="/ud84/panel/nota/{data.ID}" target="_blank" class="btn btn-sm btn-info">
                                        <img src="/icons/Printer.svg" alt="Print" height="18" />
                                        Cetak Ulang
                                    </a>
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
        <h3 class="text-lg font-bold">Detail Transaksi</h3>

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

        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div class="flex-1">
                <label for="nominalDP" class="label-text mb-1 block font-medium">Pelunasan DP</label>
                <Rupiah id="nominalDP" bind:value={useDP} useClass="input input-bordered input-sm w-full text-error"/>
            </div>
            <button type="button" onclick={updateDownPayment} class="btn btn-sm btn-primary">Simpan DP</button>
        </div>

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
    </div>
</Drawer>
