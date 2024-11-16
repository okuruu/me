<script lang="ts">
    import Searchbar from "./shared/Searchbar.svelte";

    interface Navigation { 
        name: string; 
        url: string; 
        active: boolean;
        locked : boolean;
    }

    let isMegaMenu: boolean = $state(false);

    const navigation: Navigation[] = [
        { name: 'Beranda', url: '/clyfar/beranda', active: true, locked : false },
    ];

    const megaMenu: Navigation[] = [
        { name: 'Psikotes: Kraepelin', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Papi Kostick', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Koch Test [BAUM]', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Culture Fair Intelligence Test [CFIT]', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Myers–Briggs Type Indicator [MBTI]', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Rothwell Miller Interest Blank [RMIB]', url: '/clyfar/beranda/rmib', active: false, locked : false },
        { name: 'Psikotes: Management Style Diagnostic Tes [MSDT]', url: '/bpjs', active: false, locked : false },
        { name: 'Psikotes: Dominance, Influence, Steadiness, Conscientiousness [DISC]', url: '/bpjs', active: false, locked : false },
    ];
    
    function toggleMegaMenu() {
        isMegaMenu = !isMegaMenu;
    }
</script>

<style>
    .container-relative {
        position: relative;
    }

    .mega-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: white;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
</style>
<div class="shadow-sm container-relative">
    <nav class="p-5 px-12">
        <div class="row">
            <div class="col mt-4">
                <img src="/images/clyfar.webp" class="h-30px" alt="Clyfar" />
            </div>
            <div class="col mt-4">
                {#each navigation as nav }
                    <a href="{nav.url}" class="me-10 {nav.active ? 'text-warning fw-bolder' : 'text-dark fw-bold '}">{nav.name}</a>
                {/each}
                <button type="button" onclick={toggleMegaMenu} class="btn btn-sm btn-flush fw-bold text-dark mb-1">Lainnya</button>
            </div>
            <div class="col">
                <div class="row">
                    <div class="col">
                        <Searchbar/>
                    </div>
                    <div class="col-1 mt-2">
                        <img src="/icons/elements/black/Notification.svg" class="h-35px" alt="Notification" />
                    </div>
                    <div class="col-1 mt-2">
                        <a href="/clyfar">
                            <img src="/images/avatar.jfif" class="h-30px rounded-circle" alt=""/>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Mega Menu -->
    {#if isMegaMenu}
        <div class="mega-menu p-20 bg-white">
            <div class="d-flex justify-content-between">
                <div class="form-group">
                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <h1 class="text-golden">Psychological Test</h1>
                                <ul>
                                    {#each megaMenu as menu }
                                        <li>
                                            {#if menu.locked}
                                                <span class="text-muted">{menu.name}</span>
                                            {:else}
                                                <a href="{menu.url}" class="text-dark">{menu.name}</a>
                                            {/if}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <img src="/images/pattern.jpg" class="h-150px rounded" alt="Notification" />
            </div>
        </div>
    {/if}
</div>