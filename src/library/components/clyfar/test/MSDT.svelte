<script lang="ts">
    import { db } from "../../../utils/db";
    import { userText } from "../../../strings";
    import { msdt } from "../../../resources/msdt";
    import toast, { Toaster } from 'svelte-french-toast';
    import ExampleMsdt from "../sample/ExampleMSDT.svelte";
    import { updateCurrentTest } from "../../../utils/userStorage";

    
    let token: string; 
    let enableTest: boolean = false;

    let newData: any = msdt;
    let answerList: any = [];

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'MSDT'
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
         const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : answers,
                TIPE : 'MSDT',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // CFIT
            userText.currentTest = redirectTo; // CFIT
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="container-xs">
    {#if !enableTest}
        <form on:submit|preventDefault={checkToken}>
            <ExampleMsdt/>
            <div class="d-flex justify-content-center">
                <input type="text" bind:value={token} class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3 w-50" placeholder="Masukkan Password" required/>
            </div>
            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Verifikasi Password</button>
            </div>
        </form>
    {:else}
        <form on:submit|preventDefault={isValid}>
            {#each Array(64) as _,index}
                <div class="p-7 w-full my-3 border border border-gray-700 rounded">
                    <div class="badge badge-secondary fw-semibold">#{index + 1}</div>
                    
                    <div class="table-responsive">
                        <table class="table align-middle text-white">
                            <tbody>
                                <tr>
                                    <td>
                                        <span class="mr-2">{newData.A[index]}</span>
                                    </td>
                                    <td>
                                        <input type="radio" name="MBTI_{index}" value="A" class="form-check-input ms-4" on:click={() => setAnswer(index, 'A')} required />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span class="mr-2">{newData.B[index]}</span>
                                    </td>
                                    <td>
                                        <input type="radio" name="MBTI_{index}" value="B" class="form-check-input ms-4" on:click={() => setAnswer(index, 'B')} required />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {#if index == 63}
                    <div class="mt-5">
                        <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Selesaikan Tes</button>
                    </div>
                {/if}
            {/each}
        </form>
    {/if}
</div>