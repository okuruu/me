<script lang="ts">
    import { db } from '../../../utils/db';
    import { userText } from '../../../strings';
    import { mbti } from '../../../resources/mbti';
    import toast, { Toaster } from 'svelte-french-toast';
    import ExampleMbti from '../sample/ExampleMBTI.svelte';
    import { updateCurrentTest } from '../../../utils/userStorage';
    import { formatCapitalize } from '../../../utils/formatCapitalize';

    let token: string; 
    let enableTest: boolean = false;

    let userAnswers: { index: number; answer: number }[] = [];

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'MBTI'
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

    const setUserAnswer = (answer: number, index: number) => {
        userAnswers = [...userAnswers, {
            index: index,
            answer: answer
        }]
        userAnswers = userAnswers
    }

    const isValid = () => {
        const uniqueIndices = new Set();

        // Remove duplicates directly from userAnswers
        const filteredUserAnswers = userAnswers.filter(item => {
            if (!uniqueIndices.has(item.index)) {
                uniqueIndices.add(item.index);
                return true;
            }
            return false;
        });

        let userInput: { [key: number]: number } = {}; // Change to an object to easily access by index

        // Populate userInput with filtered data
        filteredUserAnswers.forEach(item => {
            userInput[item.index] = item.answer;
        });

        let dimensionA = [];
        let dimensionB = [];
        let mbti = '';

        for (let i = 1; i <= 60; i++) {
            dimensionA[i] = userInput[i] === 1 ? 1 : 0;
            dimensionB[i] = userInput[i] === 2 ? 1 : 0;
        }

        let introversion = (dimensionB[60] + dimensionB[52] + dimensionA[45] + dimensionA[38] + dimensionB[35] + dimensionA[31] + dimensionA[29] + dimensionB[28] + dimensionA[20] + dimensionA[15] + dimensionA[11] + dimensionA[10] + dimensionB[7] + dimensionB[5] + dimensionA[2]) / 15;
        let extraversion = (dimensionA[60] + dimensionA[52] + dimensionB[45] + dimensionB[38] + dimensionA[35] + dimensionB[31] + dimensionB[29] + dimensionA[28] + dimensionB[20] + dimensionB[15] + dimensionB[11] + dimensionB[10] + dimensionA[7] + dimensionA[5] + dimensionB[2]) / 15;
        let sensing = (dimensionA[53] + dimensionA[51] + dimensionA[46] + dimensionA[43] + dimensionA[41] + dimensionA[36] + dimensionA[34] + dimensionA[27] + dimensionA[25] + dimensionB[22] + dimensionB[18] + dimensionA[16] + dimensionA[13] + dimensionA[8] + dimensionB[6]) / 15;
        let intuition = (dimensionB[53] + dimensionB[51] + dimensionB[46] + dimensionB[43] + dimensionB[41] + dimensionB[36] + dimensionB[34] + dimensionB[27] + dimensionB[25] + dimensionA[22] + dimensionA[18] + dimensionB[16] + dimensionB[13] + dimensionB[8] + dimensionA[6]) / 15;
        let thinking = (dimensionA[58] + dimensionA[57] + dimensionA[55] + dimensionB[49] + dimensionA[48] + dimensionA[42] + dimensionB[39] + dimensionA[37] + dimensionA[23] + dimensionB[32] + dimensionA[30] + dimensionA[17] + dimensionB[9] + dimensionA[4] + dimensionA[14]) / 15;
        let feeling = (dimensionB[58] + dimensionB[57] + dimensionB[55] + dimensionA[49] + dimensionB[48] + dimensionB[42] + dimensionA[39] + dimensionB[37] + dimensionB[23] + dimensionA[32] + dimensionB[30] + dimensionB[17] + dimensionA[9] + dimensionB[4] + dimensionB[14]) / 15;
        let judging = (dimensionB[59] + dimensionA[56] + dimensionA[54] + dimensionB[50] + dimensionA[47] + dimensionB[44] + dimensionB[40] + dimensionB[33] + dimensionB[26] + dimensionA[24] + dimensionB[21] + dimensionA[19] + dimensionB[12] + dimensionA[3] + dimensionB[1]) / 15;
        let perceiving = (dimensionA[59] + dimensionB[56] + dimensionB[54] + dimensionA[50] + dimensionB[47] + dimensionA[44] + dimensionA[40] + dimensionA[33] + dimensionA[26] + dimensionB[24] + dimensionA[21] + dimensionB[19] + dimensionA[12] + dimensionB[3] + dimensionA[1]) / 15;

        mbti = (introversion > extraversion ? 'I' : 'E') + (sensing > intuition ? 'S' : 'N') + (thinking > feeling ? 'T' : 'F') + (judging > perceiving ? 'J' : 'P');
        doPost(mbti)
    }

    async function doPost(mbti: any): Promise <void> {
        const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : mbti,
                TIPE : 'MBTI',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo); // MSDT
            userText.currentTest = redirectTo; // MSDT
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="bg-clyfar {!enableTest ? 'vh-100' : ''}">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" on:submit|preventDefault={checkToken}>
                <ExampleMbti/>
                <div class="p-5 rounded shadow-sm bg-white mt-5">
                    <div class="d-flex justify-content-center mt-5">
                        <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-3" placeholder="Masukkan Password" required/>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-sm btn-primary w-100">Verifikasi Password</button>
                    </div>
                </div>
            </form>
        {:else}
            <form on:submit|preventDefault={isValid}>
                {#each mbti as mbti,index}
                    <div class="p-7 w-full my-3 border border border-gray-700 rounded bg-white">
                        <div class="badge badge-secondary fw-semibold">#{index + 1}</div>
                        <div class="table-responsive">
                            <table class="table align-middle">
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="mr-2">{formatCapitalize(mbti.A)}</span>
                                        </td>
                                        <td>
                                            <input type="radio" name="MBTI_{index}" value="A" class="form-check-input ms-4" on:click={() => setUserAnswer(1, mbti.index)} required />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="mr-2">{formatCapitalize(mbti.B)}</span>
                                        </td>
                                        <td>
                                            <input type="radio" name="MBTI_{index}" value="B" class="form-check-input ms-4" on:click={() => setUserAnswer(2, mbti.index)} required />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/each}
                <button type="submit" class="btn btn-sm btn-light-primary text-center shadow-sm w-100">Selesaikan Tes</button>
            </form>
        {/if}
    </div>
</div>