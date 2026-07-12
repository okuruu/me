<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db } from "../../../../library/hooks/db";
    import UD84Omset from "../../../../components/content/ud84/analisa/UD84Omset.svelte";
    import Ud84Navigation from "../../../../components/content/ud84/UD84Navigation.svelte";
    import UD84Analisa from "../../../../components/content/ud84/analisa/UD84Analisa.svelte";
    import UD84Operasional from "../../../../components/content/ud84/analisa/UD84Operasional.svelte";
    import Ud84Sales from "../../../../components/content/ud84/analisa/UD84Sales.svelte";
    import Ud84Member from "../../../../components/content/ud84/analisa/UD84Member.svelte";
    
    let password: string = $state('');
    let contents: "Password" | "Omset" | "Analisa" | "Operasional" | "Sales" | "Member" = $state("Password");

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
<div class="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6">
    <div class="card bg-base-100 shadow-sm">
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
            {:else if contents === "Sales"}
                {@render loader()}
                <Ud84Sales/>
            {:else if contents === "Member"}
                {@render loader()}
                <Ud84Member/>
            {/if}

        </div>
    </div>
</div>

{#snippet authenticate()}
    <label for="password" class="label-text mb-2 block font-bold">Masukkan password untuk mengakses Dashboard Analisa</label>
    <form onsubmit={verifyPassword} class="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <input type="password" class="input input-bordered w-full" bind:value={password} placeholder="Masukkan Password." required/>
        <button type="submit" class="btn btn-primary">Verifikasi</button>
    </form>
{/snippet}

{#snippet loader()}
    <div class="mb-5 flex flex-wrap justify-end gap-2">
        <button type="button" onclick={() => contents = 'Omset'} class="btn btn-sm btn-success">Omset Perusahaan</button>
        <button type="button" onclick={() => contents = 'Operasional'} class="btn btn-sm btn-warning">Biaya Operasional</button>
        <button type="button" onclick={() => contents = 'Analisa'} class="btn btn-sm btn-primary">Analisa Item</button>
        <button type="button" onclick={() => contents = 'Sales'} class="btn btn-sm btn-info">Sales Online (Valid)</button>
        <button type="button" onclick={() => contents = 'Member'} class="btn btn-sm btn-neutral">Member</button>
    </div>
    <div class="divider my-5"></div>
{/snippet}
