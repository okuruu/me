<script lang="ts">
	import { onMount } from "svelte";
    import { useFetch } from "../../../../library/hooks/db";
    import Drawer from "../../../../components/shared/Drawer.svelte";
	import { rupiahFormatter } from "../../../../library/utils/useFormat";
    import Charts from "../../../../components/content/ud84/analisa/Charts.svelte";

    interface Omset {
        JUMLAH: string;
        TOTAL: string;
        NAMA: string;
    }

    interface Item {
        NAMA: string;
        JUMLAH: number,
        HARGA_ASLI: number;
        HARGA_TERJUAL: number
        CREATED_AT: string;
    }

    let itemOmset: Omset[]          = $state([]);
    let itemOperasional:any         = $state([]);
    let currentMonth:string         = $state('');
    let operationalAmount:number    = $state(0);

    let itemName:string     = $state('');
    let itemData: Item[]    = $state([]);

    let isDrawer: boolean = $state(false);
    
    onMount(async () => {
        const doResponse    = await useFetch('UD84/Omset');
        itemOmset           = doResponse.OMSET;
        currentMonth        = doResponse.BULAN;
        itemOperasional     = doResponse.OPERASIONAL;
        operationalAmount   = doResponse.OPERASIONAL_SUM;

    });

    $effect(() => {
        if (isDrawer == false){
            itemName = '';
        }
    })

    async function showItems(id: string){
        itemName = id;
        itemData = await useFetch(`UD84/Omset/Single/${id}`);
        isDrawer = !isDrawer;
    }

</script>
<h3 class="card-title fw-bold">Analisa Omset: Perusahaan</h3>
<Charts />
<div class="row">
    <div class="col">

        <h1 class="mb-5">Omset Item Tertinggi: {currentMonth}</h1>
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
                <thead>
                    <tr class="fw-bold">
                        <th>#</th>
                        <th>Nama Produk</th>
                        <th>Total Terjual</th>
                        <th>Omset Penjualan</th>
                        <th>Lihat Analisa Item</th>
                    </tr>
                </thead>
                <tbody>
                    {#each itemOmset as data,index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{ data.NAMA }</td>
                            <td>{ data.JUMLAH } Pcs</td>
                            <td>{ rupiahFormatter.format(Number(data.TOTAL)) }</td>
                            <td>
                                <button type="button" onclick={() => showItems(data.NAMA)} class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#omsetExplanation">Lihat Track Record</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
    <div class="col">

        <h1 class="mb-5">Biaya Operasional Tertinggi: {currentMonth}</h1>
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
                <thead>
                    <tr class="fw-bold">
                        <th>#</th>
                        <th>Tanggal Pengeluaran</th>
                        <th>Nama Kegiatan</th>
                        <th>Keterangan</th>
                        <th>Total Pengeluaran</th>
                    </tr>
                </thead>
                <tbody>
                    {#each itemOperasional as data,index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{ data.CREATED_AT }</td>
                            <td>{ data.NAMA }</td>
                            <td>{ data.KETERANGAN }</td>
                            <td>{ rupiahFormatter.format(data.NOMINAL) }</td>
                        </tr>
                    {/each}
                    <tr>
                        <td colspan="3" class="text-center fw-bold">Total Biaya Operasional</td>
                        <td class="fw-bold text-white bg-danger">{ rupiahFormatter.format(operationalAmount) }</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        <h3 class="fw-bolder">{itemName}</h3>
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
                <thead>
                    <tr class="fw-bolder">
                        <th>#</th>
                        <th>Nama</th>
                        <th>Jumlah</th>
                        <th>Harga Asli</th>
                        <th>Harga Terjual</th>
                        <th>Tanggal Transaksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#each itemData as data,index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{ data.NAMA }</td>
                            <td>{ data.JUMLAH }</td>
                            <td>{ rupiahFormatter.format(data.HARGA_ASLI) }</td>
                            <td>{ rupiahFormatter.format(data.HARGA_TERJUAL) }</td>
                            <td>{ data.CREATED_AT }</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</Drawer>