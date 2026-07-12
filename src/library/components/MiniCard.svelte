<script lang="ts">
    import type { MoreWorkItem } from '$library/types';

    export let item: MoreWorkItem;
</script>

<div class="group cursor-default">
    <div class="overflow-hidden rounded-lg border border-base-300 group-hover:border-accent/40 transition-colors mb-3">
        <div class="aspect-[16/10] overflow-hidden bg-base-200">
            {#if item.image}
                <img src={item.image} alt={item.title} loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {:else}
                <div class="w-full h-full flex items-center justify-center bg-base-300">
                    <span class="label-text-sm">{item.category}</span>
                </div>
            {/if}
        </div>
    </div>

    <p class="font-display text-sm font-semibold text-base-content">{item.title}</p>
    <p class="label-text-sm mt-0.5">{item.category}</p>
</div>

