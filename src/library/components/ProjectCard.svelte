<script lang="ts">
    import type { Project } from '$library/types';

    export let project: Project;

    const statusStyle: Record<string, string> = {
        'In Production': 'text-emerald-500',
        'In Progress':   'text-amber-500',
        'Shipped':       'text-base-content/40',
    };

    $: dotColor = project.status === 'In Production'
        ? 'bg-emerald-500'
        : project.status === 'In Progress'
        ? 'bg-amber-500'
        : '';
</script>

<a href="/projects/{project.slug}" class="group flex items-start gap-4 py-6 border-b border-base-300 hover:no-underline">
    <span class="label-text-sm pt-1 min-w-[2rem] shrink-0">{project.number}</span>

    <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
            <span class="label-text-sm">{project.category}</span>
            <span class="flex items-center gap-1.5 text-xs font-medium {statusStyle[project.status] ?? 'text-base-content/40'}">
                {#if dotColor}
                    <span class="w-1.5 h-1.5 rounded-full {dotColor} {project.status === 'In Production' ? 'animate-pulse' : ''}"></span>
                {/if}
                {project.status}
            </span>
        </div>

        <h3 class="font-display text-xl font-semibold text-base-content group-hover:text-accent transition-colors mb-1">{project.title}</h3>

        <p class="text-sm text-base-content/60 mb-3 leading-relaxed">{project.subtitle}</p>

        <div class="flex flex-wrap gap-2 mb-4">
            {#each project.tags as tag}
                <span class="badge badge-ghost border-base-300 text-base-content/60 text-xs font-normal">{tag}</span>
            {/each}
        </div>

        <span class="text-sm text-accent font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">View case study →</span>
    </div>
</a>

