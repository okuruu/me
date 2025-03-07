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
<div class="container">
    <h3 class="card-title fw-bold">Analisa Omset: Item</h3>
    <form onsubmit={doPost}>
        <div class="row mb-6">
            <label for="nominalPengeluaran" class="col-lg-4 col-form-label required fw-bold fs-6">Nama Produk</label>
            <div class="col-lg-8 fv-row">
                <select bind:value={itemID} class="form-select" required>
                    <option value="" disabled selected>Pilih Item</option>
                    {#each masterData as masterItem }
                        <option value="{masterItem.ID}">{masterItem.NAMA}</option>
                    {/each}
                </select>
            </div>
        </div>

        <div class="row mb-6">
            <label for="filterTanggal" class="col-lg-4 col-form-label required fw-bold fs-6">Periode Awal - Periode Akhir</label>
            <div class="col-lg-8">
                <div class="row">
                    <div class="col-lg-6 fv-row">
                        <DatePlaceholder bind:value={startPeriode} class="form-control form-control-lg form-control-flush" required/>
                    </div>
                    <div class="col-lg-6 fv-row">
                        <DatePlaceholder bind:value={endPeriode} class="form-control form-control-lg form-control-flush" required/>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-6">
            <label for="nominalPengeluaran" class="col-lg-4 col-form-label fw-bold fs-6"></label>
            <div class="col-lg-8 fv-row">
                <button type="submit" class="btn btn-primary w-100">
                    <img src="/icons/elements/Search.svg" alt="Search Toggle" class="h-30px svg-white me-2" />
                    Mulai Pencarian
                </button>
            </div>
        </div>
    </form>

    <div class="separator separator-dashed border-primary my-10"></div>

    <div class="row mb-6">
        <label for="filterTanggal" class="col-lg-4 col-form-label required fw-bold fs-6">Keuntungan</label>
        <div class="col-lg-8">
            <input type="text" class="form-control form-control-flush text-success fw-bolder" readonly value={rupiahFormatter.format(totalKotor)} >
        </div>
    </div>

    <div class="row mb-6">
        <label for="nominalPengeluaran" class="col-lg-4 col-form-label fw-bold fs-6 text-underline"><u>Potongan Rupiah & Persen</u></label>
        <div class="col-lg-8 fv-row">
            <div class="row">
                <div class="col fv-row">
                    <input type="text" class="form-control form-control-flush text-danger fw-bolder" readonly value={rupiahFormatter.format(totalPotonganRupiah)} >
                </div>
                <div class="col-lg-6 fv-row">
                    <input type="text" class="form-control form-control-flush text-warning fw-bolder" readonly value={rupiahFormatter.format(totalPotonganPersen)} >
                </div>
            </div>
        </div>
    </div>

    <div class="row mb-6">
        <label for="nominalPengeluaran" class="col-lg-4 col-form-label fw-bold fs-6">Total Pcs Terjual</label>
        <div class="col-lg-8 fv-row">
            <input type="text" class="form-control form-control-flush fw-bolder" readonly value="{totalPieces} Pcs" >
        </div>
    </div>

    <div class="separator my-10"></div>

    <div class="table-responsive">
        <table class="table table-row-dashed table-row-gray-300 gy-5 table-hover align-middle text-dark">
            <thead>
                <tr class="fw-bold">
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