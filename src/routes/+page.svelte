<script lang="ts">
    import { base } from "$app/paths";
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { baseString } from "../database/base";
</script>
<div class="container mx-auto p-2">

    <div class="card w-full bg-base-300 shadow-xl my-5">
        <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-4 mx-5 md:flex md:flex-row md:flex-wrap">
                <div class="col-span-1 md:col-span-1">
                    <div class="avatar">
                        <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <a href="https://id.linkedin.com/in/gilby-dhilega-555b9b152" target="_blank">
                                <img src="/images/avatar.jfif" alt="Profile" />
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-span-1 md:col-span-3 flex md:items-center mt-1 md:mt-0 md:ml-4">
                    <div class="content-center">
                        <p class="text-xl font-bold">{baseString.name}</p>
                        <p>{baseString.workingAt.shorts}</p>
                        <a href="{baseString.workingAt.github.url}" class="text-gray-500">{baseString.workingAt.github.display}</a>
                        <div class="text-sm breadcrumbs">
                            <ul>
                                <li>
                                    <a href="/clyfar">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                        <span class="ms-2">Clyfar - Pyschological Test</span>
                                    </a>
                                </li> 
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-2 mx-5">
        <h1 class="font-bold">About</h1>
        <p class="mt-2">{baseString.workingAt.bio}</p>
    </div>

    <div class="divider"></div>

    <div class="grid grid-rows-1 grid-flow-col gap-4 mx-1">
        <div class="row-span-3 font-bold text-gray-400 ms-3">{baseString.workingAt.name}<br/>(Present)</div>
        <div class="col-span-2">
            <p class="font-bold">{baseString.workingAt.position}</p>
            <p class="mt-2">{baseString.workingAt.doingWhat}</p>
        </div>
        <div class="col-span-2">
            <p class="font-semibold text-gray-400">
                {#each baseString.workingAt.skills as skills }
                    <a href="{skills.url}" class="mr-2">• {skills.name}</a>
                {/each}
            </p>
        </div>
    </div>

    {#each Array(1) as _,index }
        <div class="divider"></div>
        <div class="mx-5 my-2">
            <h1 class="font-bold text-2xl">"Code, Carrots, and Compassion: A Whimsical Journey of Optimism"</h1>
            <p class="pt-4">
                Join me in "Code, Carrots, Compassion." Through coding chaos and Quranic wisdom, to pursue a dream of growing a giant carrot, guided by humor and optimism to spread joy and kindness.
            </p>
            <a href="/blogs/{index}" class="btn btn-xs btn-neutral rounded-full mt-2">Read More..</a>
        </div>
    {/each}
    <div class="divider mb-12"></div>
    <NavigationBar/>
</div>