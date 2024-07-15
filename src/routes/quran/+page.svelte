<script lang="ts">
    import { goto } from '$app/navigation';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Chapters } from '../../library/interface/Quran.js';

    export let data;
 
    let searchBar: HTMLInputElement;
    let quranChapters: Chapters[] = data.quran;

    function searchFocus() {
        searchBar.value = '';
        searchBar.focus();
    }

    function keyboardEvents(event: { key: string }){
        if(event.key === 'Escape'){
            searchFocus();
        }
    }

    function searchSurah(){
        const searchTerm = searchBar.value.toLowerCase();
        let searchSurah = data.quran.filter((quran: Chapters) => {
            return quran.transliteration.toLowerCase().includes(searchTerm);
        });
        quranChapters = searchSurah;
    }

    function lastRead(){
        const getLocalStorage = localStorage.getItem('lastRead');
        if(getLocalStorage == null){
            toast('Kamu belum menandai ayat terakhir!', { icon: '👏', style: 'border-radius: 200px; background: #333; color: #fff;' });
            return;
        }
        const lastRead: { surahName: number; lastAyah: number } = JSON.parse(getLocalStorage);
        return goto(`/quran/${lastRead.surahName}#${lastRead.lastAyah}`);
    }
</script>
<Toaster/>
<div class="container-xs">
    <div class="row ">
        <div class="col-9">
            <input type="text" bind:this={searchBar} on:keyup={searchSurah} class="form-control form-control-transparent bg-dark text-white shadow" placeholder="[ESC] Cari Ayat" />
        </div>
        <div class="col-3">
            <button type="button" on:click={lastRead} class="btn btn-icon shadow-sm text-white w-100">
                <svg width="18" height="18" viewBox="0 0 48 48" class="text-orange-400 h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7H16C20.4183 7 24 10.5817 24 15V42C24 38.6863 21.3137 36 18 36H5V7Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="bevel"></path><path d="M43 7H32C27.5817 7 24 10.5817 24 15V42C24 38.6863 26.6863 36 30 36H43V7Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="bevel"></path></svg>
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
<svelte:window on:keydown={keyboardEvents} />