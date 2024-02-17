<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
</script>
<div class="container mx-auto">
    <NavigationBar/>

    <div class="grid grid-cols-1 md:grid-cols-4 mx-5 mb-5">
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

    <div class="divider"></div>

    <div class="grid grid-rows-1 grid-flow-col gap-4 mx-1">
        <div class="row-span-3 font-bold text-gray-400 ms-3">Dea Bakery<br/>(Present)</div>
        <div class="col-span-2">
            <p class="font-bold">Head of Information Technology</p>
            <p class="mt-2">Building Point of Sales, Internal Management System, and a lot.</p>
        </div>
        <div class="col-span-2">
            <p class="font-semibold text-gray-400">
                <a href="https://kit.svelte.dev/">Sveltekit</a> • 
                <a href="https://tauri.app/">Tauri</a> • 
                <a href="https://flutter.dev/">Flutter</a> • 
                <a href="https://daisyui.com/">DaisyUI</a>
            </p>
        </div>
    </div>

    <div class="grid grid-rows-1 grid-flow-col gap-4 mx-1">
        <div class="row-span-3 font-bold text-gray-400 ms-3">Jasa Tirta 1<br/>(2019)</div>
        <div class="col-span-2">
            <p class="font-bold">Software Engineer</p>
            <p class="mt-2">Building Key Performance Index. Used for employee performance measurements.</p>
        </div>
        <div class="col-span-2">
            <p class="font-semibold text-gray-400">
                <a href="https://codeigniter.com/">Codeigniter</a> • 
                <a href="https://www.proxmox.com/en/">Proxmox</a> • 
                <a href="https://navicat.com/en/">Navicat</a> • 
                <a href="https://getbootstrap.com/">Bootstrap</a>
            </p>
        </div>
    </div>

    <!-- {#each Array(10) as _,index }
        <div class="divider"></div>

        <div class="mx-5 my-2">
            <h1 class="font-bold text-2xl">A Lonesome Journey</h1>
            <p class="pt-4">
                With me as your guide, be ready to go on a delightfully crazy adventure across the vast world of code. As I make my way through frontend mishaps and backend errors, leaving a path of bug-filled mayhem in my wake, get ready to laugh till you weep.
            </p>
            <a href="/blog/{index}" class="btn btn-xs btn-neutral rounded-full mt-2">Read More..</a>
        </div>
    {/each} -->
</div>