<script>
    import Navbar from "../library/components/Navbar.svelte";
    import { userText } from "../library/strings";
</script>
<svelte:head>
    <title>{userText.pageTitle}</title>
</svelte:head>
<div class="container-xs">
    <Navbar/>
</div>
<slot/>