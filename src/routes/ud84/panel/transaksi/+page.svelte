<script lang="ts">
    import { onMount } from "svelte";
    import { Carbon, currencySanitizer, rupiahFormatter } from "../../../../library/utils/useFormat";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import Drawer from "../../../../components/shared/Drawer.svelte";
    import Rupiah from "../../../../components/shared/Rupiah.svelte";
    import { toast } from "svelte-sonner";

    interface Transaksi {
        ID: string;
        TANGGAL: string;
        JATUH_TEMPO: string;
        NAMA: string;
        NOMINAL: number;
        DP: number;
        BAYAR_TUNAI: number;
    }

    interface Rekap {
        ID: number;
        UNIQUE: string;
        NAMA: string;
        CASH: number;
        DP: number;
        JATUH_TEMPO: string;
        KETERANGAN: string | null;
        TOTAL: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    interface Detail {
        ID: number;
        UNIQUE: string;
        KODE: string | null;
        NAMA: string;
        JUMLAH: number;
        HARGA_ASLI: number;
        HARGA_TERJUAL: number;
        POTONGAN_PERSEN: number;
        POTONGAN_RUPIAH: number;
        CREATED_AT: string;
        UPDATED_AT: string | null;
    }

    let daftarTransaksi: Transaksi[] = $state([]);

    let rekapTransaksi: Rekap = $state({
        ID: 0,
        UNIQUE: '',
        NAMA: '',
        CASH: 0,
        DP: 0,
        JATUH_TEMPO: '',
        KETERANGAN: '',
        TOTAL: 0,
        CREATED_AT: '',
        UPDATED_AT: ''
    });
    let detailTransaksi: Detail[] = $state([]);

    let nominalTransaksi:number = $state(0);
    let nominalDP:number        = $state(0);
    let nominalTunai:number     = $state(0);

    let useDP: string = $state('');;

    let isDrawer: boolean = $state(false);

    onMount(async () => initializePage());

    async function initializePage(): Promise <void>{
        const doResponse    = await useFetch('UD84/Daftar-Transaksi');
        daftarTransaksi     = doResponse.data;
        nominalTransaksi    = doResponse.TRANSAKSI;
        nominalDP           = doResponse.DP;
        nominalTunai        = doResponse.BAYAR_TUNAI
    } 

    async function getDetail(id: string): Promise <Array<Detail>>{
        const getResponse = await useFetch('UD84/Daftar-Transaksi/Detail-Transaksi/' + id);
        detailTransaksi = getResponse.detail;
        rekapTransaksi = getResponse.rekap;
        useDP = rupiahFormatter.format(rekapTransaksi.TOTAL - rekapTransaksi.DP)
        isDrawer = !isDrawer;
        return detailTransaksi;
    }

    async function updateDownPayment(): Promise <void> {
        toast('Update: Down Payment', {
            description: 'Apakah anda yakin?',
            action: {
            label: 'Ya, Update',
                onClick: async () => {

                    const { status, message } = await db({
                        KODE: rekapTransaksi.UNIQUE,
                        DP: currencySanitizer(useDP),
                        OLD_DP: rekapTransaksi.DP
                    }, 'UD84/Daftar-Transaksi/Update-DP');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.success(message);
                    initializePage();
                }
            },
        })
    }

</script>
<Ud84Navigation/>
<div class="card shadow-sm">
    <div class="card-header">
        <h3 class="card-title fw-bold">Daftar Transaksi: Rekap Penjualan</h3>
    </div>
    <div class="card-body">
        
        <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
            <thead>
                <tr class="fw-bold">
                    <th>#</th>
                    <th>Tanggal Transaksi</th>
                    <th>Jatuh Tempo</th>
                    <th>Nama Pelanggan</th>
                    <th>Nominal Transaksi</th>
                    <th>DP</th>
                    <th>Bayar Tunai</th>
                    <th>Cetak Ulang</th>
                    <th>Lihat Detail Transaksi</th>
                </tr>
            </thead>
            <tbody>
                {#each daftarTransaksi as data, index}
                    <tr>
                        <td>
                            {#if data.JATUH_TEMPO !== '-'}
                                {#if data.DP == data.NOMINAL}
                                    <span class="badge badge-circle badge-success">{index + 1}</span>
                                {:else}
                                    <span class="badge badge-circle badge-danger">{index + 1}</span>
                                {/if}
                            {:else}
                                {index + 1}
                            {/if}
                        </td>
                        <td>{data.TANGGAL}</td>
                        <td>{data.JATUH_TEMPO}</td>
                        <td>{data.NAMA}</td>
                        <td>{rupiahFormatter.format(data.NOMINAL)}</td>
                        <td>
                            {#if data.DP !== 0}
                                <span class="badge badge-warning">{rupiahFormatter.format(data.DP)}</span>
                            {:else}
                                {rupiahFormatter.format(data.DP)}
                            {/if}
                        </td>
                        <td>{rupiahFormatter.format(data.BAYAR_TUNAI)}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-info">
                                <img src="/icons/elements/Printer.svg" alt="Print" class="h-20px svg-white" />
                                Cetak Ulang Nota
                            </button>
                        </td>
                        <td>
                            <button type="button" onclick={() => getDetail(data.ID)} class="btn btn-sm btn-primary">Lihat Detail</button>
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td colspan="4" class="fw-bolder">Total</td>
                    <td class="text-success fw-bolder">{ rupiahFormatter.format(nominalTransaksi) }</td>
                    <td>{ rupiahFormatter.format(nominalDP) }</td>
                    <td>{ rupiahFormatter.format(nominalTunai) }</td>
                </tr>
            </tbody>
        </table>

    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        <h3 class="modal-title">Detail Transaksi</h3>

        <div class="separator my-3"></div>

        <div class="row">
            <label for="totalTransaksi" class="col-sm-4 col-form-label fw-bold fs-6" aria-label="Nominal Pembayaran">Total Transaksi</label>
            <div class="col-sm-8 fv-row">
                <input type="text" id="totalTransaksi" class="form-control form-control-sm form-control-flush text-success w-50" placeholder="Nama Pelanggan" value="{rupiahFormatter.format(rekapTransaksi.TOTAL)}" readonly/>
            </div>
        </div>

        <div class="separator my-3"></div>


        <div class="row">
            <label for="nominalPembayaran" class="col-sm-4 col-form-label fw-bold fs-6" aria-label="Nominal Pembayaran">Pembayaran Cash</label>
            <div class="col-sm-8 fv-row">
                <input type="text" id="nominalPembayaran" class="form-control form-control-sm form-control-flush w-50" placeholder="Nama Pelanggan" value="{rupiahFormatter.format(rekapTransaksi.CASH)}" readonly/>
            </div>
        </div>

        <div class="row">
            <label for="nominalDP" class="col-sm-4 col-form-label fw-bold fs-6" aria-label="Nominal Pembayaran">Pelunasan DP</label>
            <div class="col-sm-6 fv-row">
                <Rupiah id="nominalDP" bind:value={useDP} useClass="form-control form-control-sm text-danger"/>
            </div>
            <div class="col-sm-2 fv-row">
                <button type="button" onclick={updateDownPayment} class="btn btn-sm btn-primary">Simpan DP</button>
            </div>
        </div>


        <div class="row">
            <label for="jatuhTempo" class="col-sm-4 col-form-label fw-bold fs-6" aria-label="Nominal Pembayaran">Jatuh Tempo</label>
            <div class="col-sm-8 fv-row">
                <input type="text" id="jatuhTempo" class="form-control form-control-sm form-control-flush w-50" placeholder="Nama Pelanggan" value="{Carbon(rekapTransaksi.JATUH_TEMPO, "date")}" readonly/>
            </div>
        </div>

        <div class="row">
            <label for="totalTransaksi" class="col-sm-4 col-form-label fw-bold fs-6" aria-label="Nominal Pembayaran">Keterangan</label>
            <div class="col-sm-8 fv-row">
                <input type="text" id="totalTransaksi" class="form-control form-control-sm form-control-flush w-50" placeholder="Nama Pelanggan" value="{rekapTransaksi.KETERANGAN}" readonly/>
            </div>
        </div>

        <div class="separator my-3"></div>

        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-dark">
                <thead>
                    <tr class="fw-bolder">
                        <th>Nama Produk</th>
                        <th class="text-center">Jumlah</th>
                        <th>Harga Terjual</th>
                        <th>Potongan Persen</th>
                        <th>Potongan Rupiah</th>
                    </tr>
                </thead>
                <tbody>
                    {#each detailTransaksi as detail,index }
                        <tr>
                            <td>
                                <span class="fw-bolder text-golden">{ detail.NAMA }</span> <br/>
                                <span>{ rupiahFormatter.format(detail.HARGA_ASLI) }</span>
                            </td>
                            <td class="text-center">{ detail.JUMLAH }</td>
                            <td>{ rupiahFormatter.format(detail.HARGA_TERJUAL) }</td>
                            <td>{ rupiahFormatter.format(detail.POTONGAN_PERSEN) }</td>
                            <td>{ rupiahFormatter.format(detail.POTONGAN_RUPIAH) }</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</Drawer>

<!-- Show Detail -->
<!-- 
<div class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" id="showDetail">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Detail Transaksi</h3>
                <button type="button" on:click={() => detailTransaksi = []} class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">X</button>
            </div>

            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
                        <thead>
                            <tr class="fw-bolder">
                                <th>#</th>
                                <th>Nama Produk</th>
                                <th>Jumlah</th>
                                <th>Harga Asli</th>
                                <th>Harga Terjual</th>
                                <th>Potongan Persen</th>
                                <th>Potongan Rupiah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each detailTransaksi as detail,index }
                                <tr>
                                    <td>{ index + 1 }</td>
                                    <td>{ detail.NAMA }</td>
                                    <td>{ detail.JUMLAH }</td>
                                    <td>{ rupiahFormatter.format(detail.HARGA_ASLI) }</td>
                                    <td>{ rupiahFormatter.format(detail.HARGA_TERJUAL) }</td>
                                    <td>{ rupiahFormatter.format(detail.POTONGAN_PERSEN) }</td>
                                    <td>{ rupiahFormatter.format(detail.POTONGAN_RUPIAH) }</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" on:click={() => detailTransaksi = []} class="btn btn-light" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div> -->