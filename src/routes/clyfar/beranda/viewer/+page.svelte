<script lang="ts">
    import Baum from "../../../../library/components/clyfar/test/Baum.svelte";
    import Cfit from "../../../../library/components/clyfar/test/CFIT.svelte";
    import Complete from "../../../../library/components/clyfar/test/Complete.svelte";
    import Kraepelin from "../../../../library/components/clyfar/test/Kraepelin.svelte";
    import Papikostick from "../../../../library/components/clyfar/test/Papikostick.svelte";
    import RMIB from "../../../../library/components/clyfar/test/RMIB.svelte";
    import DISC from "../../../../library/components/clyfar/test/DISC.svelte";
    import Session from "../../../../library/components/clyfar/test/Session.svelte";
    import MBTI from "../../../../library/components/clyfar/test/MBTI.svelte";
    import MSDT from "../../../../library/components/clyfar/test/MSDT.svelte";
    import { previousPage } from "../../../../library/utils/navigates";
    import Modal from "../../../../library/components/partials/Modal.svelte";

    let testType: string = '';
    const tests: string[] = ['DISC','PAPI','KRAEPLIN','BAUM','MBTI','MSDT','CFIT','RMIB','CLEAR'];
    const password: string[] = ['Veritas','Lumos','Reparo','Finite','Sonorus','Stupefy','Fussilini','Felfare','-']

    let isModal: boolean = false;
    
    const openModal = () => {
        isModal = true
    };

    const closeModal = () => {
        isModal = false
    };
</script>
<div class="bg-clyfar min-vh-100">
    <div class="container-fluid">

        <div class="card card-flush shadow-sm bg-white my-5">
            <div class="card-header">
                <h3 class="card-title">Test Viewer</h3>
                <div class="card-toolbar">
                    <button type="button" on:click={previousPage} class="btn btn-sm btn-secondary me-2">Kembali ke Beranda</button>
                    <button type="button" on:click={openModal} class="btn btn-sm btn-primary">Lihat Password</button>
                </div>
            </div>
            <div class="card-body py-5">
                
                <div class="row">
                    <div class="col-4 mt-5">
                        <span class="fw-bold">Pilih Tipe Tes</span>
                    </div>
                    <div class="col-4">
                        <select bind:value={testType} class="form-select" aria-label="Select example">
                            <option value="" selected disabled>Pilih Tipe Tes</option>
                            {#each tests as test }
                                <option value="{test}">{test}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="separator my-5"/>

                {#if testType === 'DISC'}
                    <DISC/>
                {:else if testType === 'PAPI'}
                    <Papikostick/>
                {:else if testType === 'KRAEPLIN'}
                    <Kraepelin/>
                {:else if testType === 'BAUM'}
                    <Baum/>
                {:else if testType === 'MBTI'}
                    <MBTI/>
                {:else if testType === 'MSDT'}
                    <MSDT/>
                {:else if testType === 'CFIT'}
                    <Cfit/>
                {:else if testType === 'RMIB'}
                    <RMIB/>
                {:else if testType === 'CLEAR'}
                    <Complete/>
                {:else}
                    <Session/>
                {/if}


            </div>
        </div>

    </div>
</div>

<!-- Modal -->

{#if isModal}
    <Modal open={isModal} onClose={closeModal}>
        <p class="fw-bolder h5">Daftar Password</p>

        <div class="table-responsive">
            <table class="table align-middle text-center table-striped table-hover">
                <thead>
                    <tr class="fw-bold">
                        <th>#</th>
                        <th>Alat Tes</th>
                        <th>Password</th>
                    </tr>
                </thead>
                <tbody>
                    {#each tests as test, index }
                        <tr>
                            <td>{index + 1}</td>
                            <td>{test}</td>
                            <td>{password[index]}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    </Modal>
{/if}