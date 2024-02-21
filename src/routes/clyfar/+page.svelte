<script lang="ts">
    import { goto } from "$app/navigation";
    import toast, { Toaster } from 'svelte-french-toast';

    let token: string;

    const check = () => {
        if(token === 'URXVT'){
            return goto('/clyfar/dashboard')
        }
        token = ''
        return toast.error('Token tidak sesuai!');
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
