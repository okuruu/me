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
            <span>- {rupiahFormatter.format(receipt.ringkasan.POTONGAN)}</span>
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
        /* box-sizing: border-box keeps the 54mm border-box width (and the
           2mm inset that used to come from the page's @page margin) while
           the padding is now inside the box, so the measured height in
           printThermal() includes it 1:1 — no page margin to double-count. */
        box-sizing: border-box;
        width: 54mm;
        padding: 2mm;
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
