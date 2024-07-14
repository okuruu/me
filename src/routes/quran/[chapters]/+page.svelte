<script lang="ts">
    export let data;
</script>
<div class="container-xs">
    {#each data.chapterContents as verse, index}
        <div class="form-group">
            <p class="text-muted text-end quran-font display-5 fw-bolder">{verse.arabic}</p>
            <p class="text-gray-600 text-end">{index + 1}. {verse.transliteration}</p>
        </div>
        <div class="my-20"></div>
    {/each}
</div>