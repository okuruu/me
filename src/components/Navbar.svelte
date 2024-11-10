<script lang="ts">
    const navigation = [
        { icon: 'github.svg', redirect: 'https://github.com/okuruu', alt : 'Github' },
        { icon: 'Quran.svg', redirect: '/quran', alt : 'Quran' },
        { icon: 'Threads.svg', redirect: '/threads', alt : 'Quran' },
    ];
</script>
<div class="navbar d-flex justify-between-end mb-5">
    <div class="form-group">
        <a href="/">
            <img src="/icons/elements/Function.svg" alt="Site Icon" class="h-30px" /> <span class="text-white">okuruu</span>
        </a>
    </div>
    <div class="form-group">
        {#each navigation as navigation }
            <a href="{navigation.redirect}">
                <img src="/icons/{navigation.icon}" class="h-20px me-3" alt="{navigation.alt}"/>
            </a>
        {/each}
    </div>
</div>