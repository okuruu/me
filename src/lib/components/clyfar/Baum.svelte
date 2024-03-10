<script lang="ts">
    import { baseConfig } from "$lib/strings/baseConfig";
    import BaumCanvas from "../clyfar/BaumCanvas.svelte";
    import SampleBaum from "../sample/SampleBaum.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import { updateCurrentTest } from "$lib/utils/storage";
  
    let token: string; 
    let enableTest: boolean = false;

	let picture: any;

    const checkToken = () => {
        if(token === 'Finite'){
            enableTest = true;
            return toast.success("Selamat mengerjakan");
        }
        token = '';
        return toast.error("Token tidak sesuai");
    }

	const isValid = () => {
		if(picture === undefined){
			return toast.error("Anda belum melengkapi lampiran!");
		}

		doPost();
	}

	async function doPost(): Promise <void>{
		const forms = new FormData();
			forms.append('baum',picture[0]);

		// const doPost = await fetch($baseConfig.url + '???',{
		// 	method : 'post',
		// 	body : forms
		// });
        // const { status, message, redirectTo } = await doPost.json();

		// if(status === 'success'){
            updateCurrentTest('MBTI');
            $baseConfig.currentTest = 'MBTI';
        // } else {
        //     toast.error(message);
        // }
	}
</script>
<Toaster/>
<div class="container mx-auto p-2">
    {#if !enableTest}
        <SampleBaum/>
        <form on:submit|preventDefault={checkToken}>
            <input type="text" bind:value={token} placeholder="Masukkan token" class="input text-center input-bordered w-full" required/>
            <button type="submit" class="btn btn-neutral w-full mt-3">Verifikasi Token</button>
        </form>
    {:else if enableTest}
		<div role="tablist" class="tabs tabs-bordered">
			<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Kanvas" checked/>
			<div role="tabpanel" class="tab-content p-10">
				<BaumCanvas/>
			</div>
			
			<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Selesaikan Tes"/>
			<div role="tabpanel" class="tab-content p-10">

				<form on:submit|preventDefault={isValid}>
					<div class="flex items-center justify-center w-full">
						<label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
							<div class="flex flex-col items-center justify-center pt-5 pb-6">
								<svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
								</svg>
								{#if picture === undefined}
									<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG</p>
								{:else}
									<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">{picture[0].name}</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">{picture[0].type}</p>
								{/if}
							</div>
							<input id="dropzone-file" type="file" accept="image/png, image/jpeg" bind:files={picture} class="hidden" />
						</label>
					</div> 
					<button type="submit" class="btn btn-neutral my-5 w-full">Unggah Lampiran</button>
				</form>

			</div>
		</div>
    {/if}
</div>

