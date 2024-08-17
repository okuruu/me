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
<div class="bg-clyfar">
    <div class="container-xs">
    {#if !enableTest}
        <form class="mt-5" on:submit|preventDefault={checkToken}>
            <ExamplePapi/>
            <div class="p-5 rounded shadow-sm bg-white mt-5">
                <div class="d-flex justify-content-center">
                    <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-3" placeholder="Masukkan Password" required/>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn btn-sm btn-primary w-100">Verifikasi Password</button>
                </div>
            </div>
        </form>
    {:else}
        <form on:submit|preventDefault={isValid}>
            {#each Array(90) as data,index }
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-body">
                        <div class="form-group">
                            <div class="form-check form-check-custom form-check-solid my-2">
                                <input class="form-check-input" type="radio" name="Papi_{index}" value="A" id="{`Papi_A_${index}`}" on:click={() => setAnswer(index,'A')} required/>
                                <label class="form-check-label ms-7" for="{`Papi_A_${index}`}">
                                    {papikostick.A[index]}
                                </label>
                            </div>
                            <div class="form-check form-check-custom form-check-danger form-check-solid my-2">
                                <input class="form-check-input" type="radio" name="Papi_{index}" value="B" id="{`Papi_B_${index}`}" on:click={() => setAnswer(index,'B')} required/>
                                <label class="form-check-label ms-7" for="{`Papi_B_${index}`}">
                                    {papikostick.B[index]}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
            <button type="submit" class="btn btn-sm btn-light-primary text-center shadow-sm w-100">Selesaikan Tes</button>
        </form>
    {/if}
    </div>
</div>
