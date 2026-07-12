<script lang="ts">
    import { capitalizeEachWord, rupiahFormatter } from "../../../library/utils/useFormat";

    interface Katalog {
        ID: number;
        NAMA_PRODUK: string;
        KETERANGAN: string;
        KETERSEDIAAN_PRODUK: string;
        GAMBAR: string | null;
        HARGA_JUAL: number;
        HARGA_PCS: number;
    }

    let { katalog }: { katalog: Katalog[] } = $props();
    let katalogDefault: Katalog[] = $state(katalog);

    let searchBar: string = $state('');

    function searchItem(): Katalog[] {
        if (searchBar === '') {
            katalog = katalogDefault;
        } else {
            katalog = katalogDefault.filter((item) => {
                return item.NAMA_PRODUK.toLowerCase().includes(searchBar.toLowerCase());
            });
        }

        return katalog;
    }
</script>
<div class="mb-4">
    <input type="text" bind:value={searchBar} onkeyup={searchItem} class="input input-bordered w-full max-w-sm" placeholder="Cari Produk" />
</div>
<div class="overflow-x-auto">
    <table class="table table-zebra align-middle">
        <thead>
            <tr class="font-bold">
                <th>Nama Produk</th>
                <th class="text-right">Harga Sat.</th>
                <th class="text-right">Harga Pcs</th>
            </tr>
        </thead>
        <tbody>
            {#each katalog as katalog }
                <tr>
                    <td>
                        <span class="font-bold">{katalog.NAMA_PRODUK}</span><br/>
                        <span class="text-base-content/60">{katalog.KETERANGAN}</span>
                    </td>
                    <td class="text-right">{rupiahFormatter.format(katalog.HARGA_JUAL)}</td>
                    <td class="text-right">{rupiahFormatter.format(katalog.HARGA_PCS)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
