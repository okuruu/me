<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Drawer from "../../../../components/shared/Drawer.svelte";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import RiwayatPanel from "../../../../components/shared/RiwayatPanel.svelte";
    import { operatorSaatIni } from "../../../../library/utils/useAuth";
    import type { Riwayat } from "../../../../library/types/riwayat";

    interface Pesanan {
        NAMA: string;
        WHATSAPP: string;
        SALES: string;
        SALES_ID: number | null;
        CATATAN: string;
        KODE: string;
        VALID: string | null;
        ADA_DISKON: boolean;
        CREATED_AT: string;
    }

    interface Carts {
        KODE_ITEM: number;
        ADA: boolean;
        NAMA: string;
        JUMLAH: number;
        STOK: number;
        SATUAN: string;
        HARGA_PER_ITEM: number;
        HARGA_JUAL: number;
        DISTRIBUTOR: string;
        DISKON: string | null;
    }

    interface Staff {
        ID: number;
        NAMA: string;
        STATUS?: "Aktif" | "Nonaktif";
    }

    interface Produk {
        ID: number;
        NAMA: string;
        STOK: number;
        TIPE: string;
        HARGA_PER_ITEM: number;
        HARGA_JUAL: number;
        DISTRIBUTOR: string;
    }

    let newData: Pesanan[] = $state([]);
    let carts: Carts[] = $state([]);
    let riwayat: Riwayat[] = $state([]);

    // The order the drawer is currently showing. Null until one is opened.
    let terpilih: Pesanan | null = $state(null);

    let isDrawer: boolean = $state(false);
    let isUbah: boolean = $state(false);
    let sedangMenyimpan: boolean = $state(false);

    let draft = $state({ NAMA: '', WHATSAPP: '', SALES: '' as string, CATATAN: '' });
    let alasanUbah: string = $state('');

    let daftarSales: Staff[] = $state([]);
    let daftarProduk: Produk[] = $state([]);
    let produkDipilih: string = $state('');

    // Snapshot of carts taken when edit mode starts, so Batal can restore it
    // locally -- instantly, and without a refetch that could itself fail.
    let cartsSebelumUbah: Carts[] = [];

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    // Deactivated salespeople stay pickable only if this order already names
    // one, so an edit never silently reassigns the order to somebody else.
    let salesPilihan: Staff[] = $derived(
        daftarSales.filter((orang) => orang.STATUS !== "Nonaktif" || orang.ID === terpilih?.SALES_ID)
    );

    // A Nonaktif salesperson still has a row, so salesPilihan above keeps
    // them. A DELETED salesperson has no row at all, so they are missing
    // from daftarSales entirely -- the select would render with nothing
    // selected even though the order still names them. This flags that case
    // so a fallback option can be rendered.
    let salesHilang: boolean = $derived.by(() => {
        const salesId = terpilih?.SALES_ID;
        return salesId != null && !daftarSales.some((orang) => orang.ID === salesId);
    });

    async function viewItem(pesanan: Pesanan): Promise <void> {
        const { status, message, data } = await db({
            ID: pesanan.KODE
        }, 'UD84/Pesanan/Retrieve-Items');

        if (status === "error") {
            toast.error(message);
            return;
        }

        terpilih = pesanan;
        carts = data ?? [];
        isUbah = false;
        alasanUbah = '';
        produkDipilih = '';
        await getRiwayat(pesanan.KODE);
        isDrawer = true;
    }

    async function getRiwayat(kode: string): Promise <void> {
        const { status, data } = await db({ KODE: kode }, 'UD84/Pesanan/Riwayat');
        riwayat = status === "error" ? [] : (data ?? []);
    }

    async function mulaiUbah(): Promise <void> {
        if (!terpilih) return;

        draft = {
            NAMA: terpilih.NAMA ?? '',
            WHATSAPP: terpilih.WHATSAPP ?? '',
            SALES: terpilih.SALES_ID === null ? '' : String(terpilih.SALES_ID),
            CATATAN: terpilih.CATATAN ?? '',
        };

        if (daftarSales.length === 0) {
            daftarSales = await useFetch('UD84/Stocks/Staff') ?? [];
        }

        if (daftarProduk.length === 0) {
            daftarProduk = await useFetch('UD84/Master-Produk/Retrieve') ?? [];
        }

        cartsSebelumUbah = $state.snapshot(carts);
        isUbah = true;
    }

    function batalUbah(): void {
        carts = cartsSebelumUbah;
        isUbah = false;
        alasanUbah = '';
        produkDipilih = '';
    }

    // Picking a product already on the order adds to that line. Two lines for
    // one product is a state the backend refuses, so it must be unreachable.
    function tambahItem(): void {
        const id = Number(produkDipilih);

        if (!id) {
            toast.error("Pilih produk dulu");
            return;
        }

        const sudahAda = carts.find((item) => item.KODE_ITEM === id);

        if (sudahAda) {
            sudahAda.JUMLAH = Number(sudahAda.JUMLAH) + 1;
            produkDipilih = '';
            return;
        }

        const produk = daftarProduk.find((item) => item.ID === id);

        if (!produk) {
            toast.error("Produk tidak ditemukan");
            return;
        }

        carts = [...carts, {
            KODE_ITEM: produk.ID,
            ADA: true,
            NAMA: produk.NAMA,
            JUMLAH: 1,
            STOK: produk.STOK,
            SATUAN: produk.TIPE,
            HARGA_PER_ITEM: produk.HARGA_PER_ITEM,
            HARGA_JUAL: produk.HARGA_JUAL,
            DISTRIBUTOR: produk.DISTRIBUTOR,
            // Nobody asked for a discount on a line the admin added.
            DISKON: null,
        }];
        produkDipilih = '';
    }

    function hapusItem(index: number): void {
        carts = carts.filter((_, posisi) => posisi !== index);
    }

    async function simpanUbah(): Promise <void> {
        if (!terpilih) return;

        if (draft.NAMA.trim() === '' || draft.WHATSAPP.trim() === '') {
            toast.error("Nama dan WhatsApp pelanggan wajib diisi");
            return;
        }

        if (carts.length === 0) {
            toast.error("Pesanan harus punya minimal satu item");
            return;
        }

        // The quantity input sits outside a <form>, so its min="1" is
        // decorative: a decimal like 2.5 would silently truncate server-side,
        // and clearing the box entirely arrives as NaN -> null -> 0, refused
        // only after a round trip. Floor and check locally first so the
        // operator hears about it right away.
        for (const item of carts) {
            item.JUMLAH = Math.floor(Number(item.JUMLAH));

            if (!(item.JUMLAH >= 1)) {
                toast.error(`Jumlah '${item.NAMA}' harus berupa angka minimal 1`);
                return;
            }
        }

        sedangMenyimpan = true;

        const { status, message } = await db({
            KODE: terpilih.KODE,
            NAMA: draft.NAMA,
            WHATSAPP: draft.WHATSAPP,
            SALES: draft.SALES === '' ? null : Number(draft.SALES),
            CATATAN: draft.CATATAN,
            ITEMS: carts.map((item) => ({ KODE_ITEM: item.KODE_ITEM, JUMLAH: Number(item.JUMLAH) })),
            OPERATOR: operatorSaatIni(),
            ALASAN: alasanUbah,
        }, 'UD84/Pesanan/Update');

        sedangMenyimpan = false;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        isUbah = false;
        alasanUbah = '';
        await doPost();

        const segar = newData.find((row) => row.KODE === terpilih?.KODE);

        if (segar) {
            await viewItem(segar);
        }
    }

    async function removeItem(id: string, index: number): Promise <void> {
        toast('Apakah anda yakin untuk menghapus?', {
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: id,
                        OPERATOR: operatorSaatIni(),
                    }, 'UD84/Pesanan/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                    newData.splice(index, 1);

                    if (terpilih?.KODE === id) {
                        isDrawer = false;
                        terpilih = null;
                    }
                }
            },
        });
    }

    async function isValid(id: string, index: number): Promise <void> {
        toast('Apakah anda pesanan ini valid?', {
            action: {
                label: 'Ya, Validasi',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: id
                    }, 'UD84/Pesanan/Validate-Order');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                    newData[index].VALID = "Verified";

                    if (terpilih?.KODE === id) {
                        terpilih = { ...terpilih, VALID: "Verified" };
                        isUbah = false;
                    }
                }
            },
        });
    }

    function reverseData(): Pesanan[] {
        newData = newData.reverse();
        return newData;
    }

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            start: useInput.startDate,
            end: useInput.endDate,
        }, 'UD84/Pesanan/Retrieve');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
    }
