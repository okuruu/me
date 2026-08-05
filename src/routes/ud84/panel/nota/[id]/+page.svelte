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
     * Screen layout measures shorter than print layout — a 123mm measured receipt
     * needed ~138mm on paper in testing, and the gap scales with content rather
     * than being a fixed offset, so it is applied as a factor and not folded into
     * TAIL_FEED_MM. Over-feeding a roll costs a few millimetres of paper; under-
     * feeding clips the customer's signature onto a second strip.
     */
    const PRINT_SAFETY = 1.15;
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
     * for a page margin to eat into. What remains is PRINT_SAFETY (a
     * proportional correction for print layout measuring taller than screen
     * layout) and TAIL_FEED_MM (a fixed cutter allowance) — kept separate
     * because one scales with content and the other does not.
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

<div class="mx-auto w-full max-w-md px-4 py-8 sm:px-0">
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
