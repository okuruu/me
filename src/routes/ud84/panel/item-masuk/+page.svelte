<script lang="ts">
    import { Carbon } from "../../../../library/utils/useFormat";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import DatePlaceholder from "../../../../components/shared/DatePlaceholder.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    
    type Search = Record<"searchBar" | "startDate" | "endDate", string>;
    const useInput: Search = $state({
        searchBar: '',
        startDate: initializeDate("first"),
        endDate: initializeDate("last")
    } as Search);

    interface IM {
        NO_TRANSAKSI: string;
        TANGGAL: string;
        KETERANGAN: string;
    }

    let newData: IM[] = $state([]);
</script>
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm bg-white my-3">
        <div class="card-body">
            <h3 class="text-decoration-underline fw-bolder">Item Masuk</h3>
            <div class="row">
                <div class="col-9">
                    <form class="row">
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
                        <div class="col">
                            <label for="actionButton" class="form-label fw-bolder mt-2">Action</label>
                            <div class="form-group">
                                <button type="submit" class="btn btn-sm btn-icon btn-primary">
                                    <img src="/icons/elements/Search.svg" class="h-30px svg-white" alt="Search Toggle" />
                                </button>
                                <button type="button" class="btn btn-sm btn-icon btn-info">
                                    <img src="/icons/elements/Refresh.svg" class="h-25px svg-white" alt="Refresh Data" />
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
                                    <td>IM/{data.NO_TRANSAKSI}</td>
                                    <td>{Carbon(data.TANGGAL, "timestamp")}</td>
                                    <td>{data.KETERANGAN}</td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>