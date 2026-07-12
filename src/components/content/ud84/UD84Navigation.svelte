<script lang="ts">
    import { goto } from "$app/navigation";
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";


    let time: Date = $state(new Date());
    let activeMenu: string = $state('Transaksi');
    let isOption: boolean = $state(false);

    // Presentational-only UI state for the mobile/tablet nav collapse.
    let mobileOpen: boolean = $state(false);

    let isLogin: boolean | null = $state(null);

    onMount(() => {
        const getStorage = localStorage.getItem('Auth');
        isLogin = getStorage ? JSON.parse(getStorage) : null;

        if(isLogin == null) {
            return logOut();
        }

    });

    $effect(() => {
        const timeInterval = setInterval(() => {
            time = new Date();
        }, 1000)

        return () => {
            clearInterval(timeInterval);
        };
    });

    async function logOut() {
        localStorage.removeItem('Auth');
        return goto('/ud84/panel');
    }
</script>
{#snippet navLinks()}
    <a href="/ud84/panel/retail" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Retail' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Retail</a>
    <a href="/ud84/panel/pesanan" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Pesanan' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Pesanan</a>
    <a href="/ud84/panel/transaksi" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Transaksi' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Transaksi</a>
    <a href="/ud84/panel/member" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Member' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Member</a>
    <a href="/ud84/panel/master-produk" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Master Produk' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Master Produk</a>
    <a href="/ud84/panel/analisa" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Analisa' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Analisa</a>
    <a href="/ud84/panel/logistic" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Logistic' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Logistik</a>
    <a href="/ud84/panel/kartu-stok" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu ===  'Stock-Cards' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Kartu Stok</a>
{/snippet}

<nav class="sticky top-0 z-30 border-b border-base-300 bg-base-100 shadow-sm">
    <div class="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-3 px-4 py-2 sm:px-6">

        <!-- Brand + inline desktop links -->
        <div class="flex min-w-0 items-center gap-4">
            <h1 class="shrink-0 text-2xl font-extrabold tracking-tight text-primary">UD84</h1>
            <div class="hidden items-center gap-1 lg:flex">
                {@render navLinks()}
            </div>
        </div>

        <!-- User info + avatar + mobile hamburger -->
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <div class="hidden text-right sm:block">
                <span class="text-sm font-semibold">
                    <span class="font-bold text-error">[Administrator]</span>
                    Hello, <span class="text-primary">Richie</span>
                </span> <br/>
                <small class="font-semibold text-base-content/50">
                    <span class="text-info">[2.0]</span>
                    {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)},
                    {`${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}/${time.getFullYear()}`} -
                    {`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`} WIB
                </small>
            </div>
            <button class="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-error" onclick={logOut} type="button" aria-label="Keluar">
                <img src="/icons/Log-Out.svg" alt="Keluar" class="h-5 w-5">
            </button>
            <button
                type="button"
                class="btn btn-ghost btn-square btn-sm lg:hidden"
                aria-label="Buka menu navigasi"
                aria-expanded={mobileOpen}
                onclick={() => mobileOpen = !mobileOpen}
            >
                {#if mobileOpen}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                {/if}
            </button>
        </div>
    </div>

    <!-- Collapsed nav for mobile/tablet -->
    {#if mobileOpen}
        <div class="border-t border-base-300 lg:hidden">
            <div class="mx-auto flex w-full max-w-screen-xl flex-col gap-1 px-4 py-3 sm:px-6">
                {@render navLinks()}
            </div>
        </div>
    {/if}
</nav>

{#if isOption}
    <div class="absolute left-0 right-0 top-[52px] z-[1000] flex justify-end rounded-b">
        <div class="rounded-b bg-base-100 p-5 shadow-lg">
            <a href="/ud84/pengaturan" class="btn btn-ghost btn-sm mb-2 w-full justify-start text-left">
                <img src="/icons/Gear.svg" class="mr-3 h-5" alt="Pengaturan" /> Pengaturan
            </a>
            <button type="button" onclick={logOut} class="btn btn-ghost btn-sm mt-1 w-full justify-start text-left">
                 <img src="/icons/Log-Out.svg" class="mr-5 h-4" alt="Keluar" /> Keluar
            </button>
        </div>
    </div>
{/if}
