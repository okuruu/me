<script lang="ts">
    import { onMount } from "svelte";
    import { userText } from "../../../library/strings";
    import { getLocalStorage } from "../../../library/utils/userStorage";
    import Baum from "../../../library/components/clyfar/test/Baum.svelte";
    import DISC from "../../../library/components/clyfar/test/DISC.svelte";
    import MBTI from "../../../library/components/clyfar/test/MBTI.svelte";
    import MSDT from "../../../library/components/clyfar/test/MSDT.svelte";
    import Complete from "../../../library/components/clyfar/test/Complete.svelte";
    import Kraepelin from "../../../library/components/clyfar/test/Kraepelin.svelte";
    import Papikostick from "../../../library/components/clyfar/test/Papikostick.svelte";

    onMount(() => {
        const getStorage = getLocalStorage();

        if (getStorage !== null) {
            userText.currentTest = getStorage.currentTest;
            return;
        }

        // @ts-ignore
        userText.currentTest = 'DISC';
    });
</script>
<!-- {#if userText.currentTest === 'DISC'}
    <DISC/>
{:else if userText.currentTest === 'PAPI'}
    <Papikostick/>
{:else if userText.currentTest === 'KRAEPLIN'}
    <Kraepelin/>
{:else if userText.currentTest === 'BAUM'}
    <Baum/>
{:else if userText.currentTest === 'MBTI'}
    <MBTI/>
{:else if userText.currentTest === 'MSDT'}
    <MSDT/>
{:else if userText.currentTest === 'CLEAR'}
    <Complete/>
{/if} -->
<Complete/>
