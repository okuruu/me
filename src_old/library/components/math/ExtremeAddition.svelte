<script lang="ts">
    import { onMount } from "svelte";
    import toast, { Toaster } from 'svelte-french-toast';

    let extremeAddition: number[][] = $state([]);
    let additionAnswer: number = $state();
    let quizAnswer: number = 0;

    let quizVisibility: boolean = $state(true);
    let answerVisibility: boolean = $state(true);

    onMount(() => {
        for (let a = 0; a < 25; a++) {
            let numberPlaceholder: number[] = [];
            for (let i: number = 0; i < 25; i++) {
                numberPlaceholder.push(randomNumber());
            }
            extremeAddition.push(numberPlaceholder);
        }
        extremeAddition = extremeAddition;
        quizAnswer = sum(extremeAddition);
    });

    function randomNumber(): number {
        return Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    }

    function sum(array: number[][]): number {
        return array.flat().reduce((acc, num) => acc + num, 0);
    }

    function equalNumber(num1: number, num2: number): boolean {
        return num1.toString().length === num2.toString().length;
    }


    function setVisibility(id: string) {
        if (id === 'quiz') {
            quizVisibility = !quizVisibility;
        } else {
            answerVisibility = !answerVisibility;
        }
    }

    function verifyAnswer() {
        if (equalNumber(quizAnswer,additionAnswer)) {
            if (quizAnswer === additionAnswer) {
                toast.success("Extreme Addition: Complete!");
                return;
            }
            additionAnswer = 0;
            toast.error("Jawaban anda salah!");
        } 
    }
</script>
<Toaster/>
<div class="d-flex justify-content-end">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span class="badge badge-light me-2" aria-label="Show Quiz Extreme Addition" onclick={() => setVisibility('quiz')}>
        <img src="/icons/elements/Quiz.svg" alt="Quiz Extreme Addition" class="h-20px">
    </span>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span class="badge badge-light me-2" onclick={() => setVisibility('answer')}>
        <img src="/icons/elements/Answer.svg" alt="Input Jawaban" class="h-20px">
    </span>
</div>

{#if answerVisibility}
    <div class="form-group my-5">
        <label for="extremeAddition" class="form-label fw-bold text-white">Extreme Addition</label>
        <input type="number" bind:value={additionAnswer} onkeyup={verifyAnswer} class="form-control h-40px bg-secondary rounded fw-bolder display-3 text-end p-1 w-100" placeholder="0"/>
    </div>
{/if}

{#if quizVisibility}
    <div class="container-sm">
        <div class="table-responsive">
            <table class="table table-bordered align-middle gx-1 w-full">
                <tbody style="border: 1px solid;">
                    <tr>
                        <td class="text-center text-white">#</td>
                        {#each Array(25) as columns, index}
                            <td class="text-white text-center">X{index + 1}</td>
                        {/each}
                    </tr>
                    {#each extremeAddition as rows, index}
                        <tr class="text-center">
                            <td class="text-white">Y{index + 1}</td>
                            {#each rows as column}
                                <td class="text-white">{column}</td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}