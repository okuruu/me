<script lang="ts">
    import Toggle from "../../shared/Toggle.svelte";
    import Candidates from "./view/Candidates.svelte";
    import Searchbar from "../../shared/Searchbar.svelte";
    import DatePlaceholder from "../../shared/DatePlaceholder.svelte";

    let imageView: boolean = $state(false);
    let currentPagination: string = $state("10");

    let searchBar: string = $state('');
    let startDate: Date | null = $state(null);
    let endDate: Date | null = $state(null);

    function handleView(event: CustomEvent) {
        imageView = event.detail.message;
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

        <Candidates/>

    </div>
</div>