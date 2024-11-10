<script lang="ts">
    import { onMount } from 'svelte';
    import type { DISC } from '../../../interface/Clyfar';
    import { previousPage } from '../../../utils/navigates';
    import { Chart, registerables, type ChartConfiguration } from 'chart.js';
    
    interface Props {
        disc: DISC;
    }

    let { disc }: Props = $props();

    let chartMost: Chart;
    let chartLeast: Chart;
    let chartChange: Chart;
    Chart.register(...registerables);

    onMount(() => {
        const ctxMost = document.getElementById('discMost') as HTMLCanvasElement;
        const ctxLeast = document.getElementById('discLeast') as HTMLCanvasElement;
        const ctxChange = document.getElementById('discChange') as HTMLCanvasElement;

        const baseDataset = (label: string, data: number[]) => ({
            label,
            data,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
        });

        const limitDataset = {
            label: 'Limit',
            data: [20, 20, 20, 20],
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            borderColor: "rgba(0, 0, 255, 0.5)",
            borderWidth: 1,
        };

        const createConfig = (label: string, data: number[]): ChartConfiguration => ({
            type: 'line',
            data: {
                labels: ['D', 'I', 'S', 'C'],
                datasets: [baseDataset(label, data), limitDataset]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // @ts-ignore
        chartMost = new Chart(ctxMost, createConfig('Grafik Mask', [disc.Most.D, disc.Most.I, disc.Most.S, disc.Most.C]));
        // @ts-ignore
        chartLeast = new Chart(ctxLeast, createConfig('Grafik Core', [disc.Least.D, disc.Least.I, disc.Least.S, disc.Least.C]));
        // @ts-ignore
        chartChange = new Chart(ctxChange, createConfig('Grafik Mirror', [disc.Change.D, disc.Change.I, disc.Change.S, disc.Change.C]));
    });
</script>

<div class="card shadow-sm my-3 bg-white">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi DISC</h3>
        <div class="card-toolbar">
            <button type="button" onclick={previousPage} class="btn btn-sm btn-light">Kembali</button>
        </div>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-4"><canvas id="discMost" width="30" height="50"></canvas></div>
            <div class="col-4"><canvas id="discLeast" width="30" height="50"></canvas></div>
            <div class="col-4"><canvas id="discChange" width="30" height="50"></canvas></div>
        </div>
    </div>
</div>
