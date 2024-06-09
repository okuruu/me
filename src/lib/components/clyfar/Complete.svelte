<script lang="ts">
    import { goto } from "$app/navigation";
    import { baseConfig } from "$lib/strings/baseConfig";
    import { kobo } from "$lib/utils/kobo";
    import { getLocalStorage } from "$lib/utils/storage";
    import toast from "svelte-french-toast";

    const endTest = async () => {
        let userData = getLocalStorage();

        const { status, message } = await kobo({ whatsapp : userData.whatsapp }, 'Clyfar/Log-Out');

        if ( status === 'success' ) {
            localStorage.removeItem('user');
            return goto('/clyfar');
        }

        toast.error(message);

    }
</script>
<div class="container mx-auto">
    <div class="flex justify-center items-center h-screen">
        
        <div class="card card-compact w-96 bg-base-100 shadow-xl">
            <figure><img src="/images/Cat.jpg" alt="Clear" /></figure>
            <div class="card-body">
                <h2 class="card-title">Terima Kasih!</h2>
                <p>Anda telah menyelesaikan tes dengan baik. Apakah Anda ingin menutup halaman ini?</p>
                <div class="card-actions justify-end mt-8">
                    <button type="button" on:click={endTest} class="btn btn-primary">Oke, tutup halaman.</button>
                </div>
            </div>
        </div>

    </div>
</div>