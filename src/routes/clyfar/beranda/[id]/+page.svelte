<script lang="ts">
    import type { DISC, Kraeplin, MSDT, RMIBResult } from '../../../../library/interface/Clyfar';
    import InterpretationKraeplin from '../../../../library/components/clyfar/interpretation/InterpretationKraeplin.svelte';
    import InterpretationPapikostick from '../../../../library/components/clyfar/interpretation/InterpretationPapikostick.svelte';
    import InterpretationMsdt from '../../../../library/components/clyfar/interpretation/InterpretationMSDT.svelte';
    import InterpretationDisc from '../../../../library/components/clyfar/interpretation/InterpretationDISC.svelte';
    import InterpretationMbti from '../../../../library/components/clyfar/interpretation/InterpretationMBTI.svelte';
    import InterpretationBaum from '../../../../library/components/clyfar/interpretation/InterpretationBAUM.svelte';
    import InterpretationRmib from '../../../../library/components/clyfar/interpretation/InterpretationRMIB.svelte';

    export let data: any;
    console.log(data)

    let kraeplin: Kraeplin = data.result.KRAEPLIN ?? {};
    let papikostick: string[] | null = data.result.PAPI ?? null;
    let papikostickTable: { NILAI : number; Deskripsi: string; }[] = data.result.PAPI_TABLE;
    let msdt: MSDT = data.result.MSDT ?? {};
    let disc: DISC = data.result.DISC ?? {};
    let mbti: string = data.result.MBTI ?? "";
    let baum: string = data.result.BAUM ?? "";
    let rmib: RMIBResult = data.result.RMIB ?? {};
</script>
<div class="bg-clyfar">
    <div class="container-sm">
        <InterpretationRmib rmib={rmib}/>
        <InterpretationDisc disc={disc} />
        <InterpretationPapikostick papikostickTable={papikostickTable} />
        <InterpretationKraeplin kraeplin={kraeplin} />
        <InterpretationBaum baum={baum} />
        <InterpretationMbti mbti={mbti}/>
        <InterpretationMsdt msdt={msdt}/>
    </div>
</div>