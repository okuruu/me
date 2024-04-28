<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { threadsLike } from "$lib/utils/threads/threadsLike";
    import { threadsTextCount } from "$lib/utils/threads/threadsTextCount";
    import { threadsTime } from "$lib/utils/threads/threadsTime";
    import { baseConfig } from "../../database/base";
    import { threads } from "../../database/threads";

    function viewThreads(id: number){
        if(threads[id].reply.view === false){
            threads[id].reply.view = true
        }
    }
</script>

<div class="container mx-auto p-3">
    {#each threads as data, index }
        
        <div class="max-w-[519px] border-b-[0.6px] border-gray-600 py-2 flex gap-3">
            <div class="thread flex flex-col gap-4 items-center">
                <div class="w-12 rounded-full">
                    <img src="/images/avatar.jfif" class="w-12 rounded-full" alt="">
                </div>
                {#if threadsTextCount(data.tweets) > 75}
                    <div class="border min-h-24"></div>
                {/if}
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-white">{baseConfig.workingAt.github.display}</span>
                        <img src="./icons/elements/Verified.svg" alt="">
                    </div>

                    <div class="info flex items-center gap-2">
                        <span>{threadsTime(data.timestamp)}</span>
                        <img src="./icons/elements/Dots.svg" class="cursor-not-allowed" alt="Options">
                    </div>
                </div>

                <div class="text-white me-1">
                    <p>{data.tweets}</p>
                </div>

                {#if data.images !== null}
                    <img src="/threads/{data.images}" class="rounded" alt="Gambar postingan" />                
                {/if}

                <div class="flex items-center gap-4">
                    <img src="/icons/elements/Heart.svg" class="cursor-not-allowed" alt="Likes">
                    <img src="/icons/elements/Comment.svg" class="cursor-not-allowed" alt="Comments">
                    <img src="/icons/elements/Reply.svg" class="cursor-not-allowed" alt="Replies">
                    <img src="/icons/elements/Share.svg" class="cursor-not-allowed" alt="Share">
                </div>

                <div id="footerId" class="flex items-center gap-2 text-gray-500">
                    <span>{data.replies} replies</span>
                    <span>&#8901;</span>
                    <span>{threadsLike(data.likes)} likes</span>
                </div>

                {#if data.reply.replies.length !== 0}
                    {#if !data.reply.view}
                        <button type="button" on:click={() => viewThreads(index)} class="btn btn-sm btn-ghost">Show threads</button>
                    {/if}
                    {#if data.reply.view}
                        <div class="p-1">
                            {#each data.reply.replies as replies }
                                <div class="max-w-[519px] py-2 flex gap-3">
                                    <div class="thread flex flex-col gap-4 items-center">
                                        <div class="w-12 rounded-full">
                                            <img src="/images/avatar.jfif" class="w-12 rounded-full" alt="">
                                        </div>
                                    </div>
                        
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-center justify-between gap-2">
                                            <div class="flex items-center gap-2">
                                                <span class="text-white">{baseConfig.workingAt.github.display}</span>
                                                <img src="./icons/elements/Verified.svg" alt="">
                                            </div>
                        
                                            <div class="info flex items-center gap-2">
                                                <span>{threadsTime(data.timestamp)}</span>
                                                <img src="./icons/elements/Dots.svg" class="cursor-not-allowed" alt="Options">
                                            </div>
                                        </div>
                        
                                        <div class="text-white me-1">
                                            <p>{replies.tweets}</p>
                                        </div>
                        
                                        {#if data.images !== null}
                                            <img src="/threads/{data.images}" class="rounded" alt="Gambar postingan" />                
                                        {/if}
                        
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}


            </div>
        </div>
    {/each}
    <div class="divider mb-12"></div>
    <NavigationBar/>
</div>