<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let isOpen: boolean = false;
    export let position: 'left' | 'right' | 'top' | 'bottom' = 'left';
    export let width: string = '300px';
    export let height: string = '100%';
    export let onClose: () => void;

    let drawerRef: HTMLDivElement;
    let drawerStyles: string = '';
    let focusableElements: HTMLElement[] = [];
    let lastActiveElement: HTMLElement | null = null;

    const updateStyles = () => {
        drawerStyles = `width: ${width}; height: ${height};`;
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && drawerRef && !drawerRef.contains(event.target as Node)) {
            onClose();
        }
    };

    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
        document.body.style.overflow = '';
    };

    onMount(() => {
        updateStyles();
        document.addEventListener('mousedown', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('mousedown', handleClickOutside);
        unlockScroll();
    });

    $: {
        if (isOpen) {
            lockScroll();
            lastActiveElement = document.activeElement as HTMLElement;
            setTimeout(() => {
                focusableElements[0]?.focus();
            }, 50);
        } else {
            unlockScroll();
            lastActiveElement?.focus();
        }
        updateStyles();
    }

    async function handleKeyNavigation(event: KeyboardEvent) {
		const keyPressed = event.key;
		if (keyPressed === 'Escape' && isOpen) {
            window.scrollTo({top: 0, behavior: 'smooth'});
            onClose();
		}
	}
</script>
{#if isOpen}
    <div class="modal-backdrop visible" onclick={onClose} role="presentation"></div>
{/if}

<div bind:this={drawerRef} class="drawer {position} {isOpen ? 'open' : ''}" style={drawerStyles} role="dialog" aria-modal="true">
    <slot></slot>
</div>

<svelte:window on:keydown={handleKeyNavigation} />
<!-- 
<script lang="ts">
    let isDrawer: boolean = $state(false);
    let currentSidebar: string = $state("useItem");
</script>
<Drawer isOpen={isDrawer} position="right" width="768px" onClose={() => isDrawer = !isDrawer}>
    <div class="form-group w-100 p-5">
        {#if currentSidebar === "useItem"}
            {@render useItem()}
        {/if}
    </div>
</Drawer> -->