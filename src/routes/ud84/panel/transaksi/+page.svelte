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
        POTONGAN: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

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
        HARGA_PER_ITEM: number;
        JUMLAH_PER_ITEM: number;
    }

    /** One row of the editor: a stored line carries its ID, a new one does not. */
    interface BarisKoreksi {
        ID: number | null;
        KODE_ITEM: number;
        NAMA: string;
        SATUAN: string;
        TIPE: string;
        JUMLAH_PER_ITEM: number;
        JUMLAH: number;
        HARGA_ASLI: number;
        POTONGAN_PERSEN: number;
        POTONGAN_RUPIAH: number;
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
        POTONGAN: 0,
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
    //
    // On a header-only correction (DAPAT_UBAH_ITEM false) the backend does not
    // touch the lines at all -- it sums each stored HARGA_TERJUAL as-is. That
    // figure and (HARGA_ASLI - POTONGAN_PERSEN - POTONGAN_RUPIAH) * JUMLAH only
    // agree when a stored line is internally consistent, which is not
    // guaranteed for legacy rows (an empty HARGA_ASLI with a real stored
    // HARGA_TERJUAL is live in production). The preview must derive from the
    // same source the backend actually sums, or it can show a different total
    // than what gets saved.
    let totalBarangKoreksi: number = $derived(
        koreksi.DAPAT_UBAH_ITEM
            ? barisKoreksi.reduce((jumlah, baris) =>
                jumlah + Math.max(0, baris.HARGA_ASLI - baris.POTONGAN_PERSEN - baris.POTONGAN_RUPIAH) * baris.JUMLAH, 0)
            : detailTransaksi.reduce((jumlah, detail) => jumlah + Number(detail.HARGA_TERJUAL ?? 0), 0)
    );
    let totalKoreksi: number = $derived(totalBarangKoreksi - draftKoreksi.POTONGAN);

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    onMount(async () => doPost());

    // Loads the drawer's data without touching isDrawer, so a caller that
    // refreshes an already-open drawer (a saved correction) doesn't also
    // close it -- only getDetail, which opens the drawer fresh, should toggle.
    async function muatDetail(id: string): Promise <Array<Detail>> {
        const getResponse = await useFetch('UD84/Daftar-Transaksi/Detail-Transaksi/' + id);
        detailTransaksi = getResponse.detail;
        rekapTransaksi = getResponse.rekap;
        useDP = rupiahFormatter.format(rekapTransaksi.TOTAL - rekapTransaksi.DP)
        isBatalForm = false;
        alasanBatal = '';
        koreksi = getResponse.KOREKSI ?? { DAPAT_UBAH_ITEM: false, ALASAN: null };
        isKoreksiForm = false;
        alasanKoreksi = '';
        produkDipilih = '';
        await getRiwayat(id);
        return detailTransaksi;
    }

    async function getDetail(id: string): Promise <Array<Detail>>{
        const detail = await muatDetail(id);
        isDrawer = !isDrawer;
        return detail;
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

    async function mulaiKoreksi(): Promise <void> {
        draftKoreksi = {
            NAMA: rekapTransaksi.NAMA ?? '',
            KETERANGAN: rekapTransaksi.KETERANGAN ?? '',
            JATUH_TEMPO: rekapTransaksi.JATUH_TEMPO ?? '',
            CASH: Number(rekapTransaksi.CASH ?? 0),
            DP: Number(rekapTransaksi.DP ?? 0),
            POTONGAN: Number(rekapTransaksi.POTONGAN ?? 0),
        };

        if (koreksi.DAPAT_UBAH_ITEM && daftarProduk.length === 0) {
            daftarProduk = await useFetch('UD84/Master-Produk/Retrieve') ?? [];
        }

        // The dropdown must offer the product's real unit, not the stale unit
        // the sale was rung under -- look it up from the product list (loaded
        // above), falling back to the stored SATUAN only if the product is
        // somehow gone.
        barisKoreksi = detailTransaksi.map((baris) => {
            const kodeItem = Number(baris.KODE ?? 0);
            const produk = daftarProduk.find((item) => item.ID === kodeItem);

            return {
                ID: baris.ID,
                KODE_ITEM: kodeItem,
                NAMA: baris.NAMA,
                SATUAN: baris.SATUAN ?? 'Pcs',
                TIPE: produk?.TIPE ?? (baris.SATUAN ?? 'Pcs'),
                JUMLAH_PER_ITEM: Number(produk?.JUMLAH_PER_ITEM ?? 0),
                JUMLAH: Number(baris.JUMLAH),
                HARGA_ASLI: Number(baris.HARGA_ASLI),
                POTONGAN_PERSEN: Number(baris.POTONGAN_PERSEN),
                POTONGAN_RUPIAH: Number(baris.POTONGAN_RUPIAH),
            };
        });

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

        // A new line starts as loose pieces, priced from the per-piece column --
        // HARGA_JUAL is the whole-unit (Set/Dus) price, HARGA_PER_ITEM is the
        // per-piece price, and both the unit and the price stay changeable on
        // the row before saving.
        barisKoreksi = [...barisKoreksi, {
            ID: null,
            KODE_ITEM: produk.ID,
            NAMA: produk.NAMA,
            SATUAN: 'Pcs',
            TIPE: produk.TIPE,
            JUMLAH_PER_ITEM: Number(produk.JUMLAH_PER_ITEM ?? 0),
            JUMLAH: 1,
            HARGA_ASLI: Number(produk.HARGA_PER_ITEM ?? 0),
            POTONGAN_PERSEN: 0,
            POTONGAN_RUPIAH: 0,
        }];
        produkDipilih = '';
    }

    function hapusBaris(index: number): void {
        barisKoreksi = barisKoreksi.filter((_, posisi) => posisi !== index);
    }

    // Re-seed a row's price when its unit changes, so a switch between Pcs and
    // the product's own unit doesn't leave the price from the old unit behind --
    // the same HARGA_PER_ITEM / HARGA_JUAL split the POS enforces.
    function ubahSatuanBaris(index: number): void {
        const baris = barisKoreksi[index];

        if (!baris) {
            return;
        }

        const produk = daftarProduk.find((item) => item.ID === baris.KODE_ITEM);

        if (!produk) {
            return;
        }

        baris.HARGA_ASLI = baris.SATUAN === 'Pcs'
            ? Number(produk.HARGA_PER_ITEM ?? 0)
            : Number(produk.HARGA_JUAL ?? 0);
    }

    async function simpanKoreksi(): Promise <void> {
        if (alasanKoreksi.trim() === '') {
            toast.error("Alasan perbaikan wajib diisi");
            return;
        }

        // Clearing a number input gives undefined -> JSON null -> (int) null
        // = 0 on the backend, so an operator clearing CASH to retype it and
        // saving too soon would silently zero the sale's cash and strip its
        // points behind a success toast. Caught here, before the request ever
        // goes out.
        const bidangUang: Array<[string, number]> = [
            ['Pembayaran Tunai', draftKoreksi.CASH],
            ['DP', draftKoreksi.DP],
            ['Potongan Lain', draftKoreksi.POTONGAN],
        ];
        const uangTidakValid = bidangUang.find(([, nilai]) => typeof nilai !== 'number' || Number.isNaN(nilai) || nilai < 0);

        if (uangTidakValid) {
            toast.error(`${uangTidakValid[0]} harus diisi dengan angka minimal 0`);
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
        await muatDetail(rekapTransaksi.UNIQUE);
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
                    <button type="submit" class="btn btn-square btn-primary btn-sm" aria-label="Search Toggle">
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875ZM9.93945 11.6064H15.1689C15.5293 11.6064 15.8105 11.3076 15.8105 10.9561C15.8105 10.5957 15.5293 10.3145 15.1689 10.3145H9.93945C9.57031 10.3145 9.30664 10.5957 9.30664 10.9561C9.30664 11.3076 9.5791 11.6064 9.93945 11.6064ZM9.93945 13.918H13.71C14.0615 13.918 14.3516 13.6279 14.3516 13.2764C14.3516 12.916 14.0703 12.626 13.71 12.626H9.93945C9.57031 12.626 9.30664 12.916 9.30664 13.2764C9.30664 13.6279 9.5791 13.918 9.93945 13.918Z"/>
                        </svg>
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
                                            <svg viewBox="0 0 28 28" fill="currentColor" class="h-[18px] w-[18px]" aria-hidden="true">
                                                <path d="M6.71387 20.6768H7.61914V21.4941C7.61914 22.8037 8.24316 23.3838 9.50879 23.3838H18.4912C19.748 23.3838 20.3809 22.8037 20.3809 21.4941V20.6768H21.2861C23.0791 20.6768 24.0547 19.7363 24.0547 17.9346V9.86621C24.0547 8.07324 23.0791 7.12402 21.2861 7.12402H20.4863V6.64941C20.4863 4.86523 19.5898 4.04785 17.8672 4.04785H10.1328C8.48047 4.04785 7.51367 4.86523 7.51367 6.64941V7.12402H6.71387C4.99121 7.12402 3.94531 8.07324 3.94531 9.86621V17.9346C3.94531 19.7363 4.9209 20.6768 6.71387 20.6768ZM9.14844 6.52637C9.14844 5.87598 9.48242 5.54199 10.1328 5.54199H17.8672C18.5176 5.54199 18.8516 5.87598 18.8516 6.52637V7.12402H9.14844V6.52637ZM18.4912 12.7139H9.50879C8.28711 12.7139 7.61914 13.2939 7.61914 14.6035V19.0947H6.71387C5.99316 19.0947 5.61523 18.7168 5.61523 18.0049V9.80469C5.61523 9.08398 5.99316 8.70605 6.71387 8.70605H21.2861C22.0068 8.70605 22.376 9.08398 22.376 9.80469V18.0049C22.376 18.7168 22.0068 19.0947 21.2861 19.0947H20.3809V14.6035C20.3809 13.2939 19.748 12.7139 18.4912 12.7139ZM18.1309 10.7275C18.1309 11.3691 18.6494 11.8701 19.2822 11.8613C19.8975 11.8613 20.416 11.3604 20.416 10.7275C20.416 10.1123 19.8975 9.58496 19.2822 9.58496C18.6582 9.58496 18.1309 10.1123 18.1309 10.7275ZM9.86914 21.8457C9.44727 21.8457 9.23633 21.6436 9.23633 21.2129V14.8848C9.23633 14.4541 9.44727 14.252 9.86914 14.252H18.1396C18.5615 14.252 18.7637 14.4541 18.7637 14.8848V21.2129C18.7637 21.6436 18.5615 21.8457 18.1396 21.8457H9.86914ZM11.1084 17.1611H16.9092C17.252 17.1611 17.5068 16.8975 17.5068 16.5547C17.5068 16.2295 17.252 15.9658 16.9092 15.9658H11.1084C10.7568 15.9658 10.502 16.2295 10.502 16.5547C10.502 16.8975 10.7568 17.1611 11.1084 17.1611ZM11.1084 20.1406H16.9092C17.252 20.1406 17.5068 19.8857 17.5068 19.5518C17.5068 19.2178 17.252 18.9453 16.9092 18.9453H11.1084C10.7568 18.9453 10.502 19.2178 10.502 19.5518C10.502 19.8857 10.7568 20.1406 11.1084 20.1406Z"/>
                                            </svg>
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
                        <th>Diskon (Rp)</th>
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
                    <div>
                        <label for="koreksiJatuhTempo" class="label-text mb-1 block font-medium">Jatuh Tempo</label>
                        <DatePlaceholder bind:value={draftKoreksi.JATUH_TEMPO} class="input input-bordered input-sm w-full" placeholder="Jatuh Tempo"/>
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
                                    <th>Diskon (Rp)</th>
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
                                            <select bind:value={baris.SATUAN} onchange={() => ubahSatuanBaris(index)} class="select select-bordered select-sm">
                                                <option value="Pcs">Pcs (eceran)</option>
                                                {#if baris.TIPE && baris.TIPE !== 'Pcs'}
                                                    <option value={baris.TIPE}>{baris.TIPE} (isi {baris.JUMLAH_PER_ITEM} pcs)</option>
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
