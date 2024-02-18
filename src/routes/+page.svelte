<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
</script>
<div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 mx-5 my-5">
        <div class="col-span-1 md:col-span-1">
            <div class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <a href="https://id.linkedin.com/in/gilby-dhilega-555b9b152" target="_blank">
                        <img src="/images/profile.png" alt="Profile" />
                    </a>
                </div>
            </div>
        </div>
        <div class="col-span-1 md:col-span-3 flex md:items-center mt-1 md:mt-0 md:ml-4">
            <div class="content-center">
                <p class="text-xl font-bold">Gilby Dhilega Yodiaz</p>
                <p>Lórien Loremaster of Languages</p>
                <a href="https://github.com/okuruu" class="text-gray-500">@okuruu</a>
                <div class="text-sm breadcrumbs">
                    <ul>
                        <li>
                        <a href="/">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                            <span class="ms-2">Clyfar - Pyschological Test</span>
                        </a>
                        </li> 
                    </ul>
                </div>
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
            <p class="mt-2">Led development team, Building Point of Sale (POS), Internal Management System, and various other projects.</p>
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

    {#each Array(10) as _,index }
        <div class="divider"></div>

        <div class="mx-5 my-2">
            <h1 class="font-bold text-2xl">A Lonesome Journey</h1>
            <p class="pt-4">
                With me as your guide, be ready to go on a delightfully crazy adventure across the vast world of code. As I make my way through frontend mishaps and backend errors, leaving a path of bug-filled mayhem in my wake, get ready to laugh till you weep.
            </p>
            <a href="/blog/{index}" class="btn btn-xs btn-neutral rounded-full mt-2">Read More..</a>
        </div>
    {/each}

    <NavigationBar/>
</div>