<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db } from "../../../../library/hooks/db";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";

    import Drawer from "../../../../components/shared/Drawer.svelte";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Pesanan {
        ID: number;
        NAMA: string;
        WHATSAPP: string;
        SALES: number;
        CATATAN: string;
        KODE: string;
        VALID: string | null;
        CREATED_AT: string;
        UPDATED_AT: null;
    }

    interface Carts {
        NAMA: string;
        JUMLAH: number;
        STOK: number;
        SATUAN: string;
        HARGA_PER_ITEM: number;
        HARGA_JUAL: number;
        DISTRIBUTOR: string;
    }

    let newData: Pesanan[] = $state([]);
    let carts: Carts[] = $state([]);

    type Search = Record<"startDate" | "endDate", string>;
    const useInput: Search = $state({
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
    } as Search);

    let isDrawer: boolean = $state(false);

    async function viewItem(id: string): Promise <void> {
        const { status, message, data } = await db({
            ID: id
        }, 'UD84/Pesanan/Retrieve-Items');

        if (status === "error") {
            toast.error(message);
            return;
        }

        isDrawer = !isDrawer;
        carts = data;
    }

    async function removeItem(id: string, index: number): Promise <void> {
        toast('Apakah anda yakin untuk menghapus?', {
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: id
                    }, 'UD84/Pesanan/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.info(message);
                    newData.splice(index, 1);
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
<div class="container-fluid">
    <div class="card shadow-sm my-3 bg-white">
        <div class="card-body">
            <h3 class="fw-bold">Pesanan Masuk</h3>

            <div class="row">
                <div class="col-9">
                    <form class="row" onsubmit={doPost}>
                        <div class="col me-2">
                            <label for="startDate" class="form-label fw-bolder mt-2">Pencarian Awal</label>
                            <DatePlaceholder bind:value={useInput.startDate} class="form-control form-control-sm form-control-flush" placeholder="Tanggal Awal"/>
                        </div>
                        <div class="col me-2">
                            <label for="endDate" class="form-label fw-bolder mt-2">Pencarian Akhir</label>
                            <DatePlaceholder bind:value={useInput.endDate} class="form-control form-control-sm form-control-flush" placeholder="Tanggal Akhir"/>
                        </div>
                        <div class="col">
                            <label for="actionButton" class="form-label fw-bolder mt-2">Pencarian</label>
                            <div class="form-group">
                                <button type="submit" class="btn btn-sm btn-icon btn-primary">
                                    <img src="/icons/elements/Search.svg" class="h-30px svg-white" alt="Search Toggle" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="col-3">
                    <div class="d-flex justify-content-end">
                        <label class="form-check form-switch form-check-custom form-check-solid mt-11">
                            <input class="form-check-input" type="checkbox" onchange={reverseData}/>
                            <span class="form-check-label fw-bolder ms-5">A-Z</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="separator my-5"></div>

            <div class="table-responsive">
                <table class="table align-middle gy-1 gx-1">
                    <thead>
                        <tr class="fw-bolder">
                            <th>#</th>
                            <th>Nama</th>
                            <th>WhatsApp</th>
                            <th>Nama Sales</th>
                            <th>Dipesan Pada</th>
                            <th>Keterangan</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data</td>
                            </tr>
                        {:else}
                            {#each newData as data, index }
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{data.NAMA}</td>
                                    <td>{data.WHATSAPP}</td>
                                    <td>{data.SALES}</td>
                                    <td>{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                                    <td>{data.CATATAN}</td>
                                    <td>
                                        <button type="button" onclick={() => removeItem(data.KODE, index)} class="btn btn-sm btn-icon btn-danger">
                                            <img src="/icons/elements/Delete.svg" class="h-15px svg-white" alt="Lihat Item"/>
                                        </button>
                                        {#if data.VALID === null}
                                            <button type="button" onclick={() => isValid(data.KODE, index)} class="btn btn-sm btn-icon btn-primary">
                                                <img src="/icons/elements/Add.svg" class="h-25px svg-white" alt="Lihat Item"/>
                                            </button>
                                        {:else}
                                            <button type="button" class="btn btn-sm btn-success">Verified</button>
                                        {/if}
                                        <button type="button" onclick={() => viewItem(data.KODE)} class="btn btn-sm btn-icon btn-info">
                                            <img src="/icons/elements/Share.svg" class="h-15px svg-white" alt="Lihat Item"/>
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
</div>

<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        <h3>Detail Pesanan</h3>
        <div class="separator my-3"></div>
        <div class="table-responsive">
            <table class="table align-middle gy-1 gx-1 table-striped table-hover">
                <thead>
                    <tr class="fw-bolder">
                        <th>#</th>
                        <th>Nama</th>
                        <th class="text-center">Jumlah Pesanan (Pcs)</th>
                        <th class="text-center">Stok</th>
                        <th>Satuan</th>
                        <th class="text-center">Harga Jual</th>
                        <th class="text-center">Harga Per Pcs</th>
                    </tr>
                </thead>
                <tbody>
                    {#if carts.length === 0}
                        <tr>
                            <td colspan="7" class="text-center">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each carts as carts, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>
                                    {capitalizeEachWord(carts.NAMA)} <br/>
                                    <span class="text-golden fw-bolder">[{carts.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">{carts.JUMLAH}</td>
                                <td class="text-center">
                                    {#if carts.STOK < 30}
                                        <span class="text-danger fw-bolder">{ carts.STOK }</span>
                                    {:else}
                                        { carts.STOK }
                                    {/if}
                                </td>
                                <td>{carts.SATUAN}</td>
                                <td class="text-center">{rupiahFormatter.format(carts.HARGA_JUAL)}</td>
                                <td class="text-center">{rupiahFormatter.format(carts.HARGA_PER_ITEM)}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</Drawer>