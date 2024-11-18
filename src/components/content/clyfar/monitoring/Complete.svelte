<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "../../../../library/hooks/db";
    import { getLocalStorage } from "../../../../library/utils/useStorage";

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

        console.error(message);
    }
</script>
<div class="bg-clyfar vh-100">
    <div class="container-xs">
        <div class="card shadow-sm my-10 bg-white">
            <div class="card-body">
                <h3 class="mb-5">Terima Kasih!</h3>
                <p>Anda telah menyelesaikan tes dengan baik. Apakah Anda ingin menutup halaman ini?</p>
                <div class="d-flex justify-content-end mt-12">
                    <button type="button" onclick={endTest} class="btn btn-sm btn-primary">Oke, tutup halaman.</button>
                </div>
            </div>
        </div>
    </div>
</div>