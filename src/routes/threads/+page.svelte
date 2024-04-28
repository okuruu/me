<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { threadsLike } from "$lib/utils/threads/threadsLike";
    import { threadsTime } from "$lib/utils/threads/threadsTime";
    import { baseConfig } from "../../database/base";
    import { threads } from "../../database/threads";
</script>

<div class="container mx-auto p-3">
    {#each threads as data }
        
        <div class="max-w-[519px] border-b-[0.6px] border-gray-600 py-2 flex gap-3">
            <div class="thread flex flex-col gap-4 items-center">
                <div class="w-12 rounded-full">
                    <img src="/images/avatar.jfif" class="w-12 rounded-full" alt="">
                </div>
                <div class="border min-h-12"></div>
            </div>

            <div class="flex flex-col gap-2">
                <div class="thread-data flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-white">{baseConfig.workingAt.github.display}</span>
                        <img src="./icons/elements/Verified.svg" alt="">
                    </div>

                    <div class="info flex items-center gap-2">
                        <span>{threadsTime(data.timestamp)}</span>
                        <img src="./icons/elements/Dots.svg" alt="">
                    </div>
                </div>

                <div class="text-white me-1">
                    <p>{data.tweets}</p>
                </div>

                {#if data.images !== null}
                    <img src="/threads/{data.images}" class="rounded" alt="Gambar postingan" />                
                {/if}

                <div class="flex items-center gap-4">
                    <img src="/icons/elements/Heart.svg" alt="">
                    <img src="/icons/elements/Comment.svg" alt="">
                    <img src="/icons/elements/Reply.svg" alt="">
                    <img src="/icons/elements/Share.svg" alt="">
                </div>

                <div id="footerId" class="flex items-center gap-2 text-gray-500">
                    <span>{data.replies} replies</span>
                    <span>&#8901;</span>
                    <span>{threadsLike(data.likes)} likes</span>
                </div>
            </div>
        </div>
    {/each}

    <NavigationBar/>
</div>