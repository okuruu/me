<script lang="ts">
    let isDateFocused: boolean = $state(false);
    let { value = $bindable(), customClass = '', placeholder = '', ...props } = $props();
</script>
<div class="flex w-full items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-2 transition-colors focus-within:border-primary/50">
    <span class="text-base-content/60 opacity-75">📅</span>
    <input bind:value={value} {...props} class="w-full min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-sm text-base-content shadow-none placeholder:text-base-content/40 focus:outline-none focus:ring-0" type={isDateFocused ? 'date' : 'text'} onfocus={() => (isDateFocused = true)} onblur={() => (isDateFocused = false)} id="date" placeholder={placeholder} />
</div>
