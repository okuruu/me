<script lang="ts">
    import { goto } from '$app/navigation';
    import { db } from '../../library/utils/db';
    import toast, { Toaster } from 'svelte-french-toast';

    let token: string;

    async function checkAuthenticity(): Promise <void> {
        const { status, message, data } = await db(
            { id : token },
            'Clyfar/Authorize-Token'
        );

        if(status == 'success'){
            localStorage.removeItem('localPIN');
            localStorage.removeItem('user');
            localStorage.setItem("localPIN",data.userCodes);
            data.statusAccount === 'Super' ? goto('/clyfar/beranda') : goto('/clyfar/dashboard');
            return;
        }

        token = '';
        toast.error(message);
        return;
    }
</script>
<Toaster/>
<div class="container-xs">
    <div class="form-group text-center mt-13">
        <h1 class="display-1 text-white">CLYFAR</h1>
        <p class="text-white fst-italic">Pyshological Test</p>
    </div>
    <form on:submit|preventDefault={checkAuthenticity} class="mt-7">
        <div class="d-flex justify-content-center">
            <input type="text" class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white w-50 mb-3" placeholder="Enter your token" required/>
        </div>
        <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Check</button>
        </div>
    </form>
</div>