<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";


    let time: Date = $state(new Date());

    // Derived from the URL rather than hardcoded. It used to be a fixed
    // 'Transaksi', so every panel page highlighted the same entry no matter
    // which one you were on.
    let activeMenu: string = $derived.by(() => {
        const ruas = page.url.pathname.replace(/\/+$/, '').split('/').pop() ?? '';

        return ruas;
    });
    let isOption: boolean = $state(false);

    // Presentational-only UI state for the mobile/tablet nav collapse.
    let mobileOpen: boolean = $state(false);

    let isLogin: boolean | null = $state(null);

    // Who is actually signed in. The login page stores { name, privilege };
    // sessions opened before it did hold a bare true, so both are handled.
    let namaOperator: string = $state('');
    let hakOperator: string = $state('');

    onMount(() => {
        const getStorage = localStorage.getItem('Auth');
        isLogin = getStorage ? JSON.parse(getStorage) : null;

        if(isLogin == null) {
            return logOut();
        }

        if (typeof isLogin === 'object') {
            const auth = isLogin as unknown as { name?: string; privilege?: string };
            namaOperator = auth.name ?? '';
            hakOperator = auth.privilege ?? '';
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
    <a href="/ud84/panel/retail" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'retail' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Retail</a>
    <a href="/ud84/panel/pesanan" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'pesanan' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Pesanan</a>
    <a href="/ud84/panel/transaksi" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'transaksi' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Transaksi</a>
    <a href="/ud84/panel/member" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'member' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Member</a>
    <a href="/ud84/panel/poin" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'poin' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Poin</a>
    <a href="/ud84/panel/sales" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'sales' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Sales</a>
    <a href="/ud84/panel/master-produk" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'master-produk' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Master Produk</a>
    <a href="/ud84/panel/analisa" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'analisa' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Analisa</a>
    <a href="/ud84/panel/logistic" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'logistic' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Logistik</a>
    <a href="/ud84/panel/kartu-stok" class="btn btn-ghost btn-sm w-full justify-start font-semibold lg:w-auto lg:justify-center {activeMenu === 'kartu-stok' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-primary' }">Kartu Stok</a>
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
                    {#if hakOperator}
                        <span class="font-bold text-error">[{hakOperator}]</span>
                    {/if}
                    Hello, <span class="text-primary">{namaOperator || 'Operator'}</span>
                </span> <br/>
                <small class="font-semibold text-base-content/50">
                    <span class="text-info">[2.0]</span>
                    {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)},
                    {`${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}/${time.getFullYear()}`} -
                    {`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`} WIB
                </small>
            </div>
            <button class="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-error" onclick={logOut} type="button" aria-label="Keluar">
                <svg viewBox="0 0 28 28" fill="currentColor" class="h-5 w-5" aria-hidden="true">
                    <path d="M6.44141 23.1729H15.8018C17.6826 23.1729 18.6582 22.1885 18.6582 20.29V16.335H16.9355V20.1846C16.9355 21.002 16.5049 21.4502 15.6523 21.4502H6.58203C5.72949 21.4502 5.30762 21.002 5.30762 20.1846V7.13281C5.30762 6.31543 5.72949 5.86719 6.58203 5.86719H15.6523C16.5049 5.86719 16.9355 6.31543 16.9355 7.13281V10.9912H18.6582V7.02734C18.6582 5.1377 17.6826 4.14453 15.8018 4.14453H6.44141C4.56055 4.14453 3.58496 5.1377 3.58496 7.02734V20.29C3.58496 22.1885 4.56055 23.1729 6.44141 23.1729ZM12.1016 14.4629H20.9609L22.2617 14.4014L21.6201 14.9463L20.3105 16.1768C20.1523 16.3174 20.0645 16.5195 20.0645 16.7217C20.0645 17.1172 20.3633 17.4512 20.7676 17.4512C20.9785 17.4512 21.1367 17.3633 21.2861 17.2139L24.1338 14.2695C24.3359 14.0586 24.4062 13.8652 24.4062 13.6543C24.4062 13.4434 24.3359 13.25 24.1338 13.0391L21.2861 10.0859C21.1367 9.93652 20.9785 9.85742 20.7676 9.85742C20.3633 9.85742 20.0645 10.1738 20.0645 10.5781C20.0645 10.7715 20.1523 10.9824 20.3105 11.123L21.6201 12.3623L22.2705 12.9072L20.9609 12.8369H12.1016C11.6709 12.8369 11.3018 13.2061 11.3018 13.6543C11.3018 14.1025 11.6709 14.4629 12.1016 14.4629Z"/>
                </svg>
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
                <svg viewBox="0 0 28 28" fill="currentColor" class="mr-3 h-5 w-5" aria-hidden="true">
                    <path d="M8.1377 17.9258H9.42969C10.001 17.9258 10.4756 17.5654 10.5898 17.0205L10.8008 16.0977C10.8184 15.9834 10.8447 15.9395 10.8711 15.9219L11.8379 16.4932C12.3125 16.7744 12.8926 16.7129 13.2881 16.3174L14.1758 15.4209C14.5977 14.999 14.6592 14.4277 14.3516 13.9619L13.7363 12.9863C13.7363 12.9688 13.7451 12.96 13.7451 12.9951L14.8525 12.7227C15.3887 12.5908 15.7578 12.125 15.7578 11.5537V10.3584C15.7578 9.78711 15.3975 9.32129 14.8525 9.18945L13.7451 8.92578C13.7451 8.92578 13.7451 8.92578 13.7363 8.92578L14.3516 7.95898C14.6592 7.47559 14.5977 6.91309 14.1758 6.5L13.2881 5.59473C12.8926 5.19922 12.3125 5.1377 11.8379 5.41895L10.8184 6.02539C10.8096 6.02539 10.8008 6.02539 10.8271 6.0166L10.5898 4.8916C10.4756 4.34668 10.0098 3.99512 9.42969 3.99512H8.1377C7.56641 3.99512 7.10059 4.34668 6.97754 4.8916L6.73145 6.0166C6.74023 6.0166 6.74023 6.0166 6.74023 6.02539L5.73828 5.41895C5.26367 5.1377 4.68359 5.19922 4.28809 5.59473L3.3916 6.5C2.97852 6.91309 2.92578 7.48438 3.21582 7.95898L3.83984 8.93457C3.83105 8.94336 3.83105 8.95215 3.82227 8.92578L2.71484 9.18945C2.16992 9.32129 1.81836 9.78711 1.81836 10.3584V11.5537C1.81836 12.125 2.16992 12.5908 2.71484 12.7227L3.82227 12.9951C3.83105 12.9863 3.83105 12.9863 3.83105 12.9863L3.21582 13.9619C2.91699 14.4277 2.97852 14.999 3.3916 15.4209L4.28809 16.3174C4.68359 16.7129 5.25488 16.7744 5.72949 16.4932L6.70508 15.9219C6.72266 15.9219 6.75781 15.9307 6.77539 16.0977L6.97754 17.0205C7.10059 17.5654 7.56641 17.9258 8.1377 17.9258ZM8.31348 16.5723C8.23438 16.5723 8.23438 16.5635 8.2168 16.4844L7.83008 14.876C7.37305 14.7793 6.97754 14.5771 6.66113 14.4014L5.26367 15.2539C5.18457 15.2891 5.17578 15.2979 5.11426 15.2363L4.45508 14.5947C4.39355 14.5332 4.40234 14.5332 4.44629 14.4541L5.29004 13.0742C5.18457 12.8018 4.92969 12.3887 4.83301 11.8965L3.25098 11.5186C3.16309 11.501 3.16309 11.501 3.16309 11.4131V10.499C3.16309 10.4111 3.16309 10.4111 3.25098 10.3936L4.83301 10.0156C4.92969 9.53223 5.18457 9.11914 5.29004 8.84668L4.44629 7.45801C4.40234 7.37891 4.39355 7.37891 4.45508 7.32617L5.11426 6.67578C5.17578 6.61426 5.18457 6.62305 5.26367 6.66699L6.66113 7.51074C6.97754 7.33496 7.37305 7.13281 7.83008 7.03613L8.2168 5.43652C8.23438 5.34863 8.23438 5.34863 8.31348 5.34863H9.25391C9.3418 5.34863 9.3418 5.34863 9.35938 5.43652L9.74609 7.03613C10.1943 7.13281 10.5986 7.33496 10.915 7.51074L12.3125 6.66699C12.3916 6.62305 12.4004 6.61426 12.4531 6.67578L13.1211 7.32617C13.1738 7.37891 13.1738 7.37891 13.1299 7.45801L12.2861 8.84668C12.3828 9.11914 12.6465 9.53223 12.7344 10.0156L14.3252 10.3936C14.4043 10.4111 14.4131 10.4111 14.4131 10.499V11.4131C14.4131 11.501 14.4043 11.501 14.3252 11.5186L12.7344 11.8965C12.6465 12.3887 12.3828 12.8018 12.2861 13.0742L13.1299 14.4541C13.1738 14.5332 13.1738 14.5332 13.1211 14.5947L12.4531 15.2363C12.4004 15.2979 12.3916 15.2891 12.3125 15.2539L10.915 14.4014C10.5986 14.5771 10.1943 14.7793 9.74609 14.876L9.35938 16.4844C9.3418 16.5635 9.3418 16.5723 9.25391 16.5723H8.31348ZM8.78809 13.6104C10.2295 13.6104 11.416 12.415 11.416 10.9561C11.416 9.51465 10.2295 8.32812 8.78809 8.32812C7.32031 8.32812 6.14258 9.50586 6.14258 10.9561C6.14258 12.4062 7.32031 13.6104 8.78809 13.6104ZM8.78809 12.2217C8.09375 12.2217 7.52246 11.6592 7.52246 10.9561C7.52246 10.2705 8.09375 9.69922 8.78809 9.69922C9.47363 9.69922 10.0361 10.2705 10.0361 10.9561C10.0361 11.6504 9.47363 12.2217 8.78809 12.2217ZM19.792 23.3135H20.8027C21.3301 23.3135 21.7783 22.9971 21.8662 22.5137L22.0332 21.6436C22.0332 21.6348 22.0332 21.6348 22.0332 21.6348L22.7891 22.1094C23.2197 22.373 23.7471 22.3203 24.1162 21.9424L24.8281 21.2129C25.1973 20.835 25.2676 20.3076 24.9863 19.8857L24.5029 19.1475C24.5029 19.1387 24.5029 19.1299 24.5117 19.1562L25.373 18.9805C25.8477 18.8838 26.1729 18.4443 26.1729 17.9258V16.9326C26.1729 16.4141 25.8477 15.9746 25.373 15.8779L24.5117 15.7021C24.5029 15.7021 24.5029 15.7021 24.5029 15.7021L24.9863 14.9727C25.2676 14.5508 25.1973 14.0234 24.8281 13.6367L24.1162 12.916C23.7471 12.5381 23.2197 12.4854 22.7891 12.749L22.0244 13.2236C22.0156 13.2236 22.0068 13.2236 22.0332 13.2148L21.8662 12.3359C21.7783 11.8613 21.3301 11.5449 20.8027 11.5449H19.792C19.2646 11.5449 18.8164 11.8613 18.7285 12.3359L18.5615 13.2148V13.2236L17.8057 12.749C17.375 12.4854 16.8477 12.5381 16.4785 12.916L15.7666 13.6367C15.3975 14.0234 15.3271 14.5508 15.6084 14.9727L16.0918 15.7109C16.0918 15.7197 16.0918 15.7285 16.083 15.7021L15.2217 15.8779C14.7383 15.9746 14.4219 16.4141 14.4219 16.9326V17.9258C14.4219 18.4443 14.7383 18.8838 15.2217 18.9805L16.083 19.1562H16.0918L15.6084 19.8857C15.3271 20.3076 15.3975 20.835 15.7666 21.2129L16.4785 21.9424C16.8477 22.3203 17.375 22.373 17.8057 22.1094L18.5703 21.6348C18.5791 21.6348 18.5879 21.6348 18.5615 21.6436L18.7285 22.5137C18.8164 22.9971 19.2646 23.3135 19.792 23.3135ZM20.0293 22.0303C19.9326 22.0303 19.915 22.0039 19.8975 21.916L19.5723 20.6328C19.2119 20.5537 18.8779 20.4219 18.5352 20.1934L17.4014 20.8965C17.3398 20.9229 17.2959 20.9316 17.2344 20.8789L16.8389 20.4746C16.7773 20.4043 16.7773 20.3604 16.8125 20.3076L17.4893 19.2178C17.4365 18.998 17.1641 18.5938 17.085 18.1367L15.8018 17.8379C15.7227 17.8203 15.6963 17.7939 15.6963 17.7148V17.1436C15.6963 17.0645 15.7227 17.0381 15.8018 17.0205L17.085 16.7217C17.1641 16.2646 17.4365 15.8604 17.4893 15.6406L16.8125 14.5508C16.7773 14.498 16.7773 14.4541 16.8389 14.3838L17.2344 13.9795C17.2959 13.918 17.3398 13.9268 17.4014 13.9619L18.5352 14.665C18.8779 14.4365 19.2119 14.3047 19.5723 14.2256L19.8975 12.9424C19.915 12.8545 19.9326 12.8281 20.0293 12.8281H20.5654C20.6621 12.8281 20.6797 12.8545 20.6973 12.9424L21.0137 14.2256C21.3828 14.3047 21.7168 14.4365 22.0596 14.665L23.1934 13.9619C23.2461 13.9268 23.2988 13.918 23.3604 13.9795L23.7559 14.3838C23.8174 14.4541 23.8174 14.498 23.7822 14.5508L23.1055 15.6406C23.1582 15.8604 23.4307 16.2646 23.5098 16.7217L24.793 17.0205C24.8721 17.0381 24.8984 17.0645 24.8984 17.1436V17.7148C24.8984 17.7939 24.8721 17.8203 24.793 17.8379L23.5098 18.1367C23.4307 18.5938 23.1582 18.998 23.1055 19.2178L23.7822 20.3076C23.8174 20.3604 23.8174 20.4043 23.7559 20.4746L23.3604 20.8789C23.2988 20.9316 23.2461 20.9229 23.1934 20.8965L22.0596 20.1934C21.7168 20.4219 21.3828 20.5537 21.0137 20.6328L20.6973 21.916C20.6797 22.0039 20.6621 22.0303 20.5654 22.0303H20.0293ZM20.293 19.4902C21.418 19.4902 22.3496 18.5586 22.3496 17.4248C22.3496 16.3086 21.418 15.377 20.293 15.377C19.1592 15.377 18.2275 16.2998 18.2275 17.4248C18.2275 18.5498 19.1592 19.4902 20.293 19.4902ZM20.3633 18.3652C19.8711 18.3652 19.4844 17.9785 19.4844 17.4863C19.4844 17.0117 19.8711 16.6338 20.3633 16.6338C20.8203 16.6338 21.207 17.0117 21.207 17.4863C21.207 17.9697 20.8203 18.3652 20.3633 18.3652Z"/>
                </svg> Pengaturan
            </a>
            <button type="button" onclick={logOut} class="btn btn-ghost btn-sm mt-1 w-full justify-start text-left">
                 <svg viewBox="0 0 28 28" fill="currentColor" class="mr-5 h-4 w-4" aria-hidden="true">
                     <path d="M6.44141 23.1729H15.8018C17.6826 23.1729 18.6582 22.1885 18.6582 20.29V16.335H16.9355V20.1846C16.9355 21.002 16.5049 21.4502 15.6523 21.4502H6.58203C5.72949 21.4502 5.30762 21.002 5.30762 20.1846V7.13281C5.30762 6.31543 5.72949 5.86719 6.58203 5.86719H15.6523C16.5049 5.86719 16.9355 6.31543 16.9355 7.13281V10.9912H18.6582V7.02734C18.6582 5.1377 17.6826 4.14453 15.8018 4.14453H6.44141C4.56055 4.14453 3.58496 5.1377 3.58496 7.02734V20.29C3.58496 22.1885 4.56055 23.1729 6.44141 23.1729ZM12.1016 14.4629H20.9609L22.2617 14.4014L21.6201 14.9463L20.3105 16.1768C20.1523 16.3174 20.0645 16.5195 20.0645 16.7217C20.0645 17.1172 20.3633 17.4512 20.7676 17.4512C20.9785 17.4512 21.1367 17.3633 21.2861 17.2139L24.1338 14.2695C24.3359 14.0586 24.4062 13.8652 24.4062 13.6543C24.4062 13.4434 24.3359 13.25 24.1338 13.0391L21.2861 10.0859C21.1367 9.93652 20.9785 9.85742 20.7676 9.85742C20.3633 9.85742 20.0645 10.1738 20.0645 10.5781C20.0645 10.7715 20.1523 10.9824 20.3105 11.123L21.6201 12.3623L22.2705 12.9072L20.9609 12.8369H12.1016C11.6709 12.8369 11.3018 13.2061 11.3018 13.6543C11.3018 14.1025 11.6709 14.4629 12.1016 14.4629Z"/>
                 </svg> Keluar
            </button>
        </div>
    </div>
{/if}
