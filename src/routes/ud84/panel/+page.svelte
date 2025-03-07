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
<div class="d-flex align-items-center justify-content-center vh-100">
	<div class="card shadow-sm">
		<div class="card-body">

			<div class="text-center mb-5">
				<h1 class="fw-bolder">UD . 84!</h1>
			</div>
			
			<form onsubmit={doPost}>
				<div class="form-group my-3">
					<label for="inputEmail" class="form-label fw-bold">Email</label>
					<input type="email" bind:value={currentEmail} class="form-control" placeholder="Email Anda" required/>
				</div>
				<div class="form-group my-3">
					<label for="inputPassword" class="form-label fw-bold">Password</label>
					<input type="password" bind:value={currentPassword} class="form-control" placeholder="Password Anda" required/>
				</div>
				<button type="submit" class="btn btn-primary w-100" disabled={disableButton}>{buttonProcess}</button>
			</form>

		</div>
	</div>
</div>