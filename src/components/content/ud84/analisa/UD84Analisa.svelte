<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import DatePlaceholder from "../../../shared/DatePlaceholder.svelte";
    import { rupiahFormatter } from "../../../../library/utils/useFormat";
    import { initializeDate } from "../../../../library/utils/useDefault";

    interface Master {
        ID: number;
        NAMA: string;
        STOK: number;
        TIPE: string;
        STATUS_JUAL: "Katalog dan Penjualan" | string;
        DISTRIBUTOR: string;
        HARGA_PABRIK: number;
        HARGA_JUAL: number;
        JUMLAH_PER_ITEM: number;
        HARGA_PER_ITEM: number;
        DESKRIPSI: string;
        GAMBAR: string;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    let itemID: number | null = $state(null);
    let startPeriode: string = $state(initializeDate("first"));
    let endPeriode: string = $state(initializeDate("last"));

    let masterData: Master[] = $state([]);
    let listData: any = $state([]);

    let totalKotor:number = $state(0);
    let totalPieces:number = $state(0);
    let totalPotonganRupiah:number = $state(0);
    let totalPotonganPersen:number = $state(0);

    onMount(async () => initializePage());
    
    async function initializePage(): Promise <void> {
        masterData = await useFetch('UD84/Master-Produk/Retrieve');
    }

    async function doPost(){
        if(itemID === null){
            toast.error("Silahkan pilih item terlebih dahulu");
            return;
        }

        const { status, message, data }  = await db({
            ID : itemID,
            START : startPeriode,
            FINISH : endPeriode
        }, 'UD84/Reports/Single-Item');

        if (status === "error") {
            toast.error(message);
            return;
        }

        listData              = data.data;
        totalKotor            = data.TOTAL_KOTOR;
        totalPotonganRupiah   = data.TOTAL_POTONGAN_RUPIAH;
        totalPotonganPersen   = data.TOTAL_POTONGAN_PERSEN;
        totalPieces           = data.TOTAL_PIECES;
    }

</script>
<div>
    <h3 class="card-title text-lg font-bold">Analisa Omset: Item</h3>

    <form onsubmit={doPost} class="mt-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="namaProduk" class="label-text mb-1 block font-medium">Nama Produk</label>
                <select bind:value={itemID} class="select select-bordered w-full" required>
                    <option value="" disabled selected>Pilih Item</option>
                    {#each masterData as masterItem }
                        <option value="{masterItem.ID}">{masterItem.NAMA}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="filterTanggal" class="label-text mb-1 block font-medium">Periode Awal - Periode Akhir</label>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <DatePlaceholder bind:value={startPeriode} required/>
                    <DatePlaceholder bind:value={endPeriode} required/>
                </div>
            </div>
        </div>

        <button type="submit" class="btn btn-primary w-full sm:w-auto">
            <img src="/icons/Search.svg" alt="Search Toggle" class="mr-2 h-5" />
            Mulai Pencarian
        </button>
    </form>

    <div class="divider my-8"></div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
            <label class="label-text mb-1 block font-medium">Keuntungan</label>
            <input type="text" class="input input-bordered w-full font-extrabold text-success" readonly value={rupiahFormatter.format(totalKotor)} >
        </div>
        <div>
            <label class="label-text mb-1 block font-medium"><u>Potongan Rupiah & Persen</u></label>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input type="text" class="input input-bordered w-full font-extrabold text-error" readonly value={rupiahFormatter.format(totalPotonganRupiah)} >
                <input type="text" class="input input-bordered w-full font-extrabold text-warning" readonly value={rupiahFormatter.format(totalPotonganPersen)} >
            </div>
        </div>
        <div>
            <label class="label-text mb-1 block font-medium">Total Pcs Terjual</label>
            <input type="text" class="input input-bordered w-full font-extrabold" readonly value="{totalPieces} Pcs" >
        </div>
    </div>

    <div class="divider my-8"></div>

    <div class="overflow-x-auto">
        <table class="table table-zebra align-middle">
            <thead>
                <tr class="font-bold">
                    <th>#</th>
                    <th>Tanggal Penjualan</th>
                    <th>Nama Item</th>
                    <th>Pcs</th>
                    <th>Potongan(Rp)</th>
                    <th>Potongan(%)</th>
                    <th>Nominal Terjual</th>
                </tr>
            </thead>
            <tbody>
                {#each listData as data,index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{ data.CREATED_AT }</td>
                        <td>{ data.NAMA }</td>
                        <td>{ data.JUMLAH }</td>
                        <td>{ rupiahFormatter.format(data.POTONGAN_RUPIAH) }</td>
                        <td>{ rupiahFormatter.format(data.POTONGAN_PERSEN) }</td>
                        <td>{ rupiahFormatter.format(data.NOMINAL) }</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
