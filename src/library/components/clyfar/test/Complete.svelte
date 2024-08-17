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
<div class="bg-clyfar vh-100">
    <div class="container-xs">
        <div class="card shadow-sm my-10 bg-white">
            <div class="card-body">
                <h3 class="mb-5">Terima Kasih!</h3>
                <p>Anda telah menyelesaikan tes dengan baik. Apakah Anda ingin menutup halaman ini?</p>
                <div class="d-flex justify-content-end mt-12">
                    <button type="button" on:click={endTest} class="btn btn-sm btn-primary">Oke, tutup halaman.</button>
                </div>
            </div>
        </div>
    </div>
</div>