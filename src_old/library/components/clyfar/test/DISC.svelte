<script lang="ts">
    import { preventDefault } from 'svelte/legacy';

    import { onMount } from 'svelte';
    import { db } from '../../../utils/db';
    import { disc } from '../../../resources/disc';
    import toast, { Toaster } from 'svelte-french-toast';
    import ExampleDisc from '../sample/ExampleDISC.svelte';
    import { userConfig, userText } from '../../../strings';
    import { updateCurrentTest } from '../../../utils/userStorage';

    let token: string = $state(); 
    let enableTest: boolean = $state(false);

    let data: { Most : number|null; Least : number|null; }[] = [];

    onMount(() => {
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
            toast.success(message);
            return;
        }

        token = '';
        toast.error(message);
        return;
    }

    function setValue(index: number, value: number, letter: string) {
        if (letter === 'Most') {
            if (data[index].Most === null) {
                if (data[index].Least === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            }
            data[index].Most = value;
        } else {
            if (data[index].Least === null) {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                } else if (data[index].Most === data[index].Least && data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
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
            return toast.error("Anda belum melengkapi semua subtes!");
        }
        
        doPost();
    }

    async function doPost(): Promise <void> {
        const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : data,
                TIPE : 'DISC',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });

        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="bg-clyfar">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" onsubmit={preventDefault(checkToken)}>
                <ExampleDisc/>
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