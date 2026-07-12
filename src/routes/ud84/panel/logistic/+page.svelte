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

    function reverseData(): Report[] {
        newData = newData.reverse();
        return newData;
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
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Report Logistik</h3>
        </div>

        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" onsubmit={doPost}>
                <div>
                    <label for="inputPencarian" class="label-text mb-1 block font-medium">Pencarian</label>
                    <input id="inputPencarian" bind:value={useInput.searchBar} type="text" class="input input-bordered input-sm w-full" placeholder="Kode Akhir Transaksi"/>
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
                    <div class="flex-1">
                        <label for="type" class="label-text mb-1 block font-medium">Kategori Logistik</label>
                        <select id="type" bind:value={useInput.tipe} class="select select-bordered select-sm w-full" required>
                            <option value="Item Masuk">Item Masuk</option>
                            <option value="Item Keluar">Item Keluar</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-square btn-primary btn-sm">
                        <img src="/icons/Search.svg" class="h-5 w-5" alt="Search Toggle" />
                    </button>
                </div>
            </form>
            <label class="flex cursor-pointer items-center gap-2 lg:pb-1">
                <input type="checkbox" class="toggle toggle-sm" onchange={reverseData}/>
                <span class="label-text font-bold">A-Z</span>
            </label>
        </div>

        <div class="mb-5 flex flex-wrap gap-2">
            <a href="/ud84/panel/add/item-masuk" class="btn btn-sm btn-primary">
                <img src="/icons/Cart-Plus.svg" class="h-5 w-5" alt="" /> Tambah Item Masuk
            </a>
            <a href="/ud84/panel/add/item-keluar" class="btn btn-sm btn-error">
                <img src="/icons/Cart-Minus.svg" class="h-5 w-5" alt="" /> Tambah Item Keluar
            </a>
        </div>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
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
                            <td colspan="5" class="text-center text-base-content/60">Mulai pencarian untuk mencari data!</td>
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
                                        <img src="/icons/Link-Out.svg" class="h-5 w-5" alt="View" /> Lihat Detail
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
    <div class="w-full p-5">
        {#if useDrawer !== null}
        {@render useReports(useDrawer)}
        {/if}
    </div>
</Drawer>

{#snippet useReports(useDrawer: History | null)}
    <h3 class="text-lg font-bold">{useDrawer?.TIPE}</h3>
    <div class="divider my-3"></div>
    <p class="italic">{useDrawer?.NOTES}</p>
    <div class="divider my-3"></div>

    <div class="overflow-x-auto">
        <table class="table table-zebra align-middle text-center">
            <thead>
                <tr class="font-bold">
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
                            <td class="text-{useDrawer.TIPE === "Item Masuk" ? 'primary' : 'error'}">{useDrawer.TIPE === "Item Masuk" ? '+' : '-'}{carts.STOK}</td>
                            <td>{Carbon(carts.CREATED_AT, 'date-short-with-time')}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    <div class="divider my-3"></div>

    {#if useDrawer?.TIPE === "Item Keluar"}
        <h3 class="text-lg font-bold">Penanggung Jawab</h3>
        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
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
