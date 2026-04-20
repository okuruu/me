<script lang="ts">
    import { toast } from "svelte-sonner";
    import Navbar from "../../../components/Navbar.svelte";

    interface Chapters { 
        arabic: string; 
        transliteration: string; 
    }

    let { data } = $props();
    let quranChapters: Chapters[] = data.chapterContents;
    let tajweedCorrection: Chapters[] = $state([]);

    const tajweedRules: { pattern: RegExp; color: string; }[] = [
        { pattern: /[ن|م]ّ/gu, color: '#FF6B6B' }, // Idgham bighunnah
        { pattern: /[ب|ق|ط|د|ج]ْ/gu, color: '#6BCB77' }, // Qalqalah
        { pattern: /نْ(?=[ثجتحخدذرزسشصضطظفقكملن])/gu, color: '#A16AE8' }, // Ikhfa
        { pattern: /نْ(?=ب)/gu, color: '#4D96FF' }, // Iqlab
        { pattern: /[اوي]ـ/gu, color: '#FFA500' }, // Madd
        { pattern: /مْ(?=ب)/gu, color: '#FFD700' }, // Ikhfa Shafawi
        { pattern: /لّ(?=[تثدذرزسشصضطظ])/gu, color: '#FF69B4' } // Lam Shamsiyyah
    ];

    $effect(() => {
        tajweedCorrection = quranChapters.map(chapter => ({
            arabic: applyTajweed(chapter.arabic),
            transliteration: chapter.transliteration, 
        }));
    });

    async function setBookmark(aya: number) {
        const lastRead = {
            surahName: Number(data.pageChapter),
            lastAyah: aya,
        };

        localStorage.setItem('lastRead', JSON.stringify(lastRead));
        toast.success("Bookmark disimpan!");
    }

    function applyTajweed(ayah: string): string {
        let result = ayah;
        tajweedRules.forEach(rule => {
            result = result.replace(rule.pattern, match => `<span style="color: ${rule.color}">${match}</span>`);
        });
        return result;
    }
</script>

<div class="min-vh-100 bg-base-100 pb-20">
    <div class="max-w-md mx-auto px-4">
        <Navbar/>
        
        <div class="card bg-base-100 shadow-xl mb-12 rounded-2xl overflow-hidden ring-1 ring-white/5">
          <div class="card-body p-8 items-center text-center">
            <h1 class="text-3xl font-bold text-primary tracking-tight">{data.pageTitle}</h1>
            <p class="text-xs opacity-40 font-bold uppercase tracking-[0.2em] mt-2">Surah Nomor {data.pageChapter}</p>
          </div>
        </div>

        <div class="space-y-12">
            {#each tajweedCorrection as verse, index}
            <div id="{index.toString()}" class="group relative">
                <!-- Verse Number Wrapper -->
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                      {index + 1}
                    </div>
                    <button 
                      type="button" 
                      onclick={() => setBookmark(index)} 
                      class="btn btn-ghost btn-circle btn-xs opacity-30 hover:opacity-100 hover:text-primary transition-all"
                      title="Bookmark Ayat"
                    >
                        <img src="/icons/Bookmark.svg" alt="Bookmark" class="w-4 h-4"/>
                    </button>
                  </div>
                  <div class="h-px flex-grow bg-gradient-to-r from-primary/20 to-transparent mx-4 opacity-10"></div>
                </div>

                <!-- Arabic Text -->
                <p class="text-right quran-font text-4xl leading-[2.5] text-white opacity-90 drop-shadow-sm transition-all hover:opacity-100 select-all tracking-normal">
                  {@html verse.arabic}
                </p>

                <!-- Transliteration -->
                <div class="mt-8 bg-base-100/30 p-4 rounded-xl border border-white/5 group-hover:bg-base-100 transition-colors">
                  <p class="text-base-content/70 italic text-sm leading-relaxed text-right font-medium">
                    {verse.transliteration}
                  </p>
                </div>
            </div>
            {/each}
        </div>
    </div>
</div>