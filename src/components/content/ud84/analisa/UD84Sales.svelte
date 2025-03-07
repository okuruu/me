<script lang="ts">
    import { onMount } from "svelte";
    import { db, useFetch } from "../../../../library/hooks/db";
    import DatePlaceholder from "../../../shared/DatePlaceholder.svelte";
    import { initializeDate } from "../../../../library/utils/useDefault";
    import { toast } from "svelte-sonner";
    import { capitalizeEachWord, Carbon, rupiahFormatter } from "../../../../library/utils/useFormat";

    interface Sales {
        NAMA: string;
        DISTRIBUTOR: string;
        JUMLAH: number;
        HARGA_PER_ITEM: number;
        TOTAL: number;
        CREATED_AT: string;
        SALES: number;
    }

    interface Staff { 
        ID: number; 
        NAMA: string; 
        NOMINAL: number 
    }

    let newData: Sales[] = $state([]);
    let sales: Staff[] = $state([]);

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
        }, 'UD84/Reports/Sales');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
        toast.success(message);
    }

    function getSum(id: "Total Item" | "Total Transaksi"): number {
        if (id === "Total Item") {
            const sum: number = newData.reduce((accumulator, item) => accumulator + item.JUMLAH, 0);
            return sum;
        }
        const sum: number = newData.reduce((accumulator, item) => accumulator + item.TOTAL, 0);
        return sum;
    }
</script>
<div class="container">
    <h3 class="fw-bold mb-7">Analisa Hasil Kerja Sales</h3>
    
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
        <table class="table align-middle table-hover table-striped">
            <thead>
                <tr class="fw-bold">
                    <th>#</th>
                    <th>Nama</th>
                    <th>Distributor</th>
                    <th>Jumlah</th>
                    <th>Harga Per Pcs</th>
                    <th>Total</th>
                    <th>Tanggal Transaksi</th>
                </tr>
            </thead>
            <tbody>
                {#if newData.length === 0}
                    <tr>
                        <td colspan="7" class="text-center">Tidak ada data.</td>
                    </tr>
                {:else}
                    {#each newData as data, index }
                        <tr>
                            <td>{index + 1}</td>
                            <td>{data.NAMA}</td>
                            <td>{data.DISTRIBUTOR}</td>
                            <td>{data.JUMLAH}</td>
                            <td>{rupiahFormatter.format(data.HARGA_PER_ITEM)}</td>
                            <td>{rupiahFormatter.format(data.TOTAL)}</td>
                            <td>{Carbon(data.CREATED_AT, "date-short-with-time")}</td>
                        </tr>
                    {/each}
                    <tr>
                        <td colspan="6" class="text-end">Total Item</td>
                        <td class="fw-bolder">{`${getSum("Total Item")} Pcs`}</td>
                    </tr>
                    <tr>
                        <td colspan="6" class="text-end">Total Transaksi</td>
                        <td class="fw-bolder">{rupiahFormatter.format(getSum("Total Transaksi"))}</td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>