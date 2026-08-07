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
                    <button type="submit" class="btn btn-square btn-primary btn-sm" aria-label="Search Toggle">
                        <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                            <path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875ZM9.93945 11.6064H15.1689C15.5293 11.6064 15.8105 11.3076 15.8105 10.9561C15.8105 10.5957 15.5293 10.3145 15.1689 10.3145H9.93945C9.57031 10.3145 9.30664 10.5957 9.30664 10.9561C9.30664 11.3076 9.5791 11.6064 9.93945 11.6064ZM9.93945 13.918H13.71C14.0615 13.918 14.3516 13.6279 14.3516 13.2764C14.3516 12.916 14.0703 12.626 13.71 12.626H9.93945C9.57031 12.626 9.30664 12.916 9.30664 13.2764C9.30664 13.6279 9.5791 13.918 9.93945 13.918Z"/>
                        </svg>
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
                <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                    <path d="M22.9209 13.1797C25.3818 13.1797 27.4473 11.123 27.4473 8.64453C27.4473 6.16602 25.4082 4.11816 22.9209 4.11816C20.4424 4.11816 18.3945 6.16602 18.3945 8.64453C18.3945 11.1318 20.4424 13.1797 22.9209 13.1797ZM10.7393 18.6553H20.9697C21.3828 18.6553 21.7607 18.3301 21.7607 17.8643C21.7607 17.4072 21.3828 17.082 20.9697 17.082H10.9414C10.5195 17.082 10.2559 16.792 10.1943 16.3438L10.0625 15.4297H21.04C21.9014 15.4297 22.4727 15.0869 22.8242 14.4189C21.9102 14.3838 21.0664 14.1025 20.3369 13.6367C20.2227 13.7773 20.0732 13.8477 19.8535 13.8477L9.83398 13.8564L9.15723 9.21582H17.1904C17.1201 8.72363 17.1377 8.13477 17.2256 7.64258H8.92871L8.79688 6.69336C8.68262 5.92871 8.375 5.54199 7.39941 5.54199H4.38477C3.94531 5.54199 3.55859 5.92871 3.55859 6.37695C3.55859 6.83398 3.94531 7.2207 4.38477 7.2207H7.13574L8.49805 16.5195C8.69141 17.8467 9.39453 18.6553 10.7393 18.6553ZM20.0469 8.64453C20.0469 8.28418 20.293 8.04688 20.6533 8.04688H22.3145V6.38574C22.3145 6.02539 22.5518 5.7793 22.9209 5.7793C23.29 5.7793 23.5273 6.02539 23.5273 6.38574V8.04688H25.1885C25.5488 8.04688 25.7949 8.28418 25.7949 8.64453C25.7949 9.01367 25.5488 9.25098 25.1885 9.25098H23.5273V10.9209C23.5273 11.2812 23.29 11.5186 22.9209 11.5186C22.5518 11.5186 22.3145 11.2812 22.3145 10.9209V9.25098H20.6533C20.293 9.25098 20.0469 9.01367 20.0469 8.64453ZM11.46 23.0674C12.3125 23.0674 12.998 22.3818 12.998 21.5293C12.998 20.6768 12.3125 19.9912 11.46 19.9912C10.6074 19.9912 9.92188 20.6768 9.92188 21.5293C9.92188 22.3818 10.6074 23.0674 11.46 23.0674ZM19.5811 23.0674C20.4336 23.0674 21.1104 22.3818 21.1104 21.5293C21.1104 20.6768 20.4336 19.9912 19.5811 19.9912C18.7285 19.9912 18.0342 20.6768 18.0342 21.5293C18.0342 22.3818 18.7285 23.0674 19.5811 23.0674Z"/>
                </svg> Tambah Item Masuk
            </a>
            <a href="/ud84/panel/add/item-keluar" class="btn btn-sm btn-error">
                <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                    <path d="M22.9209 13.1797C25.3818 13.1797 27.4473 11.123 27.4473 8.64453C27.4473 6.16602 25.4082 4.11816 22.9209 4.11816C20.4424 4.11816 18.3945 6.16602 18.3945 8.64453C18.3945 11.1318 20.4424 13.1797 22.9209 13.1797ZM10.7393 18.6553H20.9697C21.3828 18.6553 21.7607 18.3301 21.7607 17.8643C21.7607 17.4072 21.3828 17.082 20.9697 17.082H10.9414C10.5195 17.082 10.2559 16.792 10.1943 16.3438L10.0625 15.4297H21.04C21.9014 15.4297 22.4727 15.0869 22.8242 14.4189C21.9102 14.3838 21.0664 14.1025 20.3369 13.6367C20.2227 13.7773 20.0732 13.8477 19.8535 13.8477L9.83398 13.8564L9.15723 9.21582H17.1904C17.1201 8.72363 17.1377 8.13477 17.2256 7.64258H8.92871L8.79688 6.69336C8.68262 5.92871 8.375 5.54199 7.39941 5.54199H4.38477C3.94531 5.54199 3.55859 5.92871 3.55859 6.37695C3.55859 6.83398 3.94531 7.2207 4.38477 7.2207H7.13574L8.49805 16.5195C8.69141 17.8467 9.39453 18.6553 10.7393 18.6553ZM20.6533 9.25098C20.3281 9.25098 20.0469 8.96973 20.0469 8.64453C20.0469 8.32812 20.3281 8.04688 20.6533 8.04688H25.1885C25.5225 8.04688 25.7949 8.32812 25.7949 8.64453C25.7949 8.96973 25.5225 9.25098 25.1885 9.25098H20.6533ZM11.46 23.0674C12.3125 23.0674 12.998 22.3818 12.998 21.5293C12.998 20.6768 12.3125 19.9912 11.46 19.9912C10.6074 19.9912 9.92188 20.6768 9.92188 21.5293C9.92188 22.3818 10.6074 23.0674 11.46 23.0674ZM19.5811 23.0674C20.4336 23.0674 21.1104 22.3818 21.1104 21.5293C21.1104 20.6768 20.4336 19.9912 19.5811 19.9912C18.7285 19.9912 18.0342 20.6768 18.0342 21.5293C18.0342 22.3818 18.7285 23.0674 19.5811 23.0674Z"/>
                </svg> Tambah Item Keluar
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
                                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
                                            <path d="M6.66699 2.66602H4.00033C3.6467 2.66602 3.30756 2.80649 3.05752 3.05654C2.80747 3.30659 2.66699 3.64573 2.66699 3.99935V11.9993C2.66699 12.353 2.80747 12.6921 3.05752 12.9422C3.30756 13.1922 3.6467 13.3327 4.00033 13.3327H12.0003C12.3539 13.3327 12.6931 13.1922 12.9431 12.9422C13.1932 12.6921 13.3337 12.353 13.3337 11.9993V9.33268M8.00033 7.99935L13.3337 2.66602M13.3337 2.66602V5.99935M13.3337 2.66602H10.0003"/>
                                        </svg> Lihat Detail
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
