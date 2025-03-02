<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import UD84Omset from "../../../../components/content/ud84/analisa/UD84Omset.svelte";
    import UD84Analisa from "../../../../components/content/ud84/analisa/UD84Analisa.svelte";
    import UD84Operasional from "../../../../components/content/ud84/analisa/UD84Operasional.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    
    let password: string = $state('');
    let contents: "Password" | "Omset" | "Analisa" | "Operasional" = $state("Omset");

    async function verifyPassword(): Promise <void> {
        const { status, message } = await db({
            password: password
        }, 'UD84/Charts/Password');

        if(status === "error") {
            toast.error(message);
            return;
        }

        contents = "Omset"
    }

</script>
<Ud84Navigation/>
<div class="container-fluid">
    <div class="card shadow-sm my-7">
        <div class="card-body">

            {#if contents === "Password"}
                {@render authenticate()}
            {:else if contents === "Omset"}
                {@render loader()}
                <UD84Omset/>
            {:else if contents === "Analisa"}
                {@render loader()}
                <UD84Analisa/>
            {:else if contents === "Operasional"}
                {@render loader()}
                <UD84Operasional/>
            {/if}

        </div>
    </div>
</div>

{#snippet authenticate()}
    <label for="password" class="fw-bold form-label">Masukkan password untuk mengakses Dashboard Analisa</label>
    <form onsubmit={verifyPassword} class="row w-25 text-center">
        <div class="col-10">
            <input type="password" class="form-control text-center mt-2" bind:value={password} placeholder="Masukkan Password." required/>
        </div>
        <div class="col-2">
            <button type="submit" class="btn btn-primary mt-2">Verifikasi</button>
        </div>
    </form>
{/snippet}

{#snippet loader()}
    <div class="d-flex flex-row-reverse">
        <div class="me-2">
            <button type="button" onclick={() => contents = 'Omset'} class="btn btn-sm btn-success">Omset Perusahaan</button>
            <button type="button" onclick={() => contents = 'Operasional'} class="btn btn-sm btn-warning">Biaya Operasional</button>
            <button type="button" onclick={() => contents = 'Analisa'} class="btn btn-sm btn-primary">Analisa Item</button>
        </div>
    </div>
    <div class="separator my-5"></div>
{/snippet}