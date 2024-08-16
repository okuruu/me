<script lang="ts">
    import { rmib } from "../../../library/resources/rmib";
    const currentGender: 'Pria' | "Wanita" = 'Pria';
    const newData = rmib[currentGender];
</script>
<div class="container-xs">

    {#each newData as data }
    <div class="card my-5 bg-gray-900">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table align-middle text-white">
                    <thead class="text-center fw-bold">
                        <tr>
                            <th>#</th>
                            <th>Minat</th>
                            <th>Ranking</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data as jobType, index }
                            <tr>
                                <td class="text-center">{index + 1}</td>
                                <td>{ jobType }</td>
                                <td>
                                    <input type="number" class="form-control form-control-flush form-control-sm border rounded shadow text-center text-white mb-3" placeholder="Urutan" required/>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    {/each}

</div>