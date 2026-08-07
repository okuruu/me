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
            <svg viewBox="0 0 28 28" fill="currentColor" class="mr-2 h-5 w-5" aria-hidden="true">
                <path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875ZM9.93945 11.6064H15.1689C15.5293 11.6064 15.8105 11.3076 15.8105 10.9561C15.8105 10.5957 15.5293 10.3145 15.1689 10.3145H9.93945C9.57031 10.3145 9.30664 10.5957 9.30664 10.9561C9.30664 11.3076 9.5791 11.6064 9.93945 11.6064ZM9.93945 13.918H13.71C14.0615 13.918 14.3516 13.6279 14.3516 13.2764C14.3516 12.916 14.0703 12.626 13.71 12.626H9.93945C9.57031 12.626 9.30664 12.916 9.30664 13.2764C9.30664 13.6279 9.5791 13.918 9.93945 13.918Z"/>
            </svg>
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
