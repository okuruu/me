<script lang="ts">
    import { Carbon } from "../../library/utils/useFormat";
    import type { Riwayat } from "../../library/types/riwayat";

    let { entries, title = "Riwayat Perubahan" }: { entries: Riwayat[]; title?: string } = $props();
</script>

{#if entries.length > 0}
    <div class="divider my-3"></div>

    <h4 class="mb-2 font-bold">{title}</h4>
    <div class="flex flex-col gap-3">
        {#each entries as catatan}
            <div class="rounded-lg border border-base-300 p-3">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="badge badge-ghost">{catatan.AKSI}</span>
                    <span class="text-sm font-medium">{catatan.OPERATOR}</span>
                    <span class="text-sm text-base-content/60">{Carbon(catatan.CREATED_AT, "timestamp")}</span>
                </div>
                {#if catatan.ALASAN}
                    <p class="mt-2 text-sm"><span class="font-medium">Alasan:</span> {catatan.ALASAN}</p>
                {/if}
                {#if catatan.CATATAN_SISTEM}
                    <p class="mt-2 whitespace-pre-line text-sm text-base-content/70">{catatan.CATATAN_SISTEM}</p>
                {/if}
            </div>
        {/each}
    </div>
{/if}
