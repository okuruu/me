<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "../../../library/hooks/db";
    import Toggle from "../../shared/Toggle.svelte";
    import Searchbar from "../../shared/Searchbar.svelte";
    import type { Testee } from "../../../interface/Clyfar";
    import DatePlaceholder from "../../shared/DatePlaceholder.svelte";

    let newData: Testee[] = $state([]);

    let imageView: boolean = $state(false);
    let currentPagination: string = $state("10");

    let searchBar: string = $state('');
    let startDate: Date | null = $state(null);
    let endDate: Date | null = $state(null);

    function handleView(event: CustomEvent) {
        imageView = event.detail.message;
    }

    async function view(id: string): Promise<void> {
        const { status, message, data } = await db({ token: id }, 'Clyfar/Check-Testee');
        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }
    }
</script>
<div class="card shadow-sm bg-white my-7">
    <div class="card-body">
        <div class="row">
            <div class="col">
                <div class="row">
                    <div class="col-2">
                        <select bind:value={currentPagination} class="form-select form-select-sm form-select-transparent text-primary bg-light w-75">
                            <option value=10>10</option>
                            <option value=25>25</option>
                            <option value=50>50</option>
                            <option value=100>100</option>
                        </select>
                    </div>
                    <div class="col-8">
                        <div class="row">
                            <div class="col text-end">
                                <Toggle on:changeModes={handleView}></Toggle>
                            </div>
                            <div class="col">
                                <Searchbar bind:value={searchBar} source="employeeTable"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-5">
                <div class="row gap-2">
                    <div class="col">
                        <DatePlaceholder bind:value={startDate} customClass="form-control form-control-sm form-control-flush bg-light text-muted" placeholder="Pilih Waktu Mulai"/>
                    </div>
                    <div class="col">
                        <DatePlaceholder bind:value={endDate} customClass="form-control form-control-sm form-control-flush bg-light text-muted" placeholder="Pilih Waktu Akhir"/>
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-sm btn-gradient text-white">Cari</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="separator my-5"></div>

        <div class="table-responsive">
            <table class="table align-middle table-striped table-hover">
                <thead>
                    <tr class="fw-bolder">
                        <th>#</th>
                        <th>Token</th>
                        <th>Jenis Tes</th>
                        <th>Nama</th>
                        <th>Jenis Kelamin</th>
                        <th>Tanggal Lahir / Usia</th>
                        <th>WhatsApp</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#if newData.length === 0}
                        <tr>
                            <td colspan="8" class="text-center">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each newData as data, index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>{data.TOKEN}</td>
                                <td>{data.LIST === null ? '-' : JSON.parse(data.LIST).join(", ")}</td>
                                <td>{data.NAMA ?? '-'}</td>
                                <td>
                                    {#if data.GENDER === "Pria"}
                                        <span class="badge badge-primary">{data.GENDER}</span>
                                    {:else if data.GENDER === "Wanita"}
                                        <span class="badge badge-info">{data.GENDER}</span>
                                    {:else}
                                        -
                                    {/if}
                                </td>
                                <td>{data.TTL ?? '-'}</td>
                                <td>{data.WHATSAPP ?? '-'}</td>
                                <td>
                                    <button type="button" onclick={() => view(data.TOKEN)} class="btn btn-sm btn-primary">Lihat</button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

    </div>
</div>