<script lang="ts">
    import { onMount } from 'svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Maths } from '../../library/interface/Maths';

    let mathExercise: Maths[] = [];

    onMount(async () => {
        const getJSON = await fetch('/math/question.json');
        const parseJSON = await getJSON.json();
        
        mathExercise = parseJSON;
    });
</script>
<Toaster/>
<div class="container-xs">
    {#each mathExercise as math, index }
        <div class="form-group mb-5">
            <p class="text-white">{`${index + 1}. ${math.question}`}</p>
            <button type="button" class="btn btn-sm btn-dark text-white border me-1">{math.options.A}</button>
            <button type="button" class="btn btn-sm btn-dark text-white border me-1">{math.options.B}</button>
            <button type="button" class="btn btn-sm btn-dark text-white border me-1">{math.options.C}</button>
            <button type="button" class="btn btn-sm btn-dark text-white border me-1">{math.options.D}</button>
        </div>
    {/each}
</div>