<script lang="ts">
    import { Toaster} from 'svelte-sonner';
    import { useString } from '../library/config/useString';
</script>
<svelte:head>
    <title>{useString.pageTitle}</title>
    <meta charset="utf-8" />
    <meta name="description" content="{useString.about}" />
    <meta name="keywords" content="{useString.keywords}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{useString.pageTitle}" />
    <meta property="og:url" content="https://okuruu.vercel.app" />
    <meta property="og:site_name" content="{useString.pageTitle}" />
    <meta property="og:image" content="/images/avatar.jfif" />
</svelte:head>
<Toaster/>
<slot/>