
<script lang="ts">
    import { onMount } from "svelte";
    import { getLocalStorage } from "$lib/utils/storage";
    import { baseConfig } from "$lib/strings/baseConfig";

    import DISC from "$lib/components/clyfar/DISC.svelte";
    import Papi from "$lib/components/clyfar/Papi.svelte";
    import Baum from "$lib/components/clyfar/Baum.svelte";
    import Mbti from "$lib/components/clyfar/MBTI.svelte";
    import Msdt from "$lib/components/clyfar/MSDT.svelte";
    import CFIT from "$lib/components/clyfar/CFIT.svelte";
    import Kraeplin from "$lib/components/clyfar/Kraeplin.svelte";
    
    onMount(() => {
        const getStorage = getLocalStorage();
        if(getStorage !== null){
            $baseConfig.currentTest = getStorage.currentTest;
        } else {
            $baseConfig.currentTest = 'DISC';
        }
    });
</script>
{#if $baseConfig.currentTest === 'DISC'}
    <DISC/>
{:else if $baseConfig.currentTest === 'PAPI'}
    <Papi/>
{:else if $baseConfig.currentTest === 'KRAEPLIN'}
    <Kraeplin/>
{:else if $baseConfig.currentTest === 'BAUM'}
    <Baum/>
{:else if $baseConfig.currentTest === 'MBTI'}
    <Mbti/>
{:else if $baseConfig.currentTest === 'MSDT'}
    <Msdt/>
{:else if $baseConfig.currentTest === 'CFIT'}
    <CFIT/>
{/if}