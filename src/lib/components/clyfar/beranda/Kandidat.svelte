<script lang="ts">
    import { kobo } from '$lib/utils/kobo';
    import toast, { Toaster } from 'svelte-french-toast';

    export let kandidat;

    interface Candidate { // Candidate
        CREATED_AT: string;
        ENABLE_TEST: "Yes" | "No";
        GENDER: "Pria" | "Wanita";
        ID: number;
        LEVEL : string;
        LIST : string;
        NAMA : string;
        TOKEN : string;
        TTL : Date | null
        UPDATED_AT : Date | null;
        WHATSAPP : string;
    };

    const testOption: string[] = ['DISC','KRAEPELIN','MBTI','PAPI','BAUM','MSDT'];

    let isModal: boolean = false;

    let newData: Candidate[] = kandidat;
    let staticData: Candidate[] = [];

    let userAmount: number = 1;
    let test: string[];

    let searchBar: string;

    const runSearch = () => {
        newData = newData.filter(item => {
            const searchTerm = searchBar.trim().toLowerCase(); // Convert search term to lowercase
            const nama = item.NAMA.toLowerCase(); // Convert data field to lowercase
            const gender = item.GENDER.toLowerCase(); // Convert data field to lowercase
            const whatsapp = item.WHATSAPP.toLowerCase(); // Convert data field to lowercase
            const token = item.TOKEN.toLowerCase();

            return nama.includes(searchTerm) || gender.includes(searchTerm) || whatsapp.includes(searchTerm) || token.includes(searchTerm);
        });
    }

    // Open modal and set the current ayah index
    function openModal() {
        isModal = true;
    }

    // Close modal and reset the ayah
    function closeModal() {
        isModal = false;
    }

    function pressBar(event: { key: string }){
        if(event.key === 'Escape'){
            searchBar = '';
            newData = staticData;
            document.getElementById('searchController')?.focus();
        }
    }

    async function buatAkun(): Promise <void> {
        if (test.length === 0 || userAmount < 1) {
            toast.error("Jumlah minimal yang diperbolehkan adalah 1");
            return;
        }
        
        const { status, message } = await kobo({
            amount : userAmount,
            tests : test
        },'Clyfar/Create-Account')

        if ( status === 'success' ) {
            isModal = false;
            toast.success(message);
            return;
        }

        toast.error(message);
    }
</script>
<Toaster/>
<div class="card w-full bg-base-100">
    <div class="card-body">
        <div class="overflow-x-auto">
            <div class="grid grid-cols-2 gap-4">
                <div class="">
                    <label class="input input-sm input-bordered flex items-center gap-2">
                        <input type="text" id="searchController" bind:value={searchBar} on:keydown={runSearch} class="grow" placeholder="Search" />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
                    </label>
                </div>
                <div class="">
                    <button type="button" on:click={openModal} class="btn btn-sm btn-neutral">Generate Token</button>
                </div>
            </div>


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
<div class="modal" class:modal-open={isModal}>
    <div class="modal-box">
        <h3 class="font-bold text-lg">Psikotes: Buat Kandidat</h3>
        <button type="button" on:click={closeModal} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

        <hr class="mt-3 mb-7 h-0.5 border-t-0 bg-neutral-50 dark:bg-white/5" />

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="input input-sm input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                    <input type="number" min=1 max=25 bind:value={userAmount} class="grow" placeholder="0 - 25" required/>
                </label>
            </div>
            <div class="">
                <button type="button" on:click={buatAkun} class="btn btn-sm btn-neutral w-full">Buat Akun</button>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 my-3">
            {#each testOption as data }
                <div>
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">{data}</span> 
                            <input type="checkbox" bind:group={test} value="{data}" class="checkbox checkbox-primary" />
                        </label>
                    </div>
                </div>
            {/each}
        </div>
        
    </div>
    <button on:click={closeModal} class="modal-backdrop"></button>
</div>

<svelte:window on:keydown={pressBar} />