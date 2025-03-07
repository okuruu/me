<script lang="ts">
    import { goto } from "$app/navigation";
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";


    let time: Date = $state(new Date());
    let activeMenu: string = $state('Transaksi');
    let isOption: boolean = $state(false);

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
<nav class="p-2 shadow-sm">
    <div class="row">
        
        <div class="col">
            <div class="row">
                <div class="col-1">
                    <h1 class="text-warning fw-bolder ms-4 mt-2">UD84</h1>
                </div>
                <div class="col">
                    <div class="form-group mt-1">
                        <a href="/ud84/panel/retail" class="btn btn-sm fw-bolder {activeMenu ===  'Retail' ? 'text-golden' : 'text-gray-600' }">Retail</a>
                        <a href="/ud84/panel/pesanan" class="btn btn-sm fw-bolder {activeMenu ===  'Pesanan' ? 'text-golden' : 'text-gray-600' }">Pesanan</a>
                        <a href="/ud84/panel/transaksi" class="btn btn-sm fw-bolder {activeMenu ===  'Transaksi' ? 'text-golden' : 'text-gray-600' }">Transaksi</a>
                        <a href="/ud84/panel/member" class="btn btn-sm fw-bolder {activeMenu ===  'Member' ? 'text-golden' : 'text-gray-600' }">Member</a>
                        <a href="/ud84/panel/master-produk" class="btn btn-sm fw-bolder {activeMenu ===  'Master Produk' ? 'text-golden' : 'text-gray-600' }">Master Produk</a>
                        <a href="/ud84/panel/analisa" class="btn btn-sm fw-bolder {activeMenu ===  'Analisa' ? 'text-golden' : 'text-gray-600' }">Analisa</a>
                        <a href="/ud84/panel/logistic" class="btn btn-sm fw-bolder {activeMenu ===  'Logistic' ? 'text-golden' : 'text-gray-600' }">Logistik</a>
                        <a href="/ud84/panel/kartu-stok" class="btn btn-sm fw-bolder {activeMenu ===  'Stock-Cards' ? 'text-golden' : 'text-gray-600' }">Kartu Stok</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-3">
            <div class="row">
                <div class="col text-end">
                    <span class="fw-bolder">
                        <span class="text-danger fw-bolder">[Administrator]</span> 
                        Hello, <span class="text-golden">Richie</span>
                    </span> <br/>
                    <small class="fw-bolder text-gray-500">
                        <span class="text-info">[2.0]</span>
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)}, 
                        {`${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}/${time.getFullYear()}`} - 
                        {`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`} WIB
                    </small>
                </div>
                <div class="col-2">
                    <button class="btn btn-sm btn-flush" onclick={logOut} type="button">
                        <img src="/images/avatar.jfif" alt="Richie" class="h-35px w-35px rounded">
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>

{#if isOption}
    <div class="d-flex justify-content-end rounded-bottom" style="position: absolute; z-index: 1000;left: 0; right: 0;top: 52px;">
        <div class="p-5 rounded-bottom bg-white" style="box-shadow: 0 4px 8px rgba(0,0,0,0.2)">
            <a href="/ud84/pengaturan" class="btn btn-flush btn-sm w-100 text-start mb-2">
                <img src="/icons/Gear.svg" class="h-20px me-3" alt="Pengaturan" /> Pengaturan
            </a>
            <button type="button" onclick={logOut} class="btn btn-flush btn-sm w-100 mt-1 text-start">
                 <img src="/icons/elements/Log-Out.svg" class="h-15px me-5" alt="Keluar" /> Keluar
            </button>
        </div>
    </div>
{/if}