<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { goto } from '$app/navigation';
    
    export let data;

    interface Quran { 
        id: number; 
        transliteration: string; 
        type : string; 
        total_verses: number; 
        name: string 
    };

    let searchBar: HTMLInputElement;
    let qurans: Quran[] = data.quran;

    function searchSurah(){
        const searchTerm = searchBar.value.toLowerCase();
        let searchSurah = data.quran.filter((quran: Quran) => {
            return quran.transliteration.toLowerCase().includes(searchTerm);
        });
        qurans = searchSurah;
    }

    const searchFocus = () => {
        searchBar.value = '';
        searchBar.focus();
    }

    function keyboardEvents(event: { key: string }){
        if(event.key === 'Escape'){
            searchFocus();
        }
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
<div class="container mx-auto p-2">
    <div class="grid grid-cols-5 gap-4">
        <div class="col-span-4">
            <label class="input input-bordered flex items-center gap-2 mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
                <input type="text" bind:this={searchBar} on:keyup={searchSurah} class="grow" placeholder="Search" />
            </label>
        </div>
        <div class="col-span-1">
            <button type="button" on:click={lastRead} class="btn shadow-xl w-full mt-3">
                <svg width="18" height="18" viewBox="0 0 48 48" class="text-orange-400 h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7H16C20.4183 7 24 10.5817 24 15V42C24 38.6863 21.3137 36 18 36H5V7Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="bevel"></path><path d="M43 7H32C27.5817 7 24 10.5817 24 15V42C24 38.6863 26.6863 36 30 36H43V7Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="bevel"></path></svg>
            </button>
        </div>
    </div>


    {#if qurans.length === 0}
        <div class="card w-full bg-base-100 shadow-xl my-7">
            <div class="card-body flex items-center justify-center">
                <h2 class="card-title">Nothing Found!</h2>
                <p>Try entering the correct title of the Surah.</p>
                <div class="card-actions">
                    <button type="button" on:click={searchFocus} class="btn btn-neutral mt-5">Sure!</button>
                </div>
            </div>
        </div>
    {:else}
        {#each qurans as qurans }
            <div class="max-w-xl mx-2">
                <a href="/quran/{qurans.id}" class="w-full bg-base-100 shadow-xl my-2 transition-transform duration-500 transform hover:scale-105 cursor-pointer rounded-2xl flex justify-between items-center p-5">
                    <div>
                        <h2 class="card-title">{qurans.transliteration}</h2>
                        <p>{qurans.type == 'meccan' ? 'Makkiyah' : 'Madaniyah'} | {qurans.total_verses} ayat</p>
                    </div>
                    <div>
                        <h2 class="text-2xl font-medium arabic">{qurans.name}</h2>
                    </div>
                </a>
            </div>
        {/each}
    {/if}

    <div class="divider mb-12"></div>
    <NavigationBar/>
</div>
<svelte:window on:keydown={keyboardEvents} />