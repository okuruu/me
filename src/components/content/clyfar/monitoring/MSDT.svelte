<script lang="ts">
    import msdt from "../../../../json/psychological/msdt.json";
    import { db } from "../../../../library/hooks/db";
    import { userConfig } from "../../../../library/config/useConfiguration";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";

    let token: string = $state(''); 
    let enableTest: boolean = $state(false);

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
            console.log(message);
            return;
        }

        token = '';
        console.error(message);
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
            return console.error("Anda belum melengkapi semua subtes!");
        }

        doPost(sortedAnswers)
    }

    async function doPost(answers: any): Promise <void> {
        const { status, message, redirectTo } = await db({
            data : answers,
            TIPE : 'MSDT',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo); // CFIT
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message);
        }
    }
</script>
<div class="bg-light-warning {!enableTest ? 'vh-100' : ''}">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" onsubmit={checkToken}>
                <div class="card shadow-sm bg-white">
                    <div class="card-body">
                        <h3 class="mb-5">Test Instruction</h3>
                        <ul class="fw-semibold">
                            <li class="mb-5">Terdapat 64 pasang pernyataan di bawah ini, dimana setiap nomor memiliki 2 pasang pernyataan.</li>
                            <li class="mb-5">Tugas Anda adalah memilih satu jawaban yang paling sesuai atau yang paling mencerminkan diri Anda.</li>
                            <li class="mb-5">Jika kedua pernyataan tersebut sama-sama sesuai atau tidak sesuai dengan diri Anda, maka pilihlah pernyataan yang <span class="fw-bold text-danger">"PALING MENDEKATI"</span> diri Anda.</li>
                            <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini tidak ada jawaban yang dianggap benar atau salah.</li>
                        </ul>
                    </div>
                </div>
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
                {#each Array(64) as _,index}
                    <div class="p-7 w-full my-3 border border border-gray-700 rounded bg-white">
                        <div class="badge badge-secondary fw-semibold">#{index + 1}</div>
                        <div class="table-responsive">
                            <table class="table align-middle ">
                                <tbody>
                                    <tr>
                                        <td>
                                            <span class="mr-2">{newData.A[index]}</span>
                                        </td>
                                        <td>
                                            <input type="radio" name="MSDT_{index}" value="A" class="form-check-input ms-4" onclick={() => setAnswer(index, 'A')} required />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="mr-2">{newData.B[index]}</span>
                                        </td>
                                        <td>
                                            <input type="radio" name="MSDT_{index}" value="B" class="form-check-input ms-4" onclick={() => setAnswer(index, 'B')} required />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {#if index == 63}
                        <div class="mt-5">
                            <button type="submit" class="btn btn-sm btn-light-primary text-center shadow-sm w-100">Selesaikan Tes</button>
                        </div>
                    {/if}
                {/each}
            </form>
        {/if}
    </div>
</div>