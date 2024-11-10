<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "../../library/hooks/db";
    import { userConfig } from "../../library/config/baseConfiguration";

    let token: string = $state('');
    let isDisabled: boolean = $state(false);

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

            if (data.statusAccount === 'Super') {
                return goto('/clyfar/beranda')
            }

            if (data.continueFrom.writeForm) {
                return goto('/clyfar/home');
            }

            $userConfig.testPosition = data.continueFrom.continueTest;
            return goto('/clyfar/test');
        }

        token = '';
        isDisabled = false;
        console.log(message)
        return;
    }
</script>
<main class="wh-100 vh-100 gradients">
    <div class="d-flex flex-column min-vh-100 min-vw-100">
        <div class="d-flex flex-grow-1 justify-content-center align-items-center">
            <form onsubmit={checkAuthenticity} class="form-group">
                <h1 class="fw-bolder display-6 text-white">Perceive. <br/>Evaluate. Progress</h1>
                <p class="fw-semibold text-secondary mt-2 mb-4">Login to your account</p>

                <div class="form-group mt-12 mb-7">
                    <label for="setToken" class="form-label fw-bolder text-white">Your Token</label>
                    <input type="text" bind:value={token} class="form-control form-control-sm text-center" placeholder="Enter your token" required/>
                    <small class="text-secondary">Masukkan token yang diberikan kepada anda.</small>
                </div>

                <button type="submit" disabled={isDisabled} class="btn btn-sm btn-primary text-center w-100">
                    {#if isDisabled}
                        Loading...
                        <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                    {:else}
                        Continue
                    {/if}
                </button>
            </form>
        </div>
    </div>
</main>
<style>
    .gradients {
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
        height: 100vh;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

</style>