<script lang="ts">
    import { goto } from '$app/navigation';
    import { userConfig } from '../../../library/strings';
    import { logOut } from '../../../library/utils/auth';
    import { db } from '../../../library/utils/db';
    import toast, { Toaster } from 'svelte-french-toast';

    let name: string;
    let whatsapp: number;
    let birthDate: Date;
    let gender: "Pria" | "Wanita" = "Pria"; 

    async function doPost(): Promise <void> {
        try {
            const { status, message , data } = await db({
                name : name,
                whatsapp : "0" + whatsapp.toString(),
                birthDate : birthDate,
                gender : gender,
                isAgree : true,
                localPIN : localStorage.getItem('localPIN') ?? null
            },'Clyfar/Register-Account');

            if(status === 'success'){
                localStorage.setItem('user', JSON.stringify({
                    name: name,
                    whatsapp: "0" + whatsapp.toString(),
                    birthDate: birthDate,
                    gender: gender,
                    setTest : data.setTest,
                }));
                $userConfig.testPosition = data.currentTest;
                return goto('/clyfar/test');
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error('Token tidak sesuai!');
        }
    }
</script>
<Toaster/>
<div class="bg-clyfar vh-100 wh-100">
    <div class="container-xs">

        <div class="card bg-white shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-end mb-5">
                    <button type="button" on:click={logOut} class="btn btn-sm btn-dark">
                        <img src="/icons/elements/Log-Out.svg" alt="Log Out Icon" class=" h-20px me-2"/>
                        Keluar
                    </button>
                </div>
                <form on:submit|preventDefault={doPost}>
                    <div class="form-group mb-12">
                        <h1 class="display-4 text-primary">Clyfar - </h1>
                        <h1 class="">Biodata</h1>
                    </div>
                    <div class="form-group">
                        <label for="nama" class="form-label fw-bold ">Silahkan masukkan nama lengkap Anda.</label>
                        <input type="text" bind:value={name} class="form-control form-control-sm w-75" placeholder="Type here" required/>
                    </div>
                
                    <div class="form-group my-5">
                        <label for="whatsapp" class="form-label fw-bold ">Harap masukkan nomor <span class="text-success">WhatsApp</span> Anda.</label>
                        <input type="number" min="0" bind:value={whatsapp} class="form-control form-control-sm w-75" placeholder="089-" required/>
                    </div>
                
                    <div class="form-group my-5">
                        <label for="ttl" class="form-label fw-bold ">Silahkan masukkan tanggal lahir Anda.</label>
                        <input type="date" min="0" bind:value={birthDate} class="form-control form-control-sm w-75" required/>
                    </div>
                
                    <div class="form-group my-5">
                        <label for="gender" class="form-label fw-semibold ">Harap masukkan jenis kelamin Anda.</label>
                        <div class="form-check form-check-custom form-check-solid my-2">
                            <input class="form-check-input" type="radio" bind:group={gender} value="Pria" id="genderMale" checked required/>
                            <label class="form-check-label " for="genderMale">
                                Pria
                            </label>
                        </div>
                        <div class="form-check form-check-custom form-check-solid">
                            <input class="form-check-input" type="radio" bind:group={gender} value="Wanita" id="genderFemale" required/>
                            <label class="form-check-label " for="genderFemale">
                                Wanita
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-sm btn-primary w-50">Selanjutnya</button>
                </form>
            </div>
        </div>


    </div>
</div>