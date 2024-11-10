<script lang="ts">
    let { value = $bindable(), ...props } = $props();
</script>
<div class="row border rounded bg-light">
    <div class="col-2 mt-2">
        <img src="/icons/elements/black/Search.svg" alt="Search Toggle" />
    </div>
    <div class="col-10">
        <input type="text" bind:value={value} {...props} class="form-control form-control-sm form-control-flush" placeholder="Ketik nama atau kategori..."/>
    </div>
</div>