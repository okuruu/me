<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "../../../../../library/hooks/db";
    import type { Testee } from "../../../../../interface/Clyfar";
    import sample_table from "../../../../../json/sample_table.json";
    import Navigation from "../../../../../components/Navigation.svelte";
    import { capitalizeEachWord, Carbon } from "../../../../../library/utils/useFormat";
    import RMIB from "../../../../../components/content/clyfar/interpretation/RMIB.svelte";

    const { data }: { data: { id: string } } = $props();

    let newData: Testee[] = $state([]);
    
    $effect(() => {
        newData = sample_table;
        console.log(sample_table)
    });

    async function view(id: number): Promise<void> {
        const { status, message, data } = await db({ 
            token: newData[id].TOKEN
        }, 'Clyfar/Check-Testee');
        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }
    }

    function setEdit(id: number): boolean {
        return newData[id].IS_EDITED = true
    }
    
    function setRemove(id: number): Testee[] {
        newData.splice(id, 1);
        return newData;
    }
</script>
<Navigation/>
<div class="bg-light-warning vh-100 wh-100">
    <div class="container-fluid">
        <div class="row">
            <div class="col border">

                <div class="card shadow-sm bg-white mt-7">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h3 class="text-warning fw-bold">Kandidat Dengan Tes RMIB</h3>
                            <span class="text-muted fw-semibold">RMIB Password: <span class="text-danger fw-bolder">Felfare</span> </span>
                        </div>

                        <div class="separator my-5"></div>

                        <div class="table-responsive">
                            <table class="table align-middle table-striped table-hover">
                                <thead>
                                    <tr class="fw-bolder">
                                        <th>#</th>
                                        <th>Token</th>
                                        <th>Nama</th>
                                        <th>Jenis Kelamin</th>
                                        <th>Tanggal Lahir / Usia</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#if newData.length === 0}
                                        <tr>
                                            <td colspan="8" class="text-center">Tidak ada data</td>
                                        </tr>
                                    {:else}
                                        {#each newData as data, index }
                                            {#if data.LIST?.includes("RMIB")}
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{data.TOKEN}</td>
                                                    <td>{data.NAMA === null ? '-' : capitalizeEachWord(data.NAMA)}</td>
                                                    <td>
                                                        {#if data.GENDER === "Pria"}
                                                            <span class="badge badge-primary">{data.GENDER}</span>
                                                        {:else if data.GENDER === "Wanita"}
                                                            <span class="badge badge-info">{data.GENDER}</span>
                                                        {:else}
                                                            -
                                                        {/if}
                                                    </td>
                                                    <td>{data.TTL == null ? '-' : `${Carbon(data.TTL, "date")} / ${Carbon(data.TTL, "age")}`}</td>
                                                    <td>
                                                        {#if data.IS_EDITED}
                                                            <button type="button" onclick={() => setRemove(index)} class="btn btn-sm btn-xs btn-dark text-white">
                                                                <img src="/icons/elements/Delete.svg" class="svg-white me-2" alt=""/> Hapus
                                                            </button>
                                                        {:else}
                                                            {@render defaultView(index)}
                                                        {/if}
                                                    </td>
                                                </tr>
                                            {/if}
                                        {/each}
                                    {/if}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </div>
            <div class="col">
                {#if data.id == "rmib"}
                    <RMIB/>
                {/if}
            </div>
        </div>
    </div>
</div>

{#snippet defaultView(id: number)}
    <button type="button" onclick={() => setEdit(id)} class="btn btn-sm btn-icon btn-gradient">
        <img src="/icons/elements/Edit.svg" alt=""/>
    </button>
    <button type="button" onclick={() => view(id)} class="btn btn-sm btn-icon btn-gradient">
        <img src="/icons/elements/Link-Out.svg" alt=""/>
    </button>
{/snippet}