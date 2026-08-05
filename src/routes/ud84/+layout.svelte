<script lang="ts">
    import { Toaster } from 'svelte-sonner';
</script>

<div data-theme="ud84" class="ud84-root min-h-screen bg-base-200 text-base-content">
    <slot />
</div>

<Toaster />

<style>
    @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter-Regular.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
    }
    @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter-Medium.ttf') format('truetype');
        font-weight: 500;
        font-style: normal;
    }
    @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter-SemiBold.ttf') format('truetype');
        font-weight: 600;
        font-style: normal;
    }
    @font-face {
        font-family: 'Inter';
        src: url('/fonts/Inter-Bold.ttf') format('truetype');
        font-weight: 700;
        font-style: normal;
    }
    .ud84-root {
        font-family: 'Inter', sans-serif;
    }
    @media print {
        /* The layout wrapper and the toaster are outside every page's own
           markup, so they print unless suppressed here. */
        .ud84-root {
            min-height: 0;
            background: transparent !important;
        }
        :global([data-sonner-toaster]) {
            display: none !important;
        }
        /* .ud84-root going transparent only uncovers whatever html/body paint.
           daisyUI themes those, so pin them white for print — otherwise the
           theme's dark band prints hard against the edge of the thermal roll. */
        :global(html),
        :global(body) {
            background: #fff !important;
        }
        /* html/body alone is not enough: the site's root layout
           (src/routes/+layout.svelte) wraps every page, including this one,
           in its own `<div data-theme={$theme}>` that sits between <body>
           and .ud84-root. daisyUI paints background-color directly on any
           element carrying a data-theme attribute, not just on html/body, so
           that div still painted its own theme's dark base-100 on top of an
           already-white body. $theme is only ever 'portfolio' or
           'portfolio-dark' (see src/library/stores/theme.ts) — pin both. */
        :global([data-theme="portfolio"]),
        :global([data-theme="portfolio-dark"]) {
            background: #fff !important;
        }
    }
</style>
