<script lang="ts">
    import type { Kraeplin, MSDT } from '../../../../library/interface/Clyfar';
    import InterpretationKraeplin from '../../../../library/components/clyfar/interpretation/InterpretationKraeplin.svelte';
    import InterpretationPapikostick from '../../../../library/components/clyfar/interpretation/InterpretationPapikostick.svelte';
    import InterpretationMsdt from '../../../../library/components/clyfar/interpretation/InterpretationMSDT.svelte';

    export let data: any;
    let kraeplin: Kraeplin = data.result.KRAEPLIN ?? {};
    let papikostick: string[] | null = data.result.PAPI ?? null;
    let papikostickTable: { NILAI : number; Deskripsi: string; }[] = data.result.PAPI_TABLE;
    let msdt: MSDT = data.result.MSDT ?? {};

    console.log(data)
</script>
<div class="bg-clyfar">
    <div class="container-sm">
        <InterpretationMsdt msdt={msdt}/>
        <InterpretationKraeplin kraeplin={kraeplin} />
        <InterpretationPapikostick papikostickTable={papikostickTable} />
    </div>
</div>