<script lang="ts">
    import { onMount } from "svelte";
    import { useFetch } from "../../../../../library/hooks/db";
    import { rupiahFormatter } from "../../../../../library/utils/useFormat";

    interface Receipt {
        tanggal: string;
        tuan: string;
        total: number;
        alamat: string;
        point: number;
        data: Detail[];
        rekap: Rekap;
    }

    interface Detail {
        QUANTITY: number;
        NAMA: string;
        HARGA: number;
        JUMLAH: number;
    }

    interface Rekap {
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

    let { data } = $props();

    let getInvoices: Receipt = $state({
        tanggal: "",
        tuan: "",
        total: 0,
        data: [],
        alamat: '',
        point: 0,
        rekap: {
            ID: 0,
            UNIQUE: "",
            NAMA: "",
            CASH: 0,
            DP: 0,
            JATUH_TEMPO: "",
            KETERANGAN: "",
            TOTAL: 0,
            CREATED_AT: "",
            UPDATED_AT: ""
        }
    });

    let invoicesRekap: Rekap = $state({
        ID: 0,
        UNIQUE: "",
        NAMA: "",
        CASH: 0,
        DP: 0,
        JATUH_TEMPO: "",
        KETERANGAN: "",
        TOTAL: 0,
        CREATED_AT: "",
        UPDATED_AT: ""
    });
    let invoicesDetail: Detail[] = $state([]);

    onMount(async () => {
        getInvoices     = await useFetch(`UD84/Get-Invoices/${data.id}`);
        invoicesDetail  = getInvoices.data;
        invoicesRekap   = getInvoices.rekap;
        console.log(getInvoices)
    });
</script>

<style>
    @media print {
        .no-print, .no-print * {
            display: none !important;
        }
        /* .container {
            width: 100%;
            max-width: 148mm;
            padding: 10mm;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        } */
    }
</style>

<div class="mx-auto w-full max-w-md px-4 py-8 sm:px-0">
    <div class="card bg-base-100 shadow-sm">
        <div class="card-body">

            <div class="mb-4 flex items-center justify-between gap-3">
                <h2 class="text-xl font-extrabold text-error sm:text-2xl">UD84</h2>
                <button type="button" class="btn btn-sm btn-primary no-print" onclick={() => window.print()}>
                    <img src="/icons/Printer.svg" class="h-5 w-5" alt="" />
                </button>
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <span>Nomor Rekening a.n <b class="font-extrabold">SHOBIRUL HAQ</b></span>
                    <span>Tanggal: <b>{getInvoices.tanggal}</b></span>
                </div>

                <div class="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <span>BRI <b class="font-extrabold">0516-0101-4682-504</b></span>
                    <span>Pelanggan: <b>{getInvoices.tuan}</b></span>
                </div>

                <div class="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <span>BCA <b class="font-extrabold">3170-4041-21</b></span>
                    <span>Alamat: <b>{getInvoices.alamat}</b></span>
                </div>

                <div class="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <span>WhatsApp Admin <b class="font-extrabold">0858-5500-9169</b></span>
                    <span>Poin Anda: <b>{getInvoices.point}</b></span>
                </div>
            </div>

            <div class="divider my-3"></div>

            <div class="overflow-x-auto">
                <table class="table table-sm text-sm">
                    <thead>
                        <tr class="font-bold">
                            <th class="text-center">Qty</th>
                            <th>Nama Barang</th>
                            <th class="text-right">Harga</th>
                            <th>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each invoicesDetail as item}
                            <tr>
                                <td class="text-center">{item.QUANTITY}</td>
                                <td>{item.NAMA}</td>
                                <td class="text-right">{rupiahFormatter.format(item.HARGA)}</td>
                                <td>{rupiahFormatter.format(item.JUMLAH)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="divider my-3"></div>

            <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between gap-3">
                    <h4 class="font-bold">Total:</h4>
                    <span>{rupiahFormatter.format(getInvoices.total)}</span>
                </div>

                <div class="flex items-center justify-between gap-3">
                    <h4 class="font-bold">Pembayaran Cash:</h4>
                    <span>{rupiahFormatter.format(invoicesRekap.CASH)}</span>
                </div>

                <div class="flex items-center justify-between gap-3">
                    <h4 class="font-bold">Pembayaran DP:</h4>
                    <span>{rupiahFormatter.format(invoicesRekap.DP)}</span>
                </div>
            </div>

            <div class="mt-10 flex flex-wrap justify-between gap-6 text-sm">
                <span>(..........................................................)</span>
                <span>(..........................................................)</span>
            </div>

        </div>
    </div>
</div>
