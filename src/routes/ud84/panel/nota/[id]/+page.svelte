<script lang="ts">
    import { onMount, tick } from "svelte";
    import { useFetch } from "../../../../../library/hooks/db";
    import NotaDl from "../../../../../components/content/ud84/nota/NotaDL.svelte";
    import NotaThermal from "../../../../../components/content/ud84/nota/NotaThermal.svelte";
    import { emptyReceipt, type Receipt } from "../../../../../components/content/ud84/nota/types";

    let { data } = $props();

    type Paper = "DL" | "Thermal";

    const STORAGE_KEY = "ud84-nota-paper";
    const DL_RULE = "@page { size: 110mm 220mm; margin: 6mm; }";
    const TAIL_FEED_MM = 6; // blank strip after the signature so the cutter does not shear it

    /**
     * The original 1.15 factor was fitted while the page wrapper's `py-8`
     * (~17mm, print-only — see the container's outermost div) was still
     * live during printing, sitting outside the measured `thermalNode` but
     * still consuming page height. That made a fixed ~17mm layout bug look
     * like a gap that "scaled with content".
     *
     * With the wrapper neutralised for print (`print:px-0 print:py-0`),
     * re-measuring both `64ca60eb59cb1` (2 items) and `64ca60a842fa6`
     * (3 items) via bisection against real print-to-pdf output shows the
     * screen-measured height already matches, or very slightly *undershoots*,
     * the true minimum printable height (122mm true vs. 122.13mm measured
     * for invoice 1; 131mm true vs. 130.52mm measured for invoice 2 — at
     * most ~0.4% off, within rounding noise, not a proportional relationship).
     * `Math.ceil()` alone already absorbs that. `PRINT_SAFETY` here is not
     * compensating a measured effect — it is a small flat safety cushion
     * (~2%) against per-invoice content this pair didn't cover (long item
     * names, unusual line counts). Over-feeding a roll costs a few
     * millimetres of paper; under-feeding clips the customer's signature
     * onto a second strip, so the margin errs toward slightly more.
     */
    const PRINT_SAFETY = 1.02;
    // Split so svelte-check's raw-text style-tag scanner (which runs before
    // parsing, to hand off style blocks to PostCSS) does not mistake this
    // template literal for a real element and try to lint pageRule as CSS.
    const STYLE_TAG = "style";

    let receipt: Receipt = $state(emptyReceipt);
    let loading: boolean = $state(true);
    let notFound: boolean = $state(false);

    let paper: Paper = $state("DL");
    let pageRule: string = $state(DL_RULE);
    let thermalNode: HTMLDivElement | undefined = $state();

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

    /**
     * `@page { size: 58mm auto }` is not valid CSS — the grammar does not allow
     * mixing a length with the auto keyword — and `size: 58mm` alone means a
     * 58x58mm square page, which would slice the receipt into fragments. So the
     * height is measured from the rendered node and written into the rule.
     *
     * The page margin is 0: the 2mm visual inset lives inside
     * NotaThermal's own `.nota-thermal` padding instead, so the measured
     * node's border-box height maps 1:1 onto the page height with nothing
     * for a page margin to eat into (this also requires the page wrapper
     * outside `thermalNode` to be neutralised for print — see
     * `print:px-0 print:py-0` on the container below — otherwise its
     * padding still consumes page height without being part of the
     * measured node). What remains is PRINT_SAFETY (a small flat safety
     * cushion — see its own doc comment for the measurements behind the
     * value) and TAIL_FEED_MM (a fixed cutter allowance).
     */
    async function printThermal(): Promise<void> {
        selectPaper("Thermal");
        await tick();

        const heightPx = thermalNode?.getBoundingClientRect().height ?? 0;
        const heightMm = Math.ceil(((heightPx / 96) * 25.4) * PRINT_SAFETY) + TAIL_FEED_MM;

        pageRule = `@page { size: 58mm ${heightMm}mm; margin: 0; }`;
        await tick();
        window.print();
    }
</script>

<svelte:head>
    {@html `<${STYLE_TAG}>${pageRule}</${STYLE_TAG}>`}
</svelte:head>

