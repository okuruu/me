<script lang="ts">
    import { goto } from "$app/navigation";

    async function logOut(): Promise <void> {
        localStorage.removeItem('localPIN');  
        localStorage.removeItem('user');
        console.log('See you soon!', { icon : '👋' }); 
        return goto('/clyfar');
    }
</script>
<div class="bg-light-warning vh-100">
    <div class="container-xs">
        <div class="card shadow-sm my-10 bg-white">
            <div class="card-body">
                <h3 class="mb-5">Sesi anda telah habis 👋</h3>
                <p>Silahkan klik di bawah untuk memulai kembali sesi anda</p>
                <div class="d-flex justify-content-end mt-12">
                    <button type="button" onclick={logOut} class="btn btn-sm btn-primary">Oke, login ulang.</button>
                </div>
            </div>
        </div>
    </div>
</div>