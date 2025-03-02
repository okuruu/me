<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { rupiahFormatter } from "../../../../library/utils/useFormat";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";


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

    let masterProduk: Master[] = $state([]);

    let namaLengkap: string = $state('');
    let lokasiToko: string = $state('');
    let alamatToko: string = $state('');
    let whatsAppToko: string = $state('');

    onMount(async () => {
        masterProduk = await useFetch('Master-Produk/Retrieve');
    });

    async function doPost(){
        if(namaLengkap == null || lokasiToko == null || alamatToko == null || whatsAppToko == null){
            return toast.error('Data member tidak lengkap', { position: 'top-right' });
        }

        let idList:any              = document.getElementsByClassName('idValue');
        let priceList:any           = document.getElementsByClassName('priceValue');
        let idValue:string[]        = [];
        let priceValue:number[]     = [];

        for( let index:number = 0; index < idList.length; index++){
            idValue     = [...idValue,idList[index].value];
            priceValue  = [...priceValue,priceList[index].value];
        }

        const { status, message, data } = await db({
            NAMA        : namaLengkap,
            LOKASI      : lokasiToko,
            ALAMAT      : alamatToko,
            WHATSAPP    : whatsAppToko,
            ID          : idValue,
            PRICE       : priceValue
        }, 'UD84/Member/Insert');

        if (status === "error") {
            toast.error(message);
            return;
        }

        removeAll();
        toast.success(message);
    }

    function removeAll():void{
        namaLengkap     = '';
        lokasiToko      = '';
        alamatToko      = '';
        whatsAppToko    = '';
    }

</script>
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm my-7">
        <div class="card-header">
            <h3 class="card-title fw-bold">Input Data: Member</h3>
        </div>
        <div class="card-body">
    
            <div class="row mb-6">
                <label for="namaLokasi" class="col-lg-4 col-form-label required fw-bold fs-6">Nama Lengkap & Lokasi</label>
                <div class="col-lg-8">
                    <div class="row">
                        <div class="col-lg-6 fv-row">
                            <input type="text" bind:value={namaLengkap} class="form-control form-control-lg form-control-solid mb-3 mb-lg-0" placeholder="Wahyu Sugiharto"/>
                        </div>
                        <div class="col-lg-6 fv-row">
                            <input type="text" bind:value={lokasiToko} class="form-control form-control-lg form-control-solid" placeholder="Cth: Singosari"/>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="row mb-6">
                <label for="alamatMember" class="col-lg-4 col-form-label required fw-bold fs-6">Alamat & WhatsApp</label>
                <div class="col-lg-8">
                    <div class="row">
                        <div class="col-lg-6 fv-row">
                            <input type="text" bind:value={alamatToko} class="form-control form-control-lg form-control-solid mb-3 mb-lg-0" placeholder="JL. Soekarno Hatta XV. No.2"/>
                        </div>
                        <div class="col-lg-6 fv-row">
                            <input type="number" bind:value={whatsAppToko} class="form-control form-control-lg form-control-solid" placeholder="08984170335"/>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="separator separator-content border-dark my-15"><span class="w-250px fw-bold">Set Harga</span></div>
    
            <form onsubmit={doPost}>
                <div class="table-responsive">
                    <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
                        <thead>
                            <tr class="fw-bold">
                                <th>#</th>
                                <th>Nama Produk</th>
                                <th>Harga Beli (Pabrik)</th>
                                <th>Harga Item (Jual)</th>
                                <th>Harga Jual Produk (Untuk Pelanggan)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each masterProduk as data,index }
                                <tr>
                                    <td>
                                        { index + 1 }
                                        <input type="number" class="idValue" value="{data.ID}" hidden readonly />
                                    </td>
                                    <td>{ data.NAMA }</td>
                                    <td>{ rupiahFormatter.format(data.HARGA_PABRIK) }</td>
                                    <td>{ rupiahFormatter.format(data.HARGA_JUAL) }</td>
                                    <td>
                                        <input type="number" class="form-control form-control-sm priceValue" placeholder="Rp.0,00-">
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="submit" onclick={doPost} class="btn btn-primary">Simpan Data Member</button>
                </div>
            </form>
        </div>
    </div>
</div>