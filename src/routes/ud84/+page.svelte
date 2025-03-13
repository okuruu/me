<script lang="ts">
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { db, useFetch } from '../../library/hooks/db';
    import { capitalizeEachWord } from '../../library/utils/useFormat';
    import Ud84Katalog from '../../components/content/ud84/UD84Katalog.svelte';
    import Ud84History from '../../components/content/ud84/UD84History.svelte';

    interface Katalog {
        ID: number;
        NAMA_PRODUK: string;
        KETERANGAN: string;
        KETERSEDIAAN_PRODUK: string;
        GAMBAR: string | null;
        HARGA_JUAL: number;
        HARGA_PCS: number;
    }

    interface Staff { 
        ID: number; 
        NAMA: string; 
        NOMINAL: number 
    }

    interface Carts {
        ID: number;
        NAMA: string;
        QUANTITY: number;
    }
    
    let katalog: Katalog[] = $state([]);
    let katalogDefault: Katalog[] = $state([]);
    let sales: Staff[] = $state([]);

    let salesPassword: string = $state('');
    
    let searchBar: string = $state('');
    let imagePath: string = $state('');
    
    let cartPass: boolean = $state(false);
    let isImage: boolean = $state(false);
    let isCatalogue: boolean = $state(true);

    let isAdministrator: boolean = $state(false);
    let isHistory: boolean = $state(false);

    type Forms = Record<"nama" | "whatsapp" | "sales" | "kode" | "notes", string>;
    let useForms: Forms = $state({
        nama: '',
        whatsapp: '',
        sales: '',
        kode: '',
        notes: ''
    } as Forms);

    let carts: Carts[] = $state([]);

    onMount(async () => {
        katalog = await useFetch('UD84/Master-Produk/Katalog');
        katalogDefault = katalog;
        sales = await useFetch('UD84/Stocks/Staff');
    })

    function switchCatalogue(): boolean {
        isCatalogue = !isCatalogue;

        if(cartPass) {
            cartPass = false;
        }

        return isCatalogue;
    }

    function searchItem(): Katalog[] {
        if (searchBar === '') {
            katalog = katalogDefault;
        } else {
            katalog = katalogDefault.filter((item) => {
                return item.NAMA_PRODUK.toLowerCase().includes(searchBar.toLowerCase());
            });
        }

        return katalog;
    }

    async function openImage(index: number): Promise <void> {
        imagePath = `https://esdelfron.deabakery.co.id/public/UD84/Images/${katalog[index].GAMBAR}`;
        isImage = true;
    }

    function closeImage(): void {
        isImage = false
        imagePath = '';
        searchBar = '';
        searchItem();
    }

    function addToCarts(): void | Carts[] {
        if (useForms.kode == '') {
            toast.error("Pilih item terlebih dahulu!");
            return;
        }

        const isDuplicate = carts.find((element) => element.ID === Number(useForms.kode));

        if(isDuplicate) {
            toast.error("Produk ada dalam keranjang!");
            return;
        }

        const item = katalog.find((element: Katalog) => element.ID === Number(useForms.kode))

        if(!item) {
            toast.error("Item tidak ditemukan. Harap muat ulang halaman.");
            return;
        }

        carts = [...carts, {
            ID: item?.ID,
            NAMA: item?.NAMA_PRODUK,
            QUANTITY: 1
        }];

        useForms.kode = '';

        return carts;
    }

    function removeItem(id: number): Carts[] {
        carts.splice(id, 1);
        return carts;
    }

    function removeAll(): void {
        useForms = {
            nama: '',
            whatsapp: '',
            sales: '',
            kode: '',
            notes: ''
        };
        carts = [];
    }

    async function passwordSales(): Promise <void> {
        const { status, message, data } = await db({
            password: salesPassword
        }, 'UD84/Charts/Sales-Password');

        if (status === "error") {
            toast.error(message);
            return;
        }

        if (data === "Standard") {
            cartPass = true;
            return;
        }

        isAdministrator = true;
    }

    async function completeTransaction(): Promise <void> {
        toast('Anda akan membuat pesanan.', {
            description: 'Apakah anda yakin?',
            action: {
                label: 'Ya, Ajukan Pesanan',
                onClick: async () => {
                    if (carts.length === 0) {
                        toast.error("Keranjang tidak boleh kosong");
                        return;
                    }

                    if (useForms.whatsapp == '' || useForms.nama == '') {
                        toast.error("Informasi pelanggan tidak boleh kosong");
                        return;
                    }

                    const { status, message } = await db({
                        NAMA: useForms.nama,
                        WHATSAPP: useForms.whatsapp,
                        SALES: useForms.sales,
                        NOTES: useForms.notes,
                        CARTS: carts
                    }, 'UD84/Penjualan/Order-Online');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.success(message);
                    removeAll();
                }
            },
        })
    }

    async function saveMember(): Promise <void> {
        toast('Buat Member.', {
            description: 'Apakah anda yakin?',
            action: {
                label: 'Ya, Buat Member',
                onClick: async () => {
                    if (useForms.whatsapp == '' || useForms.nama == '') {
                        toast.error("Informasi member tidak boleh kosong");
                        return;
                    }

                    const { status, message } = await db({
                        NAMA: useForms.nama,
                        WHATSAPP: useForms.whatsapp,
                        SALES: useForms.sales,
                        NOTES: useForms.notes,
                    }, 'UD84/Member/Create-Sales');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.success(message);
                    removeAll();
                }
            },
        })
    }
