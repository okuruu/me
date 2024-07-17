<script lang="ts">
    import { db } from "../../../utils/db";
    import { goto } from "$app/navigation";
    import toast from "svelte-french-toast";
    import { getLocalStorage } from "../../../utils/userStorage";

    async function endTest(): Promise <void> {
        const user = getLocalStorage();

        const { status, message } = await db({
            whatsapp : user.whatsapp
        }, 'Clyfar/Log-Out');

        if (status === 'success') {
            localStorage.removeItem('localPIN');
            localStorage.removeItem('user');
            return goto('/clyfar');
        }

        toast.error(message);
    }
</script>
<div class="container-xs">
    <div class="p-5 border border border-gray-700 rounded">
        <h3 class="text-white mb-5">Terima Kasih!</h3>
        <p class="text-white">Anda telah menyelesaikan tes dengan baik. Apakah Anda ingin menutup halaman ini?</p>
        <div class="d-flex justify-content-end mt-12">
            <button type="button" on:click={endTest} class="btn btn-sm btn-light w-50 text-center text-dark">Oke, tutup halaman.</button>
        </div>
    </div>
</div>