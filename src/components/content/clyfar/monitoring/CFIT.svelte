<script lang="ts">
    import { preventDefault } from "svelte/legacy";
    import { userConfig } from "../../../../library/config/baseConfiguration";
    import { db } from "../../../../library/hooks/db";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";
    import cfit from "../../../../json/cfit.json";

    let token: string = $state(''); 
    let enableTest: boolean = $state(false);

    let currentSecond:number    = $state(750);
    let currentAnswers:any      = [];
    let secondAnswers:any       = [];
    let thirdAnswers:any        = [];
    let fourthAnswers:any       = [];

    let secondToken:string = $state('');
    let thirdToken:string = $state('');
    let fourthToken:string = $state('');
    
    let enableViewSecond:boolean    = $state(false);
    let enableViewThird:boolean     = $state(false);
    let enableViewFourth:boolean    = $state(false);

    const answerSelectionFirst: string[] = ['A','B','C','D','E','F'];
    const answerSelectionTwo: string[] = ['A','B','C','D','E'];

    let isPaused:boolean = $state(true);

    const startInterval = setInterval(() => {
        if(isPaused == false){
            currentSecond = currentSecond - 1;
            currentSecond = currentSecond;
        }
    },1000);

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'CFIT'
        }, 'Clyfar/Verify-Token');

        if(status === 'success'){
            enableTest = true;
            isPaused = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        token = '';
        console.error(message);
        return;
    }

    function doCheck(type:string){
        let tokenType:string = '';
        let currentToken:string = '';
        
        if(type == 'Second'){
            tokenType       = '4A764Y';
            currentToken    = secondToken;
        } else if(type == 'Third'){
            tokenType       = 'D915';
            currentToken    = thirdToken;
        } else if(type == 'Fourth'){
            tokenType       = '998A78';
            currentToken    = fourthToken;
        }

        if(tokenType != currentToken){
            return console.error('Token tidak valid!',{ position : 'top-right' });
        }

        if(type == 'Second'){
            enableViewSecond    = true;
        } else if(type == 'Third'){
            enableViewThird     = true;
        } else if (type == 'Fourth'){
            enableViewFourth    = true;
        }
        isPaused = false;
    }

    function removeDuplicate(array: any,key: any){
        return [...new Map(array.map((item: any) => [item[key], item])).values()]
    } 

    function doInput(type:string,answer:string,index:number|string){
        let currentData:object = {
            type    : type,
            index   : index,
            values  : answer
        };
        if(type == 'FIRST'){
            currentAnswers = [...currentAnswers,currentData];
            currentAnswers = currentAnswers;
        } else if(type == 'SECOND'){
            secondAnswers = [...secondAnswers,currentData];
            secondAnswers = secondAnswers;
        } else if(type == 'THIRD'){
            thirdAnswers = [...thirdAnswers,currentData];
            thirdAnswers = thirdAnswers;
        } else if(type == 'FOURTH'){
            fourthAnswers = [...fourthAnswers,currentData];
            fourthAnswers = fourthAnswers;
        }
    }


    async function doSubmit(){
        let filteredData            = removeDuplicate(currentAnswers,'index');
        let filteredDataTwo         = removeDuplicate(secondAnswers,'index');
        let filteredDataThree       = removeDuplicate(thirdAnswers,'index');
        let filteredDataFourth      = removeDuplicate(fourthAnswers,'index');

        // @ts-ignore
        let sortedData              = filteredData.sort((min: number,max: number) => {
            // @ts-ignore
            return min.index - max.index;
        });

        // Done!
        let finalAnswer:object = {
            sortFirst   : sortedData,
            // @ts-ignore
            sortSecond  : filteredDataTwo.sort((min:number,max:number) => { return min.index - max.index }),
            // @ts-ignore
            sortThird   : filteredDataThree.sort((min:number,max:number) => { return min.index - max.index }),
            // @ts-ignore
            sortFourth  : filteredDataFourth.sort((min:number,max:number) => { return min.index - max.index }),
        }

        const { status, message, redirectTo } = await db({
            data : finalAnswer,
            TIPE : 'CFIT',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo); 
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message);
        }
    }

    $effect(() => {
        if(currentSecond == 570){
            isPaused = true;
            console.log("Section 2 telah dibuka", { position : 'top-right' });
        }

        if(currentSecond == 300){
            isPaused = true;
            console.log("Section 3 telah dibuka", { position : 'top-right' });
        }

        if(currentSecond == 150){
            isPaused = true;
            console.log("Section 4 telah dibuka", { position : 'top-right' });
        }

        if(currentSecond == 0){
            clearInterval(startInterval);
            doSubmit();
            console.log("Tes telah berakhir", { position: 'top-right' });
        }
    })
