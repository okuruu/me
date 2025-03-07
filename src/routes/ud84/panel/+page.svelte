<script lang="ts">
	import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';
    import { db } from '../../../library/hooks/db';

	let disableButton:boolean = $state(false);
	let buttonProcess:string = $state('Masuk');
	let currentEmail:string = $state('');
	let currentPassword:string = $state('');

	async function startAuth(){
		buttonProcess = 'Silahkan tunggu';
		disableButton = true;
		toast.loading('Authenticating..', {position : 'top-right' , duration: 2000 });
		const doPost = await fetch( 'https://esdelfron.deabakery.co.id/api/Log-In',{
			method : 'POST',
			headers : { 'Content-Type' : 'application/json' },
			credentials : 'include',
			body : JSON.stringify({
				email 		: currentEmail,
				password 	: currentPassword
			})
		});
		const doResponse = await doPost.json();
		console.log(doResponse)
		if(doResponse.status == 'Authenticated'){
			disableButton = false;

			if(doResponse.privilege == 'Administrator'){
				return goto('/master-produk');
			} else {
				return goto('/staff');
			}

		} else {
			buttonProcess = 'Masuk';
			disableButton = false;
			return toast.error('Auth failed.', { position : 'top-right' });
		}
	}

    async function doPost(): Promise <void> {
        const { status, message, data } = await db({
            email: currentEmail,
            password: currentPassword
        }, 'UD84/Auth');

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