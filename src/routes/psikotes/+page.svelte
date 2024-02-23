<script lang="ts">
    import { goto } from "$app/navigation";
	import { psychologicalToken } from "$lib/strings/psychologicalToken";
    import toast, { Toaster } from "svelte-french-toast";

    let userToken:string;
    let isRunning:boolean = false;

    const validateToken = async () => {
        if(userToken.length === 6 && userToken === psychologicalToken[0]){
            return goto('/psikotes/dashboard');
        } else if (userToken.length === 6 && userToken !== psychologicalToken[0]){
            userToken = '';
            return toast.error('Anda tidak terdaftar');
        }
    };
</script>
<Toaster/>
<div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="text-center">
        <div class="form-group">
            <h1 class="display-1">CLYFAR</h1>
            <h3>Read: /ˈkləvar/ - Welsh</h3>
        </div>
        <div class="form-group my-12">
            {#if isRunning}
                <input type="text" bind:value={userToken} on:keyup={validateToken} class="form-control form-control-sm text-center" placeholder="Insert Token" />
                <small class="mt-3 text-muted">Please enter your token from WhatsApp</small>
            {/if}
        </div>
        <div class="me-2">
            <button type="button" on:click={() => isRunning = true} class="btn btn-sm btn-dark">Start</button>
            <button type="button" class="btn btn-sm btn-secondary">Help</button>
        </div>
    </div>
</div>