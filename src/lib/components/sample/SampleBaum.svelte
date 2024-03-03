<script lang="ts">
    import { onMount } from "svelte";
    import toast, { Toaster } from 'svelte-french-toast';

    interface User {
        name: string;
        whatsapp: string;
        birthDate: Date;
        gender: string;
        isAgree: boolean;
        agreementDate: Date;
    }

    let userData: User|null = null;

    onMount(() => {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
        } else {
            toast.error('Ada kesalahan pada perangkat anda.');
        }
    });
</script>
<div class="container mx-auto p-2">
    <div class="card w-full bg-base-100 shadow-xl mt-3">
        <div class="card-body">
            <h2 class="card-title">Hai, {userData?.name}!</h2>
            
            <ul class="list-disc p-3">
                <li class="mb-5">Buatlah <span class="font-bold text-green-400">gambar pohon</span> di kanvas yang tersedia.</li>
                <li class="mb-5">Tidak ada aturan untuk menggambar sebuah pohon; <span class="font-bold text-green-400">lukis sesuai keinginanmu</span>.</li>
                <li class="mb-5">Jika sudah selesai, anda dapat melakukan screenshot lalu mengupload gambar anda pada opsi yang ada di bawah.</li>
                <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini <span class="font-bold text-blue-400">tidak ada jawaban yang dianggap benar atau salah</span>.</li>
            </ul>
    
            <div class="card-actions justify-end mt-6">
                <div class="badge badge-outline">#tutorial</div> 
            </div>
        </div>
    </div>
</div>