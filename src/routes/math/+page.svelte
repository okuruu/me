<script lang="ts">
    import { onMount } from 'svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Maths } from '../../library/interface/Maths';
    import Navbar from '../../library/components/Navbar.svelte';

    let mathExercise: Maths[] = [];
    let timer: number = 6000;

    const startInterval = setInterval(() => {
        if(timer === 0) {
            toast.success("Waktu telah habis", { icon : '⌛' });
            clearInterval(startInterval);
            return;
        }
        timer = timer - 1;
    }, 1000);

    onMount(async () => {
        const getJSON = await fetch('/math/question.json');
        const parseJSON = await getJSON.json();
        
        mathExercise = shuffleQuestion(parseJSON);
    });

    function shuffleQuestion(array: any[]) {
        return array.sort(() => Math.random() - 0.5);
    }

    function setAnswer(id: number, answer: string) {
        const testAnswer: number = mathExercise[id].answer;

        // @ts-ignore
        if (testAnswer != answer) {
            timer -= 15;
            return toast.error('Jawaban salah!, waktu berkurang 15 detik!');
        }

        timer += 15;
        toast.success("Jawaban benar, waktu bertambah 15 detik!");
        mathExercise.splice(id, 1);
        mathExercise = mathExercise;
    }
</script>
<Toaster/>
<div class="bg-dark">
    <div class="container-xs">
        <Navbar/>
        <div class="d-flex justify-content-end mb-7">
            <span class="text-white">{`Waktu tersisa: ${timer} Detik`} </span>
        </div>
        {#each mathExercise as math, index }
            <div class="form-group mb-5">
                <p class="text-white">{`${index + 1}. ${math.question}`}</p>
                <button type="button" on:click={() => setAnswer(index, math.options.A)} class="btn btn-sm btn-dark text-white border me-1">{math.options.A}</button>
                <button type="button" on:click={() => setAnswer(index, math.options.B)} class="btn btn-sm btn-dark text-white border me-1">{math.options.B}</button>
                <button type="button" on:click={() => setAnswer(index, math.options.C)} class="btn btn-sm btn-dark text-white border me-1">{math.options.C}</button>
                <button type="button" on:click={() => setAnswer(index, math.options.D)} class="btn btn-sm btn-dark text-white border me-1">{math.options.D}</button>
            </div>
        {/each}
    </div>
</div>