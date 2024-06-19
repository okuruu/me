<script lang="ts">
    import Kandidat from "$lib/components/clyfar/beranda/Kandidat.svelte";
    export let data;
</script>
<div class="container mx-auto">
    <Kandidat kandidat={data.data} />
</div>