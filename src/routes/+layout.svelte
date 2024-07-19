<script>
    import Navbar from "../library/components/Navbar.svelte";
    import { userText } from "../library/strings";
</script>
<svelte:head>
    <title>{userText.pageTitle}</title>
    <meta charset="utf-8" />
    <meta name="description" content="{userText.about}" />
    <meta name="keywords" content="{userText.keywords}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{userText.pageTitle}" />
    <meta property="og:url" content="https://okuruu.vercel.app" />
    <meta property="og:site_name" content="{userText.pageTitle}" />
    <meta property="og:image" content="/images/avatar.jfif" />
</svelte:head>
<div class="container-xs">
    <Navbar/>
</div>
<slot/>