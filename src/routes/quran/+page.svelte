<script lang="ts">
    import { goto } from "$app/navigation";
    import type { Quran } from "../../interface/Quran";
    import Navbar from "../../components/Navbar.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    let searchBar: string = $state('');
    let quranChapters: Quran[] = $state(data.chapter);

    function searchSurah(){
        const searchTerm = searchBar.toLowerCase();

        let searchSurah = data.chapter.filter((quran: Quran) => {
            return quran.transliteration.toLowerCase().includes(searchTerm);
        });
        quranChapters = searchSurah;
    }

    function searchFocus() {
        searchBar = '';
    }

    function keyboardEvents(event: { key: string }){
        if(event.key === 'Escape'){
            searchFocus();
        }
    }

    function lastRead(){
        const getLocalStorage = localStorage.getItem('lastRead');
        if(getLocalStorage == null){
            toast.error("No bookmark found.")
            return;
        }

        const lastRead: { surahName: number; lastAyah: number } = JSON.parse(getLocalStorage);
        return goto(`/quran/${lastRead.surahName}#${lastRead.lastAyah}`);
    }
</script>
<div class="bg-dark {quranChapters.length < 9 ? 'min-vh-100' : ''}">
    <div class="container-xs">
        <Navbar/>
        <div class="row ">
            <div class="col-9">
                <input type="text" bind:value={searchBar} onkeyup={searchSurah} class="form-control form-control-transparent bg-dark text-white shadow" placeholder="[ESC] Cari Ayat" />
            </div>
            <div class="col-3">
                <button type="button" onclick={lastRead} class="btn btn-icon shadow-sm text-white w-100">
                    <img src="/icons/elements/Quran.svg" class="svg-warning" alt=""  />
                </button>
            </div>
        </div>
    
        {#if quranChapters.length === 0}
            <span>
                <div class="shadow-sm p-5 my-3 text-white">
                    <img src="/icons/elements/Quran.svg" class="h-20px svg-white me-2" alt="Quran Icon" /> Surat tidak ditemukan.
                </div>
            </span>
        {:else}
            {#each quranChapters as chapters }
                <a href="/quran/{chapters.id}">
                    <div class="shadow-sm p-5 my-3">
                        <div class="d-flex justify-content-between">
                            <div class="form-group">
                                <span class="fw-bold text-white">{chapters.transliteration}</span>
                                <p class="text-muted">{chapters.type === 'meccan' ? 'Makkiyah' : 'Madaniyah'} | {chapters.total_verses} ayat</p>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        {/if}
    </div>
</div>
<svelte:window onkeydown={keyboardEvents} />