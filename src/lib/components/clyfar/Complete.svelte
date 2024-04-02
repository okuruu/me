<script lang="ts">
    import { goto } from "$app/navigation";
    import { baseConfig } from "$lib/strings/baseConfig";
    import { getLocalStorage } from "$lib/utils/storage";

    const endTest = async () => {
        // let userData = getLocalStorage();
        // const doPost = await fetch($baseConfig.url + '#Waiting',{
        //     method : 'post',
        //     headers : { 'Content-Type' : 'application/json' },
        //     body : JSON.stringify({
        //         id : userData.whatsapp;
        //     })
        // });

        localStorage.removeItem('user');
        return goto('/clyfar');
    }
</script>
<div class="container mx-auto">
    <div class="flex justify-center items-center h-screen">
        
        <div class="card card-compact w-96 bg-base-100 shadow-xl">
            <figure><img src="/images/Cat.jpg" alt="Clear" /></figure>
            <div class="card-body">
                <h2 class="card-title">Terima Kasih!</h2>
                <p>Anda telah menyelesaikan tes dengan baik. Apakah Anda ingin menutup halaman ini?</p>
                <div class="card-actions justify-end">
                    <button type="button" on:click={endTest} class="btn btn-primary">Oke, tutup halaman.</button>
                </div>
            </div>
        </div>

    </div>
</div>