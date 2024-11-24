<script lang="ts">
    import disc from "../../../../json/psychological/disc.json";
    import ExampleDisc from "./ExampleDISC.svelte";
    import { db } from "../../../../library/hooks/db";
    import { userConfig } from "../../../../library/config/baseConfiguration";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";

    let token: string = $state(''); 
    let enableTest: boolean = $state(false);

    let data: { Most : number|null; Least : number|null; }[] = [];

    $effect(() => {
        for(let i: number = 0; i < 24; i++){
            data = [...data,{
                Most : null,
                Least : null
            }]
        }
        data = data;
    });

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'DISC'
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

    function setValue(index: number, value: number, letter: string) {
        if (letter === 'Most') {
            if (data[index].Most === null) {
                if (data[index].Least === value) {
                    console.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    console.error("Nilai tidak boleh sama!");
                    return;
                }
            }
            data[index].Most = value;
        } else {
            if (data[index].Least === null) {
                if (data[index].Most === value) {
                    console.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    console.error("Nilai tidak boleh sama!");
                    return;
                } else if (data[index].Most === data[index].Least && data[index].Most === value) {
                    console.error("Nilai tidak boleh sama!");
                    return;
                }
            }
            data[index].Least = value;
        }
    }

    const isValid = () => {
        let isValid = true;

        data.forEach((element) => {
            if(element.Most == null || element.Least == null){
                isValid = false;
                return;
            }
        });

        if(!isValid){
            return console.error("Anda belum melengkapi semua subtes!");
        }
        
        doPost();
    }

    async function doPost(): Promise <void> {
        const { status, message, redirectTo } = await db({
            data : data,
            TIPE : 'DISC',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message);
        }
    }
</script>
<div class="bg-light-warning">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" onsubmit={checkToken}>
                <ExampleDisc/>
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
            {#each disc as DISC ,index}
                <div class="card shadow-sm my-3 bg-white">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table align-middle text-center">
                                <thead>
                                    <tr class="fw-bolder">
                                        <th class="px-4 py-2"></th>
                                        <th class="px-4 py-2">M</th>
                                        <th class="px-4 py-2">L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="px-4 py-2">{DISC.LV_1}</td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="M{index}" onclick={() => setValue(index,1, 'Most')}>
                                        </td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="L{index}" onclick={() => setValue(index,1, 'Least')}>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2">{DISC.LV_2}</td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="M{index}" onclick={() => setValue(index,2, 'Most')}>
                                        </td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="L{index}" onclick={() => setValue(index,2, 'Least')}>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2">{DISC.LV_3}</td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="M{index}" onclick={() => setValue(index,3, 'Most')}>
                                        </td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="L{index}" onclick={() => setValue(index,3, 'Least')}>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2">{DISC.LV_4}</td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="M{index}" onclick={() => setValue(index,4, 'Most')}>
                                        </td>
                                        <td class="px-4 py-2">
                                            <input class="form-check-input" type="radio" name="L{index}" onclick={() => setValue(index,4, 'Least')}>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            {/each}
            <button type="button" onclick={isValid} class="btn btn-sm btn-light-primary text-center shadow-sm w-100">Selesaikan Tes</button>
        {/if}
    </div>
</div>