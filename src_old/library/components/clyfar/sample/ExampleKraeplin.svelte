<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';

    let timer: number = $state(15);
    let expressionIndex: number = $state(0);
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

    const startInterval = setInterval(() => {
        if(timer == 0){
            clearInterval(startInterval);
            toast.error("Uji coba telah berakhir, Good Job!", { icon: '👏', });
            return;
        }
        timer = timer - 1;
    }, 1000)

    const onTap = (id: number) => {
        if (expressionIndex < expressions.length - 1) {
            expressionIndex += 1;
        }
    };
</script>
<Toaster/>
<div class="card shadow-sm bg-white">
    <div class="card-body">
        <h3 class=" mb-5">Test Instruction</h3>
        <ul class="fw-semibold">
            <li class="mb-5">Di subtes ini, Anda akan dihadapkan dengan 50 soal hitungan</li>
            <li class="mb-5">Tugas Anda adalah menjawab soal-soal hitungan ini dengan cepat dan teliti.</li>
            <li class="mb-5">Hanya jawaban berupa satu digit yang akan diterima.</li>
        </ul>
        <p class=" my-5">Contoh: </p>
        <ul class="">
            <li>5 + 2 = 7</li>
            <li>5 + 5 = 10, diketikkan angka 0 saja.</li>
            <li>4 + 9 = 13, diketikkan angka 3 saja.</li>
        </ul>
    </div>
</div>

<div class="d-flex justify-content-end mt-12">
    <span class="h4 text-white">{timer}</span>
</div>

<h1 class=" text-center display-3 my-5 text-white">{expressions[expressionIndex]}</h1>

<div class="row mt-12">
    <div class="col-4"><button type="button" onclick={() => onTap(1)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">1</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(2)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">2</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(3)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">3</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(4)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">4</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(5)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">5</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(6)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">6</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(7)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">7</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(8)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">8</span></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(9)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">9</span></button></div>
    <div class="col-4"><button type="button" class="btn btn-lg btn-flush w-100 fw-bold"></button></div>
    <div class="col-4"><button type="button" onclick={() => onTap(0)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">0</span></button></div>
    <div class="col-4"><button type="button" class="btn btn-lg btn-flush w-100 fw-bold"></button></div>
</div>