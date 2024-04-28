<script lang="ts">
    import Kandidat from "$lib/components/clyfar/beranda/Kandidat.svelte";
    import Pengaturan from "$lib/components/clyfar/beranda/Pengaturan.svelte";

    let current: string = 'dashboard';
</script>
<div class="container-md mx-auto p-3">
    <div class="navbar bg-base-100">
        <div class="flex-none">
            <div class="dropdown dropdown-bottom">
                <button type="button" tabindex="0" role="button" class="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button type="button" on:click={() => current = 'kandidat'}>Lihat Kandidat</button></li>
                    <li><button type="button" on:click={() => current = 'pengaturan'}>Pengaturan Sistem</button></li>
                </ul>
            </div>
        </div>
        <div class="flex-1">
            <!-- <a href="/clyfar/beranda" class="btn btn-ghost text-xl">CLYFAR</a>
            <a href="/" class="ms-5 text-sm text-gray-600 font-semibold hover:text-white transition ease-in-out delay-20">Interpretasi</a> -->
        </div>
        <div class="flex-none">
            <div class="dropdown dropdown-end">
                <div class="avatar shadow-xl" tabindex="0" role="button" >
                    <div class="w-12 rounded-full">
                        <img src="/images/avatar.jfif" alt="Profile" />
                    </div>
                </div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a href="/">Keluar</a></li>
                </ul>
            </div>
            
        </div>
    </div>
    <hr class="h-px bg-slate-700 border-0 mb-5"/>
    {#if current === 'dashboard'}
        <!--  -->
    {:else if current === 'kandidat'}
        <Kandidat/>
    {:else if current === 'pengaturan'}
        <Pengaturan/>
    {/if}
</div>