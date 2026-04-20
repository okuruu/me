<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import { useString } from "../library/resources/useString";
</script>

<div class="min-vh-100 bg-base-100 pb-12">
  <div class="max-w-md mx-auto px-4">
    <Navbar />

    <!-- Profile Section -->
    <div class="flex items-center gap-6 px-6">
      <div class="avatar">
        <div
          class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shrink-0"
        >
          <img src="/images/avatar.jfif" alt="Avatar" />
        </div>
      </div>
      <div>
        <h1 class="card-title text-xl font-bold text-white mb-0">
          {useString.name}
        </h1>
        <p class="text-gray-400 font-small text-sm mt-1">{useString.bio}</p>

        <div
          class="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary/90"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>{useString.currentWorkplace.position}</span>
        </div>

        <div class="card-actions mt-2">
          <a
            href={useString.github.url}
            class="btn btn-ghost btn-xs lowercase text-base-content/60 px-0 hover:text-primary transition-colors"
          >
            {useString.github.username}
          </a>
        </div>
      </div>
    </div>

    <!-- About Section -->
    <div>
      <div class="card-body p-6">
        <h1 class="card-title">About Me</h1>
        <p
          class="text-base-content/80 text-gray-400 leading-relaxed text-sm whitespace-pre-line"
        >
          {useString.about}
        </p>
      </div>
    </div>

    <!-- Tech Stack Section -->
    <div class="px-6 mb-8 mt-2 space-y-6">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        Tech Stack
      </h2>

      <div class="space-y-4">
        <div>
          <h3
            class="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2"
          >
            Languages
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each useString.knowledge.language as item}
              <span class="badge badge-neutral shadow-sm">{item}</span>
            {/each}
          </div>
        </div>

        <div>
          <h3
            class="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2"
          >
            Frameworks & Libraries
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each useString.knowledge.using as item}
              <span class="badge badge-neutral shadow-sm">{item}</span>
            {/each}
          </div>
        </div>

        <div>
          <h3
            class="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2"
          >
            Databases
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each useString.knowledge.databases as item}
              <span class="badge badge-neutral shadow-sm">{item}</span>
            {/each}
          </div>
        </div>

        <div>
          <h3
            class="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2"
          >
            Tools
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each useString.knowledge.tools as item}
              <span class="badge badge-neutral shadow-sm">{item}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Experience Section -->
    <div class="px-6 mb-8 mt-2">
      <h2 class="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <svg
          class="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Experience
      </h2>

      <div
        class="relative border-l border-dashed border-base-content/20 ml-2.5 space-y-8 pb-4 pr-2"
      >
        {#each useString.experience as experience}
          <div class="relative pl-6 group">
            <div
              class="absolute -left-[5.5px] top-2 w-2.5 h-2.5 rounded-full bg-base-100 border-2 border-primary shadow-[0_0_8px_rgba(var(--p),0.5)] group-hover:bg-primary group-hover:scale-150 transition-all duration-300"
            ></div>

            <div class="flex flex-col gap-3">
              <div>
                <h3
                  class="text-[1.1rem] font-bold text-white group-hover:text-primary transition-colors duration-300 leading-tight"
                >
                  {experience.achievement}
                </h3>

                <div
                  class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-xs font-medium text-base-content/60"
                >
                  <div class="flex items-center gap-1.5 text-primary/80">
                    <span>{experience.name}</span>
                  </div>
                  <span
                    class="w-1 h-1 rounded-full bg-base-content/30 opacity-50"
                  ></span>
                  <div class="flex items-center gap-1.5 opacity-80">
                    <span class="tracking-widest uppercase"
                      >{experience.year}</span
                    >
                  </div>
                </div>
              </div>

              <div
                class="bg-base-200/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5 border-l-primary/30 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-300"
              >
                <div
                  class="text-[0.85rem] text-base-content/75 leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-1 prose-ul:pl-4"
                >
                  {@html experience.desc}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
