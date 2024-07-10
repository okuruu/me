<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onDestroy } from 'svelte';

    // Define navigation items
    const navigationItems = [
        { id: 'home', redirectTo: '/' },
        { id: 'quran', redirectTo: '/quran' },
        { id: 'threads', redirectTo: '/threads' }
    ];

    // Reactive variable to track active item
    let activeItem: string = '';

    // Function to set active item and navigate
    const setActive = (id: string) => {
        activeItem = id;
        const redirectTo = navigationItems.find(item => item.id === id)?.redirectTo ?? '/';
        goto(redirectTo);
    }

    // Subscribe to the $page store to get the current route
    const unsubscribe = page.subscribe($page => {
        const currentRoute = $page.url.pathname;
        activeItem = navigationItems.find(item => item.redirectTo === currentRoute)?.id ?? '';
    });

    // Unsubscribe when the component is destroyed
    onDestroy(() => {
        unsubscribe();
    });
</script>
<div class=" fixed bottom-0 left-0 right-0 bg-white shadow-lg">
    <div class="container mx-auto btm-nav flex justify-between p-4">
        <button on:click={() => setActive('home')} class={activeItem === 'home' ? 'active' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button on:click={() => setActive('threads')} class={activeItem === 'threads' ? 'active' : ''}>
            <img src="/icons/Threads.svg" class="h-4 w-4" alt="Threads icon" />
        </button>
        <button on:click={() => setActive('quran')} class={activeItem === 'quran' ? 'active' : ''}>
            <img src="/icons/Quran.svg" class="h-4 w-4" alt="Quran icon" />
        </button>
    </div>
</div>