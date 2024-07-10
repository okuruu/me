<script lang="ts">
    import NavigationClyfar from '$lib/components/NavigationClyfar.svelte';
    import { doFetch, kobo } from '$lib/utils/kobo';
    import toast, { Toaster } from 'svelte-french-toast';

    export let kandidat;

    interface Candidate {
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

    let newData: Candidate[] = kandidat;
</script>
<Toaster/>
<div class="card w-full bg-base-100">
    <div class="card-body">
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