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
                    <button type="submit" class="btn btn-square btn-primary btn-sm" aria-label="Search Toggle">
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875ZM9.93945 11.6064H15.1689C15.5293 11.6064 15.8105 11.3076 15.8105 10.9561C15.8105 10.5957 15.5293 10.3145 15.1689 10.3145H9.93945C9.57031 10.3145 9.30664 10.5957 9.30664 10.9561C9.30664 11.3076 9.5791 11.6064 9.93945 11.6064ZM9.93945 13.918H13.71C14.0615 13.918 14.3516 13.6279 14.3516 13.2764C14.3516 12.916 14.0703 12.626 13.71 12.626H9.93945C9.57031 12.626 9.30664 12.916 9.30664 13.2764C9.30664 13.6279 9.5791 13.918 9.93945 13.918Z"/>
                        </svg>
                    </button>
                    <button type="button" onclick={preparePrint} class="btn btn-square btn-info btn-sm" aria-label="Print Button">
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M6.71387 20.6768H7.61914V21.4941C7.61914 22.8037 8.24316 23.3838 9.50879 23.3838H18.4912C19.748 23.3838 20.3809 22.8037 20.3809 21.4941V20.6768H21.2861C23.0791 20.6768 24.0547 19.7363 24.0547 17.9346V9.86621C24.0547 8.07324 23.0791 7.12402 21.2861 7.12402H20.4863V6.64941C20.4863 4.86523 19.5898 4.04785 17.8672 4.04785H10.1328C8.48047 4.04785 7.51367 4.86523 7.51367 6.64941V7.12402H6.71387C4.99121 7.12402 3.94531 8.07324 3.94531 9.86621V17.9346C3.94531 19.7363 4.9209 20.6768 6.71387 20.6768ZM9.14844 6.52637C9.14844 5.87598 9.48242 5.54199 10.1328 5.54199H17.8672C18.5176 5.54199 18.8516 5.87598 18.8516 6.52637V7.12402H9.14844V6.52637ZM18.4912 12.7139H9.50879C8.28711 12.7139 7.61914 13.2939 7.61914 14.6035V19.0947H6.71387C5.99316 19.0947 5.61523 18.7168 5.61523 18.0049V9.80469C5.61523 9.08398 5.99316 8.70605 6.71387 8.70605H21.2861C22.0068 8.70605 22.376 9.08398 22.376 9.80469V18.0049C22.376 18.7168 22.0068 19.0947 21.2861 19.0947H20.3809V14.6035C20.3809 13.2939 19.748 12.7139 18.4912 12.7139ZM18.1309 10.7275C18.1309 11.3691 18.6494 11.8701 19.2822 11.8613C19.8975 11.8613 20.416 11.3604 20.416 10.7275C20.416 10.1123 19.8975 9.58496 19.2822 9.58496C18.6582 9.58496 18.1309 10.1123 18.1309 10.7275ZM9.86914 21.8457C9.44727 21.8457 9.23633 21.6436 9.23633 21.2129V14.8848C9.23633 14.4541 9.44727 14.252 9.86914 14.252H18.1396C18.5615 14.252 18.7637 14.4541 18.7637 14.8848V21.2129C18.7637 21.6436 18.5615 21.8457 18.1396 21.8457H9.86914ZM11.1084 17.1611H16.9092C17.252 17.1611 17.5068 16.8975 17.5068 16.5547C17.5068 16.2295 17.252 15.9658 16.9092 15.9658H11.1084C10.7568 15.9658 10.502 16.2295 10.502 16.5547C10.502 16.8975 10.7568 17.1611 11.1084 17.1611ZM11.1084 20.1406H16.9092C17.252 20.1406 17.5068 19.8857 17.5068 19.5518C17.5068 19.2178 17.252 18.9453 16.9092 18.9453H11.1084C10.7568 18.9453 10.502 19.2178 10.502 19.5518C10.502 19.8857 10.7568 20.1406 11.1084 20.1406Z"/>
                        </svg>
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
