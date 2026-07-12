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
<div>
    <h3 class="mb-6 text-lg font-bold">Analisa Member Online</h3>

    <form onsubmit={doPost} class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="pilihSales" class="label-text mb-1 block font-medium">Pilih Sales</label>
                <select bind:value={useForms.sales} class="select select-bordered w-full">
                    <option value="" disabled selected>Pilih Sales</option>
                    {#each sales as sales }
                        <option value={sales.ID}>{sales.NAMA}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="rentangTanggal" class="label-text mb-1 block font-medium">Rentang Tanggal</label>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <DatePlaceholder bind:value={useForms.start} />
                    <DatePlaceholder bind:value={useForms.end} />
                </div>
            </div>
        </div>
        <div class="flex justify-end">
            <button type="submit" class="btn btn-sm btn-primary">Analisa Hasil Kinerja</button>
        </div>
    </form>

    <div class="divider my-8"></div>

    <div class="overflow-x-auto">
        <table class="table table-zebra align-middle text-center">
            <thead>
                <tr class="font-bold">
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
