<script lang="ts">
    import { logOut } from "../../../utils/auth";
</script>
<div class="bg-clyfar vh-100">
    <div class="container-xs">
        <div class="card shadow-sm my-10 bg-white">
            <div class="card-body">
                <h3 class="mb-5">Sesi anda telah habis 👋</h3>
                <p>Silahkan klik di bawah untuk memulai kembali sesi anda</p>
                <div class="d-flex justify-content-end mt-12">
                    <button type="button" on:click={logOut} class="btn btn-sm btn-primary">Oke, login ulang.</button>
                </div>
            </div>
        </div>
    </div>
</div>