<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";

    // Define the types for the data prop and local variables
    export let data: {
        pageChapter: string;
        chapterContents: { arabic: string; transliteration: string }[];
    };

    let ayah: number | null = null;
    let isModal: boolean = false;

    // Open modal and set the current ayah index
    function openModal(id: number) {
        ayah = id;
        isModal = true;
    }

    // Close modal and reset the ayah
    function closeModal() {
        ayah = null;
        isModal = false;
    }

    // Save the last read ayah to localStorage
    function bookmark() {
        const lastRead = {
            surahName: Number(data.pageChapter),
            lastAyah: ayah,
        };

        localStorage.setItem('lastRead', JSON.stringify(lastRead));
        closeModal();
    }
</script>

<NavigationBar />
<div class="container mx-auto">
    <div class="max-w-2xl mx-auto p-4">
        <div class="space-y-4">
            {#each data.chapterContents as verse, index}
                <button id="{index.toString()}" on:click={() => openModal(index)} class="rounded-lg p-4 text-left w-full">
                    <div class="text-2xl mb-2 text-right rtl arabic pre-line">{verse.arabic}</div>
                </button>
                <div class="text-gray-600 mb-2 mt-5 rtl text-right">{index + 1}. {verse.transliteration}</div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal -->
<div class="modal" class:modal-open={isModal}>
    <div class="modal-box">
        <h3 class="font-bold text-lg">Tandai Ayat Terakhir!</h3>
        <button type="button" on:click={closeModal} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <p class="py-4">Dengan menandai ayat ini sebagai yang terakhir, kamu akan mudah menemukannya untuk dibaca lagi nanti.</p>
        <div class="modal-action">
            <button type="button" class="btn" on:click={bookmark}>Ya, Tandai</button>
        </div>
    </div>
    <button on:click={closeModal} class="modal-backdrop"></button>
</div>