<script lang="ts">
    import { getLocalStorage } from "$lib/utils/storage";

    let userData = getLocalStorage();
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
<div class="card w-full bg-base-100 shadow-xl mt-3">
    <div class="card-body">
        <h2 class="card-title">Hai, {userData?.name}!</h2>
        <ul class="list-disc p-3">
            <li class="mb-5">Terdapat 90 pasang pernyataan di bawah ini, dimana setiap nomor memiliki 2 pasang pernyataan.</li>
            <li class="mb-5">Tugas Anda adalah memilih satu jawaban yang paling sesuai atau yang paling mencerminkan diri Anda.</li>
            <li class="mb-5">Jika kedua pernyataan tersebut sama-sama sesuai atau tidak sesuai dengan diri Anda, maka pilihlah pernyataan yang <span class="font-bold text-red-400">"PALING MENDEKATI"</span> diri Anda.</li>
            <li class="mb-5">Tidak perlu ragu dalam memberikan jawaban, karena di sini tidak ada jawaban yang dianggap benar atau salah.</li>
        </ul>
        <div class="card-actions justify-end mt-6">
            <div class="badge badge-outline">#tutorial</div> 
        </div>
    </div>
</div>

{#each sample as sample,index }
    <div class="card w-full bg-base-100 shadow-xl my-3">
        <div class="card-body">
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">{sample.A}</span> 
                    <input type="radio" name="Papi_{index}" value="A" class="radio checked:bg-blue-500" required/>
                </label>
            </div>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">{sample.B}</span> 
                    <input type="radio" name="Papi_{index}" value="B" class="radio checked:bg-red-500" required/>
                </label>
            </div>
        </div>
    </div>
{/each}