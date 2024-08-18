<script lang="ts">
    import { db } from '../../../utils/db';
    import BaumCanvas from './BaumCanvas.svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import { userConfig, userText } from '../../../strings';
    import ExampleBaum from '../sample/ExampleBaum.svelte';
    import { updateCurrentTest } from '../../../utils/userStorage';

    let token: string; 
    let enableTest: boolean = false;
    
	let picture: any;

    let isDisabled: boolean = false;

	async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'BAUM'
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

	const isValid = () => {
		if(picture === undefined){
			return toast.error("Anda belum melengkapi lampiran!");
		}

		doPost();
	}

	async function doPost(): Promise <void>{
        isDisabled = true;

		const getLocal: any = localStorage.getItem('localPIN');

		const forms = new FormData();
			forms.append('baum',picture[0]);
			forms.append('localPIN', getLocal);

		const doPost = await fetch(userText.url + 'Clyfar/Baum-Completion',{
			method : 'post',
			body : forms
		});

        const { status, message, redirectTo } = await doPost.json();

		if(status === 'success'){
            isDisabled = false;
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        }

        isDisabled = false;
        toast.error(message);
	}
</script>
<Toaster/>
<div class="bg-clyfar vh-100 wh-100">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" on:submit|preventDefault={checkToken}>
                <ExampleBaum/>
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
            <BaumCanvas/>
    
            <div class="row mt-8">
                <div class="col">
                    <input type="file" bind:files={picture} class="form-control form-control-sm" />
                </div>
                <div class="col-5">
                    <button type="button" on:click={isValid} class="btn btn-sm btn-primary w-100" disabled={isDisabled}>
                        {#if isDisabled}
                            Mengunggah...
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            Unggah Lampiran
                        {/if}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>