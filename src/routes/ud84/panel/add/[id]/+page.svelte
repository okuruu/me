<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import { db, useFetch } from "../../../../../library/hooks/db";
    import { rupiahFormatter } from "../../../../../library/utils/useFormat";
    
    import type { CartsModal } from "../../../../../interface/Carts";

    import Rupiah from "../../../../../components/shared/Rupiah.svelte";
    import Drawer from "../../../../../components/shared/Drawer.svelte";
    import Ud84Navigation from "../../../../../components/content/ud84/UD84Navigation.svelte";

    interface Carts {
        ID: number;
        NAMA: string;
        STOK: number;
        SATUAN: string;
        HARGA: number;
        JUMLAH_PER_ITEM: number;
        JUMLAH: number;
        TOTAL_HARGA: number;
        DISTRIBUTOR: string;
        INPUT_STOK: number;
        DESKRIPSI: string;
    }

    let { data } = $props();

    const pageTitle: string = data.pageTitle;
    const pageUrl: string = data.pageUrl;

    let searchInput: HTMLInputElement;
    let searchQuery: string = $state('');
    let searchAmount: number = $state(1);

    let cartData: Carts[] = $state([]);
    let cartSearch: CartsModal[] = $state([]);
    
    let isDrawer: boolean = $state(false);
    let isDisabled: boolean = $state(false);
    let isModalSearch: boolean = $state(false);

    let currentIndex: number = $state(0);
    let currentIndexModal: number = $state(0);

    let totalProducts: number = $state(0);
    
    let currentSidebar: string = $state('selectPIC');
    
    let selectPIC: string = $state('');
    let responsiblePerson: any = $state([]);
    let userList: { ID: number; NAMA: string; NOMINAL: number }[] = $state([]);
    let kategoriAfkir: string[] = $state([
        'Afkir', 'Retur', 'Dikembalikan', 'Free', 'Trial', 'Dimusnahkan'
    ]);

    let notes: string = $state('');

    onMount( async () => {
        userList = await useFetch("UD84/Stocks/Staff");
    });

    function openSidebar(id: string) {
        isDrawer = !isDrawer;
        currentSidebar = id;
    };

    function addPersonInCharge() {
        if (selectPIC === '') {
            return toast.error('Harap memilih PIC terlebih dahulu!');
        }

        const duplicateFinder = responsiblePerson.find((element: { ID: { toString: () => string; }; }) => element.ID.toString() == selectPIC);
        if (duplicateFinder !== undefined) {
            return toast.error('Data sudah ada dalam daftar!');
        }

        const data = userList.find((element) => element.ID.toString() == selectPIC);

        responsiblePerson = [...responsiblePerson, {
            ID: data?.ID,
            NAMA: data?.NAMA,
            NOMINAL: 0
        }];
    }

    function doErase(id: number): void {
        responsiblePerson.splice(id, 1);
        responsiblePerson = responsiblePerson
    }

    async function selectionModal(id: number) {
        searchQuery = id.toString();
        const searchQueries = cartData.find((element) => element.ID.toString() === searchQuery);
        if(searchQueries != undefined ){
            toast.error("Item sudah ada di keranjang!");
            return;
        }

        handleSearch();
        resetSearch();
        currentSidebar = "useCart";
        isDrawer = !isDrawer;
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    async function handleSearch(): Promise <void> {
        const { status, data } = await db({
            productName: searchQuery,
        }, 'UD84/Master-Produk/Single');

        if(status === "success") {
            const searchQueries = cartData.find((element) => element.ID.toString() === searchQuery);
            if(searchQueries != undefined) {
                searchQueries.JUMLAH += searchAmount;
                searchQueries.TOTAL_HARGA = searchQueries.HARGA * searchQueries.JUMLAH;
                cartData = cartData;
        		resetSearch();
                recalculatePrice(cartData);
                return;
            }

            cartData.push({
                ID : data.ID,
                NAMA : data.NAMA ?? '-',
                STOK: data.STOK,
                SATUAN : data.SATUAN,
                HARGA : data.HARGA,
                JUMLAH_PER_ITEM: data.JUMLAH_PER_ITEM,
                JUMLAH : searchAmount ?? 0,
                TOTAL_HARGA : Number(searchAmount) * Number(data.HARGA),
                DISTRIBUTOR: data.DISTRIBUTOR,
                INPUT_STOK: 0,
                DESKRIPSI: data.DESKRIPSI
            })
            recalculatePrice(cartData);
    		resetSearch();
            return;
        }

        currentSidebar = "useItem";
        isDrawer = !isDrawer;
        isModalSearch = true;
        cartSearch = data;
        resetSearch();
    }

    async function resetSearch() {
		searchQuery = '';
		searchAmount = 1;
		searchInput?.focus();
	};

    async function handleKeyNavigation(event: KeyboardEvent): Promise <void> {
		const keyPressed = event.key;
		if (keyPressed === 'Escape') {
            window.scrollTo({top: 0, behavior: 'smooth'});

            if(!isModalSearch || currentSidebar === "useItem") {
                currentSidebar = "useCart";
                resetSearch();
            }

            isModalSearch = false;
            resetSearch();
		} else if (keyPressed === 'ArrowDown') {
            if(isModalSearch) {
                event.preventDefault();
                currentIndexModal = (currentIndexModal + 1) % cartSearch.length;
                document.getElementById(`cartModal_${currentIndexModal}`)?.focus();
                return;
            }

            event.preventDefault();
			currentIndex = (currentIndex + 1) % cartData.length;
			document.getElementById(`cart_${currentIndex}`)?.focus();
		} else if (keyPressed === 'ArrowUp') {
            if(isModalSearch) {
                event.preventDefault();
                currentIndexModal = (currentIndexModal - 1 + cartSearch.length) % cartSearch.length;
                document.getElementById(`cartModal_${currentIndexModal}`)?.focus();
                return;
            }
            
			event.preventDefault();
			currentIndex = (currentIndex - 1 + cartData.length) % cartData.length;
			document.getElementById(`cart_${currentIndex}`)?.focus();
		}  else if (event.ctrlKey && event.key == 'Enter'){
            if(!isDisabled){
                completeTransaction();
            }
        } else if (keyPressed === 'End') {
            currentSidebar = "usePayment";
            isDrawer = !isDrawer;

            setTimeout(() => {
                document.getElementById('tunaiInput')?.focus();
            }, 500);
        }
	}

    function editCartQuantity(id: number,value: number) {
        const findOnCart = cartData[id];
        cartData[id].TOTAL_HARGA = cartData[id].INPUT_STOK * findOnCart.HARGA
        return recalculatePrice(cartData);
    }

    function removeFromList(index: number){
        cartData.splice(index,1);
        cartData = cartData;
        recalculatePrice(cartData);
        return;
    }

    function recalculatePrice(cartData: any){
        totalProducts = 0;
        const sumTotal = cartData.reduce( (accumulator: any,object: { TOTAL_HARGA: any; }) => {
            return accumulator + Number(object.TOTAL_HARGA);
        }, 0 );
        totalProducts = sumTotal;
        return totalProducts;
    }

    async function completeTransaction(): Promise <void> {

        toast(pageTitle, {
            description: 'Apakah anda yakin?',
            action: {
            label: 'Ya, Simpan',
            onClick: async () => {
                    try {
                        if (cartData.length === 0) {
                            toast.error("Keranjang tidak boleh kosong");
                            return;
                        }

                        const { status, message } = await db({
                            tipe : pageTitle,
                            catatan : notes,
                            penanggungJawabAfkir : responsiblePerson,
                            cart : cartData,
                        }, 'UD84/Stocks/Manipulate');

                        if (status === "error") {
                            toast.error(message);
                            return;
                        }

                        toast.success(message);
                        return goto(`/ud84/panel/${pageUrl}`)
                    } catch (error) {
                        toast.error("Ada masalah dengan koneksi internet.");
                        return;
                    }
                }
            },
        });
    }
</script>
<Ud84Navigation/>
<div class="row p-5">
    <div class="col-4">
        <div class="d-flex justify-content-between">
            <h4 class="fw-bolder text-dea">{data.pageTitle}</h4>
        </div>

        <form onsubmit={handleSearch} class="row">
            <div class="col">
                <div class="input-group input-group-sm mb-3">
                    <span class="input-group-text border-transparent" id="cariProduk">🔍</span>
                    <input type="text" bind:this={searchInput} bind:value={searchQuery} class="form-control form-control-sm" placeholder="[ESC] Search items" required />
                </div>
            </div>
            <div class="col">
                <input type="number" bind:value={searchAmount} min="1" class="form-control form-control-sm" placeholder="[TAB] Jumlah" required />
            </div>
            <button type="submit" hidden>Search</button>
        </form>

        {#if pageUrl === "item-keluar"}
            <div class="row my-2">
                <div class="col mt-2">
                    <label class="form-label fw-bolder text-golden" for="tipeAfkir">Tipe Item Keluar</label>
                </div>
                <div class="col">
                    <select class="form-select form-select-sm">
                        <option value="" selected disabled>Pilih Salah Satu</option>
                        {#each kategoriAfkir as kategori }
                            <option value={kategori}>{kategori}</option>
                        {/each}
                    </select>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-sm btn-danger" onclick={() => openSidebar('selectPIC')}>Pilih PIC</button>
                </div>
            </div>
        {/if}

        <div class="form-group mt-2">
            <label for="notePOS" class="form-label fw-bold pe-7">Keterangan</label>
            <textarea id="notePOS" bind:value={notes} class="form-control" placeholder="Belum ada catatan"></textarea>
        </div>

        <button type="button" class="btn btn-danger w-100 my-5" onclick={completeTransaction}>Simpan {data.pageTitle}</button>

    </div>
    <div class="col-8">
        <div class="border-dea-total rounded-1 d-flex align-items-center justify-content-end">
            <h1 class="display-6 text-dea me-3 m-2">{rupiahFormatter.format(totalProducts)}</h1>
        </div>
        <table class="table table-row-dashed table-row-gray-300 align-middle gx-1 gy-1">
            <thead>
                <tr class="fw-bolder text-muted">
                    <th>#</th>
                    <th>Nama - Satuan</th>
                    <th class="text-center">Harga</th>
                    <th class="text-center">Jumlah Per Pcs</th>
                    <th class="text-center">Total Harga</th>
                    <th class="text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                {#if cartData.length == 0}
                    <tr>
                        <td>Tidak ada data</td>
                    </tr>
                {:else }
                    {#each cartData as cartItem, index }
                        <tr>
                            <td class="fw-bolder">{index + 1}</td>
                            <td>
                                <span class="fw-bolder">{ cartItem.NAMA } - </span>
                                <span class="fw-bolder text-warning">{ cartItem.SATUAN }</span>
                            </td>
                            <td class="text-center"><span class="text-dea fw-bolder">{ rupiahFormatter.format(cartItem.HARGA) }</span></td>
                            <td>
                                <div class="d-flex justify-content-center">
                                    <input type="number" min="1" id="quantity_{index}" bind:value={cartItem.INPUT_STOK}  onkeyup={() => editCartQuantity(index,cartItem.JUMLAH)}  class="form-control form-control-sm text-center w-50" placeholder="Pcs"/>
                                </div>
                            </td>
                            <td class="text-center fw-bold">{rupiahFormatter.format(cartItem.TOTAL_HARGA)}</td>
                            <td class="text-center">
                                <button type="button" onclick={() => removeFromList(index)} class="btn btn-icon btn-sm btn-dark">
                                    <img src="/icons/elements/Delete.svg" alt="" class="h-15px svg-white" />
                                </button>
                            </td>
                        </tr>
                        <tr class="text-start text-gray-400 small-text">
                            <td>
                                Distributor:<b class="text-warning ms-2"> {cartItem.DISTRIBUTOR}</b> | 
                                Stok Sekarang:<b class="text-danger ms-2"> {cartItem.STOK}</b> | 
                                Deskripsi:<b class="text-info ms-2"> {cartItem.DESKRIPSI}</b>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
        {#if currentSidebar === "selectPIC"}
            {@render choosePIC()}
        {:else if currentSidebar === "useItem"}
            {@render useItem()}
        {/if}
</Drawer>

{#snippet choosePIC()}
<div class="container mt-7">
    <div class="d-flex bg-light-brown rounded w-100">
        <div class="p-2 text-center w-100">
            <h1 class="fw-bolder bg-light-brown ms-13 mt-3">Pilih Penanggung Jawab</h1>
        </div>
        <div class="p-2 flex-shrink-1 bg-light-brown rounded">
            <button type="button" id="transactionModal" class="btn btn-sm btn-icon btn-danger mt-2" data-bs-dismiss="modal" aria-label="Close">X</button>
        </div>
    </div>

    <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-sm btn-success">Total Tagihan: {rupiahFormatter.format(totalProducts)}</button>
    </div>

    <div class="separator my-2 mt-3"></div>

    <div class="fv-row my-4">
        <label for="ItemKeluar" class="form-label fs-6 fw-bolder mb-3">Pilih Penanggung Jawab</label>
        <div class="row">
            <div class="col">
                <select bind:value={selectPIC} class="form-select form-select-sm text-capitalize">
                    <option value="" disabled selected>Pilih Penanggung Jawab</option>
                    {#each userList as {ID, NAMA}}
                        <option value={ID}>{NAMA}</option>
                    {/each}
                </select>
            </div>
            <div class="col">
                <button type="button"  onclick={addPersonInCharge} class="btn btn-sm btn-info">Tambahkan</button>
            </div>
        </div>
    </div>

    <div class="table-responsive my-3">
        <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
            <thead>
                <tr class="fw-bolder">
                    <th>#</th>
                    <th>Nama Penanggung Jawab</th>
                    <th>Potongan Afkir</th>
                </tr>
            </thead>
            <tbody>
                {#each responsiblePerson as person, index}
                    <tr>
                        <td>{index + 1}</td>
                        <td>{person.NAMA}</td>
                        <td>
                            <Rupiah id={`setRupiah_${index}`} bind:value={responsiblePerson[index].NOMINAL} useClass="form-control form-control-sm text-center" />
                        </td>
                        <td>
                            <button type="button" onclick={() => doErase(index)} class="btn btn-sm btn-dark">Hapus</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="separator my-3"></div>

    <div class="d-flex justify-content-end">
        <div class="me-2">
            <button type="button" class="btn btn-sm btn-secondary" onclick={() => isDrawer = !isDrawer} >Tutup</button>
        </div>
    </div>
</div>
{/snippet}

{#snippet useItem()}
    <div class="table-responsive w-100 mx-2 my-2">
        <table class="table table-row-dashed table-hover table-row-gray-300 align-middle gx-1 gy-1">
            <thead>
                <tr class="fw-bold">
                    <th class="text-center">#</th>
                    <th>Nama</th>
                    <th class="text-center ">Satuan</th>
                    <th class="text-center ">Tambahkan Item</th>
                </tr>
            </thead>
            <tbody>
                {#if cartSearch.length == 0}
                    <tr>
                        <td colspan="8" class="text-center">Item tidak ditemukan. Tekan <b>[ESC]</b> untuk kembali ke keranjang.</td>
                    </tr>
                {:else}
                    {#each cartSearch as cartSearch, index }
                        <tr>
                            <td class="text-center fw-bolder">{index + 1}</td>
                            <td class="fw-bolder text-start">{cartSearch.NAMA} - <b class="text-danger">[{cartSearch.SATUAN}]</b></td>
                            <td class="text-center text-golden fw-bolder">
                                <span class="text-golden">{rupiahFormatter.format(cartSearch.HARGA)}</span>
                            </td>
                            <td class="text-center">
                                <button type="button" id="cartModal_{index}" onclick={() => selectionModal(cartSearch.ID)} class="btn btn-sm btn-icon btn-active-primary">
                                    <img src="/icons/elements/Add.svg" class="h-20px" alt="Tambahkan ke Keranjang" />
                                </button>
                            </td>
                        </tr>
                        <tr class="text-start text-gray-400 small-text">
                            <td></td>
                            <td>
                                Distributor:<b class="text-warning ms-2"> {cartSearch.DISTRIBUTOR}</b> | 
                                Stok Sekarang:<b class="text-danger ms-2"> {cartSearch.STOK}</b> | 
                                Deskripsi:<b class="text-info ms-2"> {cartSearch.DESKRIPSI}</b>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
{/snippet}

<svelte:window onkeydown={handleKeyNavigation} />