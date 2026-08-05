<script lang="ts">
    import { onMount, tick } from "svelte";
    import { useFetch } from "../../../../../library/hooks/db";
    import NotaDl from "../../../../../components/content/ud84/nota/NotaDL.svelte";
    import { emptyReceipt, type Receipt } from "../../../../../components/content/ud84/nota/types";

    let { data } = $props();

    type Paper = "DL" | "Thermal";

    const STORAGE_KEY = "ud84-nota-paper";
    const DL_RULE = "@page { size: 110mm 220mm; margin: 6mm; }";
    // Split so svelte-check's raw-text style-tag scanner (which runs before
    // parsing, to hand off style blocks to PostCSS) does not mistake this
    // template literal for a real element and try to lint pageRule as CSS.
    const STYLE_TAG = "style";

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
    {@html `<${STYLE_TAG}>${pageRule}</${STYLE_TAG}>`}
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