</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Pesanan Masuk</h3>
        </div>

        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" onsubmit={doPost}>
                <div>
                    <label for="startDate" class="label-text mb-1 block font-medium">Pencarian Awal</label>
                    <DatePlaceholder bind:value={useInput.startDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Awal"/>
                </div>
                <div>
                    <label for="endDate" class="label-text mb-1 block font-medium">Pencarian Akhir</label>
                    <DatePlaceholder bind:value={useInput.endDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Akhir"/>
                </div>
                <div class="flex items-end">
                    <button type="submit" class="btn btn-square btn-primary btn-sm">
                        <img src="/icons/Search.svg" class="h-5 w-5" alt="Search Toggle" />
                    </button>
                </div>
            </form>
            <label class="flex cursor-pointer items-center gap-2 lg:pb-1">
                <input type="checkbox" class="toggle toggle-sm" onchange={reverseData}/>
                <span class="label-text font-bold">A-Z</span>
            </label>
        </div>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
                        <th class="hidden sm:table-cell">Diskon</th>
                        <th class="hidden sm:table-cell">WhatsApp</th>
                        <th class="hidden lg:table-cell">Nama Sales</th>
                        <th class="hidden md:table-cell">Dipesan Pada</th>
                        <th class="hidden lg:table-cell">Keterangan</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#if newData.length === 0}
                        <tr>
                            <td colspan="8" class="text-center text-base-content/60">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each newData as data, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td class="text-left font-medium">{data.NAMA}</td>
                                <td class="hidden sm:table-cell">
                                    {#if data.ADA_DISKON}
                                        <span class="badge badge-warning">Ada pengajuan</span>
                                    {:else}
                                        <span class="text-base-content/40">-</span>
                                    {/if}
                                </td>
                                <td class="hidden sm:table-cell">{data.WHATSAPP}</td>
                                <td class="hidden lg:table-cell">{data.SALES}</td>
                                <td class="hidden md:table-cell">{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                                <td class="hidden lg:table-cell">{data.CATATAN}</td>
                                <td>
                                    <div class="flex items-center justify-center gap-1">
                                        {#if data.VALID === null}
                                            <button type="button" onclick={() => removeItem(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-error">
                                                <img src="/icons/Delete.svg" alt="Hapus Pesanan" height="16"/>
                                            </button>
                                            <button type="button" onclick={() => isValid(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-primary">
                                                <img src="/icons/Add.svg" alt="Validasi Pesanan" height="20"/>
                                            </button>
                                        {:else}
                                            <button type="button" class="btn btn-sm btn-success">Verified</button>
                                        {/if}
                                        <button type="button" onclick={() => viewItem(data)} class="btn btn-ghost btn-square btn-sm text-info">
                                            <img src="/icons/Share.svg" alt="Lihat Item" height="16"/>
                                        </button>
                                    </div>
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

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = false}>
    <div class="w-full p-5">
        <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-lg font-bold">Detail Pesanan</h3>
            {#if terpilih?.VALID}
                <span class="badge badge-success">Verified</span>
            {/if}
        </div>

        <div class="divider my-3"></div>

        {#if isUbah}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label for="ubahNama" class="label-text mb-1 block font-medium">Nama Pelanggan</label>
                    <input id="ubahNama" type="text" bind:value={draft.NAMA} class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan"/>
                </div>
                <div>
                    <label for="ubahWhatsapp" class="label-text mb-1 block font-medium">WhatsApp</label>
                    <input id="ubahWhatsapp" type="text" bind:value={draft.WHATSAPP} class="input input-bordered input-sm w-full" placeholder="08xxxxxxxxxx"/>
                </div>
                <div>
                    <label for="ubahSales" class="label-text mb-1 block font-medium">Nama Sales</label>
                    <select id="ubahSales" bind:value={draft.SALES} class="select select-bordered select-sm w-full">
                        <option value="">Tanpa Sales</option>
                        {#each salesPilihan as orang}
                            <option value={String(orang.ID)}>{orang.NAMA}{orang.STATUS === "Nonaktif" ? ' (nonaktif)' : ''}</option>
                        {/each}
                        {#if salesHilang}
                            <option value={String(terpilih?.SALES_ID)}>Sales #{terpilih?.SALES_ID} (tidak ditemukan)</option>
                        {/if}
                    </select>
                </div>
                <div>
                    <label for="ubahCatatan" class="label-text mb-1 block font-medium">Keterangan</label>
                    <input id="ubahCatatan" type="text" bind:value={draft.CATATAN} class="input input-bordered input-sm w-full" placeholder="Keterangan"/>
                </div>
            </div>
        {:else if terpilih}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <span class="label-text mb-1 block font-medium">Nama Pelanggan</span>
                    <p class="text-sm">{terpilih.NAMA}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">WhatsApp</span>
                    <p class="text-sm">{terpilih.WHATSAPP}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">Nama Sales</span>
                    <p class="text-sm">{terpilih.SALES}</p>
                </div>
                <div>
                    <span class="label-text mb-1 block font-medium">Keterangan</span>
                    <p class="text-sm">{terpilih.CATATAN}</p>
                </div>
            </div>
        {/if}

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
                        <th class="text-center">Jumlah Pesanan (Pcs)</th>
                        <th class="text-center">Pengajuan Diskon</th>
                        <th class="text-center">Stok</th>
                        <th>Satuan</th>
                        <th class="text-center">Harga Jual</th>
                        <th class="text-center">{isUbah ? 'Aksi' : 'Harga Per Pcs'}</th>
                    </tr>
                </thead>
                <tbody>
                    {#if carts.length === 0}
                        <tr>
                            <td colspan="8" class="text-center text-base-content/60">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each carts as item, index }
                            <tr class={item.ADA === false ? 'text-error' : ''}>
                                <td>{index + 1}</td>
                                <td class="text-left">
                                    {capitalizeEachWord(item.NAMA)} <br/>
                                    <span class="font-extrabold text-warning">[{item.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">
                                    {#if isUbah && item.ADA !== false}
                                        <input type="number" min="1" bind:value={item.JUMLAH} class="input input-bordered input-sm w-20 text-center"/>
                                    {:else}
                                        {item.JUMLAH}
                                    {/if}
                                </td>
                                <td class="text-center">
                                    {#if item.DISKON}
                                        <span class="badge badge-warning">{item.DISKON}</span>
                                    {:else}
                                        <span class="text-base-content/40">-</span>
                                    {/if}
                                </td>
                                <td class="text-center">
                                    {#if item.STOK < 30}
                                        <span class="font-extrabold text-error">{ item.STOK }</span>
                                    {:else}
                                        { item.STOK }
                                    {/if}
                                </td>
                                <td>{item.SATUAN}</td>
                                <td class="text-center">{rupiahFormatter.format(item.HARGA_JUAL)}</td>
                                <td class="text-center">
                                    {#if isUbah}
                                        <button type="button" onclick={() => hapusItem(index)} class="btn btn-ghost btn-sm text-error">Hapus</button>
                                    {:else}
                                        {rupiahFormatter.format(item.HARGA_PER_ITEM)}
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

        {#if isUbah}
            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div class="flex-1">
                    <label for="tambahProduk" class="label-text mb-1 block font-medium">Tambah Produk</label>
                    <select id="tambahProduk" bind:value={produkDipilih} class="select select-bordered select-sm w-full">
                        <option value="">Pilih produk</option>
                        {#each daftarProduk as produk}
                            <option value={String(produk.ID)}>{produk.NAMA}</option>
                        {/each}
                    </select>
                </div>
                <button type="button" onclick={tambahItem} class="btn btn-sm btn-primary">Tambah Item</button>
            </div>

            <div class="mt-3">
                <label for="alasanUbah" class="label-text mb-1 block font-medium">Alasan (opsional)</label>
                <input id="alasanUbah" type="text" bind:value={alasanUbah} class="input input-bordered input-sm w-full" placeholder="Contoh: Pelanggan menambah pesanan lewat WhatsApp"/>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
                <button type="button" onclick={simpanUbah} class="btn btn-sm btn-primary" disabled={sedangMenyimpan}>
                    {sedangMenyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onclick={batalUbah} class="btn btn-sm btn-ghost" disabled={sedangMenyimpan}>Batal</button>
            </div>
        {:else if terpilih && terpilih.VALID === null}
            <div class="mt-4">
                <button type="button" onclick={mulaiUbah} class="btn btn-sm btn-primary">Ubah Pesanan</button>
            </div>
        {:else if terpilih}
            <p class="mt-4 text-sm text-base-content/70">
                Pesanan ini sudah diverifikasi, jadi tidak bisa diubah atau dihapus lagi.
                Angkanya sudah masuk ke laporan kinerja sales.
            </p>
        {/if}

        <RiwayatPanel entries={riwayat} />
    </div>
</Drawer>
