<script lang="ts">
    import { exportCSV } from '$lib/utils/exportCSV';
    import { generateRandomToken } from '$lib/utils/tokenGenerator';
    import toast, { Toaster } from 'svelte-french-toast';

    interface Ymgeisydd { // Candidate
        id: number;
        nama : string;
        gender : string;
        whatsapp : string;
        token : string;
        sesi : string[];
        pass : string,
        agreementDate : string;
    };

    let viewInterpretation: boolean = false;

    let newData: Ymgeisydd[] = [];
    let staticData: Ymgeisydd[] = [];

    let searchBar: string;
    let createToken: number|null = 5;

    const runSearch = () => {
        newData = newData.filter(item => {
            const searchTerm = searchBar.trim().toLowerCase(); // Convert search term to lowercase
            const nama = item.nama.toLowerCase(); // Convert data field to lowercase
            const gender = item.gender.toLowerCase(); // Convert data field to lowercase
            const whatsapp = item.whatsapp.toLowerCase(); // Convert data field to lowercase
            const token = item.token.toLowerCase();

            return nama.includes(searchTerm) || gender.includes(searchTerm) || whatsapp.includes(searchTerm) || token.includes(searchTerm);
        });
    }

    async function generateToken(){
        if (createToken === null) {
            return toast.error('Error: Token value is null');
        }

        for (let i = 0; i < createToken; i++) {
            newData = [...newData,{
                id : i,
                nama : '-',
                gender : '-',
                whatsapp : '-',
                token : generateRandomToken(5),
                sesi : ['DISC','PAPI','KRAEPLIN','BAUM','MBTI','MSDT','CFIT'],
                pass : '',
                agreementDate : '-'
            }];
        }
        newData = newData;
        staticData = newData;
    }

    function pressBar(event: { key: string }){
        if(event.key === 'Escape'){
            searchBar = '';
            newData = staticData;
            document.getElementById('searchController')?.focus();
        }
    }

    const getReport = () => {
        if(newData.length === 0){
            return toast.error("Tidak ada data", { position : 'top-right' });
        }
        exportCSV('lihatKandidat',newData);
    }
</script>
<Toaster/>
<div class="card w-full bg-base-100">
    <div class="card-body">
        {#if !viewInterpretation}
            <div class="overflow-x-auto">
                <div class="flex justify-between mb-3">
                    <div>
                        <form on:submit|preventDefault={generateToken}>
                            <div class="flex">
                                <div class="flex-auto">
                                    <label class="form-control">
                                        <div class="label">
                                            <span class="label-text">Buat token psikotes</span>
                                        </div>
                                        <label class="input input-sm input-bordered flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                                            <input type="number" min=1 max=25 bind:value={createToken} class="grow" placeholder="0 - 25" required/>
                                        </label>
                                    </label>
                                </div>
                                <div class="flex-auto">
                                    <button type="submit" class="btn btn-sm btn-neutral mt-9 ms-3">Generate Token</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div>
                        <div class="flex">
                            <div class="flex-auto">
                                <label class="input input-sm input-bordered flex items-center gap-2 mt-9">
                                    <input type="text" id="searchController" bind:value={searchBar} on:keydown={runSearch} class="grow" placeholder="Search" />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
                                </label>
                            </div>
                            <div class="flex-auto">
                                <button type="button" on:click={getReport} class="btn btn-sm btn-neutral mt-9 ms-3">Export CSV</button>
                            </div>
                        </div>
                    </div>
                </div>

                <table class="table table-zebra">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Gender</th>
                        <th>WhatsApp</th>
                        <th>Token</th>
                        <th>Psikotes</th>
                        <th>Tanggal Persetujuan</th>
                        <th>Passing Grade</th>
                        <th>Lihat Interpretasi</th>
                    </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="8">Tidak ada data</td>
                            </tr>
                        {:else}
                            {#each newData as data, index}
                                <tr class="hover">
                                    <th>{index + 1}</th>
                                    <td>{data.nama}</td>
                                    <td>{data.gender}</td>
                                    <td>{data.whatsapp}</td>
                                    <td>{data.token}</td>
                                    <td>{data.sesi}</td>
                                    <td>{data.agreementDate}</td>
                                    <td>
                                        <select class="select select-sm">
                                            <option value="">Pending</option>
                                            <option value="Pass">Pass</option>
                                            <option value="Fail">Fail</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button type="button" on:click={() => viewInterpretation = true} class="btn btn-neutral">Lihat</button>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        {:else}
            Yeah....
        {/if}
    </div>
</div>

<svelte:window on:keydown={pressBar} />