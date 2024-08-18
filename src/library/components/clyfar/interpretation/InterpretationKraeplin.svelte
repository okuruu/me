<script lang="ts">
    import { onMount } from 'svelte';
    import { previousPage } from '../../../utils/navigates';
    import { Chart, registerables, type ChartConfiguration } from 'chart.js';

    export let kraeplin;

    let chart: Chart;
    Chart.register(...registerables);

    onMount(async () => {
        const ctx = document.getElementById('charts') as HTMLCanvasElement;

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50'], // These are the labels
                datasets: [{
                    label: 'Hanker',
                    data: kraeplin.GRAPH,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        chart = new Chart(ctx, config);
    });
</script>
<div class="card shadow-sm bg-white my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi Kraeplin</h3>
        <div class="card-toolbar">
            <button type="button" on:click={previousPage} class="btn btn-sm btn-light">Kembali</button>
        </div>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            
            <table class="table table-striped align-middle text-center my-2">
                <thead>
                    <tr class="fw-bold">
                        <th>Kriteria</th>
                        <th>Keterangan</th>
                        <th>Nilai</th>
                        <th>Fase 1</th>
                        <th>Fase 2</th>
                        <th>Fase 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="badge badge-primary">Panker</span></td>
                        <td>Kecepatan Kerja</td>
                        <td>{kraeplin.PANKER.NILAI}</td>
                        <td>{kraeplin.PANKER.FASE_1}</td>
                        <td>{kraeplin.PANKER.FASE_2}</td>
                        <td>{kraeplin.PANKER.FASE_3}</td>
                    </tr>
                    <tr>
                        <td><span class="badge badge-success">Tinker</span></td>
                        <td>Ketelitian Kerja</td>
                        <td>{kraeplin.TINKER.NILAI} %</td>
                        <td>{kraeplin.TINKER.FASE_1} %</td>
                        <td>{kraeplin.TINKER.FASE_2} %</td>
                        <td>{kraeplin.TINKER.FASE_3} %</td>
                    </tr>
                    <tr>
                        <td><span class="badge badge-info">Janker</span></td>
                        <td>Stabilitas Kerja</td>
                        <td>{kraeplin.JANKER.NILAI}</td>
                        <td>{kraeplin.JANKER.FASE_1}</td>
                        <td>{kraeplin.JANKER.FASE_2}</td>
                        <td>{kraeplin.JANKER.FASE_3}</td>
                    </tr>
                </tbody>
            </table>

            <table class="table table-striped align-middle text-center my-2">
                <thead>
                    <tr class="fw-bold">
                        <th>Mean</th>
                        <th>Range</th>
                        <th>Av. Deviation</th>
                        <th>Sum of Error</th>
                        <th>Sum of Skipped</th>
                        <th>Sum of Right</th>
                        <th>Sum of Answer (X)</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Sum of Test</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{kraeplin.MEAN}</td>
                        <td>{kraeplin.RANGE}</td>
                        <td>{kraeplin.AV_DEVIATION}</td>
                        <td>{kraeplin.SUM_OF_ERROR}</td>
                        <td>{kraeplin.SUM_OF_SKIPPED}</td>
                        <td>{kraeplin.SUM_OF_RIGHT}</td>
                        <td>{kraeplin.SUM_OF_ANSWER}</td>
                        <td><span class="badge badge-danger">{kraeplin.MIN}</span></td>
                        <td><span class="badge badge-primary">{kraeplin.MAX}</span></td>
                        <td>{kraeplin.SUM_OF_TEST}</td>
                    </tr>
                </tbody>
            </table>

        </div>
        <canvas id="charts" width="400" height="100"></canvas>
    </div>
</div>