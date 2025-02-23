<script lang="ts">
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import { db } from "../../../../library/hooks/db";
    import { toast } from "svelte-sonner";
    import { onMount } from "svelte";
    import Drawer from "../../../../components/shared/Drawer.svelte";
    
    interface Report {
        ID: number;
        NO_TRANSAKSI: string;
        CREATED_AT: string;
        KETERANGAN: string;
    }

    interface Carts {
        NAMA: string;
        STOK: number;
        TIPE: "Item Masuk" | "Item Keluar";
        CREATED_AT: string;
    }

    interface ResponsiblePerson {
        NAMA: string;
        NOMINAL: number;
        CREATED_AT: string;
    }

    interface History {
        TIPE: "Item Masuk" | "Item Keluar";
        CARTS: Carts[];
        NOTES: string;
        PIC?: ResponsiblePerson[]; // Optional, as it's only present in "Item Keluar"
    }

    type Search = Record<"searchBar" | "startDate" | "endDate" | "tipe", string>;
    const useInput: Search = $state({
        searchBar: '',
        startDate: initializeDate("first"),
        endDate: initializeDate("last"),
        tipe: "Item Masuk"
    } as Search);

    let newData: Report[] = $state([]);
    let useDrawer: History | null = $state(null);

    let isDrawer: boolean = $state(false);

    async function viewLogistic(id: number): Promise <void> {
        const { status, message, data } = await db({
            ID: id,
        }, 'UD84/Stocks/Detail');

        if (status === "error") {
            toast.error(message);
            return;
        }

        useDrawer = data;
        isDrawer = !isDrawer;
    }

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            searchBar: useInput.searchBar,
            start: useInput.startDate,
            end: useInput.endDate,
            tipe: useInput.tipe
        }, 'UD84/Stocks/Dashboard');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
    }
</script>
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm bg-white my-3">
        <div class="card-body">
            <h3 class="text-decoration-underline fw-bolder">Report Logistik</h3>
            <div class="row">
                <div class="col-9">
                    <form class="row" onsubmit={doPost}>
                        <div class="col">
                            <label for="inputPencarian" class="form-label fw-bolder mt-2">Pencarian</label>
                            <input id="inputPencarian" bind:value={useInput.searchBar} type="text" class="form-control form-control-sm" placeholder="Kode Akhir Transaksi"/>
                        </div>
                        <div class="col me-2">
                            <label for="startDate" class="form-label fw-bolder mt-2">Pencarian Awal</label>
                            <DatePlaceholder bind:value={useInput.startDate} class="form-control form-control-sm form-control-flush" placeholder="Tanggal Awal"/>
                        </div>
                        <div class="col me-2">
                            <label for="endDate" class="form-label fw-bolder mt-2">Pencarian Akhir</label>
                            <DatePlaceholder bind:value={useInput.endDate} class="form-control form-control-sm form-control-flush" placeholder="Tanggal Akhir"/>
                        </div>
                        <div class="col me-2">
                            <label for="type" class="form-label fw-bolder mt-2">Kategori Logistik</label>
                            <select bind:value={useInput.tipe} class="form-select form-select-sm" required>
                                <option value="Item Masuk">Item Masuk</option>
                                <option value="Item Keluar">Item Keluar</option>
                            </select>
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
                            <input class="form-check-input" type="checkbox"/>
                            <span class="form-check-label fw-bolder ms-5">A-Z</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="separator my-3"></div>

            <div class="table-responsive">
                <table class="table table-row-dashed table-row-gray-300 gy-1 table-hover align-middle text-center text-dark">
                    <thead>
                        <tr class="fw-bold">
                            <th>#</th>
                            <th>No Transaksi</th>
                            <th>Tanggal</th>
                            <th>Keterangan</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="4" class="text-center">Mulai pencarian untuk mencari data!</td>
                            </tr>
                        {:else}
                            {#each newData as data, index }
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{data.NO_TRANSAKSI}</td>
                                    <td>{Carbon(data.CREATED_AT, "timestamp")}</td>
                                    <td>{data.KETERANGAN}</td>
                                    <td>
                                        <button type="button" onclick={() => viewLogistic(data.ID)} class="btn btn-sm btn-primary">
                                            <img src="/icons/elements/Link-Out.svg" class="h-20px me-2" alt="View" /> Lihat Detail
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
        {#if useDrawer !== null}
        {@render useReports(useDrawer)}
        {/if}
    </div>
</Drawer>

{#snippet useReports(useDrawer: History | null)}
    <h3>{useDrawer?.TIPE}</h3>
    <div class="separator my-3"></div>
    <p class="fst-italic">{useDrawer?.NOTES}</p>
    <div class="separator my-3"></div>

    <div class="table-responsive">
        <table class="table table-row-dashed table-row-gray-300 gy-1 table-hover align-middle text-center text-dark">
            <thead>
                <tr class="fw-bold">
                    <th>#</th>
                    <th>Nama</th>
                    <th>Stok</th>
                    <th>Tanggal Masuk</th>
                </tr>
            </thead>
            <tbody>
                {#if useDrawer !== null}
                    {#each useDrawer.CARTS as carts, index }
                        <tr>
                            <td>{index + 1}</td>
                            <td>{capitalizeEachWord(carts.NAMA)}</td>
                            <td class="text-{useDrawer.TIPE === "Item Masuk" ? 'primary' : 'danger'}">{useDrawer.TIPE === "Item Masuk" ? '+' : '-'}{carts.STOK}</td>
                            <td>{Carbon(carts.CREATED_AT, 'date-short-with-time')}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    <div class="separator my-3"></div>

    {#if useDrawer?.TIPE === "Item Keluar"}
        <h3>Penanggung Jawab</h3>
        <div class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 gy-1 table-hover align-middle text-center text-dark">
                <thead>
                    <tr class="fw-bold">
                        <th>#</th>
                        <th>Nama</th>
                        <th>Nominal</th>
                        <th>Tanggal</th>
                    </tr>
                </thead>
                <tbody>
                    {#if useDrawer.PIC && useDrawer.PIC.length !== 0}
                        {#each useDrawer.PIC as {NAMA, NOMINAL, CREATED_AT}, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>{capitalizeEachWord(NAMA)}</td>
                                <td>{rupiahFormatter.format(NOMINAL)}</td>
                                <td>{Carbon(CREATED_AT, 'date-short-with-time')}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    {/if}
{/snippet}