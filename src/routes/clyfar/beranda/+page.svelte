<script lang="ts">
    import { db } from '../../../library/utils/db';
    import toast, { Toaster } from 'svelte-french-toast';
    import type { Testee } from '../../../library/interface/Clyfar.js';
    import { goto } from '$app/navigation';

    export let data;

    let newData: Testee[] = data.testee ?? [];

    async function view(id: string): Promise <void> {
        const { status, message, data } = await db({
            token : id
        }, 'Clyfar/Check-Testee');

        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }

        toast.error(message)
    }
</script>
<Toaster/>
<div class="container-xs">
    <div class="d-flex justify-content-end">
        <button type="button" class="badge badge-dark border rounded">
            <img src="/icons/elements/Human.svg" alt="Person Icon" class="me-2"/> Buat User
        </button>
    </div>

    <div class="table-responsive">
        <table class="table table-bordered align-middle text-white text-center mt-5">
            <thead>
                <tr class="fw-bolder">
                    <th>#</th>
                    <th>Token</th>
                    <th>Nama</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each newData as data, index }
                    <tr>
                        <td>{index + 1}</td>
                        <td>{data.TOKEN}</td>
                        <td>{data.NAMA ?? '-'}</td>
                        <td>
                            <button type="button" on:click={() => view(data.TOKEN)} class="badge badge-dark border rounded">Lihat</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>