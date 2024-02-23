<script lang="ts">
    import { setDISC } from "$lib/strings/psychologicalTest";
</script>
<div class="container">
    {#each setDISC as question, index}
        <div class="card shadow-rn my-7">
            <div class="card-body">

                <table class="table text-center">
                    <thead>
                        <tr>
                        <th scope="col">M</th>
                        <th scope="col"></th>
                        <th scope="col">L</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>                                
                                <input class="form-check-input" type="radio" name="M{index}" value="1">
                            </td>
                            <td>{question.LV_1}</td>
                            <td>
                                <input class="form-check-input" type="radio" name="L{index}" value="1">
                            </td>
                        </tr>
                        <tr>
                            <td>                                
                                <input class="form-check-input" type="radio" name="M{index}" value="2">
                            </td>
                            <td>{question.LV_2}</td>
                            <td>
                                <input class="form-check-input" type="radio" name="L{index}" value="2">
                            </td>
                        </tr>
                        <tr>
                            <td>                                
                                <input class="form-check-input" type="radio" name="M{index}" value="3">
                            </td>
                            <td>{question.LV_3}</td>
                            <td>
                                <input class="form-check-input" type="radio" name="L{index}" value="3">
                            </td>
                        </tr>
                        <tr>
                            <td>                                
                                <input class="form-check-input" type="radio" name="M{index}" value="4">
                            </td>
                            <td>{question.LV_4}</td>
                            <td>
                                <input class="form-check-input" type="radio" name="L{index}" value="4">
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    {/each}
</div>