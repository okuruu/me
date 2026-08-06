<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";

    interface Member {
        ID: number;
        NAMA: string;
        LOKASI: string | null;
        WHATSAPP: string | null;
        POINT: number;
    }

    let daftarMember: Member[] = $state([]);
    let totalPoin: number = $state(0);
    let pencarian: string = $state('');

    // How many points the operator is about to add or take off, keyed by
    // member ID so every row keeps its own box.
    let jumlahPoin: Record<number, number> = $state({});

    // The row currently mid-request, so its two buttons can be disabled
    // without freezing the whole table.
    let sedangUbah: number | null = $state(null);

    let hasilCari: Member[] = $derived(
        pencarian.trim() === ''
            ? daftarMember
            : daftarMember.filter((m) => m.NAMA.toLowerCase().includes(pencarian.trim().toLowerCase()))
    );

    onMount(async () => muatPoin());

    async function muatPoin(): Promise<void> {
        const data = await useFetch('UD84/Poin/Retrieve');

        daftarMember = data?.MEMBER ?? [];
        totalPoin = Number(data?.TOTAL ?? 0);
    }

    async function ubahPoin(member: Member, arah: 'Tambah' | 'Kurang'): Promise<void> {
        const jumlah = Number(jumlahPoin[member.ID] ?? 0);

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            toast.error("Isi jumlah poin, minimal 1");
            return;
        }

        sedangUbah = member.ID;

        const { status, message } = await db({
            ID: member.ID,
            JUMLAH: jumlah,
            ARAH: arah,
        }, 'UD84/Poin/Adjust');

        sedangUbah = null;

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
        jumlahPoin[member.ID] = 0;

        // Reloaded rather than patched locally, so the number on screen is the
        // number the database holds.
        await muatPoin();
    }
</script>
<Ud84Navigation/>
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">

        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 class="card-title text-lg font-bold">Poin Member</h3>
            <div class="text-right">
                <span class="label-text block font-medium">Total Poin Terbit</span>
                <span class="text-2xl font-extrabold text-primary">{totalPoin}</span>
            </div>
        </div>

        <p class="text-sm text-base-content/60">
            Poin bertambah otomatis setiap pembayaran tunai kelipatan Rp 1.000.000.
            Gunakan tombol di bawah untuk menambah atau mengurangi poin secara manual.
        </p>

        <div class="mt-4">
            <label for="cariMember" class="label-text mb-1 block font-medium">Cari Member</label>
            <input id="cariMember" type="text" bind:value={pencarian} class="input input-bordered input-sm w-full sm:max-w-xs" placeholder="Nama member"/>
        </div>

        <div class="divider my-3"></div>

        <div class="overflow-x-auto">
            <table class="table table-zebra align-middle">
                <thead>
                    <tr class="font-bold">
                        <th>#</th>
                        <th class="text-left">Nama Member</th>
                        <th class="hidden md:table-cell">Lokasi</th>
                        <th class="hidden lg:table-cell">WhatsApp</th>
                        <th class="text-center">Poin</th>
                        <th class="text-center">Ubah Poin</th>
                    </tr>
                </thead>
                <tbody>
                    {#each hasilCari as member, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td class="text-left font-medium">{member.NAMA}</td>
                            <td class="hidden md:table-cell">{member.LOKASI ?? '-'}</td>
                            <td class="hidden lg:table-cell">{member.WHATSAPP ?? '-'}</td>
                            <td class="text-center">
                                {#if member.POINT > 0}
                                    <span class="badge badge-primary badge-lg font-extrabold">{member.POINT}</span>
                                {:else}
                                    <span class="text-base-content/50">0</span>
                                {/if}
                            </td>
                            <td>
                                <div class="flex flex-wrap items-center justify-center gap-1">
                                    <input type="number" min="1" bind:value={jumlahPoin[member.ID]} class="input input-bordered input-sm w-20 text-center" placeholder="0"/>
                                    <button type="button" onclick={() => ubahPoin(member, 'Tambah')} class="btn btn-sm btn-primary" disabled={sedangUbah === member.ID}>Tambah</button>
                                    <button type="button" onclick={() => ubahPoin(member, 'Kurang')} class="btn btn-sm btn-error" disabled={sedangUbah === member.ID}>Kurang</button>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="text-center text-base-content/60">Tidak ada member</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </div>
</div>
</div>
