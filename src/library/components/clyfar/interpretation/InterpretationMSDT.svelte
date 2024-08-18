<script lang="ts">
    export let msdt: MSDT;
    import type { MSDT } from "../../../interface/Clyfar";
</script>
<div class="card shadow-sm my-3 bg-white">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi MSDT</h3>
        <div class="card-toolbar">
            <button type="button" class="btn btn-sm btn-light">
                Interpretation Viewer
            </button>
        </div>
    </div>
    <div class="card-body">

        <div class="table-responsive">
            <table class="table table-hover align-middle text-center gy-1 gx-1">
                <thead>
                    <tr class="fw-bold">
                        <th class="border">#</th>
                        {#each msdt.line2 as tableHeader }
                            <th class="border">{tableHeader}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each Array(Math.ceil(msdt.rawjawaban.length / 8)) as _, rowIndex}
                        <tr>
                            <td class="fw-bolder border">{(rowIndex + 1) * 8}</td>
                            {#each msdt.rawjawaban.slice(rowIndex * 8, (rowIndex + 1) * 8) as data, colIndex}
                                <td>{data.value}</td>
                            {/each}
                        </tr>
                    {/each}
                    <tr class="fw-bolder">
                        <td class="bg-light-info">Koreksi</td>
                        {#each msdt.koreksi as koreksi }
                            <td>{koreksi}</td>
                        {/each}
                    </tr>
                    <tr class="fw-bolder">
                        <td class="bg-light-success">Hasil Interpretasi</td>
                        <td colspan="8">{msdt.resultMSDT}</td>
                    </tr>
                </tbody>
            </table>

            <textarea class="form-control form-control-solid" rows="7" readonly>{msdt.deskripsi}</textarea>

        </div>

    </div>
</div>