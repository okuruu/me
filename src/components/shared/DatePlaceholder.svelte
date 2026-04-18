<script lang="ts">
    let isDateFocused: boolean = $state(false);
    let { value = $bindable(), customClass = '', placeholder = '', ...props } = $props();
</script>
<div class="d-flex align-items-center rounded-pill px-3 py-2 w-100 custom-date">
    <span class="text-muted fs-6 me-2 opacity-75">📅</span>
    <input bind:value={value} {...props} class="form-control form-control-sm bg-transparent border-0 text-white shadow-none p-0 w-100 font-monospace small" type={isDateFocused ? 'date' : 'text'} onfocus={() => (isDateFocused = true)} onblur={() => (isDateFocused = false)} id="date" placeholder={placeholder} />
</div>
<style>
    .custom-date {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: border-color 0.2s ease;
    }
    .custom-date:focus-within {
        border-color: rgba(13, 110, 253, 0.5);
    }
    input::placeholder {
        color: rgba(255, 255, 255, 0.3) !important;
    }
    input:focus {
        outline: none;
        box-shadow: none;
    }
    ::-webkit-calendar-picker-indicator {
        filter: invert(1);
        opacity: 0.5;
        cursor: pointer;
    }
</style>
