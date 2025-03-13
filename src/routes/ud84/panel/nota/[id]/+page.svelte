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

<div class="container mt-20 p-4">
    <div class="row mb-3">
        <div class="col text-start">
            <h2 class="text-danger fw-bolder">UD84</h2>
        </div>
        <div class="col text-end no-print">
            <button type="button" class="btn btn-sm btn-icon btn-primary" onclick={() => window.print()}>
                <img src="/icons/elements/Printer.svg" class="h-20px svg-white" alt="" />
            </button>
        </div>
    </div>

    <div class="d-flex justify-content-between my-3">
        <span class="fs-4">Nomor Rekening a.n <b class="fw-bolder">SHOBIRUL HAQ</b></span>
        <span class="fs-5">Tanggal: <b>{getInvoices.tanggal}</b></span>
    </div>

    <div class="d-flex justify-content-between my-3">
        <span class="fs-4">BRI <b class="fw-bolder">0516-0101-4682-504</b></span>
        <span class="fs-5">Pelanggan: <b>{getInvoices.tuan}</b></span>
    </div>

    <div class="d-flex justify-content-between my-3">
        <span class="fs-4">BCA <b class="fw-bolder">3170-4041-21</b></span>
        <span class="fs-5">Alamat: <b>{getInvoices.alamat}</b></span>
    </div>

    <div class="d-flex justify-content-between my-3">
        <span class="fs-4">WhatsApp Admin <b class="fw-bolder">0858-5500-9169</b></span>
        <span class="fs-5">Poin Anda: <b>{getInvoices.point}</b></span>
    </div>

    <div class="separator my-2"></div>

    <table class="table table-bordered fs-5">
        <thead>
            <tr class="fw-bolder">
                <th class="text-center">Qty</th>
                <th>Nama Barang</th>
                <th class="text-end">Harga</th>
                <th>Jumlah</th>
            </tr>
        </thead>
        <tbody>
            {#each invoicesDetail as item}
                <tr>
                    <td class="text-center">{item.QUANTITY}</td>
                    <td>{item.NAMA}</td>
                    <td class="text-end">{rupiahFormatter.format(item.HARGA)}</td>
                    <td>{rupiahFormatter.format(item.JUMLAH)}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="separator my-5"></div>

    <div class="row mt-3 fs-5">
        <div class="col-9 text-end">
            <h4>Total: </h4>
        </div>
        <div class="col-3 text-start">
            {rupiahFormatter.format(getInvoices.total)}
        </div>
    </div>

    <div class="row mt-3 fs-5">
        <div class="col-9 text-end">
            <h4>Pembayaran Cash: </h4>
        </div>
        <div class="col-3 text-start">
            {rupiahFormatter.format(invoicesRekap.CASH)}
        </div>
    </div>

    <div class="row mt-3 fs-5">
        <div class="col-9 text-end">
            <h4>Pembayaran DP: </h4>
        </div>
        <div class="col-3 text-start">
            {rupiahFormatter.format(invoicesRekap.DP)}
        </div>
    </div>

    <div class="separator my-5"></div>

</div>
