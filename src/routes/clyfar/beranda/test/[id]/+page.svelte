<script lang="ts">
    import type { Testee } from "../../../../../interface/Clyfar";
    import sample_table from "../../../../../json/sample_table.json";
    import Navigation from "../../../../../components/Navigation.svelte";
    import RMIB from "../../../../../components/content/clyfar/monitoring/RMIB.svelte";
    import CandidateMonitoring from "../../../../../components/content/clyfar/monitoring/CandidateMonitoring.svelte";

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
<div class="bg-light-warning vh-100 wh-100">
    <div class="container-fluid">
        <div class="row">
            <div class="col border">
                <CandidateMonitoring userList={newData} title={testInformation.title} password={testInformation.password}/>
            </div>
            <div class="col">
                {#if data.id == "rmib"}
                    <RMIB/>
                {/if}
            </div>
        </div>
    </div>
</div>

