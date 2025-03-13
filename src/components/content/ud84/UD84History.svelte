<script lang="ts">
    import { db } from "../../../library/hooks/db";
    import { toast } from "svelte-sonner";
    import Drawer from "../../shared/Drawer.svelte";
    import { capitalizeEachWord, rupiahFormatter } from "../../../library/utils/useFormat";

    interface Staff { 
        ID: number; 
        NAMA: string; 
        NOMINAL: number 
    }

    interface History {
        KODE: string;
        CATATAN: string;
    }

    interface Carts {
        NAMA: string;
        JUMLAH: number;
        STOK: number;
        SATUAN: string;
        HARGA_PER_ITEM: number;
        HARGA_JUAL: number;
        DISTRIBUTOR: string;
    }

    let { staff }: { staff: Staff[] } = $props();
    let newData: History[] = $state([]);
    let sales: string = $state('');
    let isDrawer: boolean = $state(false);
    let carts: Carts[] = $state([]);

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            ID: sales
        }, 'UD84/History-Sales');
        
        if(status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
    }

    async function viewHistory(id: string): Promise <void> {
        const { status, message, data } = await db({
            ID: id
        }, 'UD84/Pesanan/Retrieve-Items');

        if (status === "error") {
            toast.error(message);
            return;
        }

        isDrawer = !isDrawer;
        carts = data;
    }
</script>
<form onsubmit={doPost} class="row">
    <div class="col">
        <div class="form-group">
            <label for="chooseSales" class="form-label fw-bold">Pilih Sales</label>
            <select bind:value={sales} class="form-select" required>
                <option value="" selected disabled>Tanpa Sales</option>
                {#each staff as {ID, NAMA} }
                    <option value={ID}>{NAMA}</option>
                {/each}
            </select>
        </div>
    </div>
    <div class="col-3">
        <button type="submit" class="btn btn-primary btn-icon mt-8">
            <img src="/icons/elements/Search.svg" class="h-30px svg-white" alt="Cari" />
        </button>
    </div>
</form>

<div class="separator my-3"></div>

<div class="table-responsive">
    <table class="table align-middle">
        <thead>
            <tr class="fw-bolder">
                <th>Catatan</th>
                <th>Lihat</th>
            </tr>
        </thead>
        <tbody>
            {#if newData.length === 0}
                <tr>
                    <td class="text-center" colspan="2">Tidak ada data.</td>
                </tr>
            {:else}
                {#each newData as {KODE, CATATAN}}
                    <tr>
                        <td>{CATATAN}</td>
                        <td>
                            <button type="button" onclick={() => viewHistory(KODE)} class="btn btn-sm btn-icon btn-primary">
                                <img src="/icons/elements/Share.svg" class="h-15px svg-white" alt="View" />
                            </button>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
<Drawer isOpen={isDrawer} position="right" width="wh-100" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        <div class="d-flex justify-content-between">
            <h3>Detail Pesanan</h3>
            <button type="button" class="btn btn-sm btn-icon btn-dark" onclick={() => isDrawer = !isDrawer}>X</button>
        </div>
        <div class="separator my-3"></div>
        <div class="table-responsive">
            <table class="table align-middle gy-1 gx-1 table-striped table-hover">
                <thead>
                    <tr class="fw-bolder">
                        <th>#</th>
                        <th>Nama</th>
                        <th class="text-center">Jumlah Pesanan (Pcs)</th>
                        <th class="text-center">Stok</th>
                        <th>Satuan</th>
                        <th class="text-center">Harga Jual</th>
                        <th class="text-center">Harga Per Pcs</th>
                    </tr>
                </thead>
                <tbody>
                    {#if carts.length === 0}
                        <tr>
                            <td colspan="7" class="text-center">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each carts as carts }
                            <tr>
                                <td>
                                    {carts.NAMA} <br/>
                                    <span class="text-golden fw-bolder">[{carts.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">{carts.JUMLAH}</td>
                                <td class="text-center">
                                    {#if carts.STOK < 30}
                                        <span class="text-danger fw-bolder">{ carts.STOK }</span>
                                    {:else}
                                        { carts.STOK }
                                    {/if}
                                </td>
                                <td>{carts.SATUAN}</td>
                                <td class="text-center">{rupiahFormatter.format(carts.HARGA_JUAL)}</td>
                                <td class="text-center">{rupiahFormatter.format(carts.HARGA_PER_ITEM)}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</Drawer>