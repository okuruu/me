<script lang="ts">
    import { onMount } from "svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import SampleDisc from "../sample/SampleDISC.svelte";
    import { disc } from "$lib/strings/psychological/disc";
    import { baseConfig } from "$lib/strings/baseConfig";
    import { goto } from "$app/navigation";

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

    const checkToken = () => {
        if(token === 'Veritas'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return toast.success("Selamat mengerjakan");
        }
        token = '';
        return toast.error("Token tidak sesuai");
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
            toast.error("Anda belum melengkapi semua subtes!");
            return;
        }
    }

    async function doPost(): Promise <void> {
        const doPost = await fetch(baseConfig.url + '???',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                DISC : data
            })
        });
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            return goto(redirectTo);
        } else {
            toast.error(message);
        }
    }

</script>
<Toaster/>
<div class="container mx-auto p-2">
    
    {#if !enableTest}
        <SampleDisc/>

        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                
                <form on:submit|preventDefault={checkToken}>
                    <input type="text" bind:value={token} placeholder="Masukkan token" class="input text-center input-bordered w-full" required/>
                    <button type="submit" class="btn btn-neutral w-full mt-3">Verifikasi Token</button>
                </form>
    
            </div>
        </div>
    {/if}

    {#if enableTest}
        {#each disc as disc,index}
            <div class="card w-full bg-base-100 shadow-xl my-5">
                <div class="card-body">

                    <div class="overflow-x-auto">
                        <table class="table-auto mx-auto">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2"></th>
                                    <th class="px-4 py-2">M</th>
                                    <th class="px-4 py-2">L</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="px-4 py-2">{disc.LV_1}</td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,1, 'Most')}>
                                    </td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,1, 'Least')}>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-4 py-2">{disc.LV_2}</td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,2, 'Most')}>
                                    </td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,2, 'Least')}>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-4 py-2">{disc.LV_3}</td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,3, 'Most')}>
                                    </td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,3, 'Least')}>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-4 py-2">{disc.LV_4}</td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,4, 'Most')}>
                                    </td>
                                    <td class="px-4 py-2">
                                        <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,4, 'Least')}>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        {/each}

        <button type="button" on:click={isValid} class="btn btn-neutral w-full">Selesaikan Tes</button>
    {/if}
    
</div>