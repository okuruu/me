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
                        <img src="/icons/Printer.svg" class="h-5 w-5" alt="" />
                        Cetak DL
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick={printThermal}>
                        <img src="/icons/Printer.svg" class="h-5 w-5" alt="" />
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
