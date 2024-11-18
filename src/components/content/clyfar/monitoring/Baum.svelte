<script lang="ts">
    import BaumCanvas from "./BaumCanvas.svelte";
    import { db } from "../../../../library/hooks/db";
    import { updateCurrentTest } from "../../../../library/utils/useStorage";
    import { userConfig } from "../../../../library/config/baseConfiguration";

    let token: string = $state(''); 
    let enableTest: boolean = $state(false);
    
	let picture: any = $state();

    let isDisabled: boolean = $state(false);

	async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'BAUM'
        }, 'Clyfar/Verify-Token');
        
        if(status === 'success'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        token = '';
        console.error(message);
        return;
    }

	const isValid = () => {
		if(picture === undefined){
			return console.error("Anda belum melengkapi lampiran!");
		}

		doPost();
	}

	async function doPost(): Promise <void>{
        isDisabled = true;

		const getLocal: any = localStorage.getItem('localPIN');

		const forms = new FormData();
			forms.append('baum',picture[0]);
			forms.append('localPIN', getLocal);

        const { status, message, redirectTo } = await db(forms, 'Clyfar/Baum-Completion');

		if(status === 'success'){
            isDisabled = false;
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        }

        isDisabled = false;
        console.error(message);
	}
</script>
<div class="bg-light-warning vh-100 wh-100">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" onsubmit={checkToken}>
                <div class="card shadow-sm bg-white">
                    <div class="card-body">
                        <h3 class="mb-5">Test Instruction</h3>
                        <ul class="fw-semibold">
                            <li class="mb-5">Buatlah <span class="fw-bold text-success">gambar pohon</span> di kanvas yang tersedia.</li>
                            <li class="mb-5">Tidak ada aturan untuk menggambar sebuah pohon; <span class="fw-bold text-success">lukis sesuai keinginanmu</span>.</li>
                            <li class="mb-5">Jika sudah selesai, anda dapat melakukan screenshot lalu mengupload gambar anda pada opsi yang ada di bawah.</li>
                            <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini <span class="fw-bold text-primary">tidak ada jawaban yang dianggap benar atau salah</span>.</li>
                        </ul>
                    </div>
                </div>
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
                    <button type="button" onclick={isValid} class="btn btn-sm btn-primary w-100" disabled={isDisabled}>
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