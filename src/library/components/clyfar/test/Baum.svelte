<script lang="ts">
    import { db } from '../../../utils/db';
    import { userText } from '../../../strings';
    import BaumCanvas from './BaumCanvas.svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import ExampleBaum from '../sample/ExampleBaum.svelte';
    import { updateCurrentTest } from '../../../utils/userStorage';

    let token: string; 
    let enableTest: boolean = false;

	let picture: any;

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
            updateCurrentTest(redirectTo); // 'MBTI'
            userText.currentTest = redirectTo; // 'MBTI'
        } else {
            toast.error(message);
        }
	}
</script>
<Toaster/>
<div class="container-xs">
    {#if !enableTest}
        <form on:submit|preventDefault={checkToken}>
            <ExampleBaum/>
            <div class="d-flex justify-content-center mt-5">
                <input type="text" bind:value={token} class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3 w-50" placeholder="Masukkan Password" required/>
            </div>
            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Verifikasi Password</button>
            </div>
        </form>
    {:else}
        <BaumCanvas/>
    {/if}
</div>