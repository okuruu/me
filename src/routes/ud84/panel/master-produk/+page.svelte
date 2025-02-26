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
        console.log({
            data: newData,
            a: "asd"
        })
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

        const { status, message } = await db(forms, 'Master-Produk/Upload-Gambar');

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
<div class="card shadow-sm my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Master Produk: All Item</h3>
        <div class="card-toolbar">
            <div class="me-2">
                <button type="button" class="btn btn-sm btn-primary" onclick={() => openDrawer("New")}>Item Baru</button>
            </div>
        </div>
    </div>
    <div class="card-body">

        <div class="form-group mb-5">
            <label for="searchItem" class="form-label fw-bolder">Cari Item Master Produk</label>
            <input type="text" bind:this={searchBar} bind:value={searchBarValue} onkeyup={() => doSearch(searchBarValue)} class="form-control w-25" placeholder="Cari Item..." />
        </div>
        
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
                <thead>
                    <tr class="fw-bold">
                        <th>#</th>
                        <th>Nama Item</th>
                        <th>Stok</th>
                        <th>Tipe Item</th>
                        <th>Status Jual</th>
                        <th>Nama Distributor</th>
                        <th>Harga Produk (Dari Pabrik)</th>
                        <th>Harga Jual Produk (Untuk Toko)</th>
                        <th>Action</th>
                        <th>Upload Gambar</th>
                    </tr>
                </thead>
                <tbody>
                    {#each newData as data, index }
                        <tr>
                            <td>{ index + 1 }</td>
                            <td>{ data.NAMA }</td>
                            <td>{ data.STOK }</td>
                            <td>{ data.TIPE }</td>
                            <td>{ data.STATUS_JUAL }</td>
                            <td>{ data.DISTRIBUTOR }</td>
                            <td>{ rupiahFormatter.format(data.HARGA_PABRIK) }</td>
                            <td>{ rupiahFormatter.format(data.HARGA_JUAL) }</td>
                            <td>
                                <div class="me-2">
                                    <button type="button" onclick={() => startEdit(index)} class="btn btn-sm btn-icon btn-warning my-2">
                                        <img src="/icons/elements/Edit.svg" alt="Edit Button" height="20" />
                                    </button>
                                    <button type="button" onclick={() => doDelete(index)} class="btn btn-sm btn-icon btn-light my-2" data-bs-toggle="modal" data-bs-target="#promptDelete">
                                        <img src="/icons/elements/Delete.svg" alt="Delete Button" height="20" />
                                    </button>
                                </div>
                            </td>
                            <td>
                                <input type="file" id="imageUpload_{data.ID}" onchange={() => imageUpload(data.ID)} class="form-control form-control-sm" accept="image/png, image/jpeg"/>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        {#if currentSidebar === "New"}
            {@render addNew()}
        {:else if currentSidebar === "Edit"}
            {@render editForm()}
        {/if}
    </div>
</Drawer>

{#snippet addNew()}
    <h3 class="fw-bolder">Master Produk: Tambah Baru</h3>
    <div class="separator my-3"></div>
    <form onsubmit={() => completeTransaction("Create")}>
        <div class="row mb-4">
            <div class="col">
                <label for="namaProduk" class="form-label fw-bold">Nama Item</label>
                <input type="text" bind:value={namaItem} class="form-control" placeholder="Nama Item"  required/>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold">Stok Item</label>
                <input type="number" bind:value={stokItem} class="form-control" placeholder="Jumlah Stok"  required/>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col">
                <label for="namaDistributor" class="form-label fw-bold">Nama Distributor</label>
                <input type="text" bind:value={namaDistributor} class="form-control" placeholder="Cth: PT. Sumber Agung Bader Mas"  required/>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold">Harga Produk (Dari Pabrik)</label>
                <Rupiah id="hargaPabrik" bind:value={hargaPabrik} useClass="form-control" />
            </div>
        </div>

        <div class="row mb-4">
            <div class="col">
                <label for="namaProduk" class="form-label fw-bold">Pilih Tipe Item</label>
                <select bind:value={tipeItem} class="form-select" required>
                    <option value="" selected disabled>Pilih salah satu</option>
                    {#each useSatuan as satuan }
                        <option value={satuan}>{satuan}</option>
                    {/each}
                </select>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold text-danger">Harga Jual Produk (Untuk Satuan)</label>
                <Rupiah id="hargaJual" bind:value={hargaJual} useClass="form-control" />
            </div>
        </div>

        <div class="row mb-4">
            <div class="col">
                <label for="perPieces" class="form-label fw-bold">Jumlah Setiap Satuan</label>
                <input type="number" bind:value={jumlahPerItem} class="form-control" placeholder="Misal: 1 Box isi 12 Pcs" required/>
            </div>
            <div class="col">
                <label for="hargaPerPieces" class="form-label fw-bold text-info">Harga Per Pieces(Per Item)</label>
                <Rupiah id="hargaPerPieces" bind:value={hargaPerItem} useClass="form-control" />
            </div>
        </div>

        <div class="row">
            <div class="col">
                <label for="statusItem" class="form-label fw-bold">Status Jual</label>
                <select bind:value={statusJual} class="form-select" required>
                    <option value="" selected>Pilih salah satu</option>
                    <option value="Katalog dan Penjualan">Aktif, Muncul di Katalog & Penjualan</option>
                    <option value="Penjualan">Aktif, Muncul di Penjualan saja</option>
                    <option value="Tidak Aktif">Tidak aktif di Katalog & Penjualan</option>
                </select>
            </div>
            <div class="col">
                <label for="deskripsiProduk" class="form-label fw-bold">Deskripsi Produk</label>
                <textarea class="form-control" bind:value={deskripsiProduk} rows="5" placeholder="Deskripsi Produk" required></textarea>
            </div>
        </div>

        <div class="form-group">
            <button type="reset" class="btn btn-light" onclick={removeAll}>Tutup</button>
            <button type="submit" class="btn btn-primary">Simpan Item</button>
        </div>
    </form>
{/snippet}

{#snippet editForm()}
    <h3 class="fw-bolder">Master Produk: Edit Data</h3>
    <div class="separator my-3"></div>
    <form onsubmit={() => completeTransaction("Edit")}>
        <div class="row mb-4">
            <div class="col">
                <label for="namaProduk" class="form-label fw-bold">Nama Item</label>
                <input type="text" bind:value={namaItem} class="form-control" placeholder="Nama Item"  required/>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold">Stok Item</label>
                <input type="number" bind:value={stokItem} class="form-control" placeholder="Jumlah Stok"  required/>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col">
                <label for="namaDistributor" class="form-label fw-bold">Nama Distributor</label>
                <input type="text" bind:value={namaDistributor} class="form-control" placeholder="Cth: PT. Sumber Agung Bader Mas"  required/>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold">Harga Produk (Dari Pabrik)</label>
                <Rupiah id="hargaPabrik" bind:value={hargaPabrik} useClass="form-control" />
            </div>
        </div>

        <div class="row mb-4">
            <div class="col">
                <label for="namaProduk" class="form-label fw-bold">Pilih Tipe Item</label>
                <select bind:value={tipeItem} class="form-select" required>
                    <option value="" selected disabled>Pilih salah satu</option>
                    {#each useSatuan as satuan }
                        <option value={satuan}>{satuan}</option>
                    {/each}
                </select>
            </div>
            <div class="col">
                <label for="hargaProduk" class="form-label fw-bold">Harga Jual Produk (Untuk Satuan)</label>
                <Rupiah id="hargaJual" bind:value={hargaJual} useClass="form-control" />
            </div>
        </div>

        <div class="row mb-4">
            <div class="col">
                <label for="perPieces" class="form-label fw-bold">Jumlah Setiap Satuan</label>
                <input type="number" bind:value={jumlahPerItem} class="form-control" placeholder="Misal: 1 Box isi 12 Pcs" required/>
            </div>
            <div class="col">
                <label for="hargaPerPieces" class="form-label fw-bold text-info">Harga Per Pieces(Per Item)</label>
                <Rupiah id="hargaPerPieces" bind:value={hargaPerItem} useClass="form-control" />
            </div>
        </div>

        <div class="row mb-4">

            <div class="col">
                <label for="statusItem" class="form-label fw-bold">Status Jual</label>
                <select bind:value={statusJual} class="form-select" required>
                    <option value="" selected>Pilih salah satu</option>
                    <option value="Katalog dan Penjualan">Aktif, Muncul di Katalog & Penjualan</option>
                    <option value="Penjualan">Aktif, Muncul di Penjualan saja</option>
                    <option value="Tidak Aktif">Tidak aktif di Katalog & Penjualan</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="deskripsiProduk" class="form-label fw-bold">Deskripsi Produk</label>
            <textarea class="form-control" bind:value={deskripsiProduk} rows="5" placeholder="Deskripsi Produk" required></textarea>
        </div>

        <button type="submit" class="btn btn-primary w-100 my-2">Simpan Item</button>
    </form>
{/snippet}

<svelte:window onkeydown={runKeyPress} />