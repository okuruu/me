<script lang="ts">
    import SamplePapi from "../sample/SamplePapi.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import { papikostick } from "$lib/strings/psychological/papikostick";

    let token: string; 
    let enableTest: boolean = false;

    const checkToken = () => {
        if(token === 'Lumos'){
            enableTest = true;
            return toast.success("Selamat mengerjakan");
        }
        token = '';
        return toast.error("Token tidak sesuai");
    }

    const isValid = () => {
        // 
    }

</script>
<Toaster/>
<div class="container mx-auto p-2">
    
    {#if !enableTest}
        <SamplePapi/>
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
        {#each Array(90) as data,index }
            <div class="card w-full bg-base-100 shadow-xl my-5">
                <div class="card-body">

                    <div class="badge badge-secondary font-semibold">#{index + 1}</div>
                
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">{papikostick.A[index]}</span> 
                            <input type="radio" name="Papi_{index}" value="A" class="radio checked:bg-blue-500" required/>
                        </label>
                    </div>
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">{papikostick.B[index]}</span> 
                            <input type="radio" name="Papi_{index}" value="B" class="radio checked:bg-red-500" required/>
                        </label>
                    </div>

                </div>
            </div>
        {/each}
    {/if}

    <button type="button" on:click={isValid} class="btn btn-neutral w-full">Selesaikan Tes</button>

</div>