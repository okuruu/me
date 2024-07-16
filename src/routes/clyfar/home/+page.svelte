<script lang="ts">
    import { goto } from '$app/navigation';
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
                    currentTest : data.currentTest
                }));
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
<div class="container-xs">

    <form on:submit|preventDefault={doPost}>

        <div class="form-group mb-12">
            <h1 class="text-white display-4">Clyfar - </h1>
            <h1 class="text-white">Biodata</h1>
        </div>
    
        <div class="form-group">
            <label for="nama" class="form-label fw-bold text-white">Silahkan masukkan nama lengkap Anda.</label>
            <input type="text" bind:value={name} class="form-control form-control-sm form-control-flush border rounded w-75" placeholder="Type here" required/>
        </div>
    
        <div class="form-group my-5">
            <label for="whatsapp" class="form-label fw-bold text-white">Harap masukkan nomor <span class="text-success">WhatsApp</span> Anda.</label>
            <input type="number" min="0" bind:value={whatsapp} class="form-control form-control-sm form-control-flush border rounded w-75" placeholder="089-" required/>
        </div>
    
        <div class="form-group my-5">
            <label for="ttl" class="form-label fw-bold text-white">Silahkan masukkan tanggal lahir Anda.</label>
            <input type="date" min="0" bind:value={birthDate} class="form-control form-control-sm form-control-flush text-white border rounded w-75" required/>
        </div>
    
        <div class="form-group my-5">
            <label for="gender" class="form-label fw-semibold text-white">Harap masukkan jenis kelamin Anda.</label>
            <div class="form-check form-check-custom form-check-solid my-2">
                <input class="form-check-input" type="radio" bind:group={gender} value="Pria" id="genderMale" checked required/>
                <label class="form-check-label text-white" for="genderMale">
                    Pria
                </label>
            </div>
            <div class="form-check form-check-custom form-check-solid">
                <input class="form-check-input" type="radio" bind:group={gender} value="Wanita" id="genderFemale" required/>
                <label class="form-check-label text-white" for="genderFemale">
                    Wanita
                </label>
            </div>
        </div>
    
        <button type="submit" class="btn btn-sm btn-light w-50 text-center text-dark">Selanjutnya</button>
    </form>

</div>