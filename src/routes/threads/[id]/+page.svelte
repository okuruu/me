<script lang="ts">
    import Navbar from '../../../components/Navbar.svelte';
    import { Carbon, likesCount } from '../../../library/utils/useFormat';

    let { data } = $props();
</script>

<div class="min-vh-100 bg-base-100 pb-20">
    <div class="max-w-md mx-auto px-4">
        <Navbar/>
        
        <!-- Main Thread Container -->
        <div class="card bg-base-100 shadow-xl rounded-3xl overflow-hidden ring-1 ring-white/5">
          <div class="card-body p-0">
            <!-- OP Tweet -->
            <div class="p-6">
              <div class="flex gap-4">
                <div class="avatar shrink-0">
                  <div class="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src="/images/avatar.jfif" alt="Avatar" />
                  </div>
                </div>
                <div class="flex-grow">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-white text-base">gdydz</span>
                    <img src="/icons/Verified.svg" class="w-4 h-4" alt="Verified">
                    <span class="text-xs opacity-40 ml-1">· {Carbon(data.threads.timestamp, "timestamp")}</span>
                  </div>
                  <div class="text-lg leading-relaxed text-white mt-3 tracking-tight">
                    {data.threads.tweets}
                  </div>
                  
                  {#if data.threads.images !== null}
                    <div class="rounded-2xl overflow-hidden border border-white/5 my-4">
                      <img src="/threads/{data.threads.images}" alt="Main thread" class="w-full h-auto" />
                    </div>
                  {/if}

                  <div class="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
                      <div class="flex items-center gap-2 text-error">
                        <img src="/icons/Heart.svg" class="w-4 h-4 brightness-0 invert" alt="Likes">
                        <span class="text-sm font-bold">{likesCount(data.threads.likes)}</span>
                      </div>
                      <div class="flex items-center gap-2 opacity-30">
                        <img src="/icons/Comment.svg" class="w-4 h-4" alt="Comments">
                        <span class="text-sm">-</span>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Replies Section -->
            {#if data.threads.reply.replies.length !== 0}
              <div class="bg-base-200/50 pt-2 pb-6 px-6">
                <div class="divider text-[10px] opacity-20 uppercase font-bold tracking-widest mb-8">Thread Replies</div>
                
                <div class="space-y-10 relative">
                  <!-- Thread Line -->
                  <div class="absolute left-[24px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent opacity-20 hidden sm:block"></div>

                  {#each data.threads.reply.replies as reply, index}
                    <div class="flex gap-4 relative">
                      <div class="avatar shrink-0 z-10">
                        <div class="w-10 h-10 rounded-full ring ring-white/10 ring-offset-base-100 ring-offset-2">
                          <img src="/images/avatar.jfif" alt="Reply Avatar" />
                        </div>
                      </div>
                      <div class="flex-grow">
                        <div class="flex items-center gap-1.5 mb-1">
                          <span class="font-bold text-white text-sm">gdydz</span>
                          <img src="/icons/Verified.svg" class="w-3.5 h-3.5" alt="Verified">
                        </div>
                        <div class="text-[15px] leading-relaxed text-base-content/90 tracking-tight">
                          {@html reply.tweets}
                        </div>
                        
                        {#if reply.images !== null}
                          <div class="rounded-2xl overflow-hidden border border-white/5 my-4">
                            <img src="/threads/{reply.images}" alt="Reply content" class="w-full h-auto" />
                          </div>
                        {/if}

                        <p class="text-[10px] opacity-20 font-bold uppercase tracking-wider mt-4">
                          {#if index === data.threads.reply.replies.length - 1}
                            · End of conversation
                          {:else}
                            · Continuous thread
                          {/if}
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
    </div>
</div>