<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { formatTextIntoParagraphs } from "$lib/formatter/autoParagraph.js";

    export let data;
</script>
<div class="container mx-auto">
    <article class="max-w-2xl mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-4">A Lonesome Journey</h1>
        <p class="mb-5">18/02/2024 - Morning Call</p>
        <p class="text mb-8">{data.article}</p>
    </article>
    <NavigationBar/>
</div>