</script>
<div class="{katalog.length <= 1 || !isCatalogue ? 'min-vh-100' : ''}">
    <div class="container">
        <div class="card shadow my-7">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h3 class=" mt-2">Katalog UD84</h3>
                    {#if isImage}
                        <button type="button" class="btn btn-sm btn-icon btn-dark" onclick={closeImage}> X </button>
                    {:else}
                        <div class="form-group">
                            {#if isAdministrator}
                                <button type="button" onclick={() => isHistory = !isHistory} class="btn btn-sm btn-icon btn-dark">
                                    <img src="/icons/elements/Quiz.svg" class="h-20px svg-white" alt="History"/>
                                </button>
                            {/if}
                            <button type="button" onclick={switchCatalogue} class="btn btn-sm btn-primary">Pesan Online</button>
                        </div>
                    {/if}
                </div>
                <div class="separator my-3"></div>
                
                {#if isAdministrator && isHistory}
                    <Ud84History staff={sales}/>
                {:else if isAdministrator}
                    <Ud84Katalog katalog={katalog}/>
                {:else}
                    {#if isCatalogue}
                        {@render mainCatalogue()}
                    {:else}
                        {#if cartPass}
                            {@render useCarts()}
                        {:else}
                            <form class="form-group" onsubmit={passwordSales}>
                                <label for="pass" class="form-label fw-bold ">Masukkan Password</label>
                                <div class="row">
                                    <div class="col-8">
                                        <input type="password" bind:value={salesPassword} class="form-control" placeholder="Password Sales" required/>
                                    </div>
                                    <div class="col-4">
                                        <button type="submit" class="btn btn-primary">Buka</button>
                                    </div>
                                </div>
                            </form>
                        {/if}
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

{#snippet mainCatalogue()}
    {#if isImage}
        {@render viewImage()}
    {:else}
        {@render viewCatalogue()}
    {/if}
{/snippet}

{#snippet viewImage()}
    {#if imagePath !== ''}
        <img src={imagePath} class="img-fluid" alt="Gambar Produk"/>
    {/if}
{/snippet}

{#snippet viewCatalogue()}
    <input type="text" bind:value={searchBar} onkeyup={searchItem} class="form-control mb-3" placeholder="Cari Produk" />
    <div class="separator my-3"></div>
    <div class="table-responsive">
        <table class="table align-middle">
            <thead>
                <tr class="fw-bolder">
                    <th>#</th>
                    <th>Nama Produk</th>
                    <th>Keterangan</th>
                    <th>Gambar</th>
                </tr>
            </thead>
            <tbody>
                {#each katalog as katalog, index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{katalog.NAMA_PRODUK}</td>
                        <td>{katalog.KETERANGAN}</td>
                        <td class="text-center">
                            <button type="button" onclick={() => openImage(index)} class="btn btn-sm btn-icon btn-primary">
                                <img src="/icons/elements/Share.svg" class="h-15px svg-white" alt="View" />
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/snippet}

{#snippet useCarts()}
    <div class="form-group mt-10">
        <label for="chooseNama" class="form-label fw-bold ">Nama Anda</label>
        <input type="text" bind:value={useForms.nama} class="form-control" placeholder="Masukkan Nama" required/>
    </div>

    <div class="form-group my-3">
        <label for="whatsApp" class="form-label fw-bold ">Nomor WhatsApp Anda</label>
        <input type="text" bind:value={useForms.whatsapp} class="form-control" placeholder="Contoh: 089887665432" required/>
    </div>

    <div class="form-group my-3">
        <label for="kodeSales" class="form-label fw-bold ">Kode Sales</label>
        <select bind:value={useForms.sales} class="form-select" required>
            <option value="" selected>Tanpa Sales</option>
            {#each sales as sales }
                <option value={sales.ID}>{sales.NAMA}</option>
            {/each}
        </select>
    </div>

    <div class="form-group my-3">
        <label for="keterangan" class="form-label fw-bold ">Catatan / Alamat</label>
        <textarea class="form-control" rows="3" placeholder="Masukkan Catatan" bind:value={useForms.notes} required></textarea>
    </div>

    <div class="form-group my-3">
        <label for="chooseItem" class="form-label fw-bold ">Pilih Item</label>
        <div class="row">
            <div class="col-10">
                <select bind:value={useForms.kode} class="form-select">
                    <option value="" selected disabled>Pilih Item</option>
                    {#each katalogDefault as katalog }
                        <option value={katalog.ID}>{katalog.NAMA_PRODUK}</option>
                    {/each}
                </select>
            </div>
            <div class="col-2">
                <button type="button" onclick={addToCarts} class="btn btn-icon btn-primary">
                    <img src="icons/elements/Cart-Plus.svg" class="h-25px svg-white" alt="View" />
                </button>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <button type="button" onclick={saveMember} class="btn btn-info w-100">Simpan Member</button>
        </div>
        <div class="col">
            <button type="button" onclick={completeTransaction} class="btn btn-primary w-100">Simpan Pesanan</button>
        </div>
    </div>


    <div class="separator my-5"></div>
    <h3 class="fw-bold ">Keranjang Belanja</h3>

    <div class="table-responsive"></div>
    
    <table class="table  align-middle">
        <thead>
            <tr class="fw-bolder">
                <th>#</th>
                <th>Nama Produk</th>
                <th>Jumlah (Pcs)</th>
                <th>Hapus</th>
            </tr>
        </thead>
        <tbody>
            {#if carts.length === 0}
                <tr>
                    <td colspan="3" class="text-center">Keranjang Kosong</td>
                </tr>
            {:else}
                {#each carts as carts, index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{carts.NAMA}</td>
                        <td class="text-center">
                            <input type="number" min="1" class="form-control text-center" placeholder="Qty" bind:value={carts.QUANTITY} />
                        </td>
                        <td class="text-center">
                            <button type="button" onclick={() => removeItem(index)} class="btn btn-sm btn-icon">
                                <img src="icons/elements/Delete.svg" class="h-15px" alt="View" />
                            </button>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>

{/snippet}