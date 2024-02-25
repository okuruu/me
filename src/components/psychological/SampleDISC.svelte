<script lang="ts">
    import { onMount } from "svelte";
    import toast, { Toaster } from 'svelte-french-toast';
    import { discSample } from "$lib/strings/psychological/sample/disc";

    interface User {
        name: string;
        whatsapp: string;
        birthDate: Date;
        gender: string;
        isAgree: boolean;
        agreementDate: Date;
    }

    interface Disc {
        Most : number|null;
        Least : number|null;
    }

    let data:Disc[] = [];

    let userData: User|null = null;

    onMount(() => {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
            
            for(let i: number = 0; i < 24; i++){
                data = [...data,{
                    Most : null,
                    Least : null
                }]
            }

            data = data;
            
        } else {
            toast.error('Ada kesalahan pada perangkat anda.');
        }
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

<div class="card w-full bg-base-100 shadow-xl mt-3">
    <div class="card-body">
        <h2 class="card-title">Hai, {userData?.name}!</h2>
        
        <ul class="list-disc p-3">
            <li class="mb-5">Tugas Anda adalah memilih satu pernyataan sebagai <span class="font-bold text-blue-400">M (Most)</span> dan satu sebagai <span class="font-bold text-red-400">L (Least)</span> dari kumpulan pernyataan yang disediakan.</li>
            <li class="mb-5"><span class="font-bold text-blue-400">M (Most)</span> menunjukkan pernyataan yang <b>paling menggambarkan diri Anda</b>, sedangkan <span class="font-bold text-red-400">L (Least)</span> menunjukkan pernyataan yang <b>paling tidak menggambarkan diri Anda.</b></li>
            <li class="mb-5">Setiap nomor hanya boleh memiliki satu pilihan di kolom M dan satu pilihan di kolom L. Pastikan pilihan tidak sejajar.</li>
        </ul>

        <div class="card-actions justify-end mt-6">
            <div class="badge badge-outline">#tutorial</div> 
        </div>
    </div>
</div>

<div class="card w-full bg-base-100 shadow-xl my-5">
    <div class="card-body">
        
        <div class="overflow-x-auto my-5">
            <table class="table-auto mx-auto">
                <thead>
                    <tr>
                        <th class="px-4 py-2"></th>
                        <th class="px-4 py-2">M</th>
                        <th class="px-4 py-2">L</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="px-4 py-2">Baik hati, lemah lembut</td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-blue-500" type="radio" name="M1" disabled>
                        </td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-red-500" type="radio" name="L1" disabled>
                        </td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2">Santai, tidak terlalu ambisius</td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-blue-500" type="radio" name="M1" disabled checked>
                        </td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-red-500" type="radio" name="L1" disabled>
                        </td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2">Pemberani, tidak takut apapun</td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-blue-500" type="radio" name="M1" disabled>
                        </td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-red-500" type="radio" name="L1" disabled>
                        </td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2">Menyenangkan, suka bercanda</td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-blue-500" type="radio" name="M1" disabled>
                        </td>
                        <td class="px-4 py-2">
                            <input class="radio checked:bg-red-500" type="radio" name="L1" disabled checked>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</div>

{#each discSample as discSample,index}
    <div class="card w-full bg-base-100 shadow-xl my-5">
        <div class="card-body">

            <div class="overflow-x-auto">
                <table class="table-auto mx-auto">
                    <thead>
                        <tr>
                            <th class="px-4 py-2"></th>
                            <th class="px-4 py-2">M</th>
                            <th class="px-4 py-2">L</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="px-4 py-2">{discSample.LV_1}</td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,1, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,1, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{discSample.LV_2}</td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,2, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,2, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{discSample.LV_3}</td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,3, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,3, 'Least')}>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">{discSample.LV_4}</td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-blue-500" type="radio" name="M{index}" on:click={() => setValue(index,4, 'Most')}>
                            </td>
                            <td class="px-4 py-2">
                                <input class="radio checked:bg-red-500" type="radio" name="L{index}" on:click={() => setValue(index,4, 'Least')}>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
{/each}