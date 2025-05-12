<script lang="ts">
    import rmib from "../../../../json/psychological/rmib.json";
    import { db } from "../../../../library/hooks/db";
    import { useString } from "../../../../library/config/useString";
    import { userConfig } from "../../../../library/config/useConfiguration";
    import { getLocalStorage, updateCurrentTest } from "../../../../library/utils/useStorage";

    let token: string = $state("");
    let enableTest: boolean = $state(false);
    let name: string = $state("") ;
    let userGender: "Pria" | "Wanita" ="Pria";

    async function checkToken(): Promise <void> {
        const { status, message } = await db({
            'token' : token,
            'type' : 'RMIB'
        }, 'Clyfar/Verify-Token');

        if(status === 'success'){
            enableTest = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        token = '';
        return;
    }

    $effect(() => {
        // const getLocal = getLocalStorage();
        // name = getLocal.name;
        // userGender = getLocal.gender;
    })

    const newData: string[][] = rmib[userGender];

    async function doPost(): Promise<void> {
        const form = new FormData(document.querySelector('form')!);

        const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
        const rmibValues: { [key: string]: string[] } = {};

        keys.forEach(key => rmibValues[key] = []);

        for (let i = 1; i <= 12; i++) {
            const key = `RMIB_${i}[]`;
            const values = form.getAll(key).map(value => value as string);

            values.forEach((value, index) => {
                rmibValues[keys[index]].push(value);
            });
        }

        // Validation
        for (const key of keys) {
            const values = rmibValues[key];

            const duplicates = values.filter((item, index) => values.indexOf(item) !== index);
            if (duplicates.length > 0) {
                console.error("Angka duplikat terdeteksi! Silahkan cek kembali pekerjaan anda")
                return;
            }

            for (const value of values) {
                const num = parseInt(value, 10);
                if (num < 1 || num > 12) {
                    console.error("Angka harus berada di antara 1 dan 12. Silahkan cek kembali pekerjaan anda")
                    return;
                }
            }
        }

        const { status, message, redirectTo } = await db({
            data : rmibValues,
            TIPE : 'RMIB',
            localPIN : localStorage.getItem('localPIN') ?? null
        }, 'Clyfar/Test-Completion');

        if(status === 'success'){
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        } else {
            console.error(message)
        }
    }
</script>
<div class="bg-light-warning {!enableTest ? 'vh-100' : ''}">
    <div class="container-xs">
        {#if !enableTest}
            <form class="mt-20" onsubmit={checkToken}>
                <div class="card shadow-sm bg-white">
                    <div class="card-body">
                        <h3 class="mb-5">Test Instruction</h3>
                        <ul class="fw-semibold">
                            <li class="mb-5">Pada subtes ini anda akan dihadapkan oleh beberapa jenis pekerjaan atau profesi yang tersusun dalam berbagai kelompok.</li>
                            <li class="mb-5">Tugas anda adalah memberikan ranking atau mengurutkan dari yang paling diminati sampai yang paling tidak diminati.</li>
                            <li class="mb-5">Perlu diperhatikan bahwa pemberian nomor boleh acak namun <span class="fw-bold text-danger">"tidak boleh rangkap / dobel"</span>.</li>
                            <li class="mb-5">Berikan nomor <b>1</b> untuk pekerjaan yang paling diminati dan seterusnya sampai nomor <b>12</b> untuk pekerjaan yang paling tidak diminati.</li>
                        </ul>
                    </div>
                </div>
                <div class="p-5 rounded shadow-sm bg-white mt-5">
                    <div class="d-flex justify-content-center mt-5">
                        <input type="text" bind:value={token} class="form-control form-control-sm text-center mb-3" placeholder="Masukkan Password" required/>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-sm btn-gradient text-white w-100">Verifikasi Password</button>
                    </div>
                </div>
            </form>
        {:else}
            <form onsubmit={doPost}>
                {#each newData as data, cardNumber }
                    <div class="card shadow-sm bg-white my-5">
                        <div class="card-header">
                            <h3 class="card-title fw-bold">No. {cardNumber + 1}</h3>
                            <div class="card-toolbar">
                                <button type="button" class="btn btn-sm btn-light">
                                    {name ?? '-'}
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table align-middle">
                                    <thead class="fw-bold">
                                        <tr>
                                            <th>#</th>
                                            <th>Minat</th>
                                            <th class="text-center">Ranking</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each data as jobType, index }
                                            <tr>
                                                <td class="text-center">{index + 1}</td>
                                                <td>{ jobType }</td>
                                                <td>
                                                    <input type="number" min="1" max="12" name="RMIB_{index +1}[]" class="form-control form-control-sm text-center" placeholder="Urutan" required/>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                {/each}
                <button type="submit" class="btn btn-sm btn-gradient text-white text-center shadow-sm w-100">Selesaikan Tes</button>
            </form>
        {/if}
    </div>
</div>