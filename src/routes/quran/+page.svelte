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
    
        {#each quranChapters as chapters }
            <a href="/quran/{chapters.id}">
                <div class="bg-dark rounded shadow-sm my-3">
                    <div class="p-5">
                        <div class="row">
                            <div class="col">
                                <span class="fw-bold text-white">{chapters.transliteration}</span>
                                <p class="text-muted">{chapters.type === 'meccan' ? 'Makkiyah' : 'Madaniyah'} | {chapters.total_verses} ayat</p>
                            </div>
                            <div class="col">
                                <div class="d-flex justify-content-end">
                                    <p class="h1 quran-font text-white mt-3">{chapters.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>
<svelte:window onkeydown={keyboardEvents} />