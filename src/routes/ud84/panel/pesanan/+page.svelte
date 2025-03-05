<script lang="ts">
    import { onMount } from "svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";
    import Drawer from "../../../../components/shared/Drawer.svelte";
    import { toast } from "svelte-sonner";

    interface Pesanan {
        ID: number;
        NAMA: string;
        WHATSAPP: string;
        SALES: number;
        CATATAN: string;
        KODE: string;
        CREATED_AT: string;
        UPDATED_AT: null
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

    let newData: Pesanan[] = $state([]);
    let carts: Carts[] = $state([]);

    let isDrawer: boolean = $state(false);

    onMount(() => initializePage());

    async function initializePage(): Promise <void> {
        newData = await useFetch('UD84/Pesanan/Retrieve');
    }

    async function viewItem(id: string): Promise <void> {
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
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm my-3 bg-white">
        <div class="card-body">
            <h3 class="fw-bold">Pesanan Masuk</h3>
            <div class="separator my-5"></div>

            <div class="table-responsive">
                <table class="table align-middle gy-1 gx-1">
                    <thead>
                        <tr class="fw-bolder">
                            <th>#</th>
                            <th>Nama</th>
                            <th>WhatsApp</th>
                            <th>Nama Sales</th>
                            <th>Dipesan Pada</th>
                            <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data</td>
                            </tr>
                        {:else}
                            {#each newData as data, index }
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{data.NAMA}</td>
                                    <td>{data.WHATSAPP}</td>
                                    <td>{data.SALES}</td>
                                    <td>{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                                    <td>{data.CATATAN}</td>
                                    <td>
                                        <button type="button" onclick={() => viewItem(data.KODE)} class="btn btn-sm btn-icon btn-primary">
                                            <img src="/icons/elements/Share.svg" class="h-15px svg-white" alt="Lihat Item"/>
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>    
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        <h3>Detail Pesanan</h3>
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
                        {#each carts as carts, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>
                                    {capitalizeEachWord(carts.NAMA)} <br/>
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