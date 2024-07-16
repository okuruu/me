<script lang="ts">
    import { onMount } from 'svelte';
    import toast, { Toaster } from 'svelte-french-toast';

    let data: { Most : number|null; Least : number|null }[] = [];
    const DISC: { LV_1 : string; LV_2: string; LV_3: string; LV_4: string }[] = [
        {
            "LV_1": "Tidak terlalu tegang",
            "LV_2": "Ketepatan sangat penting",
            "LV_3": "Menjadi baik lebih penting",
            "LV_4": "Lebih baik dihormati oleh atasan dan rekan"
        },
        {
            "LV_1": "Konser, Opera",
            "LV_2": "Drama, Ketenangan",
            "LV_3": "Keselamatan, Keamanan",
            "LV_4": "Petualangan, Berkemah"
        },
    ];

    onMount(() => {
        for(let i: number = 0; i < 24; i++){
                data = [...data,{
                    Most : null,
                    Least : null
                }]
            }
        data = data;
    });

    function setValue(index: number, value: number, letter: string) {
        if (letter === 'Most') {
            if (data[index].Most === null) {
                if (data[index].Least === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            }
            data[index].Most = value;
        } else {
            if (data[index].Least === null) {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            } else {
                if (data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                } else if (data[index].Most === data[index].Least && data[index].Most === value) {
                    toast.error("Nilai tidak boleh sama!");
                    return;
                }
            }
            data[index].Least = value;
        }
    }
</script>
<Toaster/>
<div class="container-xs">
    <div class="p-5 border border border-gray-700 rounded">
        <h3 class="text-white mb-5">Test Instruction</h3>
        <ul class="fw-semibold text-muted">
            <li class="mb-5">Tugas Anda adalah memilih satu pernyataan sebagai <span class="fw-bold text-primary">M (Most)</span> dan satu sebagai <span class="fw-bold text-danger">L (Least)</span> dari kumpulan pernyataan yang disediakan.</li>
            <li class="mb-5"><span class="fw-bold text-primary">M (Most)</span> menunjukkan pernyataan yang <b>paling menggambarkan diri Anda</b>, sedangkan <span class="fw-bold text-danger">L (Least)</span> menunjukkan pernyataan yang <b>paling tidak menggambarkan diri Anda.</b></li>
            <li class="mb-5">Setiap nomor hanya boleh memiliki satu pilihan di kolom M dan satu pilihan di kolom L. Pastikan pilihan tidak sejajar.</li>
        </ul>
    </div>

    <div class="p-3 w-full my-3 border border border-gray-700 rounded mt-3">
        <div class="table-responsive me-7">
            <table class="table align-middle text-center text-white">
                <thead>
                    <tr>
                        <th></th>
                        <th>M</th>
                        <th>L</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-end">Baik hati, lemah lembut</td>
                        <td><input class="form-check-input" type="radio" name="M1" value="M1" disabled checked></td>
                        <td><input class="form-check-input" type="radio" name="M1" value="L1" disabled></td>
                    </tr>
                    <tr>
                        <td class="text-end">Santai, tidak terlalu ambisius</td>
                        <td><input class="form-check-input" type="radio" name="M2" disabled></td>
                        <td><input class="form-check-input" type="radio" name="M2" disabled></td>
                    </tr>
                    <tr>
                        <td class="text-end">Pemberani, tidak takut apapun</td>
                        <td><input class="form-check-input" type="radio" name="M3" disabled></td>
                        <td><input class="form-check-input" type="radio" name="M3" disabled checked></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="separator separator-content border-light my-15">
        <span class="w-250px fw-bolder text-white">Uji Coba</span>
    </div>

    {#each DISC as DISC,index}
        <div class="p-3 w-full my-3 border border border-gray-700 rounded">
            <div class="table-responsive">
                <table class="table align-middle text-center text-white">
                    <thead>
                        <tr>
                            <th class="px-4 py-2"></th>
                            <th class="px-4 py-2">M</th>
                            <th class="px-4 py-2">L</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="px-4 py-2">{DISC.LV_1}</td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,1, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,1, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{DISC.LV_2}</td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,2, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,2, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{DISC.LV_3}</td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,3, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,3, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{DISC.LV_4}</td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="M{index}" on:click={() => setValue(index,4, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="form-check-input" type="radio" name="L{index}" on:click={() => setValue(index,4, 'Least')}>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    {/each}

</div>