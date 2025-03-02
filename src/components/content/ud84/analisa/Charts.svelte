<script lang="ts">
	import { onMount } from "svelte";
	import { useFetch } from "../../../../library/hooks/db";
	import { rupiahFormatter } from "../../../../library/utils/useFormat";

    interface Charts {
        "BULAN": string;
        "OMSET": number;
        "OPERASIONAL": number;
        "BERSIH": number;
    }

    let bulanSekarang: string    = $state('');
    let omsetBulan: number       = $state(0);
    let operasionalBulan: number = $state(0);
    let bersihBulan: number      = $state(0);

    onMount(async () => {
        const doResponse: Charts = await useFetch("UD84/Charts");
        bulanSekarang       = doResponse.BULAN;
        omsetBulan          = Number(doResponse.OMSET);
        operasionalBulan    = doResponse.OPERASIONAL;
        bersihBulan         = doResponse.BERSIH;
    });

</script>
<div class="row">
    <div class="col">

        <div class="card bg-success hoverable card-xl-stretch mb-5 mb-xl-8">
            <div class="card-body">
                <span class="svg-icon svg-icon-white svg-icon-3x ms-n1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M10.9607 12.9128H18.8607C19.4607 12.9128 19.9607 13.4128 19.8607 14.0128C19.2607 19.0128 14.4607 22.7128 9.26068 21.7128C5.66068 21.0128 2.86071 18.2128 2.16071 14.6128C1.16071 9.31284 4.96069 4.61281 9.86069 4.01281C10.4607 3.91281 10.9607 4.41281 10.9607 5.01281V12.9128Z" fill="currentColor" />
                        <path d="M12.9607 10.9128V3.01281C12.9607 2.41281 13.4607 1.91281 14.0607 2.01281C16.0607 2.21281 17.8607 3.11284 19.2607 4.61284C20.6607 6.01284 21.5607 7.91285 21.8607 9.81285C21.9607 10.4129 21.4607 10.9128 20.8607 10.9128H12.9607Z" fill="currentColor" />
                    </svg>
                </span>
                <div class="text-white fw-bold fs-2 mb-2 mt-5">{ rupiahFormatter.format(omsetBulan) }</div>
                <div class="fw-semibold text-white">Omset Bulan: {bulanSekarang}</div>
            </div>
        </div>

    </div>
    <div class="col">

        <div class="card bg-dark hoverable card-xl-stretch mb-5 mb-xl-8">
            <div class="card-body">
                <span class="svg-icon svg-icon-white svg-icon-3x ms-n1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M14 12V21H10V12C10 11.4 10.4 11 11 11H13C13.6 11 14 11.4 14 12ZM7 2H5C4.4 2 4 2.4 4 3V21H8V3C8 2.4 7.6 2 7 2Z" fill="currentColor" />
                        <path d="M21 20H20V16C20 15.4 19.6 15 19 15H17C16.4 15 16 15.4 16 16V20H3C2.4 20 2 20.4 2 21C2 21.6 2.4 22 3 22H21C21.6 22 22 21.6 22 21C22 20.4 21.6 20 21 20Z" fill="currentColor" />
                    </svg>
                </span>
                <div class="text-white fw-bold fs-2 mb-2 mt-5">{ rupiahFormatter.format(operasionalBulan) }</div>
                <div class="fw-semibold text-white">Biaya Operasional: { bulanSekarang }</div>
            </div>
        </div>

    </div>
    <div class="col">

        <div class="card bg-primary hoverable card-xl-stretch mb-xl-8">
            <div class="card-body">
                <span class="svg-icon svg-icon-white svg-icon-3x ms-n1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10H13V11C13 11.6 12.6 12 12 12C11.4 12 11 11.6 11 11V10H3C2.4 10 2 10.4 2 11V13H22V11C22 10.4 21.6 10 21 10Z" fill="currentColor" />
                        <path opacity="0.3" d="M12 12C11.4 12 11 11.6 11 11V3C11 2.4 11.4 2 12 2C12.6 2 13 2.4 13 3V11C13 11.6 12.6 12 12 12Z" fill="currentColor" />
                        <path opacity="0.3" d="M18.1 21H5.9C5.4 21 4.9 20.6 4.8 20.1L3 13H21L19.2 20.1C19.1 20.6 18.6 21 18.1 21ZM13 18V15C13 14.4 12.6 14 12 14C11.4 14 11 14.4 11 15V18C11 18.6 11.4 19 12 19C12.6 19 13 18.6 13 18ZM17 18V15C17 14.4 16.6 14 16 14C15.4 14 15 14.4 15 15V18C15 18.6 15.4 19 16 19C16.6 19 17 18.6 17 18ZM9 18V15C9 14.4 8.6 14 8 14C7.4 14 7 14.4 7 15V18C7 18.6 7.4 19 8 19C8.6 19 9 18.6 9 18Z" fill="currentColor" />
                    </svg>
                </span>
                <div class="text-white fw-bold fs-2 mb-2 mt-5">{ rupiahFormatter.format(bersihBulan) }</div>
                <div class="fw-semibold text-white">Keuntungan Bersih: {bulanSekarang}</div>
            </div>
        </div>

    </div>
</div>