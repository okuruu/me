<script lang="ts">
    import Navbar from "../../components/Navbar.svelte";
    import { Carbon, likesCount } from "../../library/utils/useFormat";

    interface Threads {
        tweets: string;
        images: string[] | null;
        timestamp: string;
        replies: number;
        likes: number;
    }

    const { data } = $props();

    let threads: Threads[] = $state(data.threads);
</script>

<div class="min-vh-100 bg-base-300 pb-12">
    <div class="max-w-md mx-auto px-4">
        <Navbar/>
        
        <div class="space-y-4">
            {#each threads as thread, index }
                <a href="/threads/{index}" class="block group">
                    <div class="card bg-base-100 shadow-md hover:shadow-xl hover:bg-base-200 ring-1 ring-white/5 transition-all duration-300 rounded-3xl overflow-hidden">
                        <div class="card-body p-6">
                            <div class="flex gap-4">
                                <!-- Avatar -->
                                <div class="avatar shrink-0">
                                    <div class="w-10 h-10 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-2">
                                        <img src="/images/avatar.jfif" alt="Avatar" />
                                    </div>
                                </div>
                                
                                <div class="flex-grow">
                                    <!-- Header -->
                                    <div class="flex items-center gap-1.5 mb-1">
                                        <span class="font-bold text-white text-sm">gdydz</span>
                                        <img src="/icons/Verified.svg" class="w-4 h-4" alt="Verified">
                                        <span class="text-xs opacity-40 ml-1">· {Carbon(thread.timestamp, "timestamp")}</span>
                                    </div>
                                    
                                    <!-- Tweet Content -->
                                    <div class="text-[15px] leading-relaxed text-base-content/90 tracking-tight mb-4">
                                        {@html thread.tweets}
                                    </div>
                                    
                                    <!-- Images -->
                                    {#if thread.images !== null}
                                        <div class="rounded-2xl overflow-hidden border border-white/5 mb-4 shadow-inner">
                                            <img src="/threads/{thread.images}" alt="Thread content" class="w-full h-auto object-cover max-h-[400px]" />
                                        </div>
                                    {/if}
                                    
                                    <!-- Footer Stats -->
                                    <div class="flex items-center justify-between mt-2 max-w-[280px]">
                                        <div class="flex items-center gap-1.5 opacity-50 hover:opacity-100 hover:text-error transition-all group/stat">
                                            <div class="btn btn-ghost btn-circle btn-xs h-7 w-7 group-hover/stat:bg-error/10">
                                              <img src="/icons/Heart.svg" class="w-3.5 h-3.5 group-hover/stat:brightness-0 group-hover/stat:invert" alt="Likes">
                                            </div>
                                            <span class="text-xs font-medium">{likesCount(thread.likes)}</span>
                                        </div>
                                        
                                        <div class="btn btn-ghost btn-circle btn-xs h-7 w-7 opacity-30 hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all">
                                          <img src="/icons/Comment.svg" class="w-3.5 h-3.5" alt="Comments">
                                        </div>

                                        <div class="btn btn-ghost btn-circle btn-xs h-7 w-7 opacity-30 hover:opacity-100 hover:bg-success/10 hover:text-success transition-all">
                                          <img src="/icons/Reply.svg" class="w-3.5 h-3.5" alt="Replies">
                                        </div>

                                        <div class="btn btn-ghost btn-circle btn-xs h-7 w-7 opacity-30 hover:opacity-100 hover:bg-info/10 hover:text-info transition-all">
                                          <img src="/icons/Share.svg" class="w-3.5 h-3.5" alt="Share">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
