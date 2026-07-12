<script lang="ts">
    import content from '$library/json/content.json';
    import ProjectCard from '$library/components/ProjectCard.svelte';
    import MiniCard from '$library/components/MiniCard.svelte';
    import type { Project, MoreWorkItem, Stat } from '$library/types';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { getSkillStyle } from '$library/utils/skillColors';
    import { theme, toggleTheme } from '$library/stores/theme';

    const { personal, about, resume } = content;
    const stats = about.stats as Stat[];
    const projects = content.projects as Project[];
    const moreWork = content.moreWork as MoreWorkItem[];

    let imgError = false;

    type Tab = 'about' | 'resume' | 'work';
    const tabs: Tab[] = ['about', 'resume', 'work'];
    let activeTab: Tab = 'about';

    onMount(() => {
        const t = new URLSearchParams(location.search).get('tab') as Tab;
        if (tabs.includes(t)) activeTab = t;
    });

    type WorkTab = 'systems' | 'automation';
    let activeWorkTab: WorkTab = 'systems';

    $: isDark = $theme === 'portfolio-dark';
    $: systemsProjects = projects.filter((p) => p.tab === 'systems');
    $: automationProjects = projects.filter((p) => p.tab === 'automation');
    $: visibleProjects = activeWorkTab === 'systems' ? systemsProjects : automationProjects;

    const initials = personal.name.split(' ').map((n) => n[0]).join('');
</script>

