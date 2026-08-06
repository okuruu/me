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

        // The login response carries the operator's name and privilege beside
        // the usual status/message. They are kept, because actions that are
        // audited -- cancelling a transaction -- have to record who did it.
        const { status, message, name, privilege } = await db({
            email: currentEmail,
            password: currentPassword
        }, 'UD84/Auth') as unknown as { status: string; message: string; name?: string; privilege?: string };

		disableButton = false;
		buttonProcess = 'Masuk';

        // Checked positively, against the one value the backend sends on
        // success. It used to test for "Unauthorized", which db() can never
        // return: a 401 makes fetchWithRetry throw, and the helper reports
        // status "error" instead -- so a wrong password fell straight through
        // to the success path and logged the operator in.
        if (status !== "Authenticated") {
            // db() collapses a 401 into a generic connection error, so a wrong
            // password and an unreachable server arrive here looking the same.
            // The message says what the operator can act on without claiming to
            // know which of the two it was.
            toast.error("Gagal masuk. Periksa email dan password Anda, atau koneksi internet.");
            return;
        }

        toast.success(message);
        localStorage.setItem('Auth', JSON.stringify({ name: name ?? '', privilege: privilege ?? '' }));
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
