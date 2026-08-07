<script lang="ts">
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { db, useFetch } from '../../library/hooks/db';
    import { capitalizeEachWord, rupiahFormatter } from '../../library/utils/useFormat';
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
        NOMINAL: number;
        STATUS?: "Aktif" | "Nonaktif";
    }

    interface Carts {
        ID: number;
        NAMA: string;
        QUANTITY: number;
        HARGA_JUAL: number;
        DISKON: string;
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
        // Only currently-active salespeople may be picked for a new order.
        // Deactivated ones stay visible on existing orders and in reports.
        const staff: Staff[] = await useFetch('UD84/Stocks/Staff') ?? [];
        sales = staff.filter((person) => person.STATUS !== "Nonaktif");
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
        imagePath = `https://fae.deabakery.co.id/public/UD84/Images/${katalog[index].GAMBAR}`;
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
            QUANTITY: 1,
            HARGA_JUAL: Number(item?.HARGA_JUAL ?? 0),
            DISKON: ''
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
                                <button type="button" onclick={() => isHistory = !isHistory} class="btn btn-sm btn-square btn-neutral" aria-label="History">
                                    <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                                        <path d="M19.8975 21.2744C20.0645 22.7158 20.8379 23.3926 22.2881 23.208L23.9844 23.0146C25.4346 22.8301 26.0586 22.0479 25.9004 20.6064L24.4854 7.80078C24.3271 6.35938 23.5361 5.67383 22.0947 5.86719L20.3984 6.06055C20.0205 6.10449 19.7041 6.19238 19.4404 6.32422V5.83203C19.4404 4.38184 18.7197 3.64355 17.2695 3.64355H14.9141C13.4551 3.64355 12.7344 4.38184 12.7344 5.83203V9.27734C12.585 9.25977 12.4268 9.25098 12.251 9.25098H8.19043C8.01465 9.25098 7.84766 9.25977 7.69824 9.27734V8.31934C7.69824 6.86035 6.97754 6.12207 5.52734 6.12207H4.24414C2.78516 6.12207 2.06445 6.86035 2.06445 8.31934V20.9932C2.06445 22.4434 2.78516 23.1816 4.24414 23.1816H17.2695C18.7197 23.1816 19.4404 22.4434 19.4404 20.9932V17.1787L19.8975 21.2744ZM15.1689 5.32227H17.0146C17.5156 5.32227 17.7617 5.58594 17.7617 6.06055V20.7559C17.7617 21.2393 17.5156 21.5029 17.0146 21.5029H14.4219V6.06055C14.4219 5.58594 14.668 5.32227 15.1689 5.32227ZM21.541 20.8613L20.1699 8.5127C20.1172 8.03809 20.3369 7.77441 20.8291 7.7041L22.0156 7.56348C22.5078 7.49316 22.7891 7.73926 22.8418 8.20508L24.2129 20.5537C24.2656 21.0371 24.0459 21.3008 23.5537 21.3711L22.3584 21.5117C21.8662 21.582 21.5938 21.3447 21.541 20.8613ZM4.49023 21.5029C3.99805 21.5029 3.74316 21.2393 3.74316 20.7559V8.53906C3.74316 8.06445 3.99805 7.80957 4.49023 7.80957H5.26367C5.77344 7.80957 6.01074 8.06445 6.01074 8.53906V21.5029H4.49023ZM8.44531 10.9297H11.9873C12.4971 10.9297 12.7344 11.1846 12.7344 11.6592V21.5029H7.69824V11.6592C7.69824 11.1846 7.94434 10.9297 8.44531 10.9297ZM8.99023 13.1445H11.4775C11.7939 13.1445 12.04 12.8896 12.04 12.5732C12.04 12.2568 11.7939 12.0107 11.4775 12.0107H8.99023C8.65625 12.0107 8.41895 12.2568 8.41895 12.5732C8.41895 12.8896 8.66504 13.1445 8.99023 13.1445ZM8.99023 20.4307H11.4775C11.7939 20.4307 12.04 20.1758 12.04 19.8506C12.04 19.543 11.7939 19.2881 11.4775 19.2881H8.99023C8.66504 19.2881 8.41895 19.543 8.41895 19.8506C8.41895 20.1758 8.65625 20.4307 8.99023 20.4307Z"/>
                                    </svg>
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
                        <span class="badge badge-neutral badge-sm">{ index + 1 }</span>
                        <button type="button" onclick={() => openImage(index)} class="btn btn-ghost btn-square btn-sm text-neutral" aria-label="View">
                            <svg class="h-4 w-4" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.97838 7.97406L9.70272 15.7336C9.80052 16.1737 10.3856 16.2687 10.6176 15.8821L18.5012 2.74264C18.7008 2.4101 18.4612 1.98703 18.0734 1.98703H2.34222C1.87902 1.98703 1.66584 2.56331 2.01753 2.86476L7.97838 7.97406ZM7.97838 7.97406L17.9568 2.48595" stroke="currentColor" stroke-width="1.99568"/>
                            </svg>
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
                <button type="button" onclick={addToCarts} class="btn btn-primary btn-square shrink-0" aria-label="Tambah ke keranjang">
                    <svg viewBox="0 0 28 28" fill="currentColor" class="h-6 w-6" aria-hidden="true">
                        <path d="M22.9209 13.1797C25.3818 13.1797 27.4473 11.123 27.4473 8.64453C27.4473 6.16602 25.4082 4.11816 22.9209 4.11816C20.4424 4.11816 18.3945 6.16602 18.3945 8.64453C18.3945 11.1318 20.4424 13.1797 22.9209 13.1797ZM10.7393 18.6553H20.9697C21.3828 18.6553 21.7607 18.3301 21.7607 17.8643C21.7607 17.4072 21.3828 17.082 20.9697 17.082H10.9414C10.5195 17.082 10.2559 16.792 10.1943 16.3438L10.0625 15.4297H21.04C21.9014 15.4297 22.4727 15.0869 22.8242 14.4189C21.9102 14.3838 21.0664 14.1025 20.3369 13.6367C20.2227 13.7773 20.0732 13.8477 19.8535 13.8477L9.83398 13.8564L9.15723 9.21582H17.1904C17.1201 8.72363 17.1377 8.13477 17.2256 7.64258H8.92871L8.79688 6.69336C8.68262 5.92871 8.375 5.54199 7.39941 5.54199H4.38477C3.94531 5.54199 3.55859 5.92871 3.55859 6.37695C3.55859 6.83398 3.94531 7.2207 4.38477 7.2207H7.13574L8.49805 16.5195C8.69141 17.8467 9.39453 18.6553 10.7393 18.6553ZM20.0469 8.64453C20.0469 8.28418 20.293 8.04688 20.6533 8.04688H22.3145V6.38574C22.3145 6.02539 22.5518 5.7793 22.9209 5.7793C23.29 5.7793 23.5273 6.02539 23.5273 6.38574V8.04688H25.1885C25.5488 8.04688 25.7949 8.28418 25.7949 8.64453C25.7949 9.01367 25.5488 9.25098 25.1885 9.25098H23.5273V10.9209C23.5273 11.2812 23.29 11.5186 22.9209 11.5186C22.5518 11.5186 22.3145 11.2812 22.3145 10.9209V9.25098H20.6533C20.293 9.25098 20.0469 9.01367 20.0469 8.64453ZM11.46 23.0674C12.3125 23.0674 12.998 22.3818 12.998 21.5293C12.998 20.6768 12.3125 19.9912 11.46 19.9912C10.6074 19.9912 9.92188 20.6768 9.92188 21.5293C9.92188 22.3818 10.6074 23.0674 11.46 23.0674ZM19.5811 23.0674C20.4336 23.0674 21.1104 22.3818 21.1104 21.5293C21.1104 20.6768 20.4336 19.9912 19.5811 19.9912C18.7285 19.9912 18.0342 20.6768 18.0342 21.5293C18.0342 22.3818 18.7285 23.0674 19.5811 23.0674Z"/>
                    </svg>
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
                    <th class="text-right">Harga Jual</th>
                    <th class="text-center">Jumlah (Pcs)</th>
                    <th class="text-center">Pengajuan Diskon</th>
                    <th class="text-center">Hapus</th>
                </tr>
            </thead>
            <tbody>
                {#if carts.length === 0}
                    <tr>
                        <td colspan="6" class="text-center">Keranjang Kosong</td>
                    </tr>
                {:else}
                    {#each carts as carts, index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{carts.NAMA}</td>
                            <td class="whitespace-nowrap text-right">
                                {#if carts.HARGA_JUAL > 0}
                                    {rupiahFormatter.format(carts.HARGA_JUAL)}
                                {:else}
                                    <span class="text-base-content/50">Belum ada harga</span>
                                {/if}
                            </td>
                            <td class="text-center">
                                <input type="number" min="1" class="input input-bordered input-sm w-24 text-center" placeholder="Qty" bind:value={carts.QUANTITY} />
                            </td>
                            <td class="text-center">
                                <input type="text" maxlength="100" class="input input-bordered input-sm w-40" placeholder="mis. 5% / 5000" bind:value={carts.DISKON} />
                            </td>
                            <td class="text-center">
                                <button type="button" onclick={() => removeItem(index)} class="btn btn-ghost btn-square btn-sm text-error" aria-label="Hapus item">
                                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                                        <path d="M12.6673 7.33301V13.5997C12.6673 13.8206 12.4883 13.9997 12.2673 13.9997H3.73398C3.51307 13.9997 3.33398 13.8206 3.33398 13.5997V7.33301"/>
                                        <path d="M6.66602 11.333V7.33301"/>
                                        <path d="M9.33398 11.333V7.33301"/>
                                        <path d="M14 4.66667H10.6667M10.6667 4.66667V2.4C10.6667 2.17909 10.4876 2 10.2667 2H5.73333C5.51242 2 5.33333 2.17909 5.33333 2.4V4.66667M10.6667 4.66667H5.33333M2 4.66667H5.33333"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

{/snippet}
