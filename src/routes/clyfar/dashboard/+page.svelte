<script lang="ts">
    const timeGreeter: string = getTimeOfDay();
    let isAgree: boolean = false;

    function getTimeOfDay(): string {
        const currentHour = new Date().getHours();

        if (currentHour >= 5 && currentHour < 12) {
            return 'Pagi';
        } else if (currentHour >= 12 && currentHour < 18) {
            return 'Siang';
        } else {
            return 'Malam';
        }
    }

</script>
<div class="container mx-auto p-2">

    <div class="card w-full bg-base-100 shadow-xl">
        <figure class="px-10 pt-10">
            <img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" class="rounded-xl" />
        </figure>
        <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl">{'Selamat ' + timeGreeter}! 👋</h2>
            <p class="my-5">
                Dengan menekan tombol <span class="font-bold">Selanjutnya</span>, Anda telah menyetujui 
                <span class="underline decoration-pink-500 font-bold">Syarat & Ketentuan</span>.
            </p>
            <div class="card-actions">
                <button type="button" on:click={() => isAgree = true} class="btn btn-neutral">Selanjutnya</button>
            </div>
        </div>
    </div>

    {#if isAgree}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                <label class="input input-bordered flex items-center gap-2">
                    <span class="font-semibold">Nama : </span>
                    <input type="text" class="grow" />
                </label>
            </div>
        </div>

        <div class="card w-full bg-base shadow-xl my-5">
            <div class="card-body">
                <label class="input input-bordered flex items-center gap-2">
                    <span class="font-semibold">WhatsApp : </span>
                    <input type="text" class="grow" />
                </label>
            </div>
        </div>

        <div class="card w-full bg-base shadow-xl my-5">
            <div class="card-body">
                <label class="input input-bordered flex items-center gap-2">
                    <span class="font-semibold">Tanggal Lahir : </span>
                    <input type="date" class="grow" />
                </label>
            </div>
        </div>

        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                <div class="label label-text font-semibold">Jenis Kelamin Anda</div>
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Pria</span> 
                        <input type="radio" name="radio-10" class="radio checked:bg-blue-500" checked />
                    </label>
                </div>
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Wanita</span> 
                        <input type="radio" name="radio-10" class="radio checked:bg-red-500" checked />
                    </label>
                </div>
            </div>
        </div>

        <button type="button" class="btn w-full btn-neutral my-2">Selanjutnya</button>
    {/if}

</div>