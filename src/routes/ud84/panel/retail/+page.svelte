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

        // Rounded once, here, so the figure that goes into TOTAL is the same
        // one stored in POTONGAN_PERSEN. That column is an int, so MySQL used
        // to round it on insert while TOTAL kept the unrounded value -- which
        // is how a printed line could disagree with its own arithmetic by a
        // rupiah or two.
        let doDiscount     = Math.round(Number(currentItem.HARGA_JUAL) * (Number(potonganPersen)/100));

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

        // Rounded for the same reason as the Satuan path above.
        let doDiscount     = Math.round(Number(currentItem.HARGA_PER_ITEM) * (Number(potonganPersen)/100));

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

        currentCart[id].TOTAL = ( Number(searchQueries.HARGA_ASLI) - Number(searchQueries.POTONGAN_PERSEN) - Number(searchQueries.POTONGAN_RUPIAH) ) * Number(value);
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

        const { status, message, data } = await db({
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

        const unique = data?.UNIQUE;

        if (unique) {
            toast.success(message, {
                action: {
                    label: 'Cetak Nota',
                    // New tab, so the POS stays on this screen for the next customer.
                    onClick: () => window.open(`/ud84/panel/nota/${unique}`, '_blank')
                }
            });
        } else {
            toast.success(message);
        }

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
<div class="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8">
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
                                                <button type="button" onclick={() => addToCart(index)} class="btn btn-xs btn-square btn-success" aria-label="Tambah satuan">
                                                    <svg viewBox="0 0 1080 1080" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                                        <g transform="matrix(1 0 0 1 540 540)">
                                                            <g transform="matrix(1 0 0 1 -110.5 0)">
                                                                <path fill-rule="evenodd" transform="translate(-145, -255.5)" d="M -0.5 431.5 C -0.5 427.833 -0.5 424.167 -0.5 420.5 C 2.33836 415.473 5.83836 410.807 10 406.5 C 55.7526 356.587 100.919 306.253 145.5 255.5 C 100.919 204.747 55.7526 154.413 10 104.5 C 5.83836 100.193 2.33836 95.5267 -0.5 90.5 C -0.5 86.8333 -0.5 83.1667 -0.5 79.5 C 1.62437 73.8785 5.62437 70.0451 11.5 68 C 48.8333 67.3333 86.1667 67.3333 123.5 68 C 125.246 68.4709 126.913 69.1376 128.5 70 C 180.943 127.782 233.443 185.615 286 243.5 C 292 251.5 292 259.5 286 267.5 C 233.443 325.385 180.943 383.218 128.5 441 C 126.913 441.862 125.246 442.529 123.5 443 C 86.1667 443.667 48.8333 443.667 11.5 443 C 5.62437 440.955 1.62437 437.122 -0.5 431.5 Z"/>
                                                            </g>
                                                            <g transform="matrix(1 0 0 1 110.85 0)">
                                                                <path fill-rule="evenodd" transform="translate(-366.35, -255.5)" d="M 511.5 249.5 C 511.5 253.5 511.5 257.5 511.5 261.5 C 458.782 322.059 405.115 381.892 350.5 441 C 348.913 441.862 347.246 442.529 345.5 443 C 308.167 443.667 270.833 443.667 233.5 443 C 223.212 438.927 219.379 431.427 222 420.5 C 222.561 418.275 223.561 416.275 225 414.5 C 272.685 361.649 320.185 308.649 367.5 255.5 C 320.185 202.351 272.685 149.351 225 96.5 C 219.383 86.7079 220.55 77.8746 228.5 70 C 230.246 69.5291 231.913 68.8624 233.5 68 C 270.833 67.3333 308.167 67.3333 345.5 68 C 347.246 68.4709 348.913 69.1376 350.5 70 C 405.115 129.108 458.782 188.941 511.5 249.5 Z"/>
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="whitespace-nowrap text-xs font-semibold text-success">{ rupiahFormatter.format(data.HARGA_PER_ITEM) }</span>
                                                <button type="button" onclick={() => addToCartPieces(index)} class="btn btn-xs btn-square btn-neutral" aria-label="Tambah pcs">
                                                    <svg viewBox="0 0 1080 1080" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                                        <g transform="matrix(1 0 0 1 540 540)">
                                                            <g transform="matrix(1 0 0 1 -110.5 0)">
                                                                <path fill-rule="evenodd" transform="translate(-145, -255.5)" d="M -0.5 431.5 C -0.5 427.833 -0.5 424.167 -0.5 420.5 C 2.33836 415.473 5.83836 410.807 10 406.5 C 55.7526 356.587 100.919 306.253 145.5 255.5 C 100.919 204.747 55.7526 154.413 10 104.5 C 5.83836 100.193 2.33836 95.5267 -0.5 90.5 C -0.5 86.8333 -0.5 83.1667 -0.5 79.5 C 1.62437 73.8785 5.62437 70.0451 11.5 68 C 48.8333 67.3333 86.1667 67.3333 123.5 68 C 125.246 68.4709 126.913 69.1376 128.5 70 C 180.943 127.782 233.443 185.615 286 243.5 C 292 251.5 292 259.5 286 267.5 C 233.443 325.385 180.943 383.218 128.5 441 C 126.913 441.862 125.246 442.529 123.5 443 C 86.1667 443.667 48.8333 443.667 11.5 443 C 5.62437 440.955 1.62437 437.122 -0.5 431.5 Z"/>
                                                            </g>
                                                            <g transform="matrix(1 0 0 1 110.85 0)">
                                                                <path fill-rule="evenodd" transform="translate(-366.35, -255.5)" d="M 511.5 249.5 C 511.5 253.5 511.5 257.5 511.5 261.5 C 458.782 322.059 405.115 381.892 350.5 441 C 348.913 441.862 347.246 442.529 345.5 443 C 308.167 443.667 270.833 443.667 233.5 443 C 223.212 438.927 219.379 431.427 222 420.5 C 222.561 418.275 223.561 416.275 225 414.5 C 272.685 361.649 320.185 308.649 367.5 255.5 C 320.185 202.351 272.685 149.351 225 96.5 C 219.383 86.7079 220.55 77.8746 228.5 70 C 230.246 69.5291 231.913 68.8624 233.5 68 C 270.833 67.3333 308.167 67.3333 345.5 68 C 347.246 68.4709 348.913 69.1376 350.5 70 C 405.115 129.108 458.782 188.941 511.5 249.5 Z"/>
                                                            </g>
                                                        </g>
                                                    </svg>
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
                                    <th class="text-left">Nama Item</th>
                                    <th class="text-center">Jumlah</th>
                                    <th class="w-16 text-center">Hapus</th>
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
                                            <input type="number" id="itemPotongan_{index}" bind:value={carts.QUANTITY} oninput={() => editCartQuantity(index, carts.QUANTITY)} class="input input-bordered input-sm w-full min-w-16 text-center" placeholder="Qty">
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
