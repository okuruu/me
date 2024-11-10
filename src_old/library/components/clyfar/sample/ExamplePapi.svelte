<script lang="ts">
    const sample: { A : string; B : string; }[] = [
        {
            A: "Saya adalah orang yang jujur.",
            B: "Saya mencintai diri saya sendiri.",
        },
        {
            A: "Saya berusaha untuk menjadi lebih baik setiap hari.",
            B: "Saya ingin berguna bagi orang lain.",
        },
        {
            A : "Saya ingin menunjukkan mimpi saya pada orang lain",
            B : "Saya sangat menyukai passion saya",
        },
    ];
</script>
<div class="card shadow my-3 bg-white">
    <div class="card-body">
        <h3 class="mb-5">Test Instruction</h3>
        <ul class="fw-semibold">
            <li class="mb-5">Terdapat 90 pasang pernyataan di bawah ini, dimana setiap nomor memiliki 2 pasang pernyataan.</li>
            <li class="mb-5">Tugas Anda adalah memilih satu jawaban yang paling sesuai atau yang paling mencerminkan diri Anda.</li>
            <li class="mb-5">Jika kedua pernyataan tersebut sama-sama sesuai atau tidak sesuai dengan diri Anda, maka pilihlah pernyataan yang <span class="fw-bold text-danger">"PALING MENDEKATI"</span> diri Anda.</li>
            <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini tidak ada jawaban yang dianggap benar atau salah.</li>
        </ul>
    </div>
</div>

{#each sample as sample, index }
    <div class="card shadow-sm my-3 bg-white">
        <div class="card-body">
            <div class="form-group">
                <div class="form-check form-check-custom form-check-solid my-2">
                    <input class="form-check-input" name="{`Papi_${index}`}" type="radio" value="Pria" id="{`Papi_A_${index}`}" required/>
                    <label class="form-check-label ms-7" for="{`Papi_A_${index}`}">
                        {sample.A}
                    </label>
                </div>
                <div class="form-check form-check-custom form-check-danger form-check-solid my-2">
                    <input class="form-check-input" name="{`Papi_${index}`}" type="radio" id="{`Papi_B_${index}`}" required/>
                    <label class="form-check-label ms-7" for="{`Papi_B_${index}`}">
                        {sample.B}
                    </label>
                </div>
            </div>
        </div>
    </div>
{/each}