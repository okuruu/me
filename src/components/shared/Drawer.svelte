<script lang="ts">
    import { onMount, onDestroy, type Snippet } from 'svelte';

    // Define the props for the Drawer component
    interface DrawersProps {
        isOpen: boolean;
        position: 'left' | 'right' | 'top' | 'bottom';
        width?: string; // Made optional as it might not be needed for all positions
        height?: string; // Made optional
        onClose: () => void;
        // Using `Snippet` for content is a Svelte 5 feature, great!
        children: Snippet; // Renamed from modalContent to `children` for standard slot naming
    }

    // Use Svelte 5's $props() to define reactive props
    const { isOpen, position, width, height, onClose, children }: DrawersProps = $props();

    let drawerRef: HTMLDivElement;
    let lastActiveElement: HTMLElement | null = null;

    // Reactive declaration for styles based on props
    // This will automatically update when width or height changes.
    // Clamp to the viewport so a passed width/height never overflows the screen.
    let drawerStyles = $derived(
        `width: ${width ? `min(${width}, 100vw)` : 'auto'}; height: ${height ? `min(${height}, 100vh)` : 'auto'};`
    );

    // Handles clicks outside the drawer to close it
    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && drawerRef && !drawerRef.contains(event.target as Node)) {
            onClose();
        }
    };

    // Locks body scroll when the drawer is open
    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
    };

    // Unlocks body scroll when the drawer is closed
    const unlockScroll = () => {
        document.body.style.overflow = '';
    };

    // --- Lifecycle Hooks ---
    onMount(() => {
        document.addEventListener('mousedown', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('mousedown', handleClickOutside);
        // Ensure scroll is unlocked when component is destroyed
        unlockScroll();
    });

    // --- Reactive Statements for isOpen changes ---
    $effect(() => {
        if (isOpen) {
            lockScroll();
            lastActiveElement = document.activeElement as HTMLElement;
            // Focus the first focusable element within the drawer after a short delay
            // This needs to be done *after* the drawer is rendered and visible.
            // A better approach for focus management often involves using a library
            // or more robust logic to find the first/last focusable element dynamically.
            setTimeout(() => {
                const focusableElements = drawerRef?.querySelectorAll<HTMLElement>(
                    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 50);
        } else {
            unlockScroll();
            // Restore focus to the element that was active before opening the drawer
            lastActiveElement?.focus();
        }
    });

    // Handles keyboard navigation (Escape key to close)
    const handleKeyNavigation = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
            onClose();
            // No need to manually scroll to top; onClose typically handles state change
            // and the component will react accordingly.
        }
    };
</script>

{#if isOpen}
    <div class="modal-backdrop {isOpen ? 'visible' : ''}" onclick={onClose} role="presentation"></div>
{/if}

<div bind:this={drawerRef} class="drawer {position} {isOpen ? 'open' : ''}" style={drawerStyles} role="dialog" aria-modal="true">
	{@render children()}
</div>

<svelte:window on:keydown={handleKeyNavigation} />

<style>
    /* Full-screen dimmed backdrop behind the drawer panel. */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(0, 0, 0, 0.4);
    }

    /*
      A fixed slide-in panel. Width/height come from the inline style
      (clamped to the viewport in the component script), and are additionally
      capped here so the panel can never overflow the screen on any device.
    */
    .drawer {
        position: fixed;
        z-index: 100;
        display: block;
        background: #ffffff;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        overflow-y: auto;
        overflow-x: hidden;
        max-width: 100vw;
        max-height: 100vh;
        transition: transform 0.3s ease-in-out;
    }

    .drawer.left {
        left: 0;
        top: 0;
        height: 100vh;
        transform: translateX(-100%);
    }

    .drawer.right {
        right: 0;
        top: 0;
        height: 100vh;
        transform: translateX(100%);
    }

    .drawer.top {
        left: 0;
        top: 0;
        width: 100vw;
        transform: translateY(-100%);
    }

    .drawer.bottom {
        left: 0;
        bottom: 0;
        width: 100vw;
        transform: translateY(100%);
    }

    .drawer.open {
        transform: translate(0, 0);
    }
</style>
