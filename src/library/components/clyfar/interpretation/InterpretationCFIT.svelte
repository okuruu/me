<script lang="ts">
    import { previousPage } from "../../../utils/navigates";
    import type { CFITResult } from "../../../interface/Clyfar";

    export let cfit: CFITResult;
</script>
<div class="card shadow-sm bg-white my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi MBTI</h3>
        <div class="card-toolbar">
            <button type="button" on:click={previousPage} class="btn btn-sm btn-light">Kembali</button>
        </div>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="fw-bolder">
                    <tr>
                        <th>Result Score</th>
                        <th>Status Kecerdasan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{cfit.resultScore}</td>
                        <td>{cfit.resultStatus}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>