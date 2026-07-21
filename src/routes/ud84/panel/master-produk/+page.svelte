<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { currencySanitizer, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Drawer from "../../../../components/shared/Drawer.svelte";
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

    let newData: Master[] = $state([]);
    let staticData: Master[] = $state([]);

    let useSatuan: string[] = $state([]);

    let editIndex: any = $state();
    let currentID: number | null = $state(null);

    let namaItem: string = $state('');
    let stokItem: number = $state(0);
    let hargaPabrik: string = $state('');
    let hargaJual: string = $state('');
    let jumlahPerItem: number = $state(0);
    let hargaPerItem: string = $state('');
    let tipeItem: string = $state('');
    let statusJual: string = $state('');
    let namaDistributor: string = $state('');
    let deskripsiProduk: string = $state('');

    // HTML Elements
    let searchBar: HTMLInputElement;
    let searchBarValue: string = $state('');

    let currentSidebar: "New" | "Edit" = $state("New");
    let isDrawer: boolean = $state(false);

    onMount(async () => {
        newData = await useFetch('UD84/Master-Produk/Retrieve');
        staticData = newData;
        useSatuan = await useFetch("UD84/Master-Produk/Satuan")
    });

    function doSearch(searchString:string){
        const filterData = newData.filter( (objectKey: { NAMA: string; }) => objectKey.NAMA.toLowerCase().includes(searchString.toLocaleLowerCase()) );
        newData = filterData;

        if(searchString == ''){
            newData = staticData;
        }
    }

    function startEdit(ID: number){
        editIndex = newData[ID];
        currentID = editIndex.ID;

        namaItem         = editIndex.NAMA;
        stokItem         = editIndex.STOK;
        hargaPabrik      = editIndex.HARGA_PABRIK;
        hargaJual        = editIndex.HARGA_JUAL;
        tipeItem         = editIndex.TIPE;
        statusJual       = editIndex.STATUS_JUAL;
        namaDistributor  = editIndex.DISTRIBUTOR;
        deskripsiProduk  = editIndex.DESKRIPSI;
        jumlahPerItem    = editIndex.JUMLAH_PER_ITEM;
        hargaPerItem     = editIndex.HARGA_PER_ITEM;

        openDrawer("Edit");
    }

    async function completeTransaction(type: "Create" | "Edit"): Promise<void> {
        const url = type === "Edit" 
            ? "UD84/Master-Produk/Update" 
            : "UD84/Master-Produk/Insert";

        const jsonObjects = {
            ...(type === "Edit" && { ID: currentID }),
            NAMA: namaItem,
            STOK: stokItem,
            TIPE: tipeItem,
            STATUS_JUAL: statusJual,
            DISTRIBUTOR: namaDistributor,
            HARGA_PABRIK: currencySanitizer(hargaPabrik),
            HARGA_JUAL: currencySanitizer(hargaJual),
            JUMLAH_PER_ITEM: jumlahPerItem,
            HARGA_PER_ITEM: currencySanitizer(hargaPerItem),
            DESKRIPSI: deskripsiProduk
        };

        const { status, message } = await db(jsonObjects, url);

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = await useFetch("UD84/Master-Produk/Retrieve");
        removeAll();
    }

    async function doDelete(id: number): Promise <void>{
        toast('Apakah anda yakin untuk menghapus?', {
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    if (id === null) {
                        toast.error("Tidak ada data yang dipilih.");
                        return;
                    }

                    const { status, message } = await db({
                        ID : newData[id]['ID']
                    }, 'UD84/Master-Produk/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    newData.splice(id, 1);
                    removeAll();
                }
            },
        });
    }

    async function imageUpload(ID: number) {
        const fileInput = document.getElementById('imageUpload_' + ID) as HTMLInputElement | null;

        if (!fileInput) {
            toast.error('Input gambar tidak ditemukan.');
            return;
        }

        if (!fileInput.files || fileInput.files.length === 0) {
            toast.error('Pilih gambar terlebih dahulu.');
            return;
        }

        const forms = new FormData();
        forms.append('GAMBAR', fileInput.files[0]);
        forms.append('ID', ID.toString());

        const { status, message } = await db(forms, 'UD84/Master-Produk/Upload-Gambar');

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
    }

    function removeAll():void {
        namaItem         = '';
        stokItem         = 0
        hargaPabrik      = '';
        hargaJual        = '';
        tipeItem         = '';
        statusJual       = '';
        namaDistributor  = '';
        deskripsiProduk  = '';
        currentID        = null;
        isDrawer = false;
    }

    function runKeyPress(eventPressed:any): void{
        let key = eventPressed.key;
        if(key == 'Escape'){
            searchBarValue = '';
            searchBar.focus();
        }
    }

    function openDrawer(type: "New" | "Edit") {
        isDrawer = true;
        currentSidebar = type;
    }
