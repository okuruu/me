<script lang="ts">
    import { db } from "../../../../library/hooks/db";

    let userAmount: number = $state(1);
    let userGender: "Pria" | "Wanita" = $state("Pria");

    let enableMSDT: boolean = $state(false);
    let enableCFIT: boolean = $state(false);
    let enableMBTI: boolean = $state(false);
    let enableBAUM: boolean = $state(false);
    let enableDISC: boolean = $state(false);
    let enableRMIB: boolean = $state(false);
    let enableKraeplin: boolean = $state(false);
    let enablePapikostick: boolean = $state(false);

    let isDisabled: boolean = $state(false);

    async function createCandidate(): Promise <void> {
        isDisabled = true;

        const { status, message } = await db({
            amount: userAmount,
            gender : userGender,
            MSDT : enableMSDT,
            CFIT : enableCFIT,
            MBTI : enableMBTI,
            KRAEPLIN : enableKraeplin,
            BAUM : enableBAUM,
            DISC : enableDISC,
            PAPI : enablePapikostick,
            RMIB : enableRMIB
        }, 'Clyfar/Create-Token');

        if (status === 'success') {
            userAmount = 1;
            userGender = "Pria";
            enableMSDT = false;
            enableCFIT = false;
            enableMBTI = false;
            enableKraeplin = false;
            enableBAUM = false;
            enableDISC = false;
            enablePapikostick = false;
            isDisabled = false;
            return;
        }

        isDisabled = false;
    }
</script>
<div class="row">
    <div class="col text-center">
        <img src="/assets/Token.svg" alt=""/>
    </div>
    <div class="col border-start ms-5">
        <h3 class="text-warning mb-5">Buat Akun</h3>
        <div class="form-group my-2">
            <label for="jumlah" class="form-label fw-bold">Jumlah Kandidat</label>
            <input type="number" class="form-control form-control-sm" placeholder="Jumlah Kandidat">
        </div>
        <div class="form-group my-2">
            <label for="gender" class="form-label fw-bold">Jenis Kelamin</label>
            <select class="form-select form-select-sm">
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
            </select>
        </div>
        
        <div class="separator my-7"></div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableKraeplin} class="me-2"/>Kraepelin
        </div>

        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enablePapikostick} class="me-2"/>Papi Kostick
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableBAUM} class="me-2"/>Koch Test [BAUM]
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableCFIT} class="me-2" />Culture Fair Intelligence Test [CFIT]
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableMBTI} class="me-2"/>Myers–Briggs Type Indicator [MBTI]
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableRMIB} class="me-2"/>Rothwell Miller Interest Blank [RMIB]
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableMSDT} class="me-2"/>Management Style Diagnostic Tes [MSDT]
        </div>
        
        <div class="form-group my-2">
            <input type="checkbox" bind:checked={enableDISC} class="me-2"/>Dominance, Influence, Steadiness, Conscientiousness [DISC]
        </div>
        
        <button type="button" onclick={createCandidate} disabled={isDisabled} class="btn btn-sm btn-gradient text-white mt-5">
            {#if isDisabled}
                Loading...
                <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
            {:else}
                Buat Kandidat
            {/if}
        </button>
    </div>
</div>