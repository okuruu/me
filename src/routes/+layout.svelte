<script lang="ts">
    import '../app.css';
    import { afterNavigate } from '$app/navigation';
    import { theme } from '$library/stores/theme';
    import content from '$library/json/content.json';

    const { maintenanceMode, name, title, bio, siteUrl } = content.personal;
    const defaultDesc = bio[0];
    const base = siteUrl ?? '';

    let pageEl: HTMLDivElement;

    afterNavigate(() => {
        pageEl?.animate(
            [
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 280, easing: 'ease-out' }
        );
    });
</script>

<svelte:head>
    <meta name="description" content={defaultDesc} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="{name} – Portfolio" />
    <meta property="og:description" content={defaultDesc} />
    {#if base}<meta property="og:url" content={base} />{/if}
    {#if base}<meta property="og:image" content="{base}/images/profile.jfif" />{/if}
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:description" content={defaultDesc} />
    <meta name="twitter:title" content="{name} – {title}" />
</svelte:head>

{#if maintenanceMode}
    <div data-theme={$theme} class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p class="label-text-sm mb-4">Under Maintenance</p>
        <h1 class="font-display text-3xl font-bold text-base-content mb-3">{name}</h1>
        <p class="text-base text-base-content/60 max-w-sm">This portfolio is currently undergoing updates. Check back soon.</p>
    </div>
{:else}
    <div data-theme={$theme}>
        <div bind:this={pageEl}>
            <slot />
        </div>
    </div>
{/if}
