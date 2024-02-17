<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";

    let isReadme: boolean = false;

    const aboutMe: {type : "start"|"end"; text : string}[] = [
        // {
        //     type : "start",
        //     text : "Hey, what's 'About Me, Epic of Identity' all about?"
        // },
        {
            type : "end",
            text : "Ah, 'About Me' usually means a section where someone shares information about themselves, but paired with 'Epic of Identity,' it adds a dramatic flair to personal introspection."
        },
        {
            type : "start",
            text : "Oh, intriguing! So, it's like a journey of self-discovery?"
        },
        {
            type : "end",
            text : "Exactly. It implies a grand quest to explore one's identity, akin to an epic tale unfolding with each revelation and realization."
        },
        {
            type : "start",
            text : "Wow, sounds deep. I guess it's more than just a typical 'About Me' section."
        },
        {
            type : "end",
            text : "Absolutely. It suggests a profound exploration of one's essence, delving into the depths of who we are and what makes us unique."
        },
        {
            type : "start",
            text : "I'm intrigued. Thanks for shedding light on it!"
        },
        {
            type : "end",
            text : "No problem! It's always fascinating to embark on the journey of self-discovery."
        }
    ]

</script>
<div class="container mx-auto">
    <NavigationBar/>

    <div class="chat chat-start">
        <div class="chat-image avatar">
            <div class="w-10 rounded-full">
                <img alt="Gilby" src="/images/profile.png" />
            </div>
        </div>
        <div class="chat-header">
            You
            <time class="text-xs opacity-50">12:46</time>
        </div>
        <div class="chat-bubble rounded-lg">"Hey, what's 'About Me, Epic of Identity' all about?"</div>
        <div class="chat-footer opacity-50">
            Seen at 12:46
        </div>
    </div>

    <div class="divider"></div>
</div>