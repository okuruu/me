<script lang="ts">
    import { db } from '../../../utils/db';
    import { userText } from '../../../strings';
    import toast, { Toaster } from 'svelte-french-toast';
    import ExamplePapi from "../sample/ExamplePapi.svelte";
    import { papikostick } from '../../../resources/papikostick';
    import { updateCurrentTest } from '../../../utils/userStorage';

    let token: string; 
    let enableTest: boolean = false;

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'PAPI'
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
            return toast.error("Anda belum melengkapi semua subtes!");
        }

        doPost(answers);
    }

    async function doPost(answers: any): Promise<void> {
        const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : answers,
                TIPE : 'PAPI',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });
        
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'KRAEPLIN'
            userText.currentTest = redirectTo; // 'KRAEPLIN'
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
{#if !enableTest}
    <ExamplePapi/>
    <form on:submit|preventDefault={checkToken}>
        <div class="container-xs">
            <div class="d-flex justify-content-center">
                <input type="text" bind:value={token} class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3 w-50" placeholder="Masukkan Password" required/>
            </div>
            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Verifikasi Password</button>
            </div>
        </div>
    </form>
{:else}
    <div class="container-xs">
        <form on:submit|preventDefault={isValid}>
            {#each Array(90) as data,index }
                <div class="p-7 w-full my-3 border border border-gray-700 rounded">
                    <div class="form-group">
                        <div class="form-check form-check-custom form-check-solid my-2">
                            <input class="form-check-input" type="radio" name="Papi_{index}" value="A" id="{`Papi_A_${index}`}" on:click={() => setAnswer(index,'A')} required/>
                            <label class="form-check-label text-white ms-7" for="{`Papi_A_${index}`}">
                                {papikostick.A[index]}
                            </label>
                        </div>
                        <div class="form-check form-check-custom form-check-danger form-check-solid my-2">
                            <input class="form-check-input" type="radio" name="Papi_{index}" value="B" id="{`Papi_B_${index}`}" on:click={() => setAnswer(index,'B')} required/>
                            <label class="form-check-label text-white ms-7" for="{`Papi_B_${index}`}">
                                {papikostick.B[index]}
                            </label>
                        </div>
                    </div>
                </div>
            {/each}
            <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Selesaikan Tes</button>
        </form>
    </div>
{/if}