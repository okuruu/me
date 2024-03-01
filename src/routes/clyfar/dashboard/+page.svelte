<script lang="ts">
    import { goto } from "$app/navigation";
    import toast, { Toaster } from 'svelte-french-toast';
    import { getTimeOfDay } from "$lib/utils/timeDetector";

   let name: string;
   let whatsapp: string = '08984170335';
   let birthDate: Date;
   let gender: string;
   let isAgree: boolean = false;
   const time: string = getTimeOfDay();

   async function doPost(): Promise <void>{
	   try {
			localStorage.setItem('user',JSON.stringify({
				name : name,
				whatsapp : whatsapp,
				birthDate : birthDate,
				gender : gender,
				isAgree : isAgree,
				agreementDate : Date.now()
			}));
			return goto('/clyfar/test');
		} catch (error) {
        	toast.error('Token tidak sesuai!');
		}
   }
</script>
<Toaster/>
<div class="container mx-auto p-2">

    <div class="card w-full bg-base-100 shadow-xl">
        <figure class="px-10 pt-10">
            <img src="/images/Cat.jpg" alt="Shoes" class="rounded-xl" />
        </figure>
        <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl">{'Selamat ' + time}! 👋</h2>
            <p class="my-5">
                Dengan menekan tombol <span class="font-bold">Selanjutnya</span>, Anda telah menyetujui 
                <span class="underline decoration-pink-500 font-bold">Syarat & Ketentuan</span>.
            </p>
            <div class="card-actions">
                <button type="button" on:click={() => isAgree = true} class="btn btn-neutral">Selanjutnya</button>
            </div>
        </div>
    </div>

    {#if isAgree}
		<form on:submit|preventDefault={doPost}>
			<div class="card w-full bg-base-100 shadow-xl my-5">
				<div class="card-body">

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Silahkan masukkan nama lengkap Anda.</span>
						</div>
						<input type="text" bind:value={name} placeholder="Type here" class="input input-bordered w-full" required/>
					</label>

					<label class="form-control w-full my-4">
						<div class="label">
							<span class="label-text">Harap masukkan nomor WhatsApp Anda.</span>
						</div>
						<input type="number" bind:value={whatsapp} placeholder="Type here" min="0" class="input input-bordered input-accent w-full" disabled />
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Silahkan masukkan tanggal lahir Anda.</span>
						</div>
						<input type="date" bind:value={birthDate} placeholder="Type here" class="input input-bordered w-full" required/>
					</label>

					<div class="my-4">
						<div class="label label-text font-semibold">Harap masukkan jenis kelamin Anda.</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Pria</span> 
								<input type="radio" name="radio-10" value="Pria" bind:group={gender} class="radio checked:bg-blue-500" checked required/>
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Wanita</span> 
								<input type="radio" name="radio-10" value="Wanita" bind:group={gender} class="radio checked:bg-red-500" required/>
							</label>
						</div>
					</div>

				</div>
			</div>

			<button type="submit" class="btn w-full btn-neutral my-2">Selanjutnya</button>
		</form>
    {/if}

</div>