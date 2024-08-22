<script lang="ts">
    import { goto } from '$app/navigation';
    import { logOut } from '../../../library/utils/auth';
    import toast, { Toaster } from 'svelte-french-toast';
    import { callRequest, db } from '../../../library/utils/db';
    import { estimateAge } from '../../../library/utils/formatTime';
    import type { Testee } from '../../../library/interface/Clyfar.js';
    import Modal from '../../../library/components/partials/Modal.svelte';

    export let data;

    let key:string;
    let searchBar: string = '';
    let searchBarController:HTMLElement;

    let newData: Testee[] = data.testee ?? [];
    let newDataDefault: Testee[] = data.testee ?? [];

    let userAmount: number = 1;
    let userGender: "Pria" | "Wanita" = "Pria";

    let enableMSDT: boolean;
    let enableCFIT: boolean;
    let enableMBTI: boolean;
    let enableBAUM: boolean;
    let enableDISC: boolean;
    let enableRMIB: boolean;
    let enableKraeplin: boolean;
    let enablePapikostick: boolean;

    let isModal: boolean = false;
    let isDisabled: boolean = false;

    const openModal = () => {
        isModal = true
    };

    const closeModal = () => {
        isModal = false
    };

    function filterData(searchTerm: string): void {
        const term = searchTerm.toLowerCase();
        newData = newDataDefault.filter(item => {
            return (
                item.TOKEN.toLowerCase().includes(term) ||
                (item.NAMA && item.NAMA.toLowerCase().includes(term)) ||
                (item.WHATSAPP && item.WHATSAPP.toLowerCase().includes(term))
            );
        });
    }

    async function view(id: string): Promise<void> {
        const { status, message, data } = await db({ token: id }, 'Clyfar/Check-Testee');

        if (status === 'success') {
            return goto(`/clyfar/beranda/${data}`);
        }

        toast.error(message);
    }

    async function createCandidate(): Promise <void> {
        isDisabled = true;

        const { status, message } = await db({
            amount: userAmount,
            gender : userGender,
            MSDT : enableMSDT,
            CFIT : enableCFIT,
            MBTI : enableMBTI,
            KRAEPLIN : enableKraeplin,
            BAUM : enableBAUM,
            DISC : enableDISC,
            PAPI : enablePapikostick,
            RMIB : enableRMIB
        }, 'Clyfar/Create-Token');

        if (status === 'success') {
            newData = await callRequest('Clyfar/Dashboard');
            newDataDefault = newData;
            userAmount = 1;
            userGender = "Pria";
            enableMSDT = false;
            enableCFIT = false;
            enableMBTI = false;
            enableKraeplin = false;
            enableBAUM = false;
            enableDISC = false;
            enablePapikostick = false;
            toast.success(message);
            closeModal();
            isDisabled = false;
            return;
        }

        isDisabled = false;
        toast.error(message);
    }

    function keyPrompt(eventPressed:any){
        key = eventPressed.key;
        if (key == 'Escape'){
            searchBar = '';
            searchBarController.focus();
        }
    }
</script>
<Toaster />
<div class="bg-clyfar {newData.length > 5 ? 'min-vh-100' : 'min-vh-100'}">
    <div class="container-fluid">
        <div class="card shadow-sm bg-white my-10">
            <div class="card-header">
                <h3 class="card-title fw-bold">Dashboard Utama</h3>
                <div class="card-toolbar">
                    <div class="me-2">
                        <a href="/clyfar/beranda/viewer" class="btn btn-sm btn-info">Lihat Soal</a>
                        <button type="button" class="btn btn-sm btn-primary" on:click={openModal}>
                            <img src="/icons/elements/Human.svg" alt="Person Icon" class="me-2"/> Buat User
                        </button>
                        <button type="button" on:click={logOut} class="btn btn-sm btn-danger">
                            <img src="/icons/elements/Log-Out.svg" alt="Log Out Icon" class=" h-20px me-2"/>
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-end">
                    <div class="form-group">
                        <input type="text" bind:this={searchBarController} bind:value={searchBar} on:keyup={() => filterData(searchBar)} class="form-control form-control-sm" placeholder="[ESC] Pencarian..." />
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle text-center mt-5">
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
                            {#each newData as data, index}
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
                                    <td>{estimateAge(data.TTL) ?? '-'}</td>
                                    <td>{data.WHATSAPP ?? '-'}</td>
                                    <td>
                                        <button type="button" on:click={() => view(data.TOKEN)} class="btn btn-sm btn-primary">Lihat</button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{#if isModal}
    <Modal open={isModal} onClose={closeModal}>
        <p class="fw-bolder h5">Buat User</p>

        <div class="separator mb-5"/>

        <form on:submit|preventDefault={createCandidate}>
            <div class="form-group mb-5">
                <label for="setTotal" class="form-label fw-bold">Jumlah Kandidat</label>
                <input type="number" bind:value={userAmount} class="form-control form-control-sm" placeholder="0" min="1" required/>
            </div>
            <div class="form-group">
                <label for="setGender" class="form-label fw-bold">Jenis Kelamin Testee</label>
                <select bind:value={userGender} class="form-select form-select-sm" required>
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                </select>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered align-middle mt-5">
                    <thead>
                        <tr class="fw-bold">
                            <th>Psikotes</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>MSDT</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableMSDT} class="form-check-input form-check-input-sm me-2" value="MSDT" />
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>CFIT</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableCFIT} class="form-check-input form-check-input-sm me-2" />
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>MBTI</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableMBTI} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Kraeplin</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableKraeplin} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Baum</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableBAUM} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>DISC</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableDISC} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Papikostick</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enablePapikostick} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>RMIB</td>
                            <td>
                                <div class="form-check form-check-custom form-check-solid form-check-sm">
                                    <input type="checkbox" bind:checked={enableRMIB} class="form-check-input form-check-input-sm me-2"/>
                                    Active
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button type="submit" disabled={isDisabled} class="btn btn-sm btn-success w-100 mt-5">
                {#if isDisabled}
                    Loading...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                {:else}
                    Submit
                {/if}
            </button>
        </form>

    </Modal>
{/if}

<svelte:window on:keydown={keyPrompt} />