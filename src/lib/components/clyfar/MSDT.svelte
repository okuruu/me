<script lang="ts">
    import { baseConfig } from "$lib/strings/baseConfig";
    import { msdt } from "$lib/strings/psychological/msdt";
    import { updateCurrentTest } from "$lib/utils/storage";
    import SampleMSDT from "../sample/SampleMSDT.svelte";
    import toast, { Toaster } from 'svelte-french-toast';

    let token: string; 
    let enableTest: boolean = false;

    let newData: any = msdt;
    let answerList: any = [];

    const checkToken = () => {
        if(token === 'Stupefy'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return toast.success("Selamat mengerjakan");
        }
        token = '';
        return toast.error("Token tidak sesuai");
    }

    function setAnswer(ID: number, value: string) {
        answerList = [...answerList, {
            index: ID,
            value: value
        }];
        answerList = answerList;
    }
    function removeDuplicate(array:any, key:any) {
        return [...new Map(array.map((item:any) => [item[key], item])).values()]
    }

    const isValid = () => {
        let answers = answerList;
        let uniqueAnswers = removeDuplicate(answers, 'index');
        // @ts-ignore
        let sortedAnswers = uniqueAnswers.sort((a, b) => a.index - b.index);

        if(sortedAnswers.length !== 64){
            return toast.error("Anda belum melengkapi semua subtes!");
        }

        doPost(sortedAnswers)
    }

    async function doPost(answers: any): Promise <void> {
         // const doPost = await fetch($baseConfig.url + '???',{
        //     method : 'post',
        //     headers : { 'Content-Type' : 'application/json' },
        //     body : JSON.stringify({
        //         CFIT : answers
        //     })
        // });
        // const { status, message, redirectTo } = await doPost.json();

        // if(status === 'success'){
            updateCurrentTest('CFIT');
            $baseConfig.currentTest = 'CFIT';
        // } else {
        //     toast.error(message);
        // }
    }

</script>
<Toaster/>
<div class="container mx-auto p-2">
    {#if !enableTest}
        <SampleMSDT/>
        <form on:submit|preventDefault={checkToken} class="mt-3">
            <input type="text" bind:value={token} placeholder="Masukkan token" class="input text-center input-bordered w-full" required/>
            <button type="submit" class="btn btn-neutral w-full mt-3">Verifikasi Token</button>
        </form>
    {:else if enableTest}
        <form on:submit|preventDefault={isValid}>
            {#each Array(64) as _,index}
                <div class="card w-full bg-base-100 shadow-xl my-5">
                    <div class="card-body">
                        <div class="badge badge-secondary font-semibold">#{index + 1}</div>
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text"><span class="mr-2">{newData.A[index]}</span>
                            </span> 
                                <input type="radio" name="MBTI_{index}" value="A" class="radio checked:bg-blue-500 ms-4"  on:click={() => setAnswer(index,'A')} required/>
                            </label>
                        </div>
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <span class="label-text">{newData.B[index]}</span> 
                                <input type="radio" name="MBTI_{index}" value="B" class="radio checked:bg-red-500 ms-4" on:click={() => setAnswer(index,'B')} required/>
                            </label>
                        </div>
                    </div>
                </div>

                {#if index == 63}
                    <div class="mt-5">
                        <button type="submit" class="btn btn-neutral w-full">Selesaikan Tes</button>
                    </div>
                {/if}
            {/each}
        </form>
    {/if}
</div>
