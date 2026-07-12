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
<div class="{katalog.length <= 1 || !isCatalogue ? 'min-h-screen' : ''}">
    <div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="card-title text-xl font-bold">Katalog UD84</h3>
                    {#if isImage}
                        <button type="button" class="btn btn-sm btn-square btn-neutral" onclick={closeImage}> X </button>
                    {:else}
                        <div class="flex items-center gap-2">
                            {#if isAdministrator}
                                <button type="button" onclick={() => isHistory = !isHistory} class="btn btn-sm btn-square btn-neutral">
                                    <img src="/icons/Quiz.svg" class="h-5 w-5" alt="History"/>
                                </button>
                            {/if}
                            <button type="button" onclick={switchCatalogue} class="btn btn-sm btn-primary">Pesan Online</button>
                        </div>
                    {/if}
                </div>
                <div class="divider my-3"></div>

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
                            <form class="space-y-2" onsubmit={passwordSales}>
                                <label for="pass" class="label-text font-medium">Masukkan Password</label>
                                <div class="flex flex-col gap-2 sm:flex-row">
                                    <input type="password" bind:value={salesPassword} class="input input-bordered w-full" placeholder="Password Sales" required/>
                                    <button type="submit" class="btn btn-primary sm:shrink-0">Buka</button>
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
        <img src={imagePath} class="mx-auto h-auto max-w-full rounded-lg" alt="Gambar Produk"/>
    {/if}
{/snippet}

{#snippet viewCatalogue()}
    <div class="mb-4">
        <input type="text" bind:value={searchBar} onkeyup={searchItem} class="input input-bordered w-full max-w-md" placeholder="Cari Produk" />
    </div>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {#each katalog as katalog, index }
            <div class="card border border-base-200 bg-base-100 shadow-sm">
                <div class="card-body flex flex-col gap-2 p-4">
                    <div class="flex items-start justify-between gap-2">
                        <span class="badge badge-ghost badge-sm">{ index + 1 }</span>
                        <button type="button" onclick={() => openImage(index)} class="btn btn-ghost btn-square btn-sm text-primary">
                            <img src="/icons/Share.svg" class="h-4 w-4" alt="View" />
                        </button>
                    </div>
                    <h4 class="card-title text-base font-bold leading-tight">{katalog.NAMA_PRODUK}</h4>
                    <p class="text-sm text-base-content/60">{katalog.KETERANGAN}</p>
                </div>
            </div>
        {/each}
    </div>
{/snippet}

{#snippet useCarts()}
    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
            <label for="chooseNama" class="label-text mb-1 block font-medium">Nama Anda</label>
            <input type="text" bind:value={useForms.nama} class="input input-bordered w-full" placeholder="Masukkan Nama" required/>
        </div>

        <div>
            <label for="whatsApp" class="label-text mb-1 block font-medium">Nomor WhatsApp Anda</label>
            <input type="text" bind:value={useForms.whatsapp} class="input input-bordered w-full" placeholder="Contoh: 089887665432" required/>
        </div>

        <div>
            <label for="kodeSales" class="label-text mb-1 block font-medium">Kode Sales</label>
            <select bind:value={useForms.sales} class="select select-bordered w-full" required>
                <option value="" selected>Tanpa Sales</option>
                {#each sales as sales }
                    <option value={sales.ID}>{sales.NAMA}</option>
                {/each}
            </select>
        </div>

        <div>
            <label for="chooseItem" class="label-text mb-1 block font-medium">Pilih Item</label>
            <div class="flex gap-2">
                <select bind:value={useForms.kode} class="select select-bordered w-full">
                    <option value="" selected disabled>Pilih Item</option>
                    {#each katalogDefault as katalog }
                        <option value={katalog.ID}>{katalog.NAMA_PRODUK}</option>
                    {/each}
                </select>
                <button type="button" onclick={addToCarts} class="btn btn-primary btn-square shrink-0">
                    <img src="icons/elements/Cart-Plus.svg" class="h-6 w-6" alt="View" />
                </button>
            </div>
        </div>

        <div class="md:col-span-2">
            <label for="keterangan" class="label-text mb-1 block font-medium">Catatan / Alamat</label>
            <textarea class="textarea textarea-bordered w-full" rows="3" placeholder="Masukkan Catatan" bind:value={useForms.notes} required></textarea>
        </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" onclick={saveMember} class="btn btn-info w-full">Simpan Member</button>
        <button type="button" onclick={completeTransaction} class="btn btn-primary w-full">Simpan Pesanan</button>
    </div>

    <div class="divider my-5"></div>
    <h3 class="mb-3 text-lg font-bold">Keranjang Belanja</h3>

    <div class="overflow-x-auto">
        <table class="table table-zebra align-middle">
            <thead>
                <tr class="font-bold">
                    <th>#</th>
                    <th>Nama Produk</th>
                    <th class="text-center">Jumlah (Pcs)</th>
                    <th class="text-center">Hapus</th>
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
                                <input type="number" min="1" class="input input-bordered input-sm w-24 text-center" placeholder="Qty" bind:value={carts.QUANTITY} />
                            </td>
                            <td class="text-center">
                                <button type="button" onclick={() => removeItem(index)} class="btn btn-ghost btn-square btn-sm text-error">
                                    <img src="icons/elements/Delete.svg" class="h-4 w-4" alt="View" />
                                </button>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

{/snippet}
