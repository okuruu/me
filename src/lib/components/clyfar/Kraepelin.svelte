<script lang="ts">
    import { kobo } from '$lib/utils/kobo';
    import { baseConfig } from '$lib/strings/baseConfig';
    import toast, { Toaster } from 'svelte-french-toast';
    import { updateCurrentTest } from '$lib/utils/storage';
    import SampleKraeplin from "../sample/SampleKraeplin.svelte";
    import { kraeplin } from '$lib/strings/psychological/kraeplin';

    let token: string;
    let enableTest: boolean = false;

    let timer: number = 15;
    let index: number = 0;
    let subIndex: number = 0;

    let answer: number[] = [];
    let allAnswer: number[][] = [];

    const startInterval = setInterval(() => {
        if(enableTest == true){
            if(index == 49 && timer == 0){
                clearInterval(startInterval);
                isValid();
                return;
            } else if(timer == 0){
                timer = 15;
                index += 1;
                subIndex = 0;
                allAnswer.push(answer);
                answer = [];
            }
            timer = timer - 1;
        }
    }, 1000);

    const onTap = (id: number) => {
        if(subIndex < 27 - 1){
            subIndex += 1;
        }

        if(answer.length == 27){
            return;
        }
        answer.push(id)

    };

    async function checkToken(): Promise <void> {
        const { status, message } = await kobo({
            'token' : token,
            'type' : 'Kraepelin'
        }, 'Clyfar/Verify-Token');
        
        if(status === 'success'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success(message);
            return;
        }

        token = '';
        toast.error(message);
        return;
    }

    const isValid = () => {
        if(allAnswer.length == 49){
            clearInterval(startInterval);
            doPost();
        }
    }

    async function doPost(): Promise <void> {
        const doPost = await fetch($baseConfig.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                KRAEPLIN : allAnswer,
                TIPE : 'Kraepelin'
            })
        });
        
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'BAUM'
            $baseConfig.currentTest = redirectTo; // 'BAUM'
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="container mx-auto p-2">
    {#if !enableTest}
        <SampleKraeplin/>
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                <form on:submit|preventDefault={checkToken}>
                    <input type="text" bind:value={token} placeholder="Masukkan token" class="input text-center input-bordered w-full" required/>
                    <button type="submit" class="btn btn-neutral w-full mt-3">Verifikasi Token</button>
                </form>
            </div>
        </div>
    {:else if enableTest}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">

                <div class="flex justify-end my-12">
                    <p class="font-semibold">{timer}</p>
                </div>
                
                <h1 class="text-6xl font-bold text-center my-6">{kraeplin[index][subIndex]}</h1>
                
                <div class="grid grid-cols-3 gap-2 my-5">
                    <button type="button" on:click={() => onTap(1)} class="btn btn-lg btn-neutral">1</button>
                    <button type="button" on:click={() => onTap(2)} class="btn btn-lg btn-neutral">2</button>
                    <button type="button" on:click={() => onTap(3)} class="btn btn-lg btn-neutral">3</button>
                    <button type="button" on:click={() => onTap(4)} class="btn btn-lg btn-neutral">4</button>
                    <button type="button" on:click={() => onTap(5)} class="btn btn-lg btn-neutral">5</button>
                    <button type="button" on:click={() => onTap(6)} class="btn btn-lg btn-neutral">6</button>
                    <button type="button" on:click={() => onTap(7)} class="btn btn-lg btn-neutral">7</button>
                    <button type="button" on:click={() => onTap(8)} class="btn btn-lg btn-neutral">8</button>
                    <button type="button" on:click={() => onTap(9)} class="btn btn-lg btn-neutral">9</button>
                    <button type="button" class="btn btn-lg btn-dark" disabled></button>
                    <button type="button" on:click={() => onTap(0)} class="btn btn-lg btn-neutral">0</button>
                    <button type="button" class="btn btn-lg btn-neutral" disabled></button>
                </div>

            </div>
        </div>
    {/if}
</div>