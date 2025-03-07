<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db, useFetch } from "../../../../library/hooks/db";
    import { Carbon } from "../../../../library/utils/useFormat";
    import { initializeDate } from "../../../../library/utils/useDefault";

    import DatePlaceholder from "../../../shared/DatePlaceholder.svelte";

    interface Staff { 
        ID: number; 
        NAMA: string; 
        NOMINAL: number 
    }

    interface Member {
        ID: number;
        NAMA: string;
        LOKASI: string;
        ALAMAT: string;
        WHATSAPP: string;
        CREATED_AT: string;
    }
    
    let sales: Staff[] = $state([]);

    let newData: Member[] = $state([]);

    type Forms = Record<"sales" | "start" | "end", string>;
    let useForms: Forms = $state({
        sales: '',
        start: initializeDate("first"),
        end: initializeDate("last")
    })

    onMount(async () => {
        sales = await useFetch('UD84/Stocks/Staff');
    });

    async function doPost(): Promise <void> {
        if(useForms.sales === ''){
            toast.error("Silahkan pilih sales.");
            return;
        }

        const { status, message, data }  = await db({
            SALES: useForms.sales,
            START: useForms.start,
            END: useForms.end
        }, 'UD84/Reports/Sales-Member');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
        toast.success(message);
    }
</script>
<div class="container">
    <h3 class="fw-bold mb-7">Analisa Member Online</h3>

    <form onsubmit={doPost}>
        <div class="row mb-6">
            <label for="nominalPengeluaran" class="col-lg-4 col-form-label required fw-bold fs-6">Pilih Sales</label>
            <div class="col-lg-8 fv-row">
                <select bind:value={useForms.sales} class="form-select">
                    <option value="" disabled selected>Pilih Sales</option>
                    {#each sales as sales }
                        <option value={sales.ID}>{sales.NAMA}</option>
                    {/each}
                </select>
            </div>
        </div>
        
        <div class="row mb-6">
            <label for="nominalPengeluaran" class="col-lg-4 col-form-label required fw-bold fs-6">Rentang Tanggal</label>
            <div class="col-lg-8 fv-row">
                <div class="row gap-2">
                    <div class="col">
                        <DatePlaceholder bind:value={useForms.start} />
                    </div>
                    <div class="col">
                        <DatePlaceholder bind:value={useForms.end} />
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-sm btn-primary">Analisa Hasil Kinerja</button>
        </div>
    </form>

    <div class="separator my-10"></div>

    <div class="table-responsive">
        <table class="table table-row-dashed table-row-gray-300 gy-2 table-hover align-middle text-center text-dark">
            <thead>
                <tr class="fw-bold">
                    <th>#</th>
                    <th>Nama</th>
                    <th>Alamat</th>
                    <th>Nomor WhatsApp</th>
                    <th>Dibuat Pada</th>
                </tr>
            </thead>
            <tbody>
                {#each newData as data,index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{ data.NAMA }</td>
                        <td>{ data.ALAMAT }</td>
                        <td>
                            <a href="https://wa.me/62{ data.WHATSAPP }" target="_blank" class="btn btn-sm btn-success" >0{ data.WHATSAPP }</a>
                        </td>
                        <td>{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>