<script lang="ts">
    let name: string;
    let whatsapp: number;
    let birthDate: Date;
    let gender: "Pria" | "Wanita" = "Pria"; 
    let isAgree: boolean = false;
</script>
<div class="container-xs">

    <div class="form-group">
        <label for="nama" class="form-label fw-bold text-white">Silahkan masukkan nama lengkap Anda.</label>
        <input type="text" bind:value={name} class="form-control form-control-sm form-control-flush border rounded w-75" placeholder="Type here" />
    </div>

    <div class="form-group my-5">
        <label for="whatsapp" class="form-label fw-bold text-white">Harap masukkan nomor WhatsApp Anda.</label>
        <input type="number" min="0" bind:value={whatsapp} class="form-control form-control-sm form-control-flush border rounded w-75" placeholder="089-" />
    </div>

    <div class="form-group my-5">
        <label for="ttl" class="form-label fw-bold text-white">Silahkan masukkan tanggal lahir Anda.</label>
        <input type="date" min="0" bind:value={birthDate} class="form-control form-control-sm form-control-flush text-white border rounded w-75" />
    </div>

    <div class="form-group my-5">
        <label for="gender" class="form-label fw-semibold text-white">Harap masukkan jenis kelamin Anda.</label>
        <div class="form-check form-check-custom form-check-solid my-2">
            <input class="form-check-input" type="radio" bind:group={gender} value="pria" id="genderMale"/>
            <label class="form-check-label text-white" for="genderMale">
                Pria
            </label>
        </div>
        <div class="form-check form-check-custom form-check-solid">
            <input class="form-check-input" type="radio" bind:group={gender} value="Wanita" id="genderFemale"/>
            <label class="form-check-label text-white" for="genderFemale">
                Wanita
            </label>
        </div>
    </div>

</div>