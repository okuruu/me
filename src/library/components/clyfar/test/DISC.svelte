<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '../../../utils/db';
    import { userText } from '../../../strings';
    import { disc } from '../../../resources/disc';
    import toast, { Toaster } from 'svelte-french-toast';
    import ExampleDisc from '../sample/ExampleDISC.svelte';
    import { updateCurrentTest } from '../../../utils/userStorage';

    let token: string; 
    let enableTest: boolean = false;

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
            userText.currentTest = redirectTo;
        } else {
            toast.error(message);
        }
    }
</script>
<Toaster/>
<div class="container-xs">
    {#if !enableTest}
        <form on:submit|preventDefault={checkToken}>
            <ExampleDisc/>
            <div class="d-flex justify-content-center">
                <input type="text" bind:value={token} class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3 w-50" placeholder="Masukkan Password" required/>
            </div>
            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Verifikasi Password</button>
            </div>
        </form>
    {:else}
        {#each disc as DISC ,index}

            <div class="p-3 w-full my-3 border border border-gray-700 rounded">
                <div class="table-responsive">
                    <table class="table align-middle text-center text-white">
                        <thead>
                            <tr>
                                <th class="px-4 py-2"></th>
                                <th class="px-4 py-2">M</th>
                                <th class="px-4 py-2">L</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="px-4 py-2">{DISC.LV_1}</td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,1, 'Most')}>
                                </td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,1, 'Least')}>
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2">{DISC.LV_2}</td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,2, 'Most')}>
                                </td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,2, 'Least')}>
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2">{DISC.LV_3}</td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,3, 'Most')}>
                                </td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,3, 'Least')}>
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2">{DISC.LV_4}</td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,4, 'Most')}>
                                </td>
                                <td class="px-4 py-2">
                                    <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,4, 'Least')}>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        {/each}
        <button type="button" on:click={isValid} class="btn btn-sm btn-light w-50 text-center text-dark">Selesaikan Tes</button>
    {/if}
</div>