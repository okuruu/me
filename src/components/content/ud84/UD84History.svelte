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
    <button type="submit" class="btn btn-primary btn-square shrink-0" aria-label="Cari">
        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
            <path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875ZM9.93945 11.6064H15.1689C15.5293 11.6064 15.8105 11.3076 15.8105 10.9561C15.8105 10.5957 15.5293 10.3145 15.1689 10.3145H9.93945C9.57031 10.3145 9.30664 10.5957 9.30664 10.9561C9.30664 11.3076 9.5791 11.6064 9.93945 11.6064ZM9.93945 13.918H13.71C14.0615 13.918 14.3516 13.6279 14.3516 13.2764C14.3516 12.916 14.0703 12.626 13.71 12.626H9.93945C9.57031 12.626 9.30664 12.916 9.30664 13.2764C9.30664 13.6279 9.5791 13.918 9.93945 13.918Z"/>
        </svg>
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
                            <button type="button" onclick={() => viewHistory(KODE)} class="btn btn-sm btn-square btn-primary" aria-label="View">
                                <svg viewBox="0 0 20 18" fill="none" stroke="currentColor" stroke-width="1.99568" class="h-4 w-4" aria-hidden="true">
                                    <path d="M7.97838 7.97406L9.70272 15.7336C9.80052 16.1737 10.3856 16.2687 10.6176 15.8821L18.5012 2.74264C18.7008 2.4101 18.4612 1.98703 18.0734 1.98703H2.34222C1.87902 1.98703 1.66584 2.56331 2.01753 2.86476L7.97838 7.97406ZM7.97838 7.97406L17.9568 2.48595"/>
                                </svg>
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
