<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "../../../../library/hooks/db";
    import type { Testee } from "../../../../interface/Clyfar";
    import { Carbon } from "../../../../library/utils/useFormat";
    import sample_table from "../../../../json/sample_table.json";
    
    let newData: Testee[] = $state([]);

    $effect(() => {
        newData = sample_table;
    })
    
    async function view(id: string): Promise<void> {
        const { status, message, data } = await db({ token: id }, 'Clyfar/Check-Testee');
        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }
    }
</script>
<div class="table-responsive">
    <table class="table align-middle table-striped table-hover">
        <thead>
            <tr class="fw-bolder">
                <th>#</th>
                <th>Token</th>
                <th>Jenis Tes</th>
                <th>Nama</th>
                <th>Jenis Kelamin</th>
                <th>Tanggal Lahir / Usia</th>
                <th>WhatsApp</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#if newData.length === 0}
                <tr>
                    <td colspan="8" class="text-center">Tidak ada data</td>
                </tr>
            {:else}
                {#each newData as data, index }
                    <tr>
                        <td>{index + 1}</td>
                        <td>{data.TOKEN}</td>
                        <td>{data.LIST === null ? '-' : JSON.parse(data.LIST).join(", ")}</td>
                        <td>{data.NAMA ?? '-'}</td>
                        <td>
                            {#if data.GENDER === "Pria"}
                                <span class="badge badge-primary">{data.GENDER}</span>
                            {:else if data.GENDER === "Wanita"}
                                <span class="badge badge-info">{data.GENDER}</span>
                            {:else}
                                -
                            {/if}
                        </td>
                        <td>{data.TTL == null ? '-' : `${Carbon(data.TTL, "date")} / ${Carbon(data.TTL, "age")}`}</td>
                        <td>{data.WHATSAPP ?? '-'}</td>
                        <td>
                            <button type="button" onclick={() => view(data.TOKEN)} class="btn btn-sm btn-primary">Lihat</button>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>