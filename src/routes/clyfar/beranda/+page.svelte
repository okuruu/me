<script lang="ts">
    import ClyfarSidebar from "../../../library/components/clyfar/main/ClyfarSidebar.svelte";
    import ClyfarTable from "../../../library/components/clyfar/main/ClyfarTable.svelte";

    let sidebar: string = 'home';

    let moment: "morning" | "afternoon" | "evening" | "night" = getMoment();

    function getMoment (): "morning" | "afternoon" | "evening" | "night" {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            return "morning";
        } else if (currentHour >= 12 && currentHour < 17) {
            return "afternoon";
        } else if (currentHour >= 17 && currentHour < 21) {
            return "evening";
        } else {
            return "night";
        }
    };
</script>
<div class="row">
    <div class="col-1">
        <ClyfarSidebar/>
    </div>
    <div class="col-11">
        <div class="container">
            <div class="text-center">
                <h1 class="mt-12 display-5 text-warning">Good {moment} 👋</h1>
                <p class="fw-semibold text-muted">Let's do better.</p>
            </div>
            {#if sidebar === 'home'}
                <ClyfarTable />
            {:else }
                <p>Nothing?</p>            
            {/if}
        </div>
    </div>
</div>