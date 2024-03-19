<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
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

    function keyboardEvents(event: { key: string }){
        if(event.key === 'Escape'){
            searchBar.value = '';
            searchBar.focus();
        }
    }
</script>
<div class="container mx-auto">
    <label class="input input-bordered flex items-center gap-2 mt-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
        <input type="text" bind:this={searchBar} on:keyup={searchSurah} class="grow" placeholder="Search" />
        Press <kbd class="kbd kbd-sm">Esc</kbd> to search surah.
    </label>

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
    
    <div class="divider mb-12"></div>
    <NavigationBar/>
</div>
<svelte:window on:keydown={keyboardEvents} />