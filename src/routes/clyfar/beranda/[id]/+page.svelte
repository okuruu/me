<script lang="ts">
    import type { Kraeplin } from '../../../../library/interface/Clyfar';
    import InterpretationKraeplin from '../../../../library/components/clyfar/interpretation/InterpretationKraeplin.svelte';
    import InterpretationPapikostick from '../../../../library/components/clyfar/interpretation/InterpretationPapikostick.svelte';

    export let data: any;
    let kraeplin: Kraeplin = data.result.KRAEPLIN ?? {};
    let papikostick: string[] | null = data.result.PAPI ?? null;
    let papikostickTable: { NILAI : number; Deskripsi: string; }[] = data.result.PAPI_TABLE;
</script>
<div class="bg-clyfar">
    <div class="container-sm">
        <InterpretationKraeplin kraeplin={kraeplin} />
        <InterpretationPapikostick papikostickTable={papikostickTable} />
    </div>
</div>