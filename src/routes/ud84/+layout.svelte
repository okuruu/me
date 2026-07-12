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
</style>
