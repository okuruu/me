<script lang="ts">
    import { onMount } from "svelte";
    import { toast, Toaster } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { currencySanitizer, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Rupiah from "../../../../components/shared/Rupiah.svelte";

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

        const { status, message, data } = await db({
            ID : memberDropdown
        }, 'UD84/Master-Produk/Retrieve/Member');

        if (status === "error"){
            toast.error(message);
            return;
        }

        masterProduk = data;
    }

    function runKeyPress(eventPressed:any): void{
        let key = eventPressed.key;
        if(key == 'Escape'){
            searchBarValue = '';
            searchBar.focus();
        }
    }

</script>
<Toaster />
<div class="card shadow-sm">
    <div class="card-body">
        
        <div class="row">
            <div class="col-sm-9 col-md-9 col-lg-9 col-xl-9 col-xxl-9">

                <div class="row">
                    <div class="col">
                        <label for="inputSearch" class="form-label fw-bold">Cari Nama Produk</label>
                        <input type="text" bind:this={searchBar} bind:value={searchBarValue} onkeyup={() => doSearch(searchBarValue)} class="form-control form-control-sm" placeholder="Nama Produk" />
                    </div>
                    <div class="col">
                        <label for="pilihMember" class="form-label fw-bold">Pilih Member</label>
                        <select bind:value={memberDropdown} onchange={memberPrice} class="form-select form-select-sm">
                            <option value="UMUM" selected>UMUM</option>
                            {#each listMember as memberData }
                                <option value="{memberData.ID}">{memberData.NAMA}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="separator my-5"></div>

                <div class="overflow-auto" style="height: 50vh;">

                    <div class="table-responsive">
                        <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
                            <thead>
                                <tr class="fw-bold">
                                    <th>#</th>
                                    <th>Nama Item</th>
                                    <th>Tipe</th>
                                    <th>Stok</th>
                                    <th class="fw-bolder text-danger">Harga Item (Pabrik)</th>
                                    <th class="fw-bolder text-info">Harga Item (Satuan)</th>
                                    <th class="fw-bolder text-success">Harga Item (Pcs)</th>
                                    <th>Potongan (Rp)</th>
                                    <th>Potongan (%)</th>
                                    <th>Jumlah Item</th>
                                    <th>Go (Satuan)</th>
                                    <th>Go (Pcs)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each masterProduk as data, index }
                                    <tr>
                                        <td>{ index + 1 }</td>
                                        <td>{ data.NAMA }</td>
                                        <td>{ data.TIPE }</td>
                                        <td>
                                            {#if data.STOK < 30}
                                                <button type="button" class="btn btn-sm btn-danger">{ data.STOK }</button>
                                            {:else}
                                                { data.STOK }
                                            {/if}
                                        </td>
                                        <td>{ rupiahFormatter.format(data.HARGA_PABRIK) }</td>
                                        <td>{ rupiahFormatter.format(data.HARGA_JUAL) }</td>
                                        <td>{ rupiahFormatter.format(data.HARGA_PER_ITEM) }</td>
                                        <td>
                                            <input type="number" id="potonganRupiah_{index}" class="form-control form-control-sm" placeholder="Rp. 0,00-" />
                                        </td>
                                        <td>
                                            <input type="number" id="potonganPersen_{index}" min=1 max="100" class="form-control form-control-sm" placeholder="0%" />
                                        </td>
                                        <td>
                                            <input type="number" id="potonganQuantity_{index}" value="1" min=1 class="form-control form-control-sm" placeholder="Jumlah Item" />
                                        </td>
                                        <td>
                                            <button type="button" onclick={() => addToCart(index)} class="btn btn-sm btn-icon btn-success">
                                                <img src="/icons/elements/Add-Arrow.svg" alt="Add to cart" height="20" />
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" onclick={() => addToCartPieces(index)} class="btn btn-sm btn-icon btn-dark">
                                                <img src="/icons/elements/Add-Arrow.svg" alt="Add to cart" height="20" />
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <div class="col-sm-3 col-md-3 col-lg-3 col-xl-3 col-xxl-3">

                <div class="border border-primary rounded-1 d-flex align-items-center justify-content-end">
                    <h1 class="display-6 text-dea me-3 m-2">{ rupiahFormatter.format(totalProducts) }</h1>
                </div>

                <div class="overflow-auto" style="height: 50vh;">
                    <div class="table-responsive">
                        <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
                            <thead>
                                <tr class="fw-bolder">
                                    <th class="w-50">Nama Item</th>
                                    <td class="w-25 text-center">Jumlah</td>
                                    <th class="w-25">Hapus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each currentCart as carts, index}
                                    <tr>
                                        <td>
                                            <div class="form-group">
                                                <span class="fw-bold text-dark">{ carts.NAMA }</span><br/>
                                                <span class="fw-bolder text-danger">{ rupiahFormatter.format(carts.TOTAL) }</span>
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <input type="number" id="itemPotongan_{index}" bind:value={carts.QUANTITY} onkeyup={() => editCartQuantity(index, carts.QUANTITY)} class="form-control form-control-sm text-center" placeholder="Qty">
                                        </td>
                                        <td>
                                            <button type="button" onclick={() => removeItem(index)} class="btn btn-sm btn-dark">X</button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="separator my-5"></div>

                <div class="row">
                    <div class="col">
                        <label for="inputDP" class="form-label fw-bold">DP</label>
                        <Rupiah id="payCash" bind:value={payDP} useClass="form-control form-control-sm"/>
                    </div>
                    <div class="col">
                        <label for="inputTunai" class="form-label fw-bold">Tunai</label>
                        <Rupiah id="payCash" bind:value={payCash} useClass="form-control form-control-sm"/>
                    </div>
                </div>

                <div class="my-3">
                    <label for="dpBerjangka" class="form-label fw-bold">Jatuh Tempo (Opsional)</label>
                    <input type="date" bind:value={dueDate} class="form-control form-control-sm" />
                </div>

                <div class="my-3">
                    <label for="keterangan" class="form-label fw-bold">Keterangan</label>
                    <textarea bind:value={additionalInformation} class="form-control" placeholder="Masukkan Keterangan"></textarea>
                </div>

                <button type="button" onclick={doSubmit} class="btn btn-sm btn-primary w-100" disabled={enableSubmit}>
                    Simpan Transaksi
                </button>

            </div>
        </div>

    </div>
</div>

<svelte:window onkeydown={runKeyPress} />