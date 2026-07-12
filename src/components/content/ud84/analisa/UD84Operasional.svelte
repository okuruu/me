<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db, useFetch } from "../../../../library/hooks/db";
	import { rupiahFormatter } from "../../../../library/utils/useFormat";

    let namaKegiatan: string = $state('');
    let tanggalKegiatan: string = $state('');
    let nominalKegiatan: string = $state('');
    let keteranganKegiatan: string = $state('');

    let dataOperasional:any = $state([]);

    onMount(async () => initializePage());

    async function initializePage(): Promise <void> {
        dataOperasional = await useFetch("UD84/Operasional/Retrieve");
    }

    function removeAll():void {
        namaKegiatan        = '';
        tanggalKegiatan     = '';
        nominalKegiatan     = '';
        keteranganKegiatan  = '';
        return;
    }

    async function doPost(){
        const { status, message, data } = await db({
            NAMA        : namaKegiatan,
            TANGGAL     : tanggalKegiatan,
            NOMINAL     : nominalKegiatan,
            KETERANGAN  : keteranganKegiatan
        }, 'UD84/Operasional/Insert');

        if (status === "error") {
            toast.error(message);
            return;
        }

        removeAll();
        initializePage();
    }

</script>
<form onsubmit={doPost} class="space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
            <label class="label-text mb-1 block font-medium" for="namaKegiatan">Nama Kegiatan</label>
            <input type="text" bind:value={namaKegiatan} class="input input-bordered w-full" placeholder="Nama Kegiatan" required/>
        </div>
        <div>
            <label class="label-text mb-1 block font-medium" for="tanggalKegiatan">Tanggal Pengeluaran</label>
            <input type="date" bind:value={tanggalKegiatan} class="input input-bordered w-full" required/>
        </div>
        <div>
            <label for="nominalPengeluaran" class="label-text mb-1 block font-medium">Nominal Pengeluaran</label>
            <input type="number" bind:value={nominalKegiatan} class="input input-bordered w-full" placeholder="Rp. 0,00-" required/>
        </div>
        <div class="md:col-span-2">
            <label for="keteranganKegiatan" class="label-text mb-1 block font-medium">Keterangan</label>
            <textarea bind:value={keteranganKegiatan} class="textarea textarea-bordered w-full" rows="6" placeholder="Keterangan Pengeluaran" required></textarea>
        </div>
    </div>

    <button type="submit" class="btn btn-primary w-full">
        <img src="/icons/Add.svg" alt="Simpan Semua" class="mr-2 h-5" />
        Catat Biaya Operasional
    </button>
</form>

<div class="divider my-7"></div>

<h3 class="my-3 text-lg font-extrabold">Log Catatan Operasional</h3>
<div class="overflow-x-auto">
    <table class="table table-zebra align-middle">
        <thead>
            <tr class="font-extrabold">
                <th>#</th>
                <th>Tanggal Pengeluaran</th>
                <th>Nama Kegiatan</th>
                <th>Nominal Pengeluaran</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            {#if dataOperasional.length === 0}
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data</td>
                </tr>
            {:else}
                {#each dataOperasional as data,index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{ data.TANGGAL }</td>
                        <td>{ data.NAMA }</td>
                        <td>{ rupiahFormatter.format(data.NOMINAL) }</td>
                        <td>{ data.KETERANGAN }</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
