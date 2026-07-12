<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Drawer from "../../../../components/shared/Drawer.svelte";
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

    interface Member {
        ID: number;
        NAMA: string;
        LOKASI: string;
        ALAMAT: string;
        WHATSAPP: string;
    }

    let masterProduk: Master[] = $state([]);

    let namaLengkap: string = $state('');
    let lokasiToko: string = $state('');
    let alamatToko: string = $state('');
    let whatsAppToko: string = $state('');

    let isDrawer: boolean = $state(false);

    let dataMember: Member[] = $state([]);

    onMount(async () => initializePage());

    async function initializePage(): Promise <void> {
        masterProduk = await useFetch('UD84/Master-Produk/Retrieve');
    }

    async function viewMember(): Promise <void> {
        dataMember = await useFetch('UD84/Member/Retrieve');
        isDrawer = !isDrawer;
    }

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

        const { status, message } = await db({
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

    async function deleteMember(id: number): Promise <void> {
        toast('Apakah anda yakin untuk menghapus?', {
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    if (id === null) {
                        toast.error("Tidak ada data yang dipilih.");
                        return;
                    }

                    const { status, message } = await db({
                        ID: id
                    }, 'UD84/Member/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                }
            },
        });
    }

</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Membership</h3>
            <button type="button" onclick={viewMember} class="btn btn-sm btn-info">Lihat Semua Member</button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="namaLengkap" class="label-text mb-1 block font-medium">Nama Lengkap</label>
                <input type="text" id="namaLengkap" bind:value={namaLengkap} class="input input-bordered w-full" placeholder="Wahyu Sugiharto"/>
            </div>
            <div>
                <label for="lokasiToko" class="label-text mb-1 block font-medium">Lokasi</label>
                <input type="text" id="lokasiToko" bind:value={lokasiToko} class="input input-bordered w-full" placeholder="Cth: Singosari"/>
            </div>
            <div>
                <label for="alamatToko" class="label-text mb-1 block font-medium">Alamat</label>
                <input type="text" id="alamatToko" bind:value={alamatToko} class="input input-bordered w-full" placeholder="JL. Soekarno Hatta XV. No.2"/>
            </div>
            <div>
                <label for="whatsAppToko" class="label-text mb-1 block font-medium">WhatsApp</label>
                <input type="number" id="whatsAppToko" bind:value={whatsAppToko} class="input input-bordered w-full" placeholder="08984170335"/>
            </div>
        </div>

        <div class="divider my-5">Set Harga</div>

        <form onsubmit={doPost}>
            <div class="overflow-x-auto">
                <table class="table table-zebra align-middle text-center">
                    <thead>
                        <tr class="font-bold">
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
                                    <input type="number" class="input input-bordered input-sm priceValue" placeholder="Rp.0,00-">
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <div class="mt-4 flex justify-end">
                <button type="submit" class="btn btn-primary">Simpan Data Member</button>
            </div>
        </form>
    </div>
</div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="w-full p-5">

        <h3 class="text-lg font-bold">Daftar Member</h3>
        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th>Nama</th>
                        <th>Alamat</th>
                        <th>Lokasi</th>
                        <th>Nomor WhatsApp</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each dataMember as data,index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{ data.NAMA }</td>
                            <td>{ data.ALAMAT }</td>
                            <td>{ data.LOKASI }</td>
                            <td>
                                <a href="https://wa.me/62{ data.WHATSAPP }" target="_blank" class="btn btn-sm btn-success" >0{ data.WHATSAPP }</a>
                            </td>
                            <td>
                                <button type="button" onclick={() => deleteMember(data.ID)} class="btn btn-ghost btn-square btn-sm text-error">
                                    <img src="/icons/Delete.svg" alt="Delete" height="20"/>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
</Drawer>