<div class="mx-auto w-full max-w-md px-4 py-8 sm:px-0 print:px-0 print:py-0">
    <div class="card bg-base-100 shadow-sm print:shadow-none">
        <div class="card-body print:p-0">

            {#if loading}
                <p class="text-center text-base-content/60">Memuat nota…</p>
            {:else if notFound}
                <p class="text-center font-bold text-error">Nota tidak ditemukan.</p>
            {:else}
                <div class="no-print mb-4 flex flex-wrap items-center justify-end gap-2">
                    <button type="button" class="btn btn-sm btn-primary" onclick={printDl}>
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M6.71387 20.6768H7.61914V21.4941C7.61914 22.8037 8.24316 23.3838 9.50879 23.3838H18.4912C19.748 23.3838 20.3809 22.8037 20.3809 21.4941V20.6768H21.2861C23.0791 20.6768 24.0547 19.7363 24.0547 17.9346V9.86621C24.0547 8.07324 23.0791 7.12402 21.2861 7.12402H20.4863V6.64941C20.4863 4.86523 19.5898 4.04785 17.8672 4.04785H10.1328C8.48047 4.04785 7.51367 4.86523 7.51367 6.64941V7.12402H6.71387C4.99121 7.12402 3.94531 8.07324 3.94531 9.86621V17.9346C3.94531 19.7363 4.9209 20.6768 6.71387 20.6768ZM9.14844 6.52637C9.14844 5.87598 9.48242 5.54199 10.1328 5.54199H17.8672C18.5176 5.54199 18.8516 5.87598 18.8516 6.52637V7.12402H9.14844V6.52637ZM18.4912 12.7139H9.50879C8.28711 12.7139 7.61914 13.2939 7.61914 14.6035V19.0947H6.71387C5.99316 19.0947 5.61523 18.7168 5.61523 18.0049V9.80469C5.61523 9.08398 5.99316 8.70605 6.71387 8.70605H21.2861C22.0068 8.70605 22.376 9.08398 22.376 9.80469V18.0049C22.376 18.7168 22.0068 19.0947 21.2861 19.0947H20.3809V14.6035C20.3809 13.2939 19.748 12.7139 18.4912 12.7139ZM18.1309 10.7275C18.1309 11.3691 18.6494 11.8701 19.2822 11.8613C19.8975 11.8613 20.416 11.3604 20.416 10.7275C20.416 10.1123 19.8975 9.58496 19.2822 9.58496C18.6582 9.58496 18.1309 10.1123 18.1309 10.7275ZM9.86914 21.8457C9.44727 21.8457 9.23633 21.6436 9.23633 21.2129V14.8848C9.23633 14.4541 9.44727 14.252 9.86914 14.252H18.1396C18.5615 14.252 18.7637 14.4541 18.7637 14.8848V21.2129C18.7637 21.6436 18.5615 21.8457 18.1396 21.8457H9.86914ZM11.1084 17.1611H16.9092C17.252 17.1611 17.5068 16.8975 17.5068 16.5547C17.5068 16.2295 17.252 15.9658 16.9092 15.9658H11.1084C10.7568 15.9658 10.502 16.2295 10.502 16.5547C10.502 16.8975 10.7568 17.1611 11.1084 17.1611ZM11.1084 20.1406H16.9092C17.252 20.1406 17.5068 19.8857 17.5068 19.5518C17.5068 19.2178 17.252 18.9453 16.9092 18.9453H11.1084C10.7568 18.9453 10.502 19.2178 10.502 19.5518C10.502 19.8857 10.7568 20.1406 11.1084 20.1406Z"/>
                        </svg>
                        Cetak DL
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick={printThermal}>
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M6.71387 20.6768H7.61914V21.4941C7.61914 22.8037 8.24316 23.3838 9.50879 23.3838H18.4912C19.748 23.3838 20.3809 22.8037 20.3809 21.4941V20.6768H21.2861C23.0791 20.6768 24.0547 19.7363 24.0547 17.9346V9.86621C24.0547 8.07324 23.0791 7.12402 21.2861 7.12402H20.4863V6.64941C20.4863 4.86523 19.5898 4.04785 17.8672 4.04785H10.1328C8.48047 4.04785 7.51367 4.86523 7.51367 6.64941V7.12402H6.71387C4.99121 7.12402 3.94531 8.07324 3.94531 9.86621V17.9346C3.94531 19.7363 4.9209 20.6768 6.71387 20.6768ZM9.14844 6.52637C9.14844 5.87598 9.48242 5.54199 10.1328 5.54199H17.8672C18.5176 5.54199 18.8516 5.87598 18.8516 6.52637V7.12402H9.14844V6.52637ZM18.4912 12.7139H9.50879C8.28711 12.7139 7.61914 13.2939 7.61914 14.6035V19.0947H6.71387C5.99316 19.0947 5.61523 18.7168 5.61523 18.0049V9.80469C5.61523 9.08398 5.99316 8.70605 6.71387 8.70605H21.2861C22.0068 8.70605 22.376 9.08398 22.376 9.80469V18.0049C22.376 18.7168 22.0068 19.0947 21.2861 19.0947H20.3809V14.6035C20.3809 13.2939 19.748 12.7139 18.4912 12.7139ZM18.1309 10.7275C18.1309 11.3691 18.6494 11.8701 19.2822 11.8613C19.8975 11.8613 20.416 11.3604 20.416 10.7275C20.416 10.1123 19.8975 9.58496 19.2822 9.58496C18.6582 9.58496 18.1309 10.1123 18.1309 10.7275ZM9.86914 21.8457C9.44727 21.8457 9.23633 21.6436 9.23633 21.2129V14.8848C9.23633 14.4541 9.44727 14.252 9.86914 14.252H18.1396C18.5615 14.252 18.7637 14.4541 18.7637 14.8848V21.2129C18.7637 21.6436 18.5615 21.8457 18.1396 21.8457H9.86914ZM11.1084 17.1611H16.9092C17.252 17.1611 17.5068 16.8975 17.5068 16.5547C17.5068 16.2295 17.252 15.9658 16.9092 15.9658H11.1084C10.7568 15.9658 10.502 16.2295 10.502 16.5547C10.502 16.8975 10.7568 17.1611 11.1084 17.1611ZM11.1084 20.1406H16.9092C17.252 20.1406 17.5068 19.8857 17.5068 19.5518C17.5068 19.2178 17.252 18.9453 16.9092 18.9453H11.1084C10.7568 18.9453 10.502 19.2178 10.502 19.5518C10.502 19.8857 10.7568 20.1406 11.1084 20.1406Z"/>
                        </svg>
                        Cetak 58mm
                    </button>
                </div>

                {#if paper === "Thermal"}
                    <div bind:this={thermalNode}>
                        <NotaThermal receipt={receipt} />
                    </div>
                {:else}
                    <NotaDl receipt={receipt} />
                {/if}
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
