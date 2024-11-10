<script lang="ts">
    let isDateFocused: boolean = $state(false);

    let { value = $bindable(), ...props } = $props();
</script>
<div class="row border rounded bg-light">
    <div class="col-2 mt-2">
        <img src="/icons/elements/black/Calendar.svg" alt="Search Toggle" />
    </div>
    <div class="col-10">
        <input bind:value={value} {...props} class="form-control form-control-sm form-control-flush" type={isDateFocused ? 'date' : 'text'} onfocus={() => (isDateFocused = true)} onblur={() => (isDateFocused = false)} id="date" />
    </div>
</div>