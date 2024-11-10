<script lang="ts">
    import type { CFITResult, DISC, Kraeplin, MSDT, RMIBResult } from '../../../../library/interface/Clyfar';
    import InterpretationKraeplin from '../../../../library/components/clyfar/interpretation/InterpretationKraeplin.svelte';
    import InterpretationPapikostick from '../../../../library/components/clyfar/interpretation/InterpretationPapikostick.svelte';
    import InterpretationMsdt from '../../../../library/components/clyfar/interpretation/InterpretationMSDT.svelte';
    import InterpretationDisc from '../../../../library/components/clyfar/interpretation/InterpretationDISC.svelte';
    import InterpretationMbti from '../../../../library/components/clyfar/interpretation/InterpretationMBTI.svelte';
    import InterpretationBaum from '../../../../library/components/clyfar/interpretation/InterpretationBAUM.svelte';
    import InterpretationRmib from '../../../../library/components/clyfar/interpretation/InterpretationRMIB.svelte';
    import InterpretationCfit from '../../../../library/components/clyfar/interpretation/InterpretationCFIT.svelte';

    interface Props {
        data: any;
    }

    let { data }: Props = $props();

    let kraeplin: Kraeplin | null = data?.result?.KRAEPLIN ?? null;
    let papikostick: string[] | null = data?.result?.PAPI ?? null;
    let papikostickTable: { NILAI: number; Deskripsi: string; }[] | null = data?.result?.PAPI_TABLE ?? null;
    let msdt: MSDT | null = data?.result?.MSDT ?? null;
    let disc: DISC | null = data?.result?.DISC ?? null;
    let mbti: string | null = data?.result?.MBTI ?? null;
    let baum: string | null = data?.result?.BAUM ?? null;
    let rmib: RMIBResult | null = data?.result?.RMIB ?? null;
    let cfit: CFITResult | null = data?.result?.CFIT ?? null;
</script>

<div class="bg-clyfar">
    <div class="container-sm">
        {#if cfit}
            <InterpretationCfit cfit={cfit}/>
        {/if}
        {#if disc}
            <InterpretationDisc disc={disc} />
        {/if}
        {#if papikostickTable}
            <InterpretationPapikostick papikostickTable={papikostickTable} />
        {/if}
        {#if kraeplin}
            <InterpretationKraeplin kraeplin={kraeplin} />
        {/if}
        {#if baum}
            <InterpretationBaum baum={baum} />
        {/if}
        {#if mbti}
            <InterpretationMbti mbti={mbti}/>
        {/if}
        {#if msdt}
            <InterpretationMsdt msdt={msdt}/>
        {/if}
        {#if rmib}
            <InterpretationRmib rmib={rmib}/>
        {/if}
    </div>
</div>
