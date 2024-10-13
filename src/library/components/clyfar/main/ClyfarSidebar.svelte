<script lang="ts">
    import { createEventDispatcher } from "svelte";

    interface SidebarItem {
        icon: string | null;
        name: string | string[];
    }

    interface SidebarSection {
        home: SidebarItem[];
        test: SidebarItem[];
    }

    const dispatch = createEventDispatcher();

    const sidebarData: SidebarSection = {
        home: [
            { icon: 'House.svg', name: 'Home' },
            { icon: 'Create-User.svg', name: 'Create User' }
        ],
        test: [
            { icon: null, name: ['MSDT', 'CFIT', 'MBTI', 'Kraeplin', 'Baum', 'DISC', 'Papikostick', 'RMIB'] }
        ]
    };
</script>

<aside class="form-group">
    {#each sidebarData.home as item}
        <button type="button" class="btn btn-xs btn-active-secondary w-100 text-start fw-bold">
            <img src={`/icons/elements/black/${item.icon}`} alt={`${item.name} Button`} class="h-25px ms-2 me-2" />
            {item.name}
        </button>
    {/each}

    <div class="mb-5"></div>
    <small class="text-muted fw-bold ms-5">TEST</small>

    {#each sidebarData.test[0].name as testName}
        <a href="#" class="btn btn-xs btn-active-secondary w-100 text-start fw-bold ms-7">{testName}</a>
    {/each}

    <div class="mb-5"></div>
    <button type="button" class="btn btn-xs btn-active-secondary w-100 text-start fw-bold">
        <img src="/icons/elements/black/Log-Out.svg" alt="Log Out Button" class="h-25px ms-2 me-2"/> Log Out
    </button>
</aside>
