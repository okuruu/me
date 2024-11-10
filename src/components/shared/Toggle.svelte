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
    <span class="toggle-thumb">
        <img src="/icons/Left-Toggle.svg" alt="" class="ms-2"/>
        <img src="/icons/Right-Toggle.svg" alt="" class="me-2"/>
    </span>
</label>

<style>
    .switch {
      display: inline-block;
      width: 60px;
      height: 34px;
      position: relative;
    }

    .toggle-thumb {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #FCEFE8;
        border-radius: 40px;
        cursor: pointer;
        transition: background-color 0.4s ease;
    }

    .checkbox:checked + .toggle-thumb {
        background-image: linear-gradient(to right, #B72024, #F08519);
    }

    .toggle-thumb:before {
        content: "";
        height: 26px;
        width: 26px;
        position: absolute;
        left: 4px;
        bottom: 4px;
        border-radius: 50%;
        background-color: #ffffff;
        transition: .4s all ease;
    }

    .checkbox {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .checkbox:checked + .toggle-thumb:before {
        transform: translateX(26px);
    }
</style>