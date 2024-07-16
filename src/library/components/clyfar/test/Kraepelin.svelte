<script lang="ts">
    import { db } from '../../../utils/db';
    import { userText } from '../../../strings';
    import toast, { Toaster } from 'svelte-french-toast';
    import { kraeplin } from '../../../resources/kraeplin';
    import { updateCurrentTest } from '../../../utils/userStorage';
    import ExampleKraeplin from '../sample/ExampleKraeplin.svelte';

    let token: string;
    let enableTest: boolean = true;

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
        const { status, message } = await db({
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
        const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : allAnswer,
                TIPE : 'KRAEPLIN',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });
        
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'BAUM'
            userText.currentTest = redirectTo; // 'BAUM'
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="container-xs">
    {#if !enableTest}
        <form on:submit|preventDefault={checkToken}>
            <ExampleKraeplin/>
            <div class="d-flex justify-content-center mt-15">
                <input type="text" bind:value={token} class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3 w-50" placeholder="Masukkan Password" required/>
            </div>
            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Verifikasi Password</button>
            </div>
        </form>
    {:else}
        <div class="d-flex justify-content-end mt-12">
            <span class="text-muted h4">{timer}</span>
        </div>
        
        <h1 class="text-white text-center display-3 my-5">{kraeplin[index][subIndex]}</h1>
        
        <div class="row mt-12">
            <div class="col-4"><button type="button" on:click={() => onTap(1)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">1</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(2)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">2</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(3)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">3</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(4)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">4</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(5)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">5</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(6)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">6</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(7)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">7</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(8)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">8</span></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(9)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">9</span></button></div>
            <div class="col-4"><button type="button" class="btn btn-lg btn-dark w-100 fw-bold"></button></div>
            <div class="col-4"><button type="button" on:click={() => onTap(0)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">0</span></button></div>
            <div class="col-4"><button type="button" class="btn btn-lg btn-dark w-100 fw-bold"></button></div>
        </div>
    {/if}
</div>