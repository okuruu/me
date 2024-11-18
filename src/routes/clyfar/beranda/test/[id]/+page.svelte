<script lang="ts">
    import type { Testee } from "../../../../../interface/Clyfar";
    import sample_table from "../../../../../json/sample_table.json";
    import Navigation from "../../../../../components/Navigation.svelte";
    import RMIB from "../../../../../components/content/clyfar/monitoring/RMIB.svelte";
    import Kraepelin from "../../../../../components/content/clyfar/monitoring/Kraepelin.svelte";
    import CandidateMonitoring from "../../../../../components/content/clyfar/monitoring/CandidateMonitoring.svelte";
    import Papikostick from "../../../../../components/content/clyfar/monitoring/Papikostick.svelte";
    import Baum from "../../../../../components/content/clyfar/monitoring/Baum.svelte";
    import CFIT from "../../../../../components/content/clyfar/monitoring/CFIT.svelte";

    const { data }: { data: { id: string; title: string; password: string; } } = $props();

    let newData: Testee[] = $state([]);
    let testInformation = {
        title : data.title,
        password: data.password
    }
    
    $effect(() => {
        newData = sample_table;
    });
</script>
<Navigation/>
<div class="bg-light-warning">
    <div class="container-fluid">
        <div class="row my-10">
            <div class="col border">
                <CandidateMonitoring userList={newData} title={testInformation.title} password={testInformation.password}/>
            </div>
            <div class="col">
                {#if data.id == "rmib"}
                    <RMIB/>
                {:else if data.id == "kraepelin"}
                    <Kraepelin/>
                {:else if data.id == "papikostick"}
                    <Papikostick/>
                {:else if data.id == "baum"}
                    <Baum/>
                {:else if data.id == "cfit"}
                    <CFIT/>
                {/if}
            </div>
        </div>
    </div>
</div>

