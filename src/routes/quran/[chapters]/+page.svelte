<script lang="ts">
    export let data;
    import toast, { Toaster } from 'svelte-french-toast';
    import Navbar from '../../../library/components/Navbar.svelte';

    async function setBookmark(aya: number) {
        const lastRead = {
            surahName: Number(data.pageChapter),
            lastAyah: aya,
        };

        localStorage.setItem('lastRead', JSON.stringify(lastRead));
        toast.success("Bookmark telah disimpan.")
    }
</script>
<Toaster/>
<div class="bg-dark">
    <div class="container-xs">
        <Navbar/>
        {#each data.chapterContents as verse, index}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (because of reasons) -->
            <div id="{index.toString()}" class="form-group" on:click={() => setBookmark(index)}>
                <p class="text-muted text-end quran-font display-5 fw-bolder">{verse.arabic}</p>
                <p class="text-gray-600 text-end">{index + 1}. {verse.transliteration}</p>
            </div>
            <div class="my-20"></div>
        {/each}
    </div>
</div>