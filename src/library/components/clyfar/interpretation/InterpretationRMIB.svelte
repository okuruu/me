<script lang="ts">
    import { previousPage } from "../../../utils/navigates";
    import type { RMIBResult } from "../../../interface/Clyfar";

    export let rmib: any;

    const categories: string[] = [
        "out", "me", "comp", "sci", "prs", 
        "aesth", "lit", "mus", "ss", "cler", 
        "prac", "med"
    ];
</script>

<div class="card shadow-sm my-3 bg-white">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi RMIB</h3>
        <div class="card-toolbar">
            <button type="button" on:click={previousPage} class="btn btn-sm btn-light">Kembali</button>
        </div>
    </div>
    <div class="card-body">
        <table class="table table-sm text-center table-hover table-row-dashed table-row-gray-300 gy-2">
            <thead>
                <tr class="fw-bolder fs-6 text-gray-800">
                    <th>Judul</th>
                    <th>A</th>
                    <th>B</th>
                    <th>C</th>
                    <th>D</th>
                    <th>E</th>
                    <th>F</th>
                    <th>G</th>
                    <th>H</th>
                    <th>I</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {#each categories as category}
                    <tr>
                        <td>{category}</td>
                        {#each rmib[category] as value}
                            <td>{value}</td>
                        {/each}
                        <td>{rmib.VALUE[category]}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="separator my-10"></div>

        {#each rmib.DESC as DESC }
            <div class="form-group my-3">
                <label for="Item Description" class="form-label fw-bold">{`${DESC.Key} (${DESC.Value})`}</label>
                <ol>
                    <li>Pria: { DESC.PRIA }</li>
                    <li>Wanita: { DESC.WANITA }</li>
                    <li>{DESC.DESC}</li>
                </ol>
            </div>
        {/each}
        <div class="form-group"></div>

    </div>
</div>
