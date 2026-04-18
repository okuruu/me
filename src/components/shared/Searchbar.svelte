<script lang="ts">
    let { value = $bindable(), ...props } = $props();
</script>

<div class="d-flex align-items-center rounded-pill px-3 py-2 custom-search">
    <span class="text-muted fs-6 me-2 opacity-75">🔍</span>
    <input
        type="text"
        bind:value
        {...props}
        class="form-control form-control-sm bg-transparent border-0 text-white shadow-none p-0 w-100 font-monospace small"
        placeholder="Ketik pencarian..."
    />
</div>

<style>
    .custom-search {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: border-color 0.2s ease;
    }
    .custom-search:focus-within {
        border-color: rgba(13, 110, 253, 0.5);
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
    }
    input::placeholder {
        color: rgba(255, 255, 255, 0.3) !important;
    }
    input:focus {
        outline: none;
        box-shadow: none;
    }
</style>
