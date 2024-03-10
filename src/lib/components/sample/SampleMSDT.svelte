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
<Toaster/>
<div class="card w-full bg-base-100 shadow-xl mt-3">
    <div class="card-body">
        <h2 class="card-title">Hai, {userData?.name}!</h2>
        
        <ul class="list-disc p-3">
            <li class="mb-5">Terdapat 64 pasang pernyataan di bawah ini, dimana setiap nomor memiliki 2 pasang pernyataan.</li>
            <li class="mb-5">Tugas Anda adalah memilih satu jawaban yang paling sesuai atau yang paling mencerminkan diri Anda.</li>
            <li class="mb-5">Jika kedua pernyataan tersebut sama-sama sesuai atau tidak sesuai dengan diri Anda, maka pilihlah pernyataan yang <span class="font-bold text-red-400">"PALING MENDEKATI"</span> diri Anda.</li>
            <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini tidak ada jawaban yang dianggap benar atau salah.</li>
        </ul>

        <div class="card-actions justify-end mt-6">
            <div class="badge badge-outline">#tutorial</div> 
        </div>
    </div>
</div>