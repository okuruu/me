<script lang="ts">
    import { goto } from '$app/navigation';
    import { db } from '../../../library/utils/db';
    import toast, { Toaster } from 'svelte-french-toast';
    import { estimateAge } from '../../../library/utils/formatTime';
    import type { Testee } from '../../../library/interface/Clyfar.js';

    export let data;

    /*
    interface Testee {
        CREATED_AT: string;
        ENABLE_TEST: "Yes" | "No";
        GENDER: "Pria" | "Wanita" | null;
        ID: number;
        LEVEL: number;
        LIST: string;
        NAMA: string | null;
        TOKEN: string;
        TTL: string | null;
        UPDATED_AT: string | null;
        WHATSAPP: string | null;
}
    */

    let searchBar: string = '';
    let searchBarController:HTMLElement;

    let newData: Testee[] = data.testee ?? [];
    let newDataDefault: Testee[] = data.testee ?? [];

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
</script>

<Toaster />
<div class="bg-clyfar {newData.length < 6 ? 'min-vh-100' : 'min-vh-100'}">
    <div class="container-fluid">
        <div class="card shadow-sm bg-white mt-10">
            <div class="card-header">
                <h3 class="card-title fw-bold">Dashboard Utama</h3>
                <div class="card-toolbar">
                    <button type="button" class="btn btn-sm btn-primary">
                        <img src="/icons/elements/Human.svg" alt="Person Icon" class="me-2"/> Buat User
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-end">
                    <div class="form-group">
                        <!-- The searchBar will now filter data based on TOKEN, NAMA, or WHATSAPP -->
                        <input type="text" bind:this={searchBarController} bind:value={searchBar} on:keyup={() => filterData(searchBar)} class="form-control form-control-sm" placeholder="Pencarian..." />
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
            </div>
        </div>
    </div>
</div>
