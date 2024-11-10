<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import Navbar from '../../../library/components/Navbar.svelte';
    interface Props {
        data: any;
    }

    let { data }: Props = $props();

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
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
            <div id="{index.toString()}" class="form-group" onclick={() => setBookmark(index)}>
                <p class="text-muted text-end quran-font display-5 fw-bolder">{verse.arabic}</p>
                <p class="text-gray-600 text-end">{index + 1}. {verse.transliteration}</p>
            </div>
            <div class="my-20"></div>
        {/each}
    </div>
</div>