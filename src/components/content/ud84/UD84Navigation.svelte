<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let time: Date = $state(new Date());
    let activeMenu: string = $state('Transaksi');
    let isLogin: boolean | null = $state(null);

    const menus = [
      { name: 'Retail', path: '/ud84/panel/retail' },
      { name: 'Pesanan', path: '/ud84/panel/pesanan' },
      { name: 'Transaksi', path: '/ud84/panel/transaksi' },
      { name: 'Member', path: '/ud84/panel/member' },
      { name: 'Master Produk', path: '/ud84/panel/master-produk' },
      { name: 'Analisa', path: '/ud84/panel/analisa' },
      { name: 'Logistik', path: '/ud84/panel/logistic' },
      { name: 'Kartu Stok', path: '/ud84/panel/kartu-stok' },
    ];

    onMount(() => {
        const getStorage = localStorage.getItem('Auth');
        isLogin = getStorage ? JSON.parse(getStorage) : null;
        if(isLogin == null) return logOut();
    });

    $effect(() => {
        const timeInterval = setInterval(() => {
            time = new Date();
        }, 1000)
        return () => clearInterval(timeInterval);
    });

    async function logOut() {
        localStorage.removeItem('Auth');
        return goto('/ud84/panel');
    }
</script>

<div class="navbar bg-base-100 shadow-xl px-4 sticky top-0 z-[100] border-b border-white/5">
    <!-- Brand / Logo -->
    <div class="flex-none">
        <h1 class="text-2xl font-black text-warning tracking-tighter">UD84</h1>
    </div>

    <!-- User Info and Logout -->
    <div class="flex-grow flex justify-end gap-3 items-center">
        <div class="text-right hidden sm:block">
            <div class="text-[10px] font-bold text-error uppercase tracking-widest">Administrator</div>
            <div class="text-xs font-bold text-white">Hello, <span class="text-warning">Richie</span></div>
        </div>
        
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="avatar cursor-pointer">
            <div class="w-10 rounded-xl ring ring-warning ring-offset-base-100 ring-offset-2">
              <img src="/images/avatar.jfif" alt="Admin" />
            </div>
          </div>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-200 rounded-2xl w-52 mt-4 ring-1 ring-white/10 uppercase font-bold text-[10px] tracking-widest">
            <li><a href="/ud84/pengaturan" class="py-3"><img src="/icons/Gear.svg" class="w-4 h-4 opacity-70" alt="Settings" /> Pengaturan</a></li>
            <li><button onclick={logOut} class="py-3 text-error"><img src="/icons/Log-Out.svg" class="w-4 h-4 opacity-70 brightness-0 invert" alt="Logout" /> Keluar</button></li>
          </ul>
        </div>
    </div>
</div>

<!-- Horizontal Scrollable Menu -->
<div class="bg-base-200/50 backdrop-blur-md sticky top-16 z-50 border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
    <div class="flex gap-2 py-3">
        {#each menus as menu}
          <a 
            href={menu.path} 
            class="btn btn-sm rounded-xl font-bold border-none transition-all h-9 px-4 whitespace-nowrap
                   {activeMenu === menu.name ? 'btn-warning shadow-lg shadow-warning/20' : 'bg-base-100 hover:bg-base-100/80 text-base-content/60'}"
          >
            {menu.name}
          </a>
        {/each}
    </div>
</div>

<!-- Time Info -->
<div class="bg-base-300 px-4 py-1 flex justify-between items-center text-[10px] font-bold opacity-30 uppercase tracking-widest">
    <span>v2.0 Stable</span>
    <span>
      {new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(time)}, 
      {String(time.getDate()).padStart(2, '0')}/{String(time.getMonth() + 1).padStart(2, '0')} - 
      {`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`}
    </span>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
