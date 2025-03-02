<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import { capitalizeEachWord, Carbon } from "../../../../library/utils/useFormat";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Master {
        ID: number;
        NAMA: string;
        STOK: number;
        TIPE: string;
        STATUS_JUAL: string;
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

    interface Kartu {
        NAMA: string;
        ASAL: string;
        MASUK: number;
        KELUAR: number;
        CREATED_AT: string;
        STOK: number;
    }

    type Search = Record<"searchBar" | "startDate" | "endDate", string>;
    const useInput: Search = $state({
        "searchBar" : '',
        "startDate" : initializeDate("first"),
        "endDate": initializeDate("last")
    } as Search);

    let newData: Kartu[] = $state([]);
    let useItem: Master[] = $state([]);

    onMount(() => {
        initializePage();
    })

    async function initializePage(): Promise <void> {
        useItem = await useFetch("UD84/Master-Produk/Retrieve");
    }

    async function doPost(): Promise <void> {
        if (useInput.searchBar === "") {
            toast.error("Pilih item terlebih dahulu.");
            return;
        }

        const { status, message, data } = await db({
            searchBar: useInput.searchBar,
            startDate: useInput.startDate,
            endDate: useInput.endDate
        }, 'UD84/Stocks/Kartu');

        if (status === "error") {
            toast.error(message);
            return;
        }

        if (data.length === 0) {
            toast.info("Tidak ada data.");
        }

        newData = data;
    }

    function reverseData(): Kartu[] {
        newData = newData.reverse();
        return newData;
    }

    async function preparePrint() {
        if (newData.length === 0) {
            toast.error("Tidak ada data untuk dicetak");
            return;
        }

        window.print();
    }
</script>
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm my-3 bg-white">
        <div class="card-body">
            <h3 class="text-decoration-underline fw-bolder">Kartu Stok</h3>

            <div class="row">
                <div class="col-9">
                    <form class="row" onsubmit={doPost}>
                        <div class="col-6">
                            <label for="inputPencarian" class="form-label fw-bolder mt-2">Pencarian</label>
                            <select bind:value={useInput.searchBar} class="form-select form-select-sm" required>
                                <option value="" disabled selected>Pilih Item</option>
                                {#each useItem as {ID, NAMA ,DISTRIBUTOR}}
                                    <option value={ID}>
                                        {NAMA} - [{DISTRIBUTOR}]
                                    </option>
                                {/each}
                            </select>
                        </div>
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
                                <button type="button" onclick={preparePrint} class="btn btn-sm btn-icon btn-info">
                                    <img src="/icons/elements/Printer.svg" class="h-30px svg-white" alt="Print Button" />
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

            <div class="separator my-3"></div>

            <table class="table table-row-dashed table-row-gray-300 gy-1 table-hover align-middle text-center text-dark">
                <thead>
                    <tr class="fw-bolder">
                        <th>#</th>
                        <th>Nama</th>
                        <th>Asal</th>
                        <th>Masuk</th>
                        <th>Keluar</th>
                        <th>Stok Final</th>
                        <th>Tanggal</th>
                    </tr>
                </thead>
                <tbody>
                    {#if newData.length === 0}
                        <tr>
                            <td colspan="7" class="text-center">Tidak ada data.</td>
                        </tr>
                    {:else}
                        {#each newData as data, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{capitalizeEachWord(data.NAMA)}</td>
                                <td>{data.ASAL}</td>
                                <td class="text-primary">{data.MASUK}</td>
                                <td class="text-danger">{data.KELUAR}</td>
                                <td class="text-info">{data.STOK}</td>
                                <td>{Carbon(data.CREATED_AT, "timestamp")}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>

        </div>
    </div>
</div>