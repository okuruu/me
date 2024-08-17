<script lang="ts">
    import { goto } from '$app/navigation';
    import { db } from '../../library/utils/db';
    import toast, { Toaster } from 'svelte-french-toast';

    let token: string;
    let isDisabled: boolean = false;

    async function checkAuthenticity(): Promise <void> {
        isDisabled = true;

        const { status, message, data } = await db(
            { id : token },
            'Clyfar/Authorize-Token'
        );

        if(status == 'success'){
            localStorage.removeItem('localPIN');
            localStorage.removeItem('user');
            localStorage.setItem("localPIN",data.userCodes);
            data.statusAccount === 'Super' ? goto('/clyfar/beranda') : goto('/clyfar/home');
            return;
        }

        token = '';
        isDisabled = false;
        toast.error(message);
        return;
    }
</script>
<Toaster/>
<div class="bg-clyfar wh-100 vh-100">
    <div class="d-flex flex-column min-vh-100 min-vw-100">
        <div class="d-flex flex-grow-1 justify-content-center align-items-center">
            
            <div class="card shadow-sm bg-white">
                <div class="card-body">
                    <div class="form-group text-center mt-13">
                        <h1 class="display-1 text-primary">CLYFAR</h1>
                        <p class=" fst-italic fw-semibold">Pyshological Test</p>
                    </div>
    
                    <div class="separator my-5"></div>
    
                    <form on:submit|preventDefault={checkAuthenticity} class="mt-7">
                        <div class="d-flex justify-content-center">
                            <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-5" placeholder="Enter your token" required/>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" disabled={isDisabled} class="btn btn-sm btn-primary text-center w-100">
                                {#if isDisabled}
                                    Loading...
                                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                                {:else}
                                    Login
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    </div>
</div>