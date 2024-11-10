<script lang="ts">
    interface Navigation { 
        name: string; 
        url: string; 
        active: boolean;
        locked : boolean;
    }

    let isMegaMenu: boolean = $state(false);

    const navigation: Navigation[] = [
        { name: 'Home', url: '/home', active: true, locked : false },
        { name: 'Data Karyawan', url: '/karyawan', active: false, locked : false },
    ];

    const megaMenu: Navigation[] = [
        { name: 'Dashboard BPJS', url: '/bpjs', active: false, locked : false },
        { name: 'Dashboard SPKL', url: '/spkl', active: false, locked : false },
        { name: 'Dashboard Cuti', url: '/cuti', active: false, locked : false },
        { name: 'Dashboard Benefit', url: '/benefit', active: false, locked : false },
        { name: 'Dashboard Penilaian Karyawan', url: '/', active: false, locked : false },
        { name: 'Dashboard Surat Peringatan', url: '/warning-letter', active: false, locked : false },
        { name: 'Dashboard Rekap Presensi Mengaji', url: '/mengaji', active: false, locked : false },
        { name: 'Dashboard Penggajian Outlet Dea Bakery', url: '/slip-gaji', active: false, locked : false },
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
    <nav class="p-5">
        <div class="row">
            <div class="col mt-4">
                <img src="/images/web/flat-logo.svg" class="h-20px" alt="Logo Dea Bakery" />
            </div>
            <div class="col mt-4">
                {#each navigation as nav }
                    <a href="{nav.url}" class="me-10 {nav.active ? 'text-golden fw-bolder' : 'text-dark fw-bold '}">{nav.name}</a>
                {/each}
                <button type="button" onclick={toggleMegaMenu} class="btn btn-sm btn-flush fw-bold text-dark mb-1">Lainnya</button>
            </div>
            <div class="col">
                <div class="row">
                    <div class="col">
                        <input type="text" class="form-control form-control-solid" placeholder="Cari" />
                    </div>
                    <div class="col-1 mt-2">
                        <img src="/images/web/svg/Notification.svg" class="h-35px" alt="Notification" />
                    </div>
                    <div class="col-1 mt-2">
                        <a href="/">
                            <div class="circle">
                                <img src="/images/logoDea.jpg" alt="Notification" />
                            </div>
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
                                <h1 class="text-golden">Dashboard HRD</h1>
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
                <img src="/images/web/pattern.jpg" class="h-150px rounded" alt="Notification" />
            </div>
        </div>
    {/if}
</div>