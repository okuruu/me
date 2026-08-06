<script lang="ts">
    import { rupiahFormatter } from "../../../../library/utils/useFormat";
    import type { Receipt } from "./types";

    let { receipt }: { receipt: Receipt } = $props();
</script>

<div class="nota-dl">
    {#if receipt.dibatalkan}
        <div class="void-banner">TRANSAKSI DIBATALKAN</div>
    {/if}
    {#if receipt.dikoreksi && !receipt.dibatalkan}
        <div class="void-banner">NOTA KOREKSI &mdash; {receipt.dikoreksi_pada}</div>
    {/if}

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
    /* A voided sale must never reprint as an ordinary receipt. Solid black on
       white so it survives a 1-bit printer as well as a laser. */
    .void-banner {
        margin-bottom: 2mm;
        border: 1.5pt solid #000;
        padding: 1.5mm 0;
        text-align: center;
        font-size: 12pt;
        font-weight: 800;
        letter-spacing: 0.5mm;
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
