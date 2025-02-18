<script lang="ts">
    import { rupiahFormatter } from "../../../../../library/utils/useFormat";
    import DatePlaceholder from "../../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../../components/content/ud84/UD84Navigation.svelte";
    import Drawer from "../../../../../components/shared/Drawer.svelte";

    let { data } = $props();
    let cartData: any = $state([]);
    let responsiblePerson: any = $state([]);

    let isDrawer: boolean = $state(false);
</script>
<Ud84Navigation/>
<div class="row p-5">
    <div class="col-4">
        <div class="d-flex justify-content-between">
            <h4 class="fw-bolder text-dea">{data.pageTitle}</h4>
        </div>
        <form class="mb-3">
            <div class="row">
                <div class="col">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text border-transparent" id="cariProduk">🔍</span>
                        <input type="text" class="form-control form-control-sm form-control-transparent" placeholder="[ESC] Cari Produk" aria-label="Cari Produk" aria-describedby="cariProduk" required/>
                    </div>
                </div>
                <div class="col">
                    <input type="number" min="1" pattern="[0-9]" class="form-control form-control-sm form-control-transparent" placeholder="[TAB] Jumlah"/>
                </div>
                <button type="submit" hidden>Submit</button>
            </div>
        </form>
        <div class="row my-2">
            <div class="col mt-2">
                <label class="form-label fw-bolder text-golden" for="tanggalAfkir">Tanggal Transaksi</label>
            </div>
            <div class="col">
                <DatePlaceholder/>
            </div>
        </div>
        <div class="row my-2">
            <div class="col mt-2">
                <label class="form-label fw-bolder text-golden" for="tipeAfkir">Tipe Item Keluar</label>
            </div>
            <div class="col">
                <select class="form-select form-select-sm">
                    <option value="" selected>Pilih Salah Satu</option>
                </select>
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#pilihPIC">Pilih PIC</button>
        </div>
        <div class="form-group mt-2">
            <label for="notePOS" class="form-label fw-bold pe-7">Keterangan</label>
            <textarea id="notePOS" class="form-control" placeholder="Belum ada catatan"></textarea>
        </div>

        <button type="button" class="btn btn-danger w-100" onclick={() => isDrawer = !isDrawer}>Open</button>


    </div>
    <div class="col-8">
        <div class="border-dea-total rounded-1 d-flex align-items-center justify-content-end">
            <h1 class="display-6 text-dea me-3 m-2">Rp. 24.000</h1>
        </div>
        <div class="overflow-auto" style="height: 75vh;">
            <table class="table table-row-dashed table-row-gray-300 align-middle gx-1 gy-1">
                <thead>
                    <tr class="fw-bolder text-muted">
                        <th>#</th>
                        <th>Kode Item</th>
                        <th>Nama - Satuan</th>
                        <th>Harga</th>
                        <th class="text-center">Jumlah</th>
                        <th class="text-center">Tipe</th>
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
                                <td class="fw-bolder text-danger">{cartItem.KODE}</td>
                                <td>
                                    <span class="fw-bolder">{ cartItem.NAMA } - </span>
                                    <span class="fw-bolder text-warning">{ cartItem.SATUAN }</span>
                                </td>
                                <td class="text-center"><span class="text-dea fw-bolder">{ rupiahFormatter.format(cartItem.HARGA) }</span></td>
                                <td>
                                    <div class="d-flex justify-content-center">
                                        <input type="number" min="1" id="quantity_{index}" class="form-control form-control-sm text-center w-50" placeholder="Qty"/>
                                    </div>
                                </td>
                                <td>
                                    <select class="form-select form-select-sm text-center">
                                        <option value="Normal">Normal</option>
                                        <option value="Kulit">Kulit</option>
                                        <option value="Kosongan">Kosongan</option>
                                    </select>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-icon btn-sm btn-dark">
                                        <img src="/assets/images/icons/Delete.svg" alt="" height="38" />
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal -->
<div class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" id="pilihPIC">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="d-flex bg-light-brown rounded">
                <div class="p-2 text-center w-100">
                    <h1 class="fw-bolder bg-light-brown ms-13 mt-3">Pilih Penanggung Jawab</h1>
                </div>
                <div class="p-2 flex-shrink-1 bg-light-brown rounded">
                    <button type="button" id="transactionModal" class="btn btn-sm btn-icon btn-danger mt-2" data-bs-dismiss="modal" aria-label="Close">X</button>
                </div>
            </div>

            <div class="modal-body">

                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-success">Total Tagihan: Rp. 24.000</button>
                </div>

                <div class="separator my-2 mt-3"></div>

                <div class="fv-row my-4">
                    <label for="ItemKeluar" class="form-label fs-6 fw-bolder mb-3">Pilih Penanggung Jawab</label>
                    <div class="row">
                        <div class="col">
                            <select class="form-select form-select-sm text-capitalize">
                                <option value="" disabled selected>Pilih Penanggung Jawab</option>
                            </select>
                        </div>
                        <div class="col">
                            <button type="button" class="btn btn-sm btn-info">Tambahkan</button>
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
                            {#each responsiblePerson as data,index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{data.NAMA}</td>
                                    <td>
                                        <input type="number" class="form-control form-control-sm text-center" value="{data.NOMINAL}" />
                                    </td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-dark">Hapus</button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                
                <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-sm btn-danger">Hapus Semua</button>
                    <button type="button" class="btn btn-sm btn-outline btn-outline-dashed btn-outline-danger btn-active-light-danger">Rp. 24.000</button>
                </div>

                <div class="separator my-3"></div>

                <div class="d-flex justify-content-end">
                    <div class="me-2">
                        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal" aria-label="Close">Tutup</button>
                    </div>
                </div>

            </div>

        </div>
    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="p-5">
        Hi!
    </div>
</Drawer>