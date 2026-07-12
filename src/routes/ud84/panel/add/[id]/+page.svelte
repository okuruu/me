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

                        if (pageTitle == "Item Keluar" && responsiblePerson.length == 0) {
                            toast.error("Pilih Penanggung Jawab Item Keluar");
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
                        return goto(`/ud84/panel/logistic`);
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
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <div class="lg:col-span-4">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h4 class="card-title text-lg font-bold">{data.pageTitle}</h4>

                <form onsubmit={handleSearch} class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div class="flex-1">
                        <label for="searchQuery" class="label-text mb-1 block font-medium">Cari Produk</label>
                        <input id="searchQuery" type="text" bind:this={searchInput} bind:value={searchQuery} class="input input-bordered input-sm w-full" placeholder="[ESC] Search items" required />
                    </div>
                    <div class="sm:w-28">
                        <label for="searchAmount" class="label-text mb-1 block font-medium">Jumlah</label>
                        <input id="searchAmount" type="number" bind:value={searchAmount} min="1" class="input input-bordered input-sm w-full" placeholder="[TAB] Jumlah" required />
                    </div>
                    <button type="submit" hidden>Search</button>
                </form>

                {#if pageUrl === "item-keluar"}
                    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div class="flex-1">
                            <label class="label-text mb-1 block font-medium text-warning" for="tipeAfkir">Tipe Item Keluar</label>
                            <select id="tipeAfkir" class="select select-bordered select-sm w-full">
                                <option value="" selected disabled>Pilih Salah Satu</option>
                                {#each kategoriAfkir as kategori }
                                    <option value={kategori}>{kategori}</option>
                                {/each}
                            </select>
                        </div>
                        <button type="button" class="btn btn-error btn-sm" onclick={() => openSidebar('selectPIC')}>Pilih PIC</button>
                    </div>
                {/if}

                <div class="mt-4">
                    <label for="notePOS" class="label-text mb-1 block font-medium">Keterangan</label>
                    <textarea id="notePOS" bind:value={notes} class="textarea textarea-bordered w-full" placeholder="Belum ada catatan"></textarea>
                </div>

                <button type="button" class="btn btn-error mt-6 w-full" onclick={completeTransaction}>Simpan {data.pageTitle}</button>
            </div>
        </div>
    </div>
    <div class="lg:col-span-8">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex items-center justify-end rounded-lg bg-base-200 px-4 py-3">
                    <h1 class="text-2xl font-bold text-primary sm:text-3xl">{rupiahFormatter.format(totalProducts)}</h1>
                </div>

                <div class="mt-4 overflow-x-auto">
                    <table class="table table-zebra align-middle text-center">
                        <thead>
                            <tr class="font-bold">
                                <th>#</th>
                                <th class="text-left">Nama - Satuan</th>
                                <th>Harga</th>
                                <th>Jumlah Per Pcs</th>
                                <th>Total Harga</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if cartData.length == 0}
                                <tr>
                                    <td colspan="6" class="text-center text-base-content/60">Tidak ada data</td>
                                </tr>
                            {:else }
                                {#each cartData as cartItem, index }
                                    <tr>
                                        <td class="font-bold">{index + 1}</td>
                                        <td class="text-left">
                                            <span class="font-bold">{ cartItem.NAMA } - </span>
                                            <span class="font-bold text-warning">{ cartItem.SATUAN }</span>
                                        </td>
                                        <td><span class="font-bold text-primary">{ rupiahFormatter.format(cartItem.HARGA) }</span></td>
                                        <td>
                                            <input type="number" min="1" id="quantity_{index}" bind:value={cartItem.INPUT_STOK}  onkeyup={() => editCartQuantity(index,cartItem.JUMLAH)}  class="input input-bordered input-sm mx-auto w-20 text-center" placeholder="Pcs"/>
                                        </td>
                                        <td class="font-bold">{rupiahFormatter.format(cartItem.TOTAL_HARGA)}</td>
                                        <td>
                                            <button type="button" onclick={() => removeFromList(index)} class="btn btn-ghost btn-square btn-sm text-error">
                                                <img src="/icons/Delete.svg" alt="" class="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    <tr class="text-left text-sm text-base-content/60">
                                        <td colspan="6">
                                            Distributor:<b class="ml-2 text-warning"> {cartItem.DISTRIBUTOR}</b> |
                                            Stok Sekarang:<b class="ml-2 text-error"> {cartItem.STOK}</b> |
                                            Deskripsi:<b class="ml-2 text-info"> {cartItem.DESKRIPSI}</b>
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
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
<div class="w-full p-5">
    <div class="flex items-center justify-between gap-3 rounded-lg bg-base-200 px-4 py-3">
        <h1 class="text-lg font-bold">Pilih Penanggung Jawab</h1>
        <button type="button" id="transactionModal" class="btn btn-square btn-neutral btn-sm" aria-label="Close">X</button>
    </div>

    <div class="mt-3 flex justify-end">
        <button type="button" class="btn btn-sm btn-success">Total Tagihan: {rupiahFormatter.format(totalProducts)}</button>
    </div>

    <div class="divider my-3"></div>

    <div class="my-4">
        <label for="ItemKeluar" class="label-text mb-2 block font-medium">Pilih Penanggung Jawab</label>
        <div class="flex flex-col gap-2 sm:flex-row">
            <select id="ItemKeluar" bind:value={selectPIC} class="select select-bordered select-sm w-full capitalize">
                <option value="" disabled selected>Pilih Penanggung Jawab</option>
                {#each userList as {ID, NAMA}}
                    <option value={ID}>{NAMA}</option>
                {/each}
            </select>
            <button type="button" onclick={addPersonInCharge} class="btn btn-info btn-sm">Tambahkan</button>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="table table-zebra align-middle text-center">
            <thead>
                <tr class="font-bold">
                    <th>#</th>
                    <th>Nama Penanggung Jawab</th>
                    <th>Potongan Afkir</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each responsiblePerson as person, index}
                    <tr>
                        <td>{index + 1}</td>
                        <td>{person.NAMA}</td>
                        <td>
                            <Rupiah id={`setRupiah_${index}`} bind:value={responsiblePerson[index].NOMINAL} useClass="input input-bordered input-sm w-full text-center" />
                        </td>
                        <td>
                            <button type="button" onclick={() => doErase(index)} class="btn btn-ghost btn-square btn-sm text-error">Hapus</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="divider my-3"></div>

    <div class="flex justify-end">
        <button type="button" class="btn btn-ghost btn-sm" onclick={() => isDrawer = !isDrawer} >Tutup</button>
    </div>
</div>
{/snippet}

{#snippet useItem()}
    <div class="w-full p-5">
        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
                        <th>Satuan</th>
                        <th>Tambahkan Item</th>
                    </tr>
                </thead>
                <tbody>
                    {#if cartSearch.length == 0}
                        <tr>
                            <td colspan="4" class="text-center text-base-content/60">Item tidak ditemukan. Tekan <b>[ESC]</b> untuk kembali ke keranjang.</td>
                        </tr>
                    {:else}
                        {#each cartSearch as cartSearch, index }
                            <tr>
                                <td class="font-bold">{index + 1}</td>
                                <td class="text-left font-bold">{cartSearch.NAMA} - <b class="text-error">[{cartSearch.SATUAN}]</b></td>
                                <td class="font-bold text-warning">
                                    <span class="text-warning">{rupiahFormatter.format(cartSearch.HARGA)}</span>
                                </td>
                                <td>
                                    <button type="button" id="cartModal_{index}" onclick={() => selectionModal(cartSearch.ID)} class="btn btn-ghost btn-square btn-sm text-primary">
                                        <img src="/icons/Add.svg" class="h-5 w-5" alt="Tambahkan ke Keranjang" />
                                    </button>
                                </td>
                            </tr>
                            <tr class="text-left text-sm text-base-content/60">
                                <td></td>
                                <td colspan="3">
                                    Distributor:<b class="ml-2 text-warning"> {cartSearch.DISTRIBUTOR}</b> |
                                    Stok Sekarang:<b class="ml-2 text-error"> {cartSearch.STOK}</b> |
                                    Deskripsi:<b class="ml-2 text-info"> {cartSearch.DESKRIPSI}</b>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
{/snippet}

<svelte:window onkeydown={handleKeyNavigation} />