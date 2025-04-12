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
<div class="bg-dark">
    <div class="container-xs">
        <Navbar/>
        {#each threads as threads, index }
            <a href="/threads/{index}">
                <div class="row">
                    <div class="col-2">
                        <img src="/images/avatar.jpg" alt="" class="avatar h-30px" />
                    </div>
                    <div class="col-10 text-white">
                        <div class="form-group">
                            <b>gdydz</b>
                            <img src="./icons/elements/Verified.svg" alt="">
                            <span class="text-muted ms-1">{Carbon(threads.timestamp, "timestamp")}</span>
                        </div>
                        <p class="mt-2">{@html threads.tweets}</p>
                        {#if threads.images !== null}
                            <img src="/threads/{threads.images}" alt="{threads.tweets}" class="img-fluid w-full rounded my-4" />
                        {/if}
                        <div class="form-group">
                            <img src="/icons/elements/Heart.svg" class="h-15px cursor-not-allowed" alt="Likes"> <span class="me-3 ms-1">{likesCount(threads.likes)}</span>
                            <img src="/icons/elements/Comment.svg" class="h-15px cursor-not-allowed" alt="Comments">  <span class="me-3 ms-1">-</span>
                            <img src="/icons/elements/Reply.svg" class="h-15px cursor-not-allowed" alt="Replies">  <span class="me-3 ms-1">-</span>
                            <img src="/icons/elements/Share.svg" class="h-15px cursor-not-allowed" alt="Share">  <span class="me-3 ms-1">-</span>
                        </div>
                    </div>
                    <div class="separator opacity-25 secondary my-7"></div>
                </div>
            </a>
        {/each}
    </div>
</div>