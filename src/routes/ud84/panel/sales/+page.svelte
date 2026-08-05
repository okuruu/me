<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Sales {
        ID: number;
        NAMA: string;
        STATUS: "Aktif" | "Nonaktif";
        PESANAN: number;
        MEMBER: number;
        DAPAT_DIHAPUS: boolean;
    }

    let daftarSales: Sales[] = $state([]);
    let namaBaru: string = $state('');

    // ID of the row currently being renamed, and the draft name for it.
    let editingId: number | null = $state(null);
    let draftNama: string = $state('');

    onMount(async () => loadSales());

    async function loadSales(): Promise<void> {
        const response = await useFetch('UD84/Sales/Retrieve');
        daftarSales = response ?? [];
    }

    async function addSales(): Promise<void> {
        if (namaBaru.trim() === '') {
            toast.error("Nama sales tidak boleh kosong");
            return;
        }

        const { status, message } = await db({
            NAMA: namaBaru
        }, 'UD84/Sales/Insert');

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        namaBaru = '';
        loadSales();
    }

    function startEdit(sales: Sales): void {
        editingId = sales.ID;
        draftNama = sales.NAMA;
    }

    function cancelEdit(): void {
        editingId = null;
        draftNama = '';
    }

    async function saveEdit(sales: Sales): Promise<void> {
        if (draftNama.trim() === '') {
            toast.error("Nama sales tidak boleh kosong");
            return;
        }

        const { status, message } = await db({
            ID: sales.ID,
            NAMA: draftNama
        }, 'UD84/Sales/Update');

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        cancelEdit();
        loadSales();
    }

    async function toggleStatus(sales: Sales): Promise<void> {
        const tujuan = sales.STATUS === "Aktif" ? "Nonaktif" : "Aktif";

        const { status, message } = await db({
            ID: sales.ID,
            STATUS: tujuan
        }, 'UD84/Sales/Update');

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        loadSales();
    }

    async function removeSales(sales: Sales): Promise<void> {
        toast(`Hapus sales ${sales.NAMA}?`, {
            description: 'Tindakan ini tidak bisa dibatalkan.',
            action: {
                label: 'Ya, Hapus',
                onClick: async () => {
                    const { status, message } = await db({
                        ID: sales.ID
                    }, 'UD84/Sales/Delete');

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    toast.success(message);
                    loadSales();
                }
            },
        });
    }
</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">

        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Manajemen Sales</h3>
        </div>

        <form class="flex flex-col gap-2 sm:flex-row sm:items-end" onsubmit={addSales}>
            <div class="flex-1">
                <label for="namaSales" class="label-text mb-1 block font-medium">Nama Sales Baru</label>
                <input id="namaSales" type="text" bind:value={namaBaru} class="input input-bordered w-full sm:max-w-md" placeholder="Contoh: Budi" required/>
            </div>
            <button type="submit" class="btn btn-primary sm:shrink-0">Tambah Sales</button>
        </form>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama Sales</th>
                        <th class="text-center">Status</th>
                        <th class="hidden text-center md:table-cell">Pesanan</th>
                        <th class="hidden text-center md:table-cell">Member</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#each daftarSales as sales, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td class="text-left font-medium">
                                {#if editingId === sales.ID}
                                    <input type="text" bind:value={draftNama} class="input input-bordered input-sm w-full max-w-xs" placeholder="Nama Sales"/>
                                {:else}
                                    {sales.NAMA}
                                {/if}
                            </td>
                            <td class="text-center">
                                {#if sales.STATUS === "Aktif"}
                                    <span class="badge badge-success">Aktif</span>
                                {:else}
                                    <span class="badge badge-ghost">Nonaktif</span>
                                {/if}
                            </td>
                            <td class="hidden text-center md:table-cell">{sales.PESANAN}</td>
                            <td class="hidden text-center md:table-cell">{sales.MEMBER}</td>
                            <td>
                                <div class="flex flex-wrap items-center justify-center gap-1">
                                    {#if editingId === sales.ID}
                                        <button type="button" onclick={() => saveEdit(sales)} class="btn btn-sm btn-primary">Simpan</button>
                                        <button type="button" onclick={cancelEdit} class="btn btn-sm btn-ghost">Batal</button>
                                    {:else}
                                        <button type="button" onclick={() => startEdit(sales)} class="btn btn-sm btn-ghost text-info">Ubah</button>
                                        <button type="button" onclick={() => toggleStatus(sales)} class="btn btn-sm btn-ghost text-warning">
                                            {sales.STATUS === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                                        </button>
                                        {#if sales.DAPAT_DIHAPUS}
                                            <button type="button" onclick={() => removeSales(sales)} class="btn btn-sm btn-ghost text-error">Hapus</button>
                                        {:else}
                                            <span class="text-xs text-base-content/50" title="Sales ini sudah punya riwayat pesanan atau member. Nonaktifkan saja agar riwayatnya tetap utuh.">
                                                Tidak bisa dihapus
                                            </span>
                                        {/if}
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="text-center text-base-content/60">Belum ada sales terdaftar</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <p class="mt-3 text-sm text-base-content/60">
            Sales yang dinonaktifkan tidak muncul lagi saat memilih sales untuk pesanan baru,
            tetapi namanya tetap tampil pada pesanan dan member yang sudah ada.
        </p>

    </div>
</div>
</div>
