<script lang="ts">
    import { goto } from "$app/navigation";
    import { kobo } from "$lib/utils/kobo";
    import toast, { Toaster } from 'svelte-french-toast';

    let token: string;

    const check = async (): Promise <void> => {
        const { status, message, data } = await kobo(
            { id : token },
            'Clyfar/Authorize-Token'
        );

        if(status == 'success'){
            data === 'administrator' ? goto('/clyfar/beranda') : goto('/clyfar/dashboard');
            return;
        }

        token = '';
        toast.error(message);
        return;
    }
</script>
<Toaster/>
<div class="container mx-auto">
    <div class="min-h-screen flex items-center justify-center">
        <div class="rounded-md mx-1 space-y-4">
            <h1 class="text-8xl font-bold text-center">CLYFAR</h1>
            <p class="text-center" style="margin-bottom: 3rem;">Pyshological Test</p>
            <form on:submit|preventDefault={check} class="flex flex-col items-center">
                <input type="text" bind:value={token} placeholder="Enter your token" class="input input-sm input-bordered text-center w-1/2 mb-3" required/>
                <button type="submit" class="btn btn-sm btn-neutral w-1/2">Check</button>
            </form>
        </div>
    </div>
</div>