</script>
<Ud84Navigation/>
<!-- Table Content -->
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Master Produk: All Item</h3>
            <button type="button" class="btn btn-sm btn-primary" onclick={() => openDrawer("New")}>Item Baru</button>
        </div>

        <div class="mb-5">
            <label for="searchItem" class="label-text mb-1 block font-medium">Cari Item Master Produk</label>
            <input type="text" bind:this={searchBar} bind:value={searchBarValue} onkeyup={() => doSearch(searchBarValue)} class="input input-bordered w-full max-w-sm" placeholder="Cari Item..." />
        </div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama Item</th>
                        <th>Stok</th>
                        <th class="hidden lg:table-cell">Tipe Item</th>
                        <th class="hidden lg:table-cell">Status Jual</th>
                        <th class="hidden lg:table-cell">Nama Distributor</th>
                        <th class="hidden md:table-cell">Harga Produk (Dari Pabrik)</th>
                        <th class="hidden md:table-cell">Harga Jual Produk (Untuk Toko)</th>
                        <th>Action</th>
                        <th class="hidden sm:table-cell">Upload Gambar</th>
                    </tr>
                </thead>
                <tbody>
                    {#each newData as data, index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td class="text-left font-medium">{ data.NAMA }</td>
                            <td>{ data.STOK }</td>
                            <td class="hidden lg:table-cell">{ data.TIPE }</td>
                            <td class="hidden lg:table-cell">{ data.STATUS_JUAL }</td>
                            <td class="hidden lg:table-cell">{ data.DISTRIBUTOR }</td>
                            <td class="hidden md:table-cell">{ rupiahFormatter.format(data.HARGA_PABRIK) }</td>
                            <td class="hidden md:table-cell">{ rupiahFormatter.format(data.HARGA_JUAL) }</td>
                            <td>
                                <div class="flex items-center justify-center gap-1">
                                    <button type="button" onclick={() => startEdit(index)} class="btn btn-ghost btn-square btn-sm text-primary">
                                        <img src="/icons/Edit.svg" alt="Edit Button" height="20" />
                                    </button>
                                    <button type="button" onclick={() => doDelete(index)} class="btn btn-ghost btn-square btn-sm text-error">
                                        <img src="/icons/Delete.svg" alt="Delete Button" height="20" />
                                    </button>
                                </div>
                            </td>
                            <td class="hidden sm:table-cell">
                                <input type="file" id="imageUpload_{data.ID}" onchange={() => imageUpload(data.ID)} class="file-input file-input-bordered file-input-sm w-full min-w-[12rem]" accept="image/png, image/jpeg"/>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
</div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="w-full p-5">
        {#if currentSidebar === "New"}
            {@render addNew()}
        {:else if currentSidebar === "Edit"}
            {@render editForm()}
        {/if}
    </div>
</Drawer>

{#snippet addNew()}
    <h3 class="text-lg font-bold">Master Produk: Tambah Baru</h3>
    <div class="divider my-3"></div>
    <form onsubmit={() => completeTransaction("Create")}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="namaProduk" class="label-text mb-1 block font-medium">Nama Item</label>
                <input type="text" bind:value={namaItem} class="input input-bordered w-full" placeholder="Nama Item"  required/>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium">Stok Item</label>
                <input type="number" bind:value={stokItem} class="input input-bordered w-full" placeholder="Jumlah Stok"  required/>
            </div>
            <div>
                <label for="namaDistributor" class="label-text mb-1 block font-medium">Nama Distributor</label>
                <input type="text" bind:value={namaDistributor} class="input input-bordered w-full" placeholder="Cth: PT. Sumber Agung Bader Mas"  required/>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium">Harga Produk (Dari Pabrik)</label>
                <Rupiah id="hargaPabrik" bind:value={hargaPabrik} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="namaProduk" class="label-text mb-1 block font-medium">Pilih Tipe Item</label>
                <select bind:value={tipeItem} class="select select-bordered w-full" required>
                    <option value="" selected disabled>Pilih salah satu</option>
                    {#each useSatuan as satuan }
                        <option value={satuan}>{satuan}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium text-error">Harga Jual Produk (Untuk Satuan)</label>
                <Rupiah id="hargaJual" bind:value={hargaJual} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="perPieces" class="label-text mb-1 block font-medium">Jumlah Setiap Satuan</label>
                <input type="number" bind:value={jumlahPerItem} class="input input-bordered w-full" placeholder="Misal: 1 Box isi 12 Pcs" required/>
            </div>
            <div>
                <label for="hargaPerPieces" class="label-text mb-1 block font-medium text-info">Harga Per Pieces(Per Item)</label>
                <Rupiah id="hargaPerPieces" bind:value={hargaPerItem} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="statusItem" class="label-text mb-1 block font-medium">Status Jual</label>
                <select bind:value={statusJual} class="select select-bordered w-full" required>
                    <option value="" selected>Pilih salah satu</option>
                    <option value="Katalog dan Penjualan">Aktif, Muncul di Katalog & Penjualan</option>
                    <option value="Penjualan">Aktif, Muncul di Penjualan saja</option>
                    <option value="Tidak Aktif">Tidak aktif di Katalog & Penjualan</option>
                </select>
            </div>
            <div>
                <label for="deskripsiProduk" class="label-text mb-1 block font-medium">Deskripsi Produk</label>
                <textarea class="textarea textarea-bordered w-full" bind:value={deskripsiProduk} rows="5" placeholder="Deskripsi Produk" required></textarea>
            </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
            <button type="reset" class="btn btn-ghost" onclick={removeAll}>Tutup</button>
            <button type="submit" class="btn btn-primary">Simpan Item</button>
        </div>
    </form>
{/snippet}

{#snippet editForm()}
    <h3 class="text-lg font-bold">Master Produk: Edit Data</h3>
    <div class="divider my-3"></div>
    <form onsubmit={() => completeTransaction("Edit")}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="namaProduk" class="label-text mb-1 block font-medium">Nama Item</label>
                <input type="text" bind:value={namaItem} class="input input-bordered w-full" placeholder="Nama Item"  required/>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium">Stok Item</label>
                <input type="number" bind:value={stokItem} class="input input-bordered w-full" placeholder="Jumlah Stok"  required/>
            </div>
            <div>
                <label for="namaDistributor" class="label-text mb-1 block font-medium">Nama Distributor</label>
                <input type="text" bind:value={namaDistributor} class="input input-bordered w-full" placeholder="Cth: PT. Sumber Agung Bader Mas"  required/>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium">Harga Produk (Dari Pabrik)</label>
                <Rupiah id="hargaPabrik" bind:value={hargaPabrik} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="namaProduk" class="label-text mb-1 block font-medium">Pilih Tipe Item</label>
                <select bind:value={tipeItem} class="select select-bordered w-full" required>
                    <option value="" selected disabled>Pilih salah satu</option>
                    {#each useSatuan as satuan }
                        <option value={satuan}>{satuan}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="hargaProduk" class="label-text mb-1 block font-medium">Harga Jual Produk (Untuk Satuan)</label>
                <Rupiah id="hargaJual" bind:value={hargaJual} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="perPieces" class="label-text mb-1 block font-medium">Jumlah Setiap Satuan</label>
                <input type="number" bind:value={jumlahPerItem} class="input input-bordered w-full" placeholder="Misal: 1 Box isi 12 Pcs" required/>
            </div>
            <div>
                <label for="hargaPerPieces" class="label-text mb-1 block font-medium text-info">Harga Per Pieces(Per Item)</label>
                <Rupiah id="hargaPerPieces" bind:value={hargaPerItem} useClass="input input-bordered w-full" />
            </div>
            <div>
                <label for="statusItem" class="label-text mb-1 block font-medium">Status Jual</label>
                <select bind:value={statusJual} class="select select-bordered w-full" required>
                    <option value="" selected>Pilih salah satu</option>
                    <option value="Katalog dan Penjualan">Aktif, Muncul di Katalog & Penjualan</option>
                    <option value="Penjualan">Aktif, Muncul di Penjualan saja</option>
                    <option value="Tidak Aktif">Tidak aktif di Katalog & Penjualan</option>
                </select>
            </div>
            <div class="md:col-span-2">
                <label for="deskripsiProduk" class="label-text mb-1 block font-medium">Deskripsi Produk</label>
                <textarea class="textarea textarea-bordered w-full" bind:value={deskripsiProduk} rows="5" placeholder="Deskripsi Produk" required></textarea>
            </div>
        </div>

        <button type="submit" class="btn btn-primary w-full my-2">Simpan Item</button>
    </form>
{/snippet}

<svelte:window onkeydown={runKeyPress} />
