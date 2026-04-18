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

    function switchCatalogue() {
        isCatalogue = !isCatalogue;
        if(cartPass) cartPass = false;
    }

    function searchItem() {
        if (searchBar === '') {
            katalog = katalogDefault;
        } else {
            katalog = katalogDefault.filter((item) => {
                return item.NAMA_PRODUK.toLowerCase().includes(searchBar.toLowerCase());
            });
        }
    }

    async function openImage(index: number) {
        imagePath = `https://esdelfron.deabakery.co.id/public/UD84/Images/${katalog[index].GAMBAR}`;
        isImage = true;
    }

    function closeImage() {
        isImage = false
        imagePath = '';
        searchBar = '';
        searchItem();
    }

    function addToCarts() {
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
    }

    function removeItem(id: number) {
        carts.splice(id, 1);
        carts = carts;
    }

    function removeAll() {
        useForms = {
            nama: '',
            whatsapp: '',
            sales: '',
            kode: '',
            notes: ''
        };
        carts = [];
    }

    async function passwordSales(e: Event) {
        e.preventDefault();
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

    async function completeTransaction() {
        toast('Konfirmasi Pesanan', {
            description: 'Apakah Anda yakin ingin mengajukan pesanan ini?',
            action: {
                label: 'Ya, Pesan',
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

    async function saveMember() {
        toast('Konfirmasi Member', {
            description: 'Buat member baru dengan data ini?',
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

<div class="min-vh-100 bg-base-300 pb-20">
    <div class="max-w-md mx-auto px-4 pt-8">
        <div class="card bg-base-100 shadow-xl overflow-hidden rounded-3xl ring-1 ring-white/5">
            {#if isImage && imagePath}
              <div class="relative group">
                <img src={imagePath} class="w-full h-auto max-h-[500px] object-cover" alt="Produk"/>
                <button type="button" class="btn btn-circle btn-sm btn-glass absolute right-4 top-4 shadow-lg text-white" onclick={closeImage}>✕</button>
              </div>
            {/if}

            <div class="card-body p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                      <h3 class="text-2xl font-bold text-white tracking-tight">UD84 Catalogue</h3>
                      <p class="text-xs text-primary font-bold uppercase tracking-widest mt-1 opacity-60">
                        {isAdministrator ? 'ADMIN MODE' : (isCatalogue ? 'PREVIEW MODE' : 'ORDER MODE')}
                      </p>
                    </div>
                    
                    {#if !isImage}
                      <div class="flex gap-2">
                          {#if isAdministrator}
                              <button type="button" onclick={() => isHistory = !isHistory} class="btn btn-square btn-ghost btn-sm">
                                  <img src="/icons/Quiz.svg" class="h-5 w-5 brightness-0 invert" alt="History"/>
                              </button>
                          {/if}
                          <button type="button" onclick={switchCatalogue} class="btn btn-primary btn-sm rounded-xl px-4 font-bold shadow-lg">
                            {isCatalogue ? 'Pesan Online' : 'Lihat Katalog'}
                          </button>
                      </div>
                    {/if}
                </div>

                <div class="divider opacity-5 my-0 mb-6"></div>
                
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
                            <form class="space-y-4" onsubmit={passwordSales}>
                                <div class="form-control">
                                    <label for="pass" class="label">
                                      <span class="label-text font-bold text-base-content/60">Akses Terbatas</span>
                                    </label>
                                    <div class="flex gap-2">
                                        <input type="password" bind:value={salesPassword} class="input input-bordered flex-grow bg-base-200/50 rounded-2xl" placeholder="Password Sales" required/>
                                        <button type="submit" class="btn btn-primary rounded-2xl w-24">Buka</button>
                                    </div>
                                    <label class="label mt-1">
                                      <span class="label-text-alt opacity-30 italic">Masukkan password sales untuk memesan.</span>
                                    </label>
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
    {#if !isImage}
        <div class="relative mb-6">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          <input type="text" bind:value={searchBar} onkeyup={searchItem} class="input input-bordered w-full pl-10 bg-base-200/50 rounded-2xl focus:bg-base-200 transition-all border-white/5" placeholder="Cari Produk..." />
        </div>
        
        <div class="space-y-4">
            {#each katalog as item, index }
                <div class="group bg-base-200/40 p-5 rounded-2xl border border-white/5 hover:bg-base-200/80 transition-all hover:shadow-lg">
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex-grow">
                            <h4 class="font-bold text-white text-lg leading-tight mb-1">{item.NAMA_PRODUK}</h4>
                            <p class="text-sm opacity-50 line-clamp-2 leading-relaxed">{item.KETERANGAN}</p>
                        </div>
                        <button type="button" onclick={() => openImage(index)} class="btn btn-primary btn-sm btn-square rounded-xl shrink-0 shadow-md">
                            <img src="/icons/Share.svg" class="h-4 w-4 brightness-0 invert" alt="View" />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/snippet}

{#snippet useCarts()}
    <div class="space-y-6">
        <div class="space-y-4">
            <div class="form-control">
                <label class="label py-1"><span class="label-text font-bold opacity-50 text-[10px] uppercase tracking-widest">Informasi Pelanggan</span></label>
                <div class="grid grid-cols-1 gap-3">
                    <input type="text" bind:value={useForms.nama} class="input input-bordered bg-base-200/50 rounded-2xl" placeholder="Nama Anda" required/>
                    <input type="text" bind:value={useForms.whatsapp} class="input input-bordered bg-base-200/50 rounded-2xl" placeholder="Nomor WhatsApp" required/>
                </div>
            </div>

            <div class="form-control">
                <label class="label py-1"><span class="label-text font-bold opacity-50 text-[10px] uppercase tracking-widest">Koneksi Sales</span></label>
                <select bind:value={useForms.sales} class="select select-bordered bg-base-200/50 rounded-2xl w-full">
                    <option value="" selected>Tanpa Sales (Default)</option>
                    {#each sales as s }
                        <option value={s.ID}>{s.NAMA}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control">
                <label class="label py-1"><span class="label-text font-bold opacity-50 text-[10px] uppercase tracking-widest">Catatan / Alamat</span></label>
                <textarea class="textarea textarea-bordered bg-base-200/50 rounded-2xl leading-relaxed" rows="3" placeholder="Detail pengiriman atau instruksi khusus..." bind:value={useForms.notes} required></textarea>
            </div>

            <div class="form-control">
                <label class="label py-1"><span class="label-text font-bold opacity-50 text-[10px] uppercase tracking-widest">Tambah Pesanan</span></label>
                <div class="flex gap-2">
                    <select bind:value={useForms.kode} class="select select-bordered bg-base-200/50 rounded-2xl flex-grow overflow-hidden text-ellipsis">
                        <option value="" selected disabled>Pilih Produk</option>
                        {#each katalogDefault as item }
                            <option value={item.ID}>{item.NAMA_PRODUK}</option>
                        {/each}
                    </select>
                    <button type="button" onclick={addToCarts} class="btn btn-primary rounded-2xl px-6 shadow-lg">
                        <img src="/icons/Cart-Plus.svg" class="h-6 w-6 brightness-0 invert" alt="Add" />
                    </button>
                </div>
            </div>
        </div>

        <div class="divider opacity-5"></div>

        <div class="space-y-4">
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Keranjang ({carts.length})
            </h3>

            <div class="space-y-3">
                {#if carts.length === 0}
                    <div class="p-8 text-center bg-base-200/30 rounded-3xl border border-dashed border-white/10 opacity-30 italic text-sm">
                        Belum ada item ditambahkan.
                    </div>
                {:else}
                    {#each carts as item, index }
                        <div class="flex items-center gap-4 bg-base-200/50 p-4 rounded-2xl ring-1 ring-white/5 shadow-inner">
                            <div class="flex-grow">
                                <h4 class="font-bold text-white text-sm line-clamp-1">{item.NAMA}</h4>
                                <div class="flex items-center gap-2 mt-1">
                                    <input type="number" min="1" class="input input-ghost input-xs w-16 bg-base-100/50 text-center font-bold text-primary px-0 rounded-lg" bind:value={item.QUANTITY} />
                                    <span class="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Pcs</span>
                                </div>
                            </div>
                            <button type="button" onclick={() => removeItem(index)} class="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error transition-all">
                                <img src="/icons/Delete.svg" class="h-4 w-4" alt="Delete" />
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8">
            <button type="button" onclick={saveMember} class="btn btn-neutral rounded-2xl font-bold border-white/5">Simpan Member</button>
            <button type="button" onclick={completeTransaction} class="btn btn-primary rounded-2xl font-bold shadow-lg shadow-primary/20">Konfirmasi</button>
        </div>
    </div>
{/snippet}
