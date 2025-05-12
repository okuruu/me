<script lang="ts">
    import { db } from "../../../../library/hooks/db";
    import kraepelin from "../../../../json/psychological/kraepelin.json";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";
    import { userConfig } from "../../../../library/config/useConfiguration";
    import ExampleKraeplin from "./ExampleKraeplin.svelte";

    let token: string = $state('');
    let enableTest: boolean = $state(false);

    let timer: number = $state(15);
    let index: number = $state(0);
    let subIndex: number = $state(0);

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
            return;
        }

        token = '';
        return;
    }

    const isValid = () => {
        if(allAnswer.length == 49){
            clearInterval(startInterval);
            doPost();
        }
    }

    async function doPost(): Promise <void> {
        const { status, message, redirectTo } = await db({
            data : allAnswer,
            TIPE : 'KRAEPLIN',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'BAUM'
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message)
        }
    }
</script>
<div class="bg-light-warning min-vh-100 min-wh-100">
    <div class="container-xs">
        {#if !enableTest}
            <ExampleKraeplin/>
            <form onsubmit={checkToken}>
                <div class="d-flex justify-content-center mt-15">
                    <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-3" placeholder="Masukkan Password" required/>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn btn-sm btn-gradient text-white w-100">Verifikasi Password</button>
                </div>
            </form>
        {:else}
            <div class="d-flex justify-content-end mt-12">
                <span class="h4">{timer}</span>
            </div>
            
            <h1 class="text-center display-3 my-5">{kraepelin[index][subIndex]}</h1>
            
            <div class="row mt-12">
                <div class="col-4"><button type="button" onclick={() => onTap(1)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">1</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(2)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">2</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(3)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">3</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(4)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">4</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(5)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">5</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(6)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">6</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(7)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">7</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(8)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">8</span></button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(9)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">9</span></button></div>
                <div class="col-4"><button type="button" class="btn btn-lg btn-flush w-100 p-5 fw-bold" disabled>-</button></div>
                <div class="col-4"><button type="button" onclick={() => onTap(0)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">0</span></button></div>
                <div class="col-4"><button type="button" class="btn btn-lg btn-flush w-100 p-5 fw-bold" disabled>-</button></div>
            </div>
        {/if}
    </div>
</div>