<script>
    import { threadsTweets } from "../../library/threads";
    import { formatLike } from "../../library/utils/formatLike";
    import { formatTime } from "../../library/utils/formatTime";
</script>
<div class="container-xs">
    {#each threadsTweets as threads, index }
        <a href="/threads/{index}">
            <div class="row">
                <div class="col-2">
                    <img src="/images/avatar.jfif" alt="" class="avatar h-30px" />
                </div>
                <div class="col-10 text-white">
                    <div class="form-group">
                        <b>gdydz</b>
                        <img src="./icons/elements/Verified.svg" alt="">
                        <span class="text-muted ms-1">{formatTime(threads.timestamp)}</span>
                    </div>
                    <p class="mt-2">{threads.tweets}</p>
    
                    <div class="form-group">
                        <img src="/icons/elements/Heart.svg" class="h-15px cursor-not-allowed" alt="Likes"> <span class="me-3 ms-1">{formatLike(threads.likes)}</span>
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