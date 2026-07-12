<script lang="ts">
	import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';
    import { db } from '../../../library/hooks/db';

	let disableButton:boolean = $state(false);
	let buttonProcess:string = $state('Masuk');
	let currentEmail:string = $state('');
	let currentPassword:string = $state('');

    async function doPost(): Promise <void> {
		disableButton = true;
		buttonProcess = 'Memuat...';

        const { status, message } = await db({
            email: currentEmail,
            password: currentPassword
        }, 'UD84/Auth');

		disableButton = false;
		buttonProcess = 'Masuk';

        if(status === "Unauthorized") {
            toast.error(message);
            return;
        }

        toast.success(message);
        localStorage.setItem('Auth', JSON.stringify(true));
        return goto('/ud84/panel/pesanan');

    }
</script>
<div class="flex min-h-screen w-full items-center justify-center bg-base-200 px-4 py-10">
	<div class="card w-full max-w-sm bg-base-100 shadow-sm">
		<div class="card-body">

			<div class="mb-5 text-center">
				<h1 class="text-2xl font-extrabold">UD . 84!</h1>
			</div>

			<form onsubmit={doPost} class="space-y-4">
				<div>
					<label for="inputEmail" class="label-text mb-1 block font-medium">Email</label>
					<input type="email" bind:value={currentEmail} class="input input-bordered w-full" placeholder="Email Anda" required/>
				</div>
				<div>
					<label for="inputPassword" class="label-text mb-1 block font-medium">Password</label>
					<input type="password" bind:value={currentPassword} class="input input-bordered w-full" placeholder="Password Anda" required/>
				</div>
				<button type="submit" class="btn btn-primary w-full" disabled={disableButton}>{buttonProcess}</button>
			</form>

		</div>
	</div>
</div>
