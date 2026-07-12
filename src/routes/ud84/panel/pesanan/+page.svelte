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
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Pesanan Masuk</h3>
        </div>

        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <form class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" onsubmit={doPost}>
                <div>
                    <label for="startDate" class="label-text mb-1 block font-medium">Pencarian Awal</label>
                    <DatePlaceholder bind:value={useInput.startDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Awal"/>
                </div>
                <div>
                    <label for="endDate" class="label-text mb-1 block font-medium">Pencarian Akhir</label>
                    <DatePlaceholder bind:value={useInput.endDate} class="input input-bordered input-sm w-full" placeholder="Tanggal Akhir"/>
                </div>
                <div class="flex items-end">
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

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
                        <th class="hidden sm:table-cell">WhatsApp</th>
                        <th class="hidden lg:table-cell">Nama Sales</th>
                        <th class="hidden md:table-cell">Dipesan Pada</th>
                        <th class="hidden lg:table-cell">Keterangan</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#if newData.length === 0}
                        <tr>
                            <td colspan="7" class="text-center text-base-content/60">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each newData as data, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td class="text-left font-medium">{data.NAMA}</td>
                                <td class="hidden sm:table-cell">{data.WHATSAPP}</td>
                                <td class="hidden lg:table-cell">{data.SALES}</td>
                                <td class="hidden md:table-cell">{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                                <td class="hidden lg:table-cell">{data.CATATAN}</td>
                                <td>
                                    <div class="flex items-center justify-center gap-1">
                                        <button type="button" onclick={() => removeItem(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-error">
                                            <img src="/icons/Delete.svg" alt="Hapus Pesanan" height="16"/>
                                        </button>
                                        {#if data.VALID === null}
                                            <button type="button" onclick={() => isValid(data.KODE, index)} class="btn btn-ghost btn-square btn-sm text-primary">
                                                <img src="/icons/Add.svg" alt="Validasi Pesanan" height="20"/>
                                            </button>
                                        {:else}
                                            <button type="button" class="btn btn-sm btn-success">Verified</button>
                                        {/if}
                                        <button type="button" onclick={() => viewItem(data.KODE)} class="btn btn-ghost btn-square btn-sm text-info">
                                            <img src="/icons/Share.svg" alt="Lihat Item" height="16"/>
                                        </button>
                                    </div>
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
        <h3 class="text-lg font-bold">Detail Pesanan</h3>
        <div class="divider my-3"></div>
        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle text-center">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama</th>
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
                            <td colspan="7" class="text-center text-base-content/60">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each carts as carts, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td class="text-left">
                                    {capitalizeEachWord(carts.NAMA)} <br/>
                                    <span class="font-extrabold text-warning">[{carts.DISTRIBUTOR}]</span>
                                </td>
                                <td class="text-center">{carts.JUMLAH}</td>
                                <td class="text-center">
                                    {#if carts.STOK < 30}
                                        <span class="font-extrabold text-error">{ carts.STOK }</span>
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
