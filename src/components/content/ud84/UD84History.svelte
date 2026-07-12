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
<form onsubmit={doPost} class="flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="w-full">
        <label for="chooseSales" class="label-text mb-1 block font-medium">Pilih Sales</label>
        <select bind:value={sales} class="select select-bordered w-full" required>
            <option value="" selected disabled>Tanpa Sales</option>
            {#each staff as {ID, NAMA} }
                <option value={ID}>{NAMA}</option>
            {/each}
        </select>
    </div>
    <button type="submit" class="btn btn-primary btn-square shrink-0">
        <img src="/icons/Search.svg" class="h-5 w-5" alt="Cari" />
    </button>
</form>

<div class="divider my-3"></div>

<div class="overflow-x-auto">
    <table class="table table-zebra align-middle">
        <thead>
            <tr class="font-bold">
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
                            <button type="button" onclick={() => viewHistory(KODE)} class="btn btn-sm btn-square btn-primary">
                                <img src="/icons/Share.svg" class="h-4 w-4" alt="View" />
                            </button>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="w-full p-5">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">Detail Pesanan</h3>
            <button type="button" class="btn btn-sm btn-square btn-neutral" onclick={() => isDrawer = !isDrawer}>X</button>
        </div>
        <div class="divider my-3"></div>
        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle">
                <thead>
                    <tr class="font-bold">
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
                                    <span class="text-secondary font-bold">[{carts.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">{carts.JUMLAH}</td>
                                <td class="text-center">
                                    {#if carts.STOK < 30}
                                        <span class="text-error font-bold">{ carts.STOK }</span>
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
