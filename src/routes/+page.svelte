<script lang="ts">
    import Navbar from "../components/Navbar.svelte";
    import { useString } from "../library/resources/useString";
</script>

<div class="min-vh-100 bg-base-300 pb-12">
    <div class="max-w-md mx-auto px-4">
        <Navbar/>
        
        <!-- Profile Section -->
        <div class="card bg-base-100 shadow-xl overflow-hidden mb-8">
          <div class="card-body flex-row items-center gap-6 p-6">
            <div class="avatar">
              <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shrink-0">
                <img src="/images/avatar.jfif" alt="Avatar" />
              </div>
            </div>
            <div>
              <h1 class="card-title text-2xl font-bold text-white mb-0">{useString.name}</h1>
              <p class="text-primary font-medium text-sm mt-1">{useString.bio}</p>
              <div class="card-actions mt-3">
                <a href="{useString.github.url}" class="btn btn-ghost btn-xs lowercase text-base-content/60 px-0 hover:text-primary transition-colors">
                  {useString.github.username}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider opacity-20 my-10 px-12 text-primary uppercase font-bold text-xs tracking-widest">About Me</div>

        <!-- About Section -->
        <div class="card bg-base-100 shadow-md mb-8 ring-1 ring-white/5">
          <div class="card-body p-6">
            <p class="text-base-content/80 leading-relaxed text-sm">
              {useString.about}
            </p>
          </div>
        </div>

        <div class="divider opacity-20 my-10 px-12 text-primary uppercase font-bold text-xs tracking-widest">Experience</div>

        <!-- Experience List -->
        <div class="space-y-4">
            {#each useString.experience as experience}
                <div class="card bg-base-200 border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                    <div class="card-body p-6">
                        <div class="flex flex-col gap-1">
                          <span class="badge badge-primary badge-outline font-bold text-[10px] lowercase py-0.5 h-auto">{experience.year}</span>
                          <h3 class="text-lg font-bold text-white mt-1">{experience.name}</h3>
                          <p class="text-primary font-semibold text-xs tracking-wide">{experience.achievement}</p>
                        </div>
                        <div class="mt-4 text-sm text-base-content/70 leading-relaxed prose prose-sm prose-invert">
                            {@html experience.desc}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
