<script lang="ts">
    import { onMount } from "svelte";
    import { toast, Toaster } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { currencySanitizer, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Rupiah from "../../../../components/shared/Rupiah.svelte";
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

    interface Cart {
        ID: number;
        NAMA: string;
        QUANTITY: number,
        TOTAL: number,
        HARGA_ASLI: number,
        POTONGAN_RUPIAH: number,
        POTONGAN_PERSEN: number,
        TIPE: 'Satuan' | 'Pieces'
    }

    interface Member {
        ID: number;
        NAMA: string;
        LOKASI: string;
        ALAMAT: string;
        WHATSAPP: string;
    }

    let masterProduk: Master[] = $state([]);
    let staticMasterProduk: Master[] = $state([]);

    let listMember: Member[] = $state([]);

    let memberDropdown: string = $state('UMUM');
    let totalProducts: number = $state(0);
    let currentCart: Cart[] = $state([]);

    // Paid Method
    let payDP: string = $state('');
    let payCash: string = $state('');
    let cutMoney: string = $state('');
    let dueDate: Date | null = $state(null);
    let additionalInformation: string = $state('');

    // HTML Element
    let searchBar: HTMLInputElement;
    let searchBarValue: string = $state('');
    let enableSubmit: boolean = $state(false);

    onMount(async () => {
        masterProduk = await useFetch('UD84/Master-Produk/Retrieve');
        staticMasterProduk = masterProduk;
        listMember = await useFetch("UD84/Member/Retrieve");
    });

    function doSearch(searchString: string){
        const filterData = masterProduk.filter( (objectKey: { NAMA: string; }) => objectKey.NAMA.toLowerCase().includes(searchString.toLocaleLowerCase()) );
        masterProduk = filterData;
        if(searchString == ''){
            masterProduk = staticMasterProduk;
        }
    }

    function addToCart(ID: number){
        let currentItem = masterProduk[ID];

        const findItem = currentCart.find((objectKey: { NAMA: any; }) => objectKey.NAMA === currentItem.NAMA);
        if(findItem != undefined){
            return toast.error('Produk sudah ada dalam keranjang!', { position: 'top-right' });
        }

        let potonganRupiah      = (document.getElementById('potonganRupiah_' + ID) as HTMLInputElement)?.value;
        let potonganPersen      = (document.getElementById('potonganPersen_' + ID) as HTMLInputElement)?.value;
        let potonganQuantity    = (document.getElementById('potonganQuantity_' + ID) as HTMLInputElement)?.value;

        let doDiscount     = Number(currentItem.HARGA_JUAL) * (Number(potonganPersen)/100);

        currentCart = [...currentCart, {
            ID              : currentItem.ID,
            NAMA            : currentItem.NAMA,
            QUANTITY        : Number(potonganQuantity),
            TOTAL           : ( Number(currentItem.HARGA_JUAL) - Number(doDiscount) - Number(potonganRupiah) ) * Number(potonganQuantity),
            HARGA_ASLI      : currentItem.HARGA_JUAL,
            POTONGAN_RUPIAH : Number(potonganRupiah),
            POTONGAN_PERSEN : Number(doDiscount),
            TIPE            : 'Satuan'
        }];
        currentCart = currentCart;
        recalculatePrice(currentCart);
        return currentCart;
    }

    function addToCartPieces(ID:number){
        let currentItem    = masterProduk[ID];

        const findItem = currentCart.find((objectKey: { NAMA: any; }) => objectKey.NAMA === currentItem.NAMA);
        if(findItem != undefined){
            return toast.error('Produk sudah ada dalam keranjang!', { position: 'top-right' });
        }

        let potonganRupiah      = (document.getElementById('potonganRupiah_' + ID) as HTMLInputElement)?.value;
        let potonganPersen      = (document.getElementById('potonganPersen_' + ID) as HTMLInputElement)?.value;
        let potonganQuantity    = (document.getElementById('potonganQuantity_' + ID) as HTMLInputElement)?.value;

        let doDiscount     = Number(currentItem.HARGA_PER_ITEM) * (Number(potonganPersen)/100);

        currentCart = [...currentCart, {
            ID              : currentItem.ID,
            NAMA            : currentItem.NAMA,
            QUANTITY        : Number(potonganQuantity),
            TOTAL           : ( Number(currentItem.HARGA_PER_ITEM) - Number(doDiscount) - Number(potonganRupiah) ) * Number(potonganQuantity),
            HARGA_ASLI      : currentItem.HARGA_PER_ITEM,
            POTONGAN_RUPIAH : Number(potonganRupiah),
            POTONGAN_PERSEN : Number(doDiscount),
            TIPE            : 'Pieces'
        }];
        currentCart = currentCart;
        recalculatePrice(currentCart);
        return currentCart;
    }

    function removeItem(ID:number){
        currentCart.splice(ID,1);
        currentCart = currentCart;
        recalculatePrice(currentCart);
        return currentCart;
    }

    function editCartQuantity(id: number, value: number) {
        const searchQueries: Cart = currentCart[id];
        if(!searchQueries){
            return toast.error("Item tidak ditemukan!");
        }

        currentCart[id].TOTAL = value * searchQueries.HARGA_ASLI - (searchQueries.POTONGAN_PERSEN + searchQueries.POTONGAN_RUPIAH);
        recalculatePrice(currentCart);
    }

    // function editQuantity(ID:number){
    //     let currentItem     = currentCart[ID];
    //     let mainItem        = masterProduk.find((objectKey: { NAMA: any; }) => objectKey.NAMA == currentItem.NAMA );
    //     let mainCart        = currentCart.find((objectKey: { NAMA: any; }) => objectKey.NAMA == currentItem.NAMA );
    //     let quantityAmount  = (document.getElementById('itemPotongan_' + ID) as HTMLInputElement).value;

    //     if (mainCart === undefined) {
    //         toast.error('Produk tidak ditemukan!);
    //         return;
    //     }

    //     mainCart.QUANTITY = Number(quantityAmount);
    //     mainCart.TOTAL    = mainItem.HARGA_JUAL * Number(quantityAmount);
    //     currentCart = currentCart;
    //     return recalculatePrice(currentCart);
    // }

    function recalculatePrice(currentCart:any){
        totalProducts = 0;
        const sumTotal = currentCart.reduce((accumulator: any, object : { TOTAL: any }) => {
            return accumulator + Number(object.TOTAL);
        }, 0);
        totalProducts = sumTotal;
        return totalProducts;
    }

    async function doSubmit(){
        if ( currentCart.length == 0 ){
            return toast.error('Keranjang Kosong!');
        }

        enableSubmit = true;

        const { status, message } = await db({
            DP: currencySanitizer(payDP),
            CASH: currencySanitizer(payCash),
            POTONGAN: currencySanitizer(cutMoney),
            JATUH_TEMPO: dueDate,
            TOTAL: totalProducts,
            KETERANGAN: additionalInformation,
            CART: currentCart,
            MEMBER: memberDropdown
        }, 'UD84/Penjualan/Saving-Receipt');

        enableSubmit = false;

        if (status === "error"){
            toast.error(message);
            return;
        }

        masterProduk = await useFetch('UD84/Master-Produk/Retrieve');
        toast.success(message);
        removeAll();
    }

    function removeAll(): void {
        totalProducts = 0;
        currentCart = [];
        payCash = '';
        payDP = '';
        dueDate = null
        enableSubmit = false;
        additionalInformation = '';
        recalculatePrice(currentCart);
    }

    async function memberPrice(){
        if(memberDropdown == 'UMUM'){
            masterProduk = staticMasterProduk;
            return;
        }

        // const { status, message, data } = await db({
        //     ID : memberDropdown
        // }, 'UD84/Master-Produk/Retrieve/Member');

        // if (status === "error"){
        //     toast.error(message);
        //     return;
        // }

        // masterProduk = data;
    }

    function runKeyPress(eventPressed:any): void{
        let key = eventPressed.key;
        if(key == 'Escape'){
            searchBarValue = '';
            searchBar.focus();
        }
    }

</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div class="lg:col-span-9">

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label for="inputSearch" class="label-text mb-1 block font-medium">Cari Nama Produk</label>
                        <input type="text" bind:this={searchBar} bind:value={searchBarValue} onkeyup={() => doSearch(searchBarValue)} class="input input-bordered input-sm w-full" placeholder="Nama Produk" />
                    </div>
                    <div>
                        <label for="pilihMember" class="label-text mb-1 block font-medium">Pilih Member</label>
                        <select bind:value={memberDropdown} onchange={memberPrice} class="select select-bordered select-sm w-full">
                            <option value="UMUM" selected>UMUM</option>
                            {#each listMember as memberData }
                                <option value="{memberData.ID}">{memberData.NAMA}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="divider my-3"></div>

                <div class="overflow-y-auto" style="max-height: 60vh;">
                    <div class="overflow-x-auto">
                        <table class="table table-zebra table-sm align-middle">
                            <thead>
                                <tr class="font-bold">
                                    <th class="text-left">Nama Item</th>
                                    <th class="text-center">Diskon<br/><span class="text-[10px] font-normal opacity-70">Rp / %</span></th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-center font-extrabold text-info">Satuan</th>
                                    <th class="text-center font-extrabold text-success">Pcs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each masterProduk as data, index }
                                    <tr>
                                        <td class="text-left">
                                            <div class="flex items-center gap-2">
                                                {#if data.STOK < 30}
                                                    <span class="badge badge-error badge-sm shrink-0">{ data.STOK }</span>
                                                {:else}
                                                    <span class="badge badge-ghost badge-sm shrink-0">{ data.STOK }</span>
                                                {/if}
                                                <div class="leading-tight">
                                                    <div>
                                                        <span class="font-extrabold text-warning">[{ data.TIPE }]</span>
                                                        <span class="font-medium">{ data.NAMA }</span>
                                                    </div>
                                                    <span class="text-[10px] text-error opacity-70">Pabrik: { rupiahFormatter.format(data.HARGA_PABRIK) }</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex flex-col gap-1">
                                                <input type="number" id="potonganRupiah_{index}" class="input input-bordered input-xs w-20" placeholder="Rp" />
                                                <input type="number" id="potonganPersen_{index}" min=1 max="100" class="input input-bordered input-xs w-20" placeholder="%" />
                                            </div>
                                        </td>
                                        <td>
                                            <input type="number" id="potonganQuantity_{index}" value="1" min=1 class="input input-bordered input-xs w-16 text-center" placeholder="Qty" />
                                        </td>
                                        <td class="text-center">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="whitespace-nowrap text-xs font-semibold text-info">{ rupiahFormatter.format(data.HARGA_JUAL) }</span>
                                                <button type="button" onclick={() => addToCart(index)} class="btn btn-xs btn-square btn-success">
                                                    <img src="/icons/Add-Arrow.svg" alt="Tambah satuan" height="16" />
                                                </button>
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="whitespace-nowrap text-xs font-semibold text-success">{ rupiahFormatter.format(data.HARGA_PER_ITEM) }</span>
                                                <button type="button" onclick={() => addToCartPieces(index)} class="btn btn-xs btn-square btn-neutral">
                                                    <img src="/icons/Add-Arrow.svg" alt="Tambah pcs" height="16" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <div class="lg:col-span-3">

                <div class="flex items-center justify-end rounded-lg border border-primary p-3">
                    <h1 class="text-2xl font-bold text-primary sm:text-3xl">{ rupiahFormatter.format(totalProducts - currencySanitizer(cutMoney)) }</h1>
                </div>

                <div class="my-3 overflow-y-auto" style="max-height: 40vh;">
                    <div class="overflow-x-auto">
                        <table class="table table-zebra align-middle">
                            <thead>
                                <tr class="font-bold">
                                    <th class="w-1/2 text-left">Nama Item</th>
                                    <th class="w-1/4 text-center">Jumlah</th>
                                    <th class="w-1/4">Hapus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each currentCart as carts, index}
                                    <tr>
                                        <td class="text-left">
                                            <span class="font-bold">{ carts.NAMA }</span><br/>
                                            <span class="font-extrabold text-error">{ rupiahFormatter.format(carts.TOTAL) }</span>
                                        </td>
                                        <td class="text-center">
                                            <input type="number" id="itemPotongan_{index}" bind:value={carts.QUANTITY} onkeyup={() => editCartQuantity(index, carts.QUANTITY)} class="input input-bordered input-sm w-full text-center" placeholder="Qty">
                                        </td>
                                        <td>
                                            <button type="button" onclick={() => removeItem(index)} class="btn btn-sm btn-neutral">X</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="divider my-3"></div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label for="inputDP" class="label-text mb-1 block font-medium">DP</label>
                        <Rupiah id="payCash" bind:value={payDP} useClass="input input-bordered input-sm w-full"/>
                    </div>
                    <div>
                        <label for="inputTunai" class="label-text mb-1 block font-medium">Tunai</label>
                        <Rupiah id="payCash" bind:value={payCash} useClass="input input-bordered input-sm w-full"/>
                    </div>
                </div>

                <div class="my-3">
                    <label for="inputTunai" class="label-text mb-1 block font-medium">Potongan Lainnya</label>
                    <Rupiah id="payCash" bind:value={cutMoney} useClass="input input-bordered input-sm w-full"/>
                </div>

                <div class="my-3">
                    <label for="dpBerjangka" class="label-text mb-1 block font-medium">Jatuh Tempo (Opsional)</label>
                    <input type="date" bind:value={dueDate} class="input input-bordered input-sm w-full" />
                </div>

                <div class="my-3">
                    <label for="keterangan" class="label-text mb-1 block font-medium">Keterangan</label>
                    <textarea bind:value={additionalInformation} class="textarea textarea-bordered w-full" placeholder="Masukkan Keterangan"></textarea>
                </div>

                <button type="button" onclick={doSubmit} class="btn btn-sm btn-primary w-full" disabled={enableSubmit}>
                    Simpan Transaksi
                </button>

            </div>
        </div>

    </div>
</div>
</div>

<svelte:window onkeydown={runKeyPress} />
