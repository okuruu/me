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
<form onsubmit={doPost}>
    <div class="row mb-6">
        <label class="col-lg-4 col-form-label required fw-bold fs-6" for="keteranganOperasional">Nama Kegiatan & Tanggal Pengeluaran</label>
        <div class="col-lg-8">
            <div class="row">
                <div class="col-lg-6 fv-row">
                    <input type="text" bind:value={namaKegiatan} class="form-control form-control-lg form-control-solid mb-3 mb-lg-0" placeholder="Nama Kegiatan" required/>
                </div>
                <div class="col-lg-6 fv-row">
                    <input type="date" bind:value={tanggalKegiatan} class="form-control form-control-lg form-control-solid" required/>
                </div>
            </div>
        </div>
    </div>

    <div class="row mb-6">
        <label for="nominalPengeluaran" class="col-lg-4 col-form-label required fw-bold fs-6">Nominal Pengeluaran</label>
        <div class="col-lg-8 fv-row">
            <input type="number" bind:value={nominalKegiatan} class="form-control form-control-lg form-control-solid" placeholder="Rp. 0,00-" required/>
        </div>
    </div>

    <div class="row mb-6">
        <label for="nominalPengeluaran" class="col-lg-4 col-form-label required fw-bold fs-6">Keterangan</label>
        <div class="col-lg-8 fv-row">
            <textarea bind:value={keteranganKegiatan} class="form-control form-control-solid" rows="6" placeholder="Keterangan Pengeluaran" required></textarea>
        </div>
    </div>

    <button type="submit" class="btn btn-primary w-100">
        <img src="/icons/elements/Add.svg" alt="Simpan Semua" class="h-25px svg-white me-2" />
        Catat Biaya Operasional
    </button>
</form>

<div class="separator my-7"></div>

<h3 class="fw-bolder my-3">Log Catatan Operasional</h3>
<div class="table-responsive">
    <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
        <thead>
            <tr class="fw-bolder">
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