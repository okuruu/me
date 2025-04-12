<script lang="ts">
    import Navbar from '../../../components/Navbar.svelte';
    import { Carbon, likesCount } from '../../../library/utils/useFormat';

    let { data } = $props();
</script>
<div class="bg-dark { data.threads.reply.replies.length === 0 ? 'min-vh-100' : ''}">
    <div class="container-xs">
        <Navbar/>
        <div class="row">
            <div class="col-2">
                <img src="/images/avatar.jpg" alt="" class="avatar h-30px" />
            </div>
            <div class="col-10 text-white">
                {@render tweets()}
                <p class="mt-2">{data.threads.tweets}</p>
                
                {#if data.threads.images !== null}
                    <img src="/threads/{data.threads.images}" alt="{data.threads.tweets}" class="img-fluid w-full my-4" />
                {/if}
    
                <div class="form-group">
                    <img src="/icons/elements/Heart.svg" class="h-15px cursor-not-allowed" alt="Likes"> <span class="me-3 ms-1">{likesCount(data.threads.likes)}</span>
                    <img src="/icons/elements/Comment.svg" class="h-15px cursor-not-allowed" alt="Comments">  <span class="me-3 ms-1">-</span>
                    <img src="/icons/elements/Reply.svg" class="h-15px cursor-not-allowed" alt="Replies">  <span class="me-3 ms-1">-</span>
                    <img src="/icons/elements/Share.svg" class="h-15px cursor-not-allowed" alt="Share">  <span class="me-3 ms-1">-</span>
                </div>
            </div>
            <div class="separator opacity-25 secondary my-7"></div>
            {#if data.threads.reply.replies.length !== 0}
                {#each data.threads.reply.replies as replies, indexes }
                    <div class="row">
                        <div class="col-2">
                            <img src="/images/avatar.jpg" alt="" class="avatar h-30px" />
                        </div>
                        <div class="col-10 text-white">
                            {@render tweets()}
                            <p class="mt-2">{@html replies.tweets}</p>
    
                            {#if replies.images !== null}
                                <img src="/threads/{replies.images}" alt="{ replies.tweets}" class="img-fluid w-full my-4" />
                            {/if}
                
                            <p class="text-muted">
                                {#if indexes === data.threads.reply.replies.length - 1}
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
</div>

{#snippet tweets()}
    <div class="form-group">
        <b>gdydz</b>
        <img src="/icons/elements/Verified.svg" alt="">
        <span class="text-muted ms-1">{Carbon(data.threads.timestamp, "timestamp")}</span>
    </div>
{/snippet}