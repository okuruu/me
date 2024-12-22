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
        toast.success("Bookmarked.");
    }

    function applyTajweed(ayah: string): string {
        let result = ayah;
        tajweedRules.forEach(rule => {
            result = result.replace(rule.pattern, match => `<span style="color: ${rule.color}">${match}</span>`);
        });
        return result;
    }
</script>
<div class="bg-dark">
    <div class="container-xs">
        <Navbar/>
        {#each tajweedCorrection as verse, index}
        <div id="{index.toString()}" class="form-group">
            <p class="text-muted text-end quran-font display-5 fw-bolder">{@html verse.arabic}</p>

            <div class="d-flex justify-content-end mb-5">
                <button type="button" onclick={() => setBookmark(index)} class="btn btn-xs btn-icon border border-white">
                    <img src="/icons/elements/Bookmark.svg" alt="" class="w-15px"/>
                </button>
            </div>
            <p class="text-gray-600 text-end">{index + 1}. {verse.transliteration}</p>
            
        </div>
        <div class="my-20"></div>
        {/each}
    </div>
</div>