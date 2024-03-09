<script>
    import DISC from "$lib/components/clyfar/Disc.svelte";
    import Papi from "$lib/components/clyfar/Papi.svelte";
    import Baum from "$lib/components/clyfar/Baum.svelte";
    import Mbti from "$lib/components/clyfar/MBTI.svelte";
    import Msdt from "$lib/components/clyfar/MSDT.svelte";
    import CFIT from "$lib/components/clyfar/CFIT.svelte";
    import Kraeplin from "$lib/components/clyfar/Kraeplin.svelte";
    import { onMount } from "svelte";
    
    onMount(() => {
    const userStorage = localStorage.getItem('user');
        if (userStorage !== null) {
            const user = JSON.parse(userStorage);
            console.log(user);
        } else {
            console.log('User data not found in local storage');
        }
    });


</script>
<DISC/>
<!-- <Papi/> -->
<!-- <Kraeplin/> -->
<!-- <Baum/> -->
<!-- <Mbti/> -->
<!-- <Msdt/> -->
<!-- <CFIT/> -->