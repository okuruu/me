<script lang="ts">
    export let open: boolean;
    export let onClose: () => void;
  
    const handleClickOutside = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
  </script>
  
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class={`modal ${open ? 'open' : ''}`} on:click={handleClickOutside}>
    <div class="modal-content">
        <button class="close-btn" on:click={onClose}>×</button>
        <slot></slot>
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