<svelte:head>
    <title>{personal.name} – Portfolio</title>
    <meta property="og:title" content="{personal.name} – {personal.title}" />
    <meta property="og:description" content={personal.bio[0]} />
    {#if personal.siteUrl}<meta property="og:url" content={personal.siteUrl} />{/if}
</svelte:head>

<!-- ─── TOP BAR ─────────────────────────────────────────────────── -->
<header class="sticky top-0 z-50 bg-base-100 border-b border-base-300">
    <div class="max-w-4xl mx-auto px-6 md:px-8 h-14 flex items-center gap-4">

        <!-- Avatar + name -->
        <div class="flex items-center gap-3 shrink-0">
            <div class="w-8 h-8 rounded-full border-2 border-base-300 bg-base-200 flex items-center justify-center shrink-0">
                <span class="font-display text-xs font-bold text-base-content/50">{initials}</span>
            </div>
            <div class="hidden sm:block">
                <p class="font-display text-sm font-semibold text-base-content leading-tight">{personal.name}</p>
                <p class="text-xs text-base-content/50 leading-tight">{personal.title}</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-0 ml-auto" role="tablist">
            {#each tabs as tab}
                <button
                    role="tab"
                    aria-selected={activeTab === tab}
                    class="px-3 sm:px-4 h-14 text-sm border-b-2 transition-colors capitalize {activeTab === tab ? 'border-base-content text-base-content font-medium' : 'border-transparent text-base-content/50 hover:text-base-content'}"
                    on:click={() => (activeTab = tab)}
                >
                    {tab === 'about' ? 'About' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            {/each}
        </div>

        <!-- Theme toggle -->
        <button
            on:click={toggleTheme}
            aria-label="Toggle theme"
            class="flex items-center gap-1.5 shrink-0 border border-base-300 rounded-full px-2.5 py-1 hover:border-accent/50 transition-colors"
        >
            <span class="text-xs {isDark ? 'text-base-content/30' : 'text-base-content/70'}">☀</span>
            <div class="w-7 h-3.5 rounded-full relative transition-colors {isDark ? 'bg-accent' : 'bg-base-300'}">
                <div class="w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all {isDark ? 'right-0.5' : 'left-0.5'} shadow-sm"></div>
            </div>
            <span class="text-xs {isDark ? 'text-base-content/70' : 'text-base-content/30'}">🌙</span>
        </button>

    </div>
</header>

<!-- ─── MAIN ──────────────────────────────────────────────────────── -->
<main class="max-w-4xl mx-auto px-6 md:px-8">

    <!-- ─── BIO STRIP ──────────────────────────────────────────────── -->
    <section class="py-8 border-b border-base-300">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-base-300 bg-base-300 flex items-center justify-center shrink-0">
                {#if !imgError}
                    <img src="/images/profile.jfif" alt={personal.name} fetchpriority="high" loading="eager" class="w-full h-full object-cover" />
                {:else}
                    <span class="font-display text-xl font-bold text-base-content/30">{initials}</span>
                {/if}
            </div>
            <div class="flex-1 min-w-0">
                <h1 class="font-display text-2xl md:text-3xl font-bold text-base-content mb-1">{personal.name}</h1>
                <p class="text-sm text-base-content/60 leading-relaxed mb-3">{personal.bio[0]}</p>
                <div class="flex flex-wrap gap-2 items-center">
                    {#if personal.available}
                        <span class="flex items-center gap-1.5 label-text-sm !text-accent mr-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            {personal.availabilityLabel}
                        </span>
                    {/if}
                    {#if personal.currentFocus}
                        <span class="w-full text-xs text-base-content/45 mb-1">
                            <span class="text-accent mr-1">▸</span>{personal.currentFocus}
                        </span>
                    {/if}
                    <a href="mailto:{personal.email}" class="btn btn-xs btn-ghost border border-base-300 hover:border-accent/40 hover:text-accent hover:bg-transparent normal-case font-normal">✉ Email</a>
                    {#if personal.linkedin}
                        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-ghost border border-base-300 hover:border-accent/40 hover:text-accent hover:bg-transparent normal-case font-normal">LinkedIn</a>
                    {/if}
                    {#if personal.github}
                        <a href={personal.github} target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-ghost border border-base-300 hover:border-accent/40 hover:text-accent hover:bg-transparent normal-case font-normal">GitHub</a>
                    {/if}
                </div>
            </div>
        </div>
    </section>

    <!-- ─── TAB CONTENT ─────────────────────────────────────────────── -->
    {#key activeTab}
        <div in:fly={{ y: 12, duration: 220 }}>

            <!-- ─── TAB: ABOUT ────────────────────────────────────────── -->
            {#if activeTab === 'about'}
                <div class="py-10 space-y-16">

                    <div in:fly={{ y: 24, duration: 380, delay: 0 }}>
                        <p class="label-text-sm mb-2">About me</p>
                        <div class="accent-bar"></div>
                        {#each about.intro as paragraph}
                            <p class="text-base text-base-content/70 leading-relaxed mb-4">{paragraph}</p>
                        {/each}
                    </div>

                    <div in:fly={{ y: 24, duration: 300, delay: 60 }}>
                        <p class="label-text-sm mb-2">Impact</p>
                        <div class="accent-bar"></div>
                        <h2 class="font-display text-2xl font-semibold mb-6">By the numbers</h2>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {#each stats as stat}
                                <div class="bg-base-200 rounded-lg p-4 border border-base-300 flex flex-col gap-1">
                                    <p class="font-display text-2xl font-bold text-accent leading-none">{stat.value}</p>
                                    <p class="text-xs text-base-content/55 leading-snug">{stat.label}</p>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <div in:fly={{ y: 24, duration: 300, delay: 120 }}>
                        <p class="label-text-sm mb-2">Services</p>
                        <div class="accent-bar"></div>
                        <h2 class="font-display text-2xl font-semibold mb-6">What I offer</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {#each about.services as service}
                                <div class="bg-base-200 rounded-lg p-5 border border-base-300">
                                    <h3 class="font-display font-semibold mb-1">{service.title}</h3>
                                    <p class="text-sm text-base-content/60 leading-relaxed">{service.description}</p>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <div in:fly={{ y: 24, duration: 300, delay: 180 }}>
                        <p class="label-text-sm mb-2">Process</p>
                        <div class="accent-bar"></div>
                        <h2 class="font-display text-2xl font-semibold mb-6">How I work</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {#each about.process as step}
                                <div class="flex flex-col gap-3">
                                    <div class="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-display font-semibold text-sm shrink-0">{step.step}</div>
                                    <h3 class="font-display font-semibold">{step.title}</h3>
                                    <p class="text-sm text-base-content/60 leading-relaxed">{step.description}</p>
                                </div>
                            {/each}
                        </div>
                    </div>

                </div>

            <!-- ─── TAB: RESUME ───────────────────────────────────────── -->
            {:else if activeTab === 'resume'}
                <div class="py-10">
                    <div class="flex justify-end mb-6">
                        <a href="/resume" class="btn btn-xs btn-ghost border border-base-300 hover:border-accent/40 hover:text-accent hover:bg-transparent normal-case font-normal">Print résumé ↗</a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">

                        <!-- Experience – wide left column -->
                        <div in:fly={{ y: 24, duration: 350, delay: 0 }}>
                            <p class="label-text-sm mb-2">Experience</p>
                            <div class="accent-bar"></div>
                            <div class="space-y-6">
                                {#each resume.experience as entry}
                                    <div>
                                        <p class="font-display font-semibold">{entry.title}</p>
                                        <p class="text-sm text-base-content/60">{entry.company}</p>
                                        <p class="label-text-sm mt-0.5 mb-2">{entry.period}</p>
                                        {#if entry.description}
                                            <p class="text-sm text-base-content/60 leading-relaxed">{entry.description}</p>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <!-- Education + Skills – stacked right column -->
                        <div class="flex flex-col gap-10">

                            <div in:fly={{ y: 24, duration: 350, delay: 70 }}>
                                <p class="label-text-sm mb-2">Education</p>
                                <div class="accent-bar"></div>
                                <div class="space-y-6">
                                    {#each resume.education as entry}
                                        <div>
                                            <p class="font-display font-semibold">{entry.degree}</p>
                                            <p class="text-sm text-base-content/60">{entry.school}</p>
                                            {#if entry.period}
                                                <p class="label-text-sm mt-0.5">{entry.period}</p>
                                            {/if}
                                            {#if entry.scholarship}
                                                <p class="label-text-sm mt-1">{entry.scholarship}</p>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <div in:fly={{ y: 24, duration: 350, delay: 140 }}>
                                <p class="label-text-sm mb-2">Skills & Tools</p>
                                <div class="accent-bar"></div>
                                <div class="space-y-5">
                                    {#each resume.skills as group}
                                        <div>
                                            <p class="font-display font-semibold text-sm mb-2">{group.category}</p>
                                            <div class="flex flex-wrap gap-2">
                                                {#each group.tools as tool}
                                                    <span class="badge border text-xs font-normal" style={getSkillStyle(tool)}>{tool}</span>
                                                {/each}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            <!-- ─── TAB: WORK ─────────────────────────────────────────── -->
            {:else if activeTab === 'work'}
                <div class="py-10">

                    <div class="flex gap-4 mb-2" role="tablist">
                        <button role="tab" aria-selected={activeWorkTab === 'systems'} class="text-sm pb-1 border-b-2 transition-colors {activeWorkTab === 'systems' ? 'border-base-content text-base-content font-medium' : 'border-transparent text-base-content/50 hover:text-base-content'}" on:click={() => (activeWorkTab = 'systems')}>Systems & Apps</button>
                        <button role="tab" aria-selected={activeWorkTab === 'automation'} class="text-sm pb-1 border-b-2 transition-colors {activeWorkTab === 'automation' ? 'border-base-content text-base-content font-medium' : 'border-transparent text-base-content/50 hover:text-base-content'}" on:click={() => (activeWorkTab = 'automation')}>AI & Automation</button>
                    </div>
                    <div class="border-b border-base-300 mb-8"></div>

                    {#key activeWorkTab}
                        <div in:fly={{ y: 12, duration: 200 }}>
                            {#each visibleProjects as project (project.slug)}
                                <ProjectCard {project} />
                            {/each}
                        </div>
                    {/key}

                    <div class="mt-16">
                        <p class="label-text-sm mb-2">More Work</p>
                        <div class="accent-bar"></div>
                        <h2 class="font-display text-xl font-semibold mb-6">Other projects</h2>
                        <div class="grid grid-cols-2 gap-4">
                            {#each moreWork as item}
                                <MiniCard {item} />
                            {/each}
                        </div>
                    </div>

                </div>
            {/if}

        </div>
    {/key}

    <!-- ─── FOOTER ────────────────────────────────────────────────────── -->
    <footer class="py-8 border-t border-base-300 text-center">
        <p class="label-text-sm">© {new Date().getFullYear()} {personal.name}. All rights reserved.</p>
    </footer>

</main>
