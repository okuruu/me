<script lang="ts">
import { onMount } from 'svelte';
import { previousPage } from '../../../utils/navigates';
    import { papikostickDescription } from '../../../resources/papikostick';

    interface Props {
        papikostickTable: any;
    }

    let { papikostickTable }: Props = $props();

interface Data {
    key: string;
    nilai: number;
    deskripsi: string;
    color: string;
}

let newData: Data[] = $state([]);

const descriptions: { [key: string]: { range: [number, number]; text: string }[] } = papikostickDescription;

const getDescription = (key: string, nilai: number) => {
    const keyDescriptions = descriptions[key];
    if (keyDescriptions) {
        const match = keyDescriptions.find((desc) => nilai >= desc.range[0] && nilai <= desc.range[1]);
        return match ? match.text : '';
    }
    return '';
};

onMount(() => {
    newData = Object.keys(papikostickTable).map((key: string) => ({ key,
        nilai: papikostickTable[key].NILAI,
        deskripsi: papikostickTable[key].Deskripsi,
        color: papikostickTable[key].color,
    }));
});
</script>
<div class="card shadow-sm bg-white my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi Papikostick</h3>
        <div class="card-toolbar">
            <button type="button" onclick={previousPage} class="btn btn-sm btn-light">Kembali</button>
        </div>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-sm table-bordered text-center align-middle table-hover">
                <thead>
                    <tr class="fw-bolder text-center">
                        <th>#</th>
                        <th>Tipe</th>
                        <th>Nilai</th>
                        <th>Kategori</th>
                        <th>Deskripsi</th>
                    </tr>
                </thead>
                <tbody>
                    {#each newData as data, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td><span class="badge badge-{data.color}">{data.deskripsi}</span></td>
                            <td>{data.key}</td>
                            <td>{data.nilai}</td>
                            <td>{getDescription(data.key, data.nilai)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>