<script lang="ts">
    import { rmib } from "../../../resources/rmib";
    import toast, { Toaster } from 'svelte-french-toast';
    import { userText, userConfig } from "../../../strings";
    import { getLocalStorage, updateCurrentTest } from "../../../utils/userStorage";
    
    const getLocal = getLocalStorage();
    const name: string = getLocal.name;
    const userGender: "Pria" | "Wanita" = getLocal.gender ?? "Pria";

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
            toast.error("Angka duplikat terdeteksi! Silahkan cek kembali pekerjaan anda")
            return;
        }

        for (const value of values) {
            const num = parseInt(value, 10);
            if (num < 1 || num > 12) {
                toast.error("Angka harus berada di antara 1 dan 12. Silahkan cek kembali pekerjaan anda")
                return;
            }
        }
    }

    const doPost = await fetch(userText.url + 'Clyfar/Test-Completion',{
            method : 'post',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                data : rmibValues,
                TIPE : 'RMIB',
                localPIN : localStorage.getItem('localPIN') ?? null
            })
        });
        
        const { status, message, redirectTo } = await doPost.json();

        if(status === 'success'){
            updateCurrentTest(redirectTo);
            $userConfig.testPosition = redirectTo;
        } else {
            toast.error(message);
        }
}
</script>
<Toaster/>
<div class="bg-clyfar">
    <div class="container-xs">
        <form on:submit|preventDefault={doPost}>
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
            <button type="submit" class="btn btn-sm btn-light-primary text-center shadow-sm w-100">Selesaikan Tes</button>
        </form>
    </div>
</div>