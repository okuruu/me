<script lang="ts">
    import SamplePapi from "../sample/SamplePapi.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfig } from "$lib/strings/baseConfig";
    import { updateCurrentTest } from "$lib/utils/storage";
    import { papikostick } from "$lib/strings/psychological/papikostick";

    let token: string; 
    let enableTest: boolean = false;

    const checkToken = () => {
        if(token === 'Lumos'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return toast.success("Selamat mengerjakan");
        }
        token = '';
        return toast.error("Token tidak sesuai");
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
        const doPost = await fetch($baseConfig.url + '#Waiting',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                PAPI : answers
            })
        });
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // 'KRAEPLIN'
            $baseConfig.currentTest = redirectTo; // 'KRAEPLIN'
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="container mx-auto p-2">
    {#if !enableTest}
        <SamplePapi/>
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                <form on:submit|preventDefault={checkToken} class="mt-3">
                    <input type="text" bind:value={token} placeholder="Masukkan token" class="input text-center input-bordered w-full" required/>
                    <button type="submit" class="btn btn-neutral w-full mt-3">Verifikasi Token</button>
                </form>
            </div>
        </div>
    {:else if enableTest}
        <form on:submit|preventDefault={isValid}>
            {#each Array(90) as data,index }
                <div class="card w-full bg-base-100 shadow-xl my-5">
                    <div class="card-body">

                        <div class="badge badge-secondary font-semibold">#{index + 1}</div>
                    
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text">{papikostick.A[index]}</span> 
                                <input type="radio" name="Papi_{index}" value="A" class="radio checked:bg-blue-500" on:click={() => setAnswer(index,'A')}  required/>
                            </label>
                        </div>
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text">{papikostick.B[index]}</span> 
                                <input type="radio" name="Papi_{index}" value="B" class="radio checked:bg-red-500" on:click={() => setAnswer(index,'B')}  required/>
                            </label>
                        </div>

                    </div>
                </div>
            {/each}
            <button type="submit" class="btn btn-neutral w-full">Selesaikan Tes</button>
        </form>
    {/if}
</div>