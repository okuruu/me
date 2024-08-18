<script lang="ts">
    import { userConfig } from "../../../library/strings";
    import Baum from "../../../library/components/clyfar/test/Baum.svelte";
    import DISC from "../../../library/components/clyfar/test/DISC.svelte";
    import MBTI from "../../../library/components/clyfar/test/MBTI.svelte";
    import MSDT from "../../../library/components/clyfar/test/MSDT.svelte";
    import Cfit from "../../../library/components/clyfar/test/CFIT.svelte";
    import Rmib from "../../../library/components/clyfar/test/RMIB.svelte";
    import Complete from "../../../library/components/clyfar/test/Complete.svelte";
    import Kraepelin from "../../../library/components/clyfar/test/Kraepelin.svelte";
    import Papikostick from "../../../library/components/clyfar/test/Papikostick.svelte";
</script>
{#if $userConfig.testPosition === 'DISC'}
    <DISC/>
{:else if $userConfig.testPosition === 'PAPI'}
    <Papikostick/>
{:else if $userConfig.testPosition === 'KRAEPLIN'}
    <Kraepelin/>
{:else if $userConfig.testPosition === 'BAUM'}
    <Baum/>
{:else if $userConfig.testPosition === 'MBTI'}
    <MBTI/>
{:else if $userConfig.testPosition === 'MSDT'}
    <MSDT/>
{:else if $userConfig.testPosition === 'CFIT'}
    <Cfit/>
{:else if $userConfig.testPosition === 'RMIB'}
    <Rmib/>
{:else if $userConfig.testPosition === 'CLEAR'}
    <Complete/>
{/if}
