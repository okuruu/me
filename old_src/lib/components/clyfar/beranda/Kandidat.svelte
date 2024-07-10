<script lang="ts">
    import { doFetch, kobo } from '$lib/utils/kobo';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Candidate } from '$lib/utils/interface/Kandidat';

    export let kandidat;

    let newData: Candidate[] = kandidat;

    let isModal: boolean = false;

    function openModal() {
        isModal = true;
    }

    function closeModal() {
        isModal = false;
    }

</script>
<Toaster/>
<div class="card w-full bg-base-100">
    <div class="card-body">

        <div class="grid grid-cols-2 gap-2">
            <button type="button" class="btn" on:click={openModal}>Buat Kandidat</button>
            <label class="input input-bordered flex items-center">
                <input type="text" class="grow" placeholder="Kandidat" />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-4 w-4 opacity-70">
                    <path
                    fill-rule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clip-rule="evenodd" />
                </svg>
            </label>
        </div>

        <div class="overflow-x-auto">
            <table class="table table-zebra">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Token</th>
                    <th>Lihat Interpretasi</th>
                </tr>
                </thead>
                <tbody>
                    {#if newData.length === 0}
                        <tr>
                            <td colspan="8">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each newData as data, index}
                            <tr class="hover">
                                <th>{index + 1}</th>
                                <td>{data.NAMA ?? '-'}</td>
                                <td>{data.TOKEN}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-neutral">Lihat</button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal -->

<!-- Modal -->
<div class="modal" class:modal-open={isModal}>
    <div class="modal-box">
        <h3 class="font-bold text-lg">Psikotes: Buat Kandidat</h3>
        <button type="button" on:click={closeModal} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <p class="py-4">Dengan menandai ayat ini sebagai yang terakhir, kamu akan mudah menemukannya untuk dibaca lagi nanti.</p>
        <div class="modal-action">
            <button type="button" class="btn">Ya, Tandai</button>
        </div>
    </div>
    <button on:click={closeModal} class="modal-backdrop"></button>
</div>