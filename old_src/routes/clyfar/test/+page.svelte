
<script lang="ts">
    import { onMount } from "svelte";
    import { getLocalStorage } from "$lib/utils/storage";
    import { baseConfig } from "$lib/strings/baseConfig";

    import DISC from "$lib/components/clyfar/DISC.svelte";
    import Baum from "$lib/components/clyfar/Baum.svelte";
    import MBTI from "$lib/components/clyfar/MBTI.svelte";
    import MSDT from "$lib/components/clyfar/MSDT.svelte";
    import CFIT from "$lib/components/clyfar/CFIT.svelte";
    import Kraepelin from "$lib/components/clyfar/Kraepelin.svelte";
    import Papikostick from "$lib/components/clyfar/Papkostick.svelte";
    import Complete from "$lib/components/clyfar/Complete.svelte";
    
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
    <Papikostick/>
{:else if $baseConfig.currentTest === 'KRAEPLIN'}
    <Kraepelin/>
{:else if $baseConfig.currentTest === 'BAUM'}
    <Baum/>
{:else if $baseConfig.currentTest === 'MBTI'}
    <MBTI/>
{:else if $baseConfig.currentTest === 'MSDT'}
    <MSDT/>
{:else if $baseConfig.currentTest === 'CFIT'}
    <CFIT/>
{:else if $baseConfig.currentTest === 'CLEAR'}
    <Complete/>
{/if}