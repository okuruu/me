<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';

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
<div class="container-xs">
    <div class="p-5 border border border-gray-700 rounded">
        <h3 class="text-white mb-5">Test Instruction</h3>
        <ul class="fw-semibold text-muted">
            <li class="mb-5">Di subtes ini, Anda akan dihadapkan dengan 50 soal hitungan</li>
            <li class="mb-5">Tugas Anda adalah menjawab soal-soal hitungan ini dengan cepat dan teliti.</li>
            <li class="mb-5">Hanya jawaban berupa satu digit yang akan diterima.</li>
        </ul>
        <p class="text-white my-5">Contoh: </p>
        <ul class="text-muted">
            <li>5 + 2 = 7</li>
            <li>5 + 5 = 10, diketikkan angka 0 saja.</li>
            <li>4 + 9 = 13, diketikkan angka 3 saja.</li>
        </ul>
    </div>

    <div class="d-flex justify-content-end mt-12">
        <span class="text-muted h4">{timer}</span>
    </div>

    <h1 class="text-white text-center display-3 my-5">{expressions[expressionIndex]}</h1>

    <div class="row mt-12">
        <div class="col-4"><button type="button" on:click={() => onTap(1)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">1</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(2)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">2</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(3)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">3</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(4)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">4</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(5)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">5</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(6)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">6</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(7)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">7</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(8)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">8</span></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(9)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">9</span></button></div>
        <div class="col-4"><button type="button" class="btn btn-lg btn-dark w-100 fw-bold"></button></div>
        <div class="col-4"><button type="button" on:click={() => onTap(0)} class="btn btn-lg btn-bg-secondary w-100 fw-bold my-2 p-5"><span class="display-6">0</span></button></div>
        <div class="col-4"><button type="button" class="btn btn-lg btn-dark w-100 fw-bold"></button></div>
    </div>
</div>