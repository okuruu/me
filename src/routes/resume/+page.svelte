<script lang="ts">
    import content from '$library/json/content.json';
    import { getSkillStyle } from '$library/utils/skillColors';
    import { theme } from '$library/stores/theme';

    const { personal, resume } = content;
</script>

<svelte:head>
    <title>{personal.name} – Résumé</title>
    <meta name="description" content="Résumé of {personal.name}, {personal.title}." />
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div data-theme={$theme} class="print:block">

    <!-- Print button – hidden when printing -->
    <div class="no-print sticky top-0 z-10 bg-base-100 border-b border-base-300 px-8 py-3 flex items-center justify-between">
        <a href="/" class="label-text-sm hover:text-accent transition-colors">← Portfolio</a>
        <button
            on:click={() => window.print()}
            class="btn btn-sm btn-ghost border border-base-300 hover:border-accent/40 hover:text-accent hover:bg-transparent normal-case font-normal text-xs"
        >
            Print / Save PDF
        </button>
    </div>

    <main class="max-w-[52rem] mx-auto px-8 py-10 print:px-0 print:py-0">

        <!-- Header -->
        <header class="mb-8 print:mb-6">
            <h1 class="font-display text-4xl font-bold text-base-content mb-1">{personal.name}</h1>
            <p class="text-base text-base-content/60 mb-4">{personal.title}</p>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-base-content/60">
                <a href="mailto:{personal.email}" class="hover:text-accent transition-colors print:no-underline">{personal.email}</a>
                {#if personal.linkedin}
                    <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" class="hover:text-accent transition-colors print:no-underline">linkedin.com/in/gilbydhilega</a>
                {/if}
                {#if personal.github}
                    <a href={personal.github} target="_blank" rel="noopener noreferrer" class="hover:text-accent transition-colors print:no-underline">github.com/okuruu</a>
                {/if}
            </div>
        </header>

        <div class="w-full h-px bg-base-300 mb-8 print:mb-6"></div>

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-10 print:grid-cols-[1fr_16rem] print:gap-8">

            <!-- Left: Experience -->
            <section>
                <p class="label-text-sm mb-4">Experience</p>
                <div class="space-y-7">
                    {#each resume.experience as entry}
                        <div>
                            <div class="flex items-start justify-between gap-4 mb-0.5">
                                <p class="font-display font-semibold text-base-content">{entry.title}</p>
                                <p class="text-xs text-base-content/40 shrink-0 pt-0.5">{entry.period}</p>
                            </div>
                            <p class="text-sm text-base-content/50 mb-2">{entry.company}</p>
                            {#if entry.description}
                                <p class="text-sm text-base-content/65 leading-relaxed">{entry.description}</p>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Right: Education + Skills -->
            <div class="flex flex-col gap-8">

                <section>
                    <p class="label-text-sm mb-4">Education</p>
                    <div class="space-y-5">
                        {#each resume.education as entry}
                            <div>
                                <p class="font-display font-semibold text-sm text-base-content">{entry.degree}</p>
                                <p class="text-sm text-base-content/50">{entry.school}</p>
                                {#if entry.scholarship}
                                    <p class="text-xs text-accent mt-0.5">{entry.scholarship}</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </section>

                <section>
                    <p class="label-text-sm mb-4">Skills & Tools</p>
                    <div class="space-y-4">
                        {#each resume.skills as group}
                            <div>
                                <p class="text-xs font-medium text-base-content/40 uppercase tracking-wider mb-2">{group.category}</p>
                                <div class="flex flex-wrap gap-1.5">
                                    {#each group.tools as tool}
                                        <span class="text-xs px-2 py-0.5 rounded border" style={getSkillStyle(tool)}>{tool}</span>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                </section>

            </div>
        </div>

    </main>
</div>

<style>
    @media print {
        :global(body) {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .no-print {
            display: none !important;
        }

        :global(.badge),
        :global(span[style]) {
            border: 1px solid #ddd !important;
        }
    }
</style>
