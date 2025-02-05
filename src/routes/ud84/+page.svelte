<script lang="ts">
    import { capitalizeEachWord } from '../../library/utils/useFormat';

    let { data } = $props();
</script>
<div class="bg-dark">
    <div class="container-xs">
        <table class="table text-white">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Produk</th>
                    <th>Keterangan</th>
                    <th>Ketersediaan</th>
                </tr>
            </thead>
            <tbody>
                {#each data.katalog as katalog, index }
                    <tr>
                        <td>{ index + 1 }</td>
                        <td>{capitalizeEachWord(katalog.NAMA_PRODUK)}</td>
                        <td>{katalog.KETERANGAN}</td>
                        <td>{katalog.KETERSEDIAAN_PRODUK}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>