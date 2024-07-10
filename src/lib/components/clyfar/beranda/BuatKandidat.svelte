<script lang="ts">
    import { kobo } from "$lib/utils/kobo";
    import toast, { Toaster } from 'svelte-french-toast';
    import NavigationClyfar from "$lib/components/NavigationClyfar.svelte";
    
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

    let test: string[];
    let userAmount: number = 1;

    const testOption: string[] = ['DISC','KRAEPELIN','MBTI','PAPI','BAUM','MSDT'];

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
            toast.success(message);
            return;
        }

        toast.error(message);
    }
</script>
<Toaster/>
<h3 class="font-bold text-lg">Psikotes: Buat Kandidat</h3>

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
    <div>
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text">DISC</span> 
                <input type="checkbox" bind:group={test} value="DISC" class="checkbox checkbox-primary" />
            </label>
        </div>
    </div>
</div>

<div class="grid grid-cols-2 gap-4 my-3">
    <div>
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text">KRAEPELIN</span> 
                <input type="checkbox" bind:group={test} value="KRAEPELIN" class="checkbox checkbox-primary" />
            </label>
        </div>
    </div>
</div>

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
                    <!-- {#if newData.length === 0}
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
                    {/if} -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="divider mb-12"></div>
<NavigationClyfar/>