<script lang="ts">
    import type { PageData } from './$types';
    import type { ProjectSection } from '$library/types';
    import { fly } from 'svelte/transition';

    export let data: PageData;
    const { project } = data;

    function body(s: ProjectSection & { type: 'text' }) { return s.body; }
    function items(s: ProjectSection & { type: 'list' }) { return s.items; }
    function cards(s: ProjectSection & { type: 'cards' }) { return s.cards; }
    function metrics(s: ProjectSection & { type: 'metrics' }) { return s.metrics; }
    function steps(s: ProjectSection & { type: 'steps' }) { return s.steps; }
    function imageSrc(s: ProjectSection & { type: 'image' }) { return s.src; }
    function imageAlt(s: ProjectSection & { type: 'image' }) { return s.alt; }
    function imageCaption(s: ProjectSection & { type: 'image' }) { return s.caption; }
</script>

<svelte:head>
    <title>{project.title} — Gilby Dhilega</title>
    <meta name="description" content={project.subtitle} />
    <meta property="og:title" content={project.title} />
    <meta property="og:description" content={project.subtitle} />
    <meta property="og:type" content="article" />
</svelte:head>

<main class="max-w-3xl mx-auto px-6 md:px-8">

    <!-- ─── BACK LINK ────────────────────────────────────────── -->
    <div class="pt-8 mb-8">
        <a href="/?tab=work" class="inline-flex items-center gap-2 label-text-sm hover:text-accent transition-colors">← Back to home</a>
    </div>

    <!-- ─── PROJECT HEADER ───────────────────────────────────── -->
    <header class="pb-10 border-b border-base-300" in:fly={{ y: 20, duration: 350, delay: 0 }}>
        <p class="label-text-sm mb-3">Project {project.number}</p>
        <h1 class="font-display text-3xl md:text-4xl font-bold text-base-content mb-3">{project.title}</h1>
        <p class="text-base text-base-content/60 leading-relaxed mb-5">{project.subtitle}</p>
        <div class="flex flex-wrap gap-2 mb-5">
            {#each project.tags as tag}
                <span class="badge badge-ghost border-base-300 text-xs font-normal text-base-content/60">{tag}</span>
            {/each}
        </div>

        {#if project.links}
            <div class="flex flex-wrap gap-3">
                {#if project.links.playStore}
                    <a href={project.links.playStore} target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.18 23.76c.3.17.64.22.97.15l13.2-7.62-2.88-2.88-11.29 10.35zm-1.85-20.4A1.99 1.99 0 001 4.8v14.4c0 .57.22 1.1.59 1.5l.08.08 8.07-8.07v-.19L1.33 4.45l-.0-.09zm17.6 8.42l-2.25-1.3-3.17 3.17 3.17 3.17 2.28-1.32a2.01 2.01 0 000-3.72zm-16.6-9.6l11.29 10.35 2.88-2.88L5.4.14c-.33-.2-.73-.24-1.07-.06L2.33 2.18z"/>
                        </svg>
                        Google Play
                    </a>
                {/if}
                {#if project.links.appStore}
                    <a href={project.links.appStore} target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        App Store
                    </a>
                {/if}
                {#if project.links.live}
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        ↗ Live site
                    </a>
                {/if}
                {#if project.links.github}
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-base-200 border border-base-300 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        GitHub
                    </a>
                {/if}
            </div>
        {/if}
    </header>

    <!-- ─── META ROW ─────────────────────────────────────────── -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-base-300" in:fly={{ y: 20, duration: 350, delay: 60 }}>
        <div>
            <p class="label-text-sm mb-1">Team</p>
            <p class="text-sm">{project.meta.team}</p>
        </div>
        <div>
            <p class="label-text-sm mb-1">Role</p>
            <p class="text-sm">{project.meta.role}</p>
        </div>
        <div>
            <p class="label-text-sm mb-1">Tools</p>
            <p class="text-sm">{project.meta.tools}</p>
        </div>
        <div>
            <p class="label-text-sm mb-1">Status</p>
            <p class="text-sm">{project.meta.status}</p>
        </div>
    </div>

    <!-- ─── SECTIONS ──────────────────────────────────────────── -->
    {#each project.sections as section, i}
        <section class="cs-section" in:fly={{ y: 20, duration: 280, delay: Math.min(80 + i * 40, 280) }}>
            <p class="label-text-sm mb-2">{section.label}</p>
            <div class="accent-bar"></div>
            <h2 class="font-display text-2xl font-semibold text-base-content mb-5">{section.heading}</h2>

            {#if section.type === 'text'}
                <p class="text-base text-base-content/70 leading-relaxed">{body(section)}</p>

            {:else if section.type === 'list'}
                <ul class="space-y-3">
                    {#each items(section) as item}
                        <li class="flex items-start gap-3 text-base text-base-content/70 leading-relaxed">
                            <span class="text-accent mt-1 shrink-0">—</span>
                            {item}
                        </li>
                    {/each}
                </ul>

            {:else if section.type === 'cards'}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {#each cards(section) as card}
                        <div class="bg-base-200 rounded-lg p-5 border border-base-300">
                            <h3 class="font-display font-semibold mb-1">{card.title}</h3>
                            <p class="text-sm text-base-content/60 leading-relaxed">{card.description}</p>
                        </div>
                    {/each}
                </div>

            {:else if section.type === 'metrics'}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {#each metrics(section) as metric}
                        <div class="bg-base-200 rounded-lg p-5 border border-base-300">
                            <p class="font-display text-4xl font-bold text-accent mb-1">{metric.value}</p>
                            <p class="text-sm text-base-content/60">{metric.label}</p>
                        </div>
                    {/each}
                </div>

            {:else if section.type === 'steps'}
                <div class="space-y-12">
                    {#each steps(section) as step, si}
                        <div class="flex gap-5">
                            <div class="flex flex-col items-center gap-3 shrink-0">
                                <div class="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-display font-semibold text-sm">{si + 1}</div>
                                {#if si < steps(section).length - 1}
                                    <div class="w-px flex-1 bg-base-300"></div>
                                {/if}
                            </div>
                            <div class="pb-4">
                                <h3 class="font-display font-semibold text-lg mb-1">{step.title}</h3>
                                <p class="text-sm text-base-content/60 leading-relaxed mb-4">{step.description}</p>
                                {#if step.image}
                                    <div class="rounded-lg overflow-hidden border border-base-300">
                                        <img src={step.image} alt={step.title} loading="lazy" class="w-full object-cover" />
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

            {:else if section.type === 'image'}
                <figure>
                    <div class="rounded-lg overflow-hidden border border-base-300">
                        <img src={imageSrc(section)} alt={imageAlt(section)} loading="lazy" class="w-full object-cover" />
                    </div>
                    {#if imageCaption(section)}
                        <figcaption class="text-xs text-center text-base-content/50 mt-3">{imageCaption(section)}</figcaption>
                    {/if}
                </figure>
            {/if}

        </section>
    {/each}

    <!-- ─── FOOTER ───────────────────────────────────────────── -->
    <footer class="py-8 text-center">
        <a href="/" class="label-text-sm hover:text-accent transition-colors">← Back to home</a>
    </footer>

</main>