</script>
<div class="bg-light-warning {!enableTest ? 'vh-100' : ''}">
    <div class="container">

        {#if !enableTest}
            <form class="mt-7" onsubmit={checkToken}>
                <div class="card shadow-sm bg-white mt-5">
                    <div class="card-body">
                        <h3 class="mb-5">Test Instruction</h3>
                        <ul class="fw-semibold">
                            <li class="mb-5">Tugas anda disini adalah mencari <b>gambar ke - 4</b> dari 5 gambar yang tersedia pada pilihan jawaban</li>
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
            {#if currentSecond <= 750 && currentSecond >= 571}
                <div class="separator separator-content border-dark my-15"><span class="w-250px fw-bold">Section 1</span></div>
                {#each cfit.FIRST as chapterOne,index }
                    <div class="card shadow-sm my-5 bg-white">
                        <div class="card-header">
                            <h3 class="card-title fw-bolder">Section 1.{index + 1}</h3>
                        </div>
                        <div class="card-body">
                            <img src="/clyfar/CFIT/{chapterOne}.webp" class="img-fluid" alt="Gambar Section 1 Bag. {index}" />
                            <div class="row my-5">
                                {#each answerSelectionFirst as firstSectionAnswer }
                                    <div class="col">
                                        <div class="form-check form-check-custom form-check-solid my-2">
                                            <input class="form-check-input" name="section_1_{index}" type="radio" value="{firstSectionAnswer}" id="section_1_{firstSectionAnswer}_{index}" onclick={() => doInput('FIRST',firstSectionAnswer,index)} required/>
                                            <label class="form-check-label" for="section_1_{firstSectionAnswer}_{index}">{firstSectionAnswer}</label>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                        <!-- <div class="card-footer">
                            {#if index == 12}
                                <button type="button" on:click={() => currentSecond = 570} class="btn btn-sm btn-primary">Selesaikan</button>
                            {/if}
                        </div> -->
                    </div>
                {/each}
            {/if}

            {#if currentSecond <= 570 && currentSecond >= 301}
                <div class="separator separator-content border-dark my-15"><span class="w-250px fw-bold">Section 2</span></div>
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-header">
                        <h3 class="card-title fw-bold">Contoh Pengerjaan 2</h3>
                    </div>
                    <div class="card-body">
                        <img src="/clyfar/CFIT/1.webp" class="img-fluid" alt="Contoh Soal 2">

                        <div class="row my-3">
                            {#each answerSelectionTwo as sampleAnswer}
                                <div class="col">
                                    <div class="form-check form-check-custom form-check-solid my-2">
                                        <input class="form-check-input" type="radio" value="{sampleAnswer}" name="Sample2A" id="Sample2A{sampleAnswer}"/>
                                        <label class="form-check-label" for="Sample2A{sampleAnswer}">{sampleAnswer}</label>
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <div class="row my-3">
                            {#each answerSelectionTwo as sampleAnswer}
                                <div class="col">
                                    <div class="form-check form-check-custom form-check-solid my-2">
                                        <input class="form-check-input" type="radio" value="{sampleAnswer}" name="Sample2B" id="Sample2B{sampleAnswer}"/>
                                        <label class="form-check-label" for="Sample2B{sampleAnswer}">{sampleAnswer}</label>
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <p class="text-center my-5">Durasi Pengerjaan : 4 Menit</p>
                        <p class="my-5">Tugas anda disini adalah dari 5 gambar yang terdapat dalam kotak, <b>pilihlah 2 gambar</b> yang paling <b>berbeda</b> dari lainnya</p>
                    </div>
                    <div class="card-footer">
                        <form onsubmit={preventDefault(() => doCheck('Second'))}>
                            <input type="text" bind:value={secondToken} class="form-control form-control-sm text-center" placeholder="Masukkan Token" />
                            <button type="submit" class="btn btn-sm btn-primary my-2 w-100">Masukkan Token</button>
                        </form>
                    </div>
                </div>
                {#if enableViewSecond == true}
                    {#each cfit.TWO as chapterTwo,index }
                        <div class="card shadow-sm my-5 bg-white">
                            <div class="card-header">
                                <h3 class="card-title fw-bolder">Section 2.{index + 1}</h3>
                            </div>
                            <div class="card-body">
                                <img src="/clyfar/CFIT/{chapterTwo}.webp" class="img-fluid" alt="Gambar Section 2 Bag. {index}" />
                                <div class="row my-3">
                                    {#each answerSelectionTwo as secondSectionAnswer }
                                        <div class="col">
                                            <div class="form-check form-check-custom form-check-solid my-2">
                                                <input class="form-check-input" name="section_2A_{index}" type="radio" value="{secondSectionAnswer}" id="section_2A_{secondSectionAnswer}_{index}" onclick={() => doInput('SECOND',secondSectionAnswer,index + 'A')} required/>
                                                <label class="form-check-label" for="section_2A_{secondSectionAnswer}_{index}">{secondSectionAnswer}</label>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                                <div class="row my-3">
                                    {#each answerSelectionTwo as secondSectionAnswer }
                                        <div class="col">
                                            <div class="form-check form-check-custom form-check-solid my-2">
                                                <input class="form-check-input" name="section_2B_{index}" type="radio" value="{secondSectionAnswer}" id="section_2B_{secondSectionAnswer}_{index}" onclick={() => doInput('SECOND',secondSectionAnswer,index + 'B')} required/>
                                                <label class="form-check-label" for="section_2B_{secondSectionAnswer}_{index}">{secondSectionAnswer}</label>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <!-- <div class="card-footer">
                                {#if index == 13}
                                    <button type="button" on:click={() => currentSecond = 300} class="btn btn-sm btn-primary">Selesaikan</button>
                                {/if}
                            </div> -->
                        </div>
                    {/each}
                {/if}
            {/if}


            {#if currentSecond <= 330 && currentSecond >= 151}
                <div class="separator separator-content border-dark my-15"><span class="w-250px fw-bold">Section 3</span></div>
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-header">
                        <h3 class="card-title fw-bold">Contoh Pengerjaan 3</h3>
                    </div>
                    <div class="card-body">
                        <img src="/clyfar/CFIT/2.webp" class="img-fluid" alt="Contoh Soal 3">
                        <p class="text-center my-5">Durasi Pengerjaan : 3 Menit</p>
                        <p class="my-5">Anda akan menemui 4 buah kotak di samping kiri. 4 buah kotak ini memiliki pola-pola tertentu.
                            <br><b>Pilihlah 1 dari 6 pilihan yang tersedia, yang sesuai untuk mengisi kotak yang kosong</b>
                        </p>
                    </div>
                    <div class="card-footer">
                        <form onsubmit={preventDefault(() => doCheck('Third'))}>
                            <input type="text" bind:value={thirdToken} class="form-control form-control-sm text-center" placeholder="Masukkan Token" />
                            <button type="submit" class="btn btn-sm btn-primary my-2 w-100">Masukkan Token</button>
                        </form>
                    </div>
                </div>
                {#if enableViewThird == true}
                    {#each cfit.THIRD as chapterThree,index }
                        <div class="card shadow-sm my-5 bg-white">
                            <div class="card-header">
                                <h3 class="card-title fw-bolder">Section 3.{index + 1}</h3>
                            </div>
                            <div class="card-body">
                                <img src="/clyfar/CFIT/{chapterThree}.webp" class="img-fluid" alt="Gambar Section 3 Bag. {index}" />
                                <div class="row my-5">
                                    {#each answerSelectionFirst as thirdSectionAnswer }
                                        <div class="col">
                                            <div class="form-check form-check-custom form-check-solid my-2">
                                                <input class="form-check-input" name="section_3_{index}" type="radio" onclick={() => doInput('THIRD',thirdSectionAnswer,index)} value="{thirdSectionAnswer}" id="flexRadioDefault3_{thirdSectionAnswer}_{index}" required/>
                                                <label class="form-check-label" for="flexRadioDefault3_{thirdSectionAnswer}_{index}">{thirdSectionAnswer}</label>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <!-- <div class="card-footer">
                                {#if index == 12}
                                    <button type="button" on:click={() => currentSecond = 150} class="btn btn-sm btn-primary">Selesaikan</button>
                                {/if}
                            </div> -->
                        </div>
                    {/each}
                {/if}
            {/if}

            {#if currentSecond <= 150}
                <div class="separator separator-content border-dark my-15"><span class="w-250px fw-bold">Section 4</span></div>
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-header">
                        <h3 class="card-title fw-bold">Contoh Pengerjaan 4</h3>
                    </div>
                    <div class="card-body">
                        <img src="/clyfar/CFIT/3.webp" class="img-fluid" alt="Contoh Soal 4">
                        <p class="text-center my-5">Durasi Pengerjaan : 2,5 Menit</p>
                        <p class="my-5">Di dalam setiap kotak soal, terdapat sebuah titik. Amati dan pahami prinsip yang diberikan oleh titik terebut. Kemudian
                            <b>Pilihlah 1 dari 5 pilihan yang tersediam yang memiliki prinsip titik yang sama dengan kotak soalnya</b>
                        </p>
                    </div>
                    <div class="card-footer">
                        <form onsubmit={preventDefault(() => doCheck('Fourth'))}>
                            <input type="text" bind:value={fourthToken} class="form-control form-control-sm text-center" placeholder="Masukkan Token" />
                            <button type="submit" class="btn btn-sm btn-primary my-2 w-100">Masukkan Token</button>
                        </form>
                    </div>
                </div>
                {#if enableViewFourth == true}
                    {#each cfit.FOURTH as chapterFour,index }
                        <div class="card shadow-sm my-5 bg-white">
                            <div class="card-header">
                                <h3 class="card-title fw-bolder">Section 4.{index + 1}</h3>
                            </div>
                            <div class="card-body">
                                <img src="/clyfar/CFIT/{chapterFour}.webp" class="img-fluid" alt="Gambar Section 4 Bag. {index}" />
                                <div class="row my-5">
                                    {#each answerSelectionTwo as fourthSectionAnswer }
                                        <div class="col">
                                            <div class="form-check form-check-custom form-check-solid my-2">
                                                <input class="form-check-input" name="section_4_{index}" type="radio" value="{fourthSectionAnswer}" onclick={() => doInput('FOURTH',fourthSectionAnswer,index)} id="flexRadioDefault4_{fourthSectionAnswer}_{index}" required/>
                                                <label class="form-check-label" for="flexRadioDefault4_{fourthSectionAnswer}_{index}">{fourthSectionAnswer}</label>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <!-- <div class="card-footer">
                                {#if index == 10}
                                    <button type="button" on:click={() => currentSecond = 3} class="btn btn-sm btn-primary">Selesaikan</button>
                                {/if}
                            </div> -->
                        </div>
                    {/each}
                {/if}
            {/if}

            <div class="separator my-15"></div>

            <div class="fixed-bottom d-flex justify-content-center p-3">
                <button class="btn btn-dark position-absolute bottom-0  mb-3">
                    Sisa Waktu : {currentSecond} Detik
                </button>
            </div>

        {/if}
    </div>
</div>