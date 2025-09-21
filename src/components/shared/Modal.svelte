<script lang="ts">
	import type { Snippet } from "svelte";

    interface Modal { 
        isModal: boolean; 
        size: "xs" | "sm" | "md" | "lg" | "xl"; 
        title: string; 
        onClose: () => void;
        modalContent: Snippet;
    }

    let { isModal = $bindable(), size, title, onClose, modalContent }: Modal = $props();

    function closeModal(): boolean {
        isModal = false;
        return isModal;
    }

    async function handleKeyNavigation(event: KeyboardEvent) {
		const keyPressed = event.key;
		if (keyPressed === 'Escape' && isModal) {
            window.scrollTo({top: 0, behavior: 'smooth'});
            onClose();
		}
	}
</script>

{#if isModal}
    <div class="modal fade show d-block modal-{size}" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4">
                <div class="d-flex justify-content-between align-items-start">
                    <h3 class="fw-bold text-dark">{title}</h3>
                    <button type="button" class="btn btn-sm btn-close" aria-label="Close" onclick={closeModal}></button>
                </div>
                <div class="separator mb-3"></div>
                {@render modalContent()}
            </div>
        </div>
    </div>
{/if}

<svelte:window on:keydown={handleKeyNavigation} />

<style>
    @keyframes modal-fade-scale-in {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .modal-dialog {
        animation: modal-fade-scale-in 0.2s ease-out;
    }

    .modal-content {
        background: white;
        padding: 1rem;
        border-radius: 1rem;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }

    .modal-content.xs {
        width: 20%;
        max-width: 300px;
    }

    .modal-content.sm {
        width: 30%;
        max-width: 400px;
    }

    .modal-content.md {
        width: 50%;
        max-width: 600px;
    }

    .modal-content.lg {
        width: 70%;
        max-width: 800px;
    }

    .modal-content.xl {
        width: 90%;
        max-width: 1000px;
    }
</style>

<!-- <Modal bind:isModal={isModal} size={"md"} title="" onClose={() => isModal = !isModal}>
    {#snippet modalContent()}
    {/snippet}
</Modal> -->