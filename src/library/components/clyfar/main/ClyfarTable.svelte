<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { callRequest, db } from '../../../utils/db';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Testee } from '../../../interface/Clyfar';
    import { estimateAge } from '../../../utils/formatTime';

    let newData: Testee[] = [];
    let newDataDefault: Testee[] = [];

    // onMount(async () => {
    //     newData = await callRequest('Clyfar/Dashboard');
    //     newDataDefault = newData;
    // });
    
    let key:string;
    let searchBar: string = '';
    let searchBarController:HTMLElement;

    function filterData(searchTerm: string): void {
        const term = searchTerm.toLowerCase();
        newData = newDataDefault.filter(item => {
            return (
                item.TOKEN.toLowerCase().includes(term) ||
                (item.NAMA && item.NAMA.toLowerCase().includes(term)) ||
                (item.WHATSAPP && item.WHATSAPP.toLowerCase().includes(term))
            );
        });
    }

    async function view(id: string): Promise<void> {
        const { status, message, data } = await db({ token: id }, 'Clyfar/Check-Testee');
        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }
        toast.error(message);
    }

    function keyPrompt(eventPressed:any){
        key = eventPressed.key;
        if (key == 'Escape'){
            searchBar = '';
            searchBarController.focus();
        }
    }
</script>
<Toaster/>
<div class="row border rounded w-25">
    <div class="col-1 text-center mt-1">
        <img src="/icons/elements/black/Search.svg" alt="Search Icon" class="h-30px" />
    </div>
    <div class="col">
        <input type="text" bind:this={searchBarController} bind:value={searchBar} on:keyup={() => filterData(searchBar)} class="form-control form-control-sm form-control-flush" placeholder="[ESC] Pencarian..." />
    </div>
</div>

<div class="table-responsive">
    <table class="table table-hover align-middle text-center mt-5">
        <thead>
            <tr class="fw-bolder">
                <th>#</th>
                <th>Token</th>
                <th>Jenis Tes</th>
                <th>Nama</th>
                <th>Jenis Kelamin</th>
                <th>Tanggal Lahir / Usia</th>
                <th>WhatsApp</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#each newData as data, index}
                <tr>
                    <td>{index + 1}</td>
                    <td>{data.TOKEN}</td>
                    <td>{data.LIST === null ? '-' : JSON.parse(data.LIST).join(", ")}</td>
                    <td>{data.NAMA ?? '-'}</td>
                    <td>
                        {#if data.GENDER === "Pria"}
                            <span class="badge badge-primary">{data.GENDER}</span>
                        {:else if data.GENDER === "Wanita"}
                            <span class="badge badge-info">{data.GENDER}</span>
                        {:else}
                            -
                        {/if}
                    </td>
                    <td>{estimateAge(data.TTL) ?? '-'}</td>
                    <td>{data.WHATSAPP ?? '-'}</td>
                    <td>
                        <button type="button" on:click={() => view(data.TOKEN)} class="btn btn-sm btn-primary">Lihat</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<svelte:window on:keydown={keyPrompt} />