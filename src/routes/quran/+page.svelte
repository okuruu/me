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

<div class="min-vh-100 bg-base-100 pb-12">
    <div class="max-w-md mx-auto px-4">
        <Navbar/>
        
        <!-- Search and Bookmark Section -->
        <div class="flex gap-2 mb-8">
            <div class="relative flex-grow">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
              <input 
                type="text" 
                bind:value={searchBar} 
                onkeyup={searchSurah} 
                class="input input-bordered w-full pl-10 bg-base-100/50 focus:bg-base-100 transition-all shadow-md rounded-2xl border-white/5" 
                placeholder="[ESC] Cari Surat..." 
              />
            </div>
            <button 
              type="button" 
              onclick={lastRead} 
              class="btn btn-primary shadow-lg rounded-2xl w-14 shrink-0"
              title="Terakhir Dibaca"
            >
                <img src="/icons/Quran-book.svg" class="h-6 w-6 brightness-0 invert" alt="Last Read" />
            </button>
        </div>
    
        {#if quranChapters.length === 0}
            <div class="card bg-base-100 shadow-xl border border-dashed border-white/10">
                <div class="card-body items-center text-center p-12">
                    <img src="/icons/Quran-book.svg" class="h-16 w-16 opacity-20 mb-4" alt="Quran Icon" />
                    <h2 class="text-xl font-bold opacity-50">Surat tidak ditemukan</h2>
                    <p class="text-sm opacity-30 mt-1">Coba kata kunci lain</p>
                </div>
            </div>
        {:else}
            <div class="grid grid-cols-1 gap-4 text-white">
                {#each quranChapters as chapters }
                    <a href="/quran/{chapters.id}" class="group">
                        <div class="card bg-base-100 shadow-md hover:shadow-xl hover:bg-base-200 ring-1 ring-white/5 transition-all duration-300 rounded-2xl">
                            <div class="card-body p-6">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center gap-4">
                                      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {chapters.id}
                                      </div>
                                      <div>
                                          <h3 class="font-bold text-lg leading-tight">{chapters.transliteration}</h3>
                                          <div class="flex items-center gap-2 mt-1">
                                            <span class="badge badge-neutral badge-xs font-bold text-[9px] uppercase tracking-wider h-auto py-0.5">{chapters.type === 'meccan' ? 'Makkiyah' : 'Madaniyah'}</span>
                                            <span class="text-[11px] opacity-40 font-medium">{chapters.total_verses} Ayat</span>
                                          </div>
                                      </div>
                                    </div>
                                    <div class="text-2xl font-quran opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                                      →
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</div>

<svelte:window onkeydown={keyboardEvents} />
