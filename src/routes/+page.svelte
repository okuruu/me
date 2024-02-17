<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
</script>
<div class="container mx-auto">
    <NavigationBar/>
    <div class="grid grid-cols-1 md:grid-cols-4 mx-5">
        <div class="col-span-1 md:col-span-1">
            <div class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src="/images/profile.png" alt="Profile" />
                </div>
            </div>
        </div>
        <div class="col-span-1 md:col-span-3 flex md:items-center mt-1 md:mt-0 md:ml-4">
            <div class="content-center">
                <p class="text-xl font-bold">Gilby Dhilega Yodiaz</p>
                <p>Lórien Loremaster of Languages</p>
                <a href="https://github.com/okuruu" class="text-gray-500">@okuruu</a>
            </div>
        </div>
    </div>    

    <div class="mt-2 mx-5">
        <h1 class="font-bold">About</h1>
        <p class="mt-2">Hey there, I'm Gilby, a Fullstack Developer on a mission to turn ideas into digital delights. Armed with my trusty keyboard and fueled by endless snacks, I tame bugs and craft user experiences that spark joy. </p>
    </div>

    {#each Array(10) as _,index }
        <div class="divider"></div>

        <div class="mx-5">
            <h1 class="font-bold text-2xl">A Lonesome Journey</h1>
            <p class="pt-4">
                With me as your guide, be ready to go on a delightfully crazy adventure across the vast world of code. As I make my way through frontend mishaps and backend errors, leaving a path of bug-filled mayhem in my wake, get ready to laugh till you weep.
            </p>
            <a href="/blog/{index}" class="btn btn-xs btn-neutral rounded-full mt-2">Read More..</a>
        </div>
    {/each}
</div>