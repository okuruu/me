<script lang="ts">
	import { createEventDispatcher } from "svelte";

    let isChecked: boolean = false;
    const dispatch = createEventDispatcher();

    function changeMode(event: Event) {
        isChecked = (event.target as HTMLInputElement).checked;
        dispatch('changeModes', { message: isChecked });
    }
</script>
<label class="switch">
    <input type="checkbox" bind:checked={isChecked} onchange={changeMode} class="checkbox">
    <span class="toggle-thumb border border-secondary border-opacity-50 shadow-sm">
        <span class="label left-label font-monospace">List</span>
        <span class="label right-label font-monospace">Buat</span>
    </span>
</label>

<style>
    .switch {
      display: inline-block;
      width: 140px;
      height: 40px;
      position: relative;
    }

    .toggle-thumb {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: rgba(26, 26, 30, 0.8);
        border-radius: 40px;
        cursor: pointer;
        transition: background-color 0.4s ease;
        padding: 0 16px;
    }

    .label {
        font-size: 0.75rem;
        font-weight: bold;
        z-index: 2;
        transition: color 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .left-label { color: #fff; }
    .right-label { color: rgba(255,255,255,0.4); }

    .checkbox:checked ~ .toggle-thumb .left-label { color: rgba(255,255,255,0.4); }
    .checkbox:checked ~ .toggle-thumb .right-label { color: #fff; }

    .toggle-thumb:before {
        content: "";
        height: 32px;
        width: 50%;
        position: absolute;
        left: 4px;
        bottom: 3px;
        border-radius: 30px;
        background-color: #0d6efd;
        z-index: 1;
        transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        opacity: 0.9;
        box-shadow: 0 0 10px rgba(13, 110, 253, 0.4);
    }

    .checkbox {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .checkbox:checked + .toggle-thumb:before {
        transform: translateX(92%);
        background-color: #0dcaf0; /* Using info color for "Create" instead of red */
        box-shadow: 0 0 10px rgba(13, 202, 240, 0.4);
    }
</style>
