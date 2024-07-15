<script lang="ts">
    import type { Threads } from '../../../library/interface/Threads.js';
    import { formatLike } from '../../../library/utils/formatLike';
    import { formatTime } from '../../../library/utils/formatTime';

    export let data;
    const threads: Threads = data.threads;
</script>
<div class="container-xs">
    
    <div class="row">
        <div class="col-2">
            <img src="/images/avatar.jfif" alt="" class="avatar h-30px" />
        </div>
        <div class="col-10 text-white">
            <div class="form-group">
                <b>gdydz</b>
                <img src="/icons/elements/Verified.svg" alt="">
                <span class="text-muted ms-1">{formatTime(threads.timestamp)}</span>
            </div>
            <p class="mt-2">{threads.tweets}</p>
            
            {#if threads.images !== null}
                <img src="/threads/{threads.images}" alt="{threads.tweets}" class="img-fluid w-full my-4" />
            {/if}

            <div class="form-group">
                <img src="/icons/elements/Heart.svg" class="h-15px cursor-not-allowed" alt="Likes"> <span class="me-3 ms-1">{formatLike(threads.likes)}</span>
                <img src="/icons/elements/Comment.svg" class="h-15px cursor-not-allowed" alt="Comments">  <span class="me-3 ms-1">-</span>
                <img src="/icons/elements/Reply.svg" class="h-15px cursor-not-allowed" alt="Replies">  <span class="me-3 ms-1">-</span>
                <img src="/icons/elements/Share.svg" class="h-15px cursor-not-allowed" alt="Share">  <span class="me-3 ms-1">-</span>
            </div>
        </div>
        <div class="separator opacity-25 secondary my-7"></div>
        {#if threads.reply.replies.length !== 0}
            {#each threads.reply.replies as replies, indexes }
                <div class="row">
                    <div class="col-2">
                        <img src="/images/avatar.jfif" alt="" class="avatar h-30px" />
                    </div>
                    <div class="col-10 text-white">
                        <div class="form-group">
                            <b>gdydz</b>
                            <img src="/icons/elements/Verified.svg" alt="">
                            <span class="text-muted ms-1">{formatTime(threads.timestamp)}</span>
                        </div>
                        <p class="mt-2">{replies.tweets}</p>

                        {#if replies.images !== null}
                            <img src="/threads/{replies.images}" alt="{replies.tweets}" class="img-fluid w-full my-4" />
                        {/if}
            
                        <p class="text-muted">
                            {#if indexes === threads.reply.replies.length - 1}
                                - End of thread.
                            {:else}
                                - Thread replies.
                            {/if}
                        </p>
                        
                    </div>
                    <div class="separator opacity-25 secondary my-7"></div>
                </div>
            {/each}
        {/if}
    </div>
</div>