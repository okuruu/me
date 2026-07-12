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
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Kartu Stok</h3>
        </div>

        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" onsubmit={doPost}>
                <div>
                    <label for="inputPencarian" class="label-text mb-1 block font-medium">Pencarian</label>
                    <select id="inputPencarian" bind:value={useInput.searchBar} class="select select-bordered select-sm w-full" required>
                        <option value="" disabled selected>Pilih Item</option>
                        {#each useItem as {ID, NAMA ,DISTRIBUTOR}}
                            <option value={ID}>
                                {NAMA} - [{DISTRIBUTOR}]
                            </option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label for="startDate" class="label-text mb-1 block font-medium">Pencarian Awal</label>
                    <DatePlaceholder bind:value={useInput.startDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Awal"/>
                </div>
                <div>
                    <label for="endDate" class="label-text mb-1 block font-medium">Pencarian Akhir</label>
                    <DatePlaceholder bind:value={useInput.endDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Akhir"/>
                </div>
                <div class="flex items-end gap-2">
                    <button type="submit" class="btn btn-square btn-primary btn-sm">
                        <img src="/icons/Search.svg" class="h-5 w-5" alt="Search Toggle" />
                    </button>
                    <button type="button" onclick={preparePrint} class="btn btn-square btn-info btn-sm">
                        <img src="/icons/Printer.svg" class="h-5 w-5" alt="Print Button" />
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
                            <td colspan="7" class="text-center text-base-content/60">Tidak ada data.</td>
                        </tr>
                    {:else}
                        {#each newData as data, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{capitalizeEachWord(data.NAMA)}</td>
                                <td>{data.ASAL}</td>
                                <td class="text-primary">{data.MASUK}</td>
                                <td class="text-error">{data.KELUAR}</td>
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
</div>
