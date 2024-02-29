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
<div class="card w-full bg-base-100 shadow-xl mt-3">
    <div class="card-body">
        <h2 class="card-title">Hai, {userData?.name}!</h2>
        
        <ul class="list-none p-2">
            <li class="mb-2">Di subtes ini, Anda akan dihadapkan dengan 50 soal hitungan</li>
            <li class="mb-2">Tugas Anda adalah menjawab soal-soal hitungan ini dengan cepat dan teliti.</li>
            <li class="mb-2">Hanya jawaban berupa satu digit yang akan diterima.</li>
        </ul>

        <p>Contoh:</p>
        <ul class="list-disc p-2">
            <li class="mb-2">5 + 2 = 7</li>
            <li class="mb-2">5 + 5 = 10, diketikkan angka 0 saja.</li>
            <li class="mb-2">4 + 9 = 13, diketikkan angka 3 saja.</li>
        </ul>

        <div class="card-actions justify-end mt-6">
            <div class="badge badge-outline">#tutorial</div> 
        </div>
    </div>
</div>

<h1 class="text-6xl font-bold text-center my-12">2 + 7</h1>

<div class="grid grid-cols-3 gap-2 my-5">
    <button class="btn btn-lg btn-neutral">1</button>
    <button class="btn btn-lg btn-neutral">2</button>
    <button class="btn btn-lg btn-neutral">3</button>
    <button class="btn btn-lg btn-neutral">4</button>
    <button class="btn btn-lg btn-neutral">5</button>
    <button class="btn btn-lg btn-neutral">6</button>
    <button class="btn btn-lg btn-neutral">7</button>
    <button class="btn btn-lg btn-neutral">8</button>
    <button class="btn btn-lg btn-neutral">9</button>
    <button class="btn btn-lg btn-dark" disabled></button>
    <button class="btn btn-lg btn-neutral">0</button>
    <button class="btn btn-lg btn-neutral" disabled></button>
</div>
