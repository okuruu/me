<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    children?: import('svelte').Snippet;
  }

  let { open, onClose, children }: Props = $props();
  
    const handleClickOutside = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
  </script>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class={`modal ${open ? 'open' : ''}`} onclick={handleClickOutside}>
    <div class="modal-content">
        <button class="close-btn" onclick={onClose}>×</button>
        {@render children?.()}
    </div>
  </div>
  
  <style>
    .modal {
        position: fixed;
        bottom: -100%; /* Hide the modal initially */
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: flex-end;
        transition: bottom 0.3s ease;
        z-index: 1000;
    }
  
    .modal.open {
        bottom: 0; /* Show the modal */
    }
  
    .modal-content {
        background: white;
        width: 100%;
        max-width: 600px;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        border-radius: 10px 10px 0 0;
    }
  
    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
    }
  </style>