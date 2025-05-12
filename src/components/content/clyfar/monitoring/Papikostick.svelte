<script lang="ts">
    import ExamplePapi from "./ExamplePapi.svelte";
    import { db } from "../../../../library/hooks/db";
    import papikostick from "../../../../json/psychological/papikostick.json";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";
    import { userConfig } from "../../../../library/config/useConfiguration";

    let token: string = $state(''); 
    let enableTest: boolean = $state(false);

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'PAPI'
        }, 'Clyfar/Verify-Token');
        
        if(status === 'success'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        token = '';
        return;
    }

    let answerList:any = [];

    function setAnswer(ID:number,value:string){
        answerList = [...answerList, {
            index : ID,
            value : value
        }];
        answerList = answerList;
    }

    function removeDuplicate(array:any,key:any){
        return [...new Map(array.map((item:any) => [item[key], item])).values()]
    }

    const isValid = () => {
        let answers = answerList;
        let uniqueAnswers = removeDuplicate(answers, 'index');
        // @ts-ignore
        let sortedAnswers = uniqueAnswers.sort((a, b) => a.index - b.index);

        if(sortedAnswers.length !== 90){
            return console.error("Anda belum melengkapi semua subtes!");
        }

        doPost(answers);
    }

    async function doPost(answers: any): Promise<void> {
        const { status, message, redirectTo } = await db({
            data : answers,
            TIPE : 'PAPI',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'KRAEPLIN'
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message);
        }
    }
</script>
<div class="bg-light-warning">
    <div class="container-xs">
    {#if !enableTest}
        <form class="mt-5" onsubmit={checkToken}>
            <ExamplePapi/>
            <div class="p-5 rounded shadow-sm bg-white mt-5">
                <div class="d-flex justify-content-center">
                    <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-3" placeholder="Masukkan Password" required/>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn btn-sm btn-gradient text-white w-100">Verifikasi Password</button>
                </div>
            </div>
        </form>
    {:else}
        <form onsubmit={isValid}>
            {#each Array(90) as data,index }
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-body">
                        <div class="form-group">
                            <div class="form-check form-check-custom form-check-solid my-2">
                                <input class="form-check-input" type="radio" name="Papi_{index}" value="A" id="{`Papi_A_${index}`}" onclick={() => setAnswer(index,'A')} required/>
                                <label class="form-check-label ms-7" for="{`Papi_A_${index}`}">
                                    {papikostick.A[index]}
                                </label>
                            </div>
                            <div class="form-check form-check-custom form-check-danger form-check-solid my-2">
                                <input class="form-check-input" type="radio" name="Papi_{index}" value="B" id="{`Papi_B_${index}`}" onclick={() => setAnswer(index,'B')} required/>
                                <label class="form-check-label ms-7" for="{`Papi_B_${index}`}">
                                    {papikostick.B[index]}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
            <button type="submit" class="btn btn-sm btn-gradient text-white text-center shadow-sm w-100">Selesaikan Tes</button>
        </form>
    {/if}
    </div>
</div>