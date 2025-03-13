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
<input type="text" bind:value={searchBar} onkeyup={searchItem} class="form-control mb-3" placeholder="Cari Produk" />
<div class="table-responsive">
    <table class="table align-middle">
        <thead>
            <tr class="fw-bolder">
                <th>Nama Produk</th>
                <th class="text-end">Harga Sat.</th>
                <th class="text-end">Harga Pcs</th>
            </tr>
        </thead>
        <tbody>
            {#each katalog as katalog }
                <tr>
                    <td>
                        <span class="fw-bold">{katalog.NAMA_PRODUK}</span><br/>
                        <span class="text-muted">{katalog.KETERANGAN}</span>
                    </td>
                    <td class="text-end">{rupiahFormatter.format(katalog.HARGA_JUAL)}</td>
                    <td class="text-end">{rupiahFormatter.format(katalog.HARGA_PCS)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>