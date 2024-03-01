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

    let timer: number = 15;

    let expressionIndex: number = 0;
    const expressions: string[] = [
        "4 + 7","5 + 4","2 + 9",
        "1 + 2","2 + 4","5 + 4",
        "2 + 3","1 + 2","9 + 8",
        "8 + 8","4 + 7","5 + 4",
        "2 + 9","1 + 2","2 + 4",
        "5 + 4","2 + 3","1 + 2",
        "9 + 8","8 + 8","2 + 2",
        "4 + 3"
    ];

    onMount(() => {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
        } else {
            toast.error('Ada kesalahan pada perangkat anda.');
        }
    });

    const startInterval = setInterval(() => {
        if(timer == 0){
            clearInterval(startInterval);
            return toast.error('Uji coba telah selesai!', {position : 'top-right' });
        }
        timer = timer - 1;
    },1000)

    const onTap = (id: number) => {
        if (expressionIndex < expressions.length - 1) {
            expressionIndex += 1;
        }
    };
</script>
<Toaster/>
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

<div class="flex justify-end my-12">
    <p class="font-semibold">{timer}</p>
</div>

<h1 class="text-6xl font-bold text-center my-6">{expressions[expressionIndex]}</h1>

<div class="grid grid-cols-3 gap-2 my-5">
    <button type="button" on:click={() => onTap(1)} class="btn btn-lg btn-neutral">1</button>
    <button type="button" on:click={() => onTap(2)} class="btn btn-lg btn-neutral">2</button>
    <button type="button" on:click={() => onTap(3)} class="btn btn-lg btn-neutral">3</button>
    <button type="button" on:click={() => onTap(4)} class="btn btn-lg btn-neutral">4</button>
    <button type="button" on:click={() => onTap(5)} class="btn btn-lg btn-neutral">5</button>
    <button type="button" on:click={() => onTap(6)} class="btn btn-lg btn-neutral">6</button>
    <button type="button" on:click={() => onTap(7)} class="btn btn-lg btn-neutral">7</button>
    <button type="button" on:click={() => onTap(8)} class="btn btn-lg btn-neutral">8</button>
    <button type="button" on:click={() => onTap(9)} class="btn btn-lg btn-neutral">9</button>
    <button type="button" class="btn btn-lg btn-dark" disabled></button>
    <button type="button" on:click={() => onTap(0)} class="btn btn-lg btn-neutral">0</button>
    <button type="button" class="btn btn-lg btn-neutral" disabled></button>
</div>