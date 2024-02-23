<script lang="ts">
	import Kraeplin from './../../../components/psychological/Kraeplin.svelte';
	import DISC from './../../../components/psychological/DISC.svelte';
    import toast,{ Toaster } from 'svelte-french-toast';
	import { psychologicalToken } from '$lib/strings/psychologicalToken.js';

    export let data;

    let token:string;
    let navigator:number = 1;
    let background:string = '#fff';

    let currentTest:string;
    let enableTest:boolean = false;

    const readManual = () => {
        if(navigator === 2){
            return;
        }

        navigator += 1;
        background = '#f1f5f9';
        return;
    }

    const validateToken = (id:number) => {
        if(token.length === 6 && token === psychologicalToken[id]){
            token = '';
            enableTest = true;
            currentTest = 'disc'
        } else if(token.length === 6 && token !== psychologicalToken[id]){
            toast.error('Token tidak valid!');
            token = '';
        }
    }
</script>
<Toaster/>
<!-- <div class="vh-100 wh-100" style="background-color : {background}">
    {#if enableTest == false}

        <div class="container d-flex justify-content-center align-items-center vh-100">
            <div class="text-center">
                {#if navigator === 1}
                    {@html data.greeter}
                {:else if navigator === 2}
                    {@html data.manual.disc}
                    <div class="d-flex justify-content-center">
                        <input type="text" bind:value={token} on:keyup={() => validateToken(1)} class="form-control form-control-sm text-center w-25 my-7" placeholder="Masukkan Token"/>
                    </div>
                {/if}
                <button type="button" on:click={readManual} class="btn btn-sm btn-dark mt-5">Selanjutnya</button>
            </div>
        </div>

    {:else if enableTest == true}

        {#if currentTest === 'disc'}
            <DISC />
        {:else if currentTest === 'kraeplin'}
            <Kraeplin />
        {/if}

    {/if}
</div> -->

<DISC />
