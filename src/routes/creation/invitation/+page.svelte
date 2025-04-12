<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
    import { scrollAnimate } from '../../../library/utils/useAnimation';

    interface Comment {
        name: string;
        attend: boolean;
        message: string;
    }

    interface DB {
        "ID": number;
        "FOR": string;
        "NAMA": string;
        "ATTEND": string;
        "COMMENTS": string;
        "CREATED_AT": string;
    }
    
    let isOpened: boolean = $state(true);
    let isLoading: boolean = $state(false);

    const url: string = 'https://fae.deabakery.co.id/api/Wedding/';

    type Form = Record<"nama" | "kehadiran" | "ucapan", string>;
    let useForm: Form = $state({
        nama: '',
        kehadiran: '',
        ucapan: ''
    });

    let comments: Comment[] = $state([]);
    let invitationTo: string = $state('');

    let time: Date = $state(new Date());

    function useCountdown(id: string): string {
        const eventDate: Date = new Date(id);
        const diff: number = eventDate.getTime() - time.getTime();

        if (diff <= 0) {
            return '00:00:00';
        }

        const days: number = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours: number = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes: number = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds: number = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
    }

    onMount(() => {
        initializePage();

        $effect(() => {
            const interval = setInterval(() => {
                time = new Date(); // Reassign to trigger reactivity
            }, 1000);

            return () => {
                clearInterval(interval); // Cleanup on component unmount
            };
        });
    });

    async function initializePage(): Promise <void> {
        getComments();
        const urlParams: string = page.url.searchParams.get('to') ?? '';

        if (urlParams) {
            invitationTo = urlParams;
            useForm.nama = urlParams;
        }
    }

    async function openInvitation(): Promise <void> {
        document.getElementById('cover')?.classList.toggle('hideOpening');
        isOpened = true;
        document.getElementById('cover')?.classList.remove('coverImage');
    }

    function playAudio(): void {
        const audio: HTMLAudioElement = document.getElementById('useAudio') as HTMLAudioElement;

        if (!audio) {
            console.log("Audio element not found!");
            return;
        }

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }

    async function getComments(): Promise <void> {
        const doGet = await fetch(`${url}Get-Comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                by: 'Indras'
            })
        });

        const { status, message, data } = await doGet.json();

        if ( status === "error" ) {
            console.log(message);
            return;
        }

        comments = data.map((comment: DB) => ({
            name: comment.NAMA,
            attend: Number(comment.ATTEND) === 1 ? true : false,
            message: comment.COMMENTS
        }));

        comments.reverse();
    }

    async function postComments(event: Event): Promise <void> {
        event.preventDefault();
        isLoading = true;

        const doPost = await fetch(`${url}Post-Comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: useForm.nama,
                attend: useForm.kehadiran === 'Hadir' ? true : false,
                message: useForm.ucapan,
                by: 'Indras'
            })
        });

        const { status, message } = await doPost.json();

        isLoading = false;

        if ( status === "error" ) {
            console.log(message);
            return;
        }

        comments.push({
            name: useForm.nama,
            attend: useForm.kehadiran === 'Hadir' ? true : false,
            message: useForm.ucapan
        });

        comments.reverse();

        useForm = {
            kehadiran: '',
            nama: '',
            ucapan: ''
        };
        return;
    }
</script>
<div class="container-xs">
    {#if isOpened}
        {@render useContents()}
    {:else}
        <div transition:fly={{x: 200}}>
            {@render useGreet()}
        </div>
    {/if}
</div>

{#snippet useGreet()}
    <section class="d-flex flex-column min-vh-100">
        <div class="flex-grow-1">
            <img src="/invitation/images/invitation-header.webp" class="img-fluid" alt="Invitation Header" />
        
            <div class="form-group text-center">
                <p class="h1 text-gray-800 fw-semibold delius-regular my-5">Kepada Yth: <br/></p>
                <p class="h3 fw-bold">{invitationTo}</p> <br/>
                <button type="button" onclick={openInvitation} class="btn btn-sm btn-primary delius-regular mb-5">
                    <img src="/invitation/icons/Paper-Plane.svg" class="h-20px me-2" alt="Send" />Buka Undangan
                </button>
            </div>
        </div>
        <img src="/invitation/images/flowers-footers.webp" class="img-fluid" alt="Flower Footer" />
    </section>
{/snippet}

{#snippet useContents()}

    <!-- COUPLE -->
    <section id="couple" class="couple position-relative bg-burgundy">
        <div class="container py-5 text-center">
            <img src="img/element/flower2.png" alt="" class="img-fluid w-50 w-sm-25 pt-3 mx-auto" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>

            <h1 class="fw-semibold my-10 text-white" style="font-family: 'Passions Conflict', cursive; font-size: 50px" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Bride & Groom</h1>
            
            <div class="w-75 mx-auto mt-3 mb-10 text-white" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                <p class="fst-italic fw-bolder">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                <p class="delius-regular">Maha suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan.</p>
                <p class="delius-regular">Ya Allah, perkenankanlah kami merangkai kasih sayang yang Kau ciptakan di antara putra-putri kami:</p>
            </div>

            <div class="text-center text-white" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                <p class="fw-bolder h1 my-5 delius-regular fst-italic text-golden">Indraswari Ayu Fahmi, S. Psi</p>
                <p class="delius-regular mb-2">Putri Dari Pasangan <br> 
                    <b>Bapak Gunadi, S.P & Ibu Suharti</b>
                </p>
            </div>
            <div class="text-center display-6 my-5 fw-bolder delius-regular text-white" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>&</div>
            <div class="text-center mt-3 text-white" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                <p class="fw-bolder h1 my-5 delius-regular fst-italic text-golden">Tri Rizky Abriyan</p>
                <p class="delius-regular mb-2">Putra Dari Pasangan <br> <b>Bapak Adi Triyono & Ibu Yari Agustin</b></p>
            </div>
        </div>

            <img src="/assets/golden-separator.png" class="img-fluid my-10" alt="Flower Footer"  use:scrollAnimate={{ y: 30, duration: 500, once: false }}/>
    </section>


    <!-- EVENT -->
    <section id="event" class="container bg-burgundy">
        <div class="bg-burgundy">
            
            <div class="p-2 bg-white rounded shadow-sm mb-5">
                <div class="text-center my-5">
                    <img src="img/element/flower2.png" alt="" class="img-fluid" style="max-width: 300px;" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                </div>

                <h2 class="text-center fw-semibold" style="font-family: 'Passions Conflict', cursive; font-size: 50px;" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Akad Nikah</h2>
                
                <hr class="mx-auto" style="width:5%; border: 2px solid #333;">

                <div class="row" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <div class="col-4 text-end mt-3">
                        <p class="fw-semibold delius-regular h5"><b>April</b><br>2025</p>
                    </div>
                    <div class="col-4 text-center">
                        <h4><b class="text-danger d-block" style="font-size: 35px;">27</b><span class="fw-bold delius-regular">Minggu</span></h4>
                    </div>
                    <div class="col-4 text-start mt-3">
                        <p class="fw-semibold delius-regular h5"><b>Masjid</b><br>Al Amin</p>
                    </div>
                </div>

                <div class="form-group" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <p class="h1 fw-bold delius-regular text-center my-5">08:00 WIB</p>
                    <p class="text-center delius-regular text-danger fw-bolder">{useCountdown('2025-04-27T08:00:00')}</p>
                </div>

                <div class="separator my-5"></div>

                <p class="delius-regular text-center h5 mx-6" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Masjid Al - Amin Gg. Akasia, Kendal Payak, Kendalpayak, Kec. Pakisaji, Kabupaten Malang</p>
                <div class="d-flex justify-content-center" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <a href="https://maps.app.goo.gl/UT3gEde4FUveuTGw7" target="_blank" class="btn btn-sm btn-danger w-50 my-5">
                        <img src="/icons/Maps.svg" class="h-20px me-2" alt="Maps" />Lokasi Akad Nikah
                    </a>
                </div>
            </div>

            <div class="p-2 bg-white rounded shadow-sm mb-10">
                <div class="text-center my-5">
                    <img src="img/element/flower2.png" alt="" class="img-fluid" style="max-width: 300px;">
                </div>

                <h2 class="text-center fw-semibold" style="font-family: 'Passions Conflict', cursive; font-size: 50px;" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Acara Resepsi</h2>

                <hr class="mx-auto" style="width:5%; border: 2px solid #333;">

                <div class="row" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <div class="col-4 text-end mt-3">
                        <p class="fw-semibold delius-regular h5"><b>April</b><br>2025</p>
                    </div>
                    <div class="col-4 text-center">
                        <h4><b class="text-danger d-block" style="font-size: 35px;">27</b><span class="fw-bold delius-regular">Minggu</span></h4>
                    </div>
                    <div class="col-4 text-start mt-3">
                        <p class="fw-semibold delius-regular h5"><b>Kediaman</b><br>Pengantin</p>
                    </div>
                </div>

                <div class="form-group" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <p class="h1 fw-bold delius-regular text-center my-5">15:00 WIB - 21:00 WIB</p>
                    <p class="text-center delius-regular text-danger fw-bolder">{useCountdown('2025-04-27T15:00:00')}</p>
                </div>
                
                <div class="d-flex justify-content-center">
                    <div class="separator my-3 w-50"></div>
                </div>

                <p class="delius-regular text-center h5 mx-6" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Perum Sarimadu 2 Blok A4 No. 8 RT 10 RW 10, Dusun Segaran, Kendalpayak, Kecamatan Pakisaji, Kabupaten Malang</p>
                <div class="d-flex justify-content-center" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                    <a href="https://maps.app.goo.gl/X6u7ay9SjvEEsmmC9" target="_blank" class="btn btn-sm btn-danger w-50 my-5">
                        <img src="/icons/Maps.svg" class="h-20px me-2" alt="Maps" />Lokasi Resepsi
                    </a>
                </div>
            </div>

        </div>
    </section>

    <section id="gifts" class="w-100 ">
        <div class="container-fluid text-center">
            <img src="img/element/flower2.png" alt="" class="img-fluid" style="max-width: 300px;">
            <h1 class="fw-semibold my-10" style="font-family: 'Passions Conflict', cursive; font-size: 60px" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Love Gift</h1>

            <p class="w-75 mx-auto delius-regular" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>Berikan sentuhan kebahagiaan kepada Indras dan Ryan dengan kado virtual istimewa untuk merayakan momen indah pernikahan mereka.</p>
            
            <div class="card shadow-lg my-5" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                <div class="card-body">
                    <img src="/img/payment/logoBCA.png" class="img-fluid rounded" width="150" alt="Bank BCA">
                    <p class="card-text mt-3 mb-0 text-dark fw-bold h3 delius-regular">
                        No. Rekening:  4480605204
                    </p>
                    <p class="card-text text-dark mt-3 h5 delius-regular">
                        a.n Indraswari Aju Fahmi
                    </p>
                    <div class="d-flex justify-content-center">
                        <div class="separator my-3 w-25"></div>
                    </div>
                    <p class="fst-italic delius-regular">Bank Central Asia</p>
                </div>
            </div>
            
            <div class="card shadow-lg my-5" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
                <div class="card-body">
                    <img src="/img/payment/gifts.webp" class="img-fluid rounded" width="150" alt="Bank BCA">
                    <p class="card-text mt-3 mb-0 text-dark fw-bold h3 delius-regular">
                        Berikan Hadiah Secara Langsung!
                    </p>
                    <p class="card-text text-dark mt-3 h5 delius-regular">
                        Perum Sarimadu 2 Blok A4 No. 8 RT 10 RW 10, Dusun Segaran, Kendalpayak, Kecamatan Pakisaji, Kabupaten Malang
                    </p>
                    <div class="d-flex justify-content-center">
                        <div class="separator my-3 w-25"></div>
                    </div>
                    <p class="fst-italic delius-regular">Kediaman Pengantin</p>
                </div>
            </div>


        </div>
        <img src="/assets/flowers-footers.webp" class="img-fluid" alt="Flower Footer" />
    </section>

    <section id="comments" class="w-100 p-5 bg-burgundy">
        <div class="card shadow-sm bg-white" use:scrollAnimate={{ y: 30, duration: 500, once: false }}>
            <div class="card-body">
            <h1 class="fw-semibold my-10 text-center" style="font-family: 'Passions Conflict', cursive; font-size: 50px">Ucapan & Doa</h1>
                <p class="text-center mb-17 delius-regular">
                    "Kami mengundang Anda untuk turut merayakan hari bahagia pada pernikahan kami. Kami akan sangat senang dan berterima kasih jika Anda dapat hadir untuk berbagi kebahagiaan bersama kami."
                </p>
                <form onsubmit={postComments}>
                    <div class="form-group my-3">
                        <label for="nama" class="form-label fw-bold delius-regular">Nama</label>
                        <input type="text" bind:value={useForm.nama} class="form-control shadow-sm delius-regular" id="nama" placeholder="Masukkan Nama Anda" required/>
                    </div>
                    <div class="form-group my-3">
                        <label for="nama" class="form-label fw-bold delius-regular">Kehadiran</label>
                        <select bind:value={useForm.kehadiran} class="form-select shadow-sm delius-regular" required>
                            <option value="" selected disabled>Konfirmasi Kehadiran</option>
                            <option value="Hadir">Hadir</option>
                            <option value="Berhalangan">Berhalangan</option>
                        </select>
                    </div>
                    <div class="form-group my-3">
                        <label for="ucapan" class="form-label fw-bold delius-regular">Ucapan & Doa</label>
                        <textarea class="form-control shadow-sm delius-regular" bind:value={useForm.ucapan} rows="4" placeholder="Tulis Ucapan & Doa" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-sm btn-danger fw-bold w-100 delius-regular" disabled={isLoading}>
                        {#if isLoading}
                            Menulis pesan..
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            <img src="/icons/Paper-Plane.svg" class="h-20px me-2" alt="Send" />Kirim Pesan
                        {/if}
                    </button>
                </form>

                <div class="separator my-10"></div>

                {#if comments.length === 0}
                    <div class="mb-5">
                        <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                            <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                                <span class="placeholder bg-secondary col-5"></span>
                                <span class="placeholder bg-secondary col-3"></span>
                            </div>
                            <hr class="text-dark my-1">
                            <p class="card-text placeholder-glow">
                                <span class="placeholder bg-secondary col-6"></span>
                                <span class="placeholder bg-secondary col-5"></span>
                                <span class="placeholder bg-secondary col-12"></span>
                            </p>
                        </div>
                    </div>
                {:else}
                    {#each comments as comments }
                        <div class="mb-5">
                            <div class="card-body bg-light shadow p-5 m-0 rounded-4">
                                <div class="d-flex flex-wrap justify-content-between align-items-center">
                                    <span class="fw-bolder col-8 delius-regular">{comments.name}</span>
                                    <span class={comments.attend ? 'text-success fw-bold delius-regular' : 'text-muted fw-bold delius-regular'}>{comments.attend ? 'Hadir' : 'Berhalangan'}</span>
                                </div>
                                <hr class="text-dark my-1">
                                <p class="card-text delius-regular">{comments.message}</p>
                            </div>
                        </div>
                    {/each}
                {/if}

            </div>
        </div>
    </section>

    <section id="home" class="bg-burgundy vw-100 vh-100">
        <img src="/images/burgundy-frame-with-background-text.webp" alt="Footer Notes" class="img-fluid"/>
    </section>

    <footer class="footer d-flex justify-content-around p-3 sticky-bottom bg-white rounded-top">
        <a href="#couple" aria-label="Couple">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20px" fill="#475569" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>
        </a>
        <a href="#event" aria-label="Event">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20px" fill="#475569" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zm9.954 3H2.545c-.3 0-.545.224-.545.5v1c0 .276.244.5.545.5h10.91c.3 0 .545-.224.545-.5v-1c0-.276-.244-.5-.546-.5zm-2.6 5.854a.5.5 0 0 0-.708-.708L7.5 10.793 6.354 9.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
            </svg>
        </a>
        <a href="#gifts" aria-label="Event">
            <svg xmlns="http://www.w3.org/2000/svg"class="h-20px" fill="#475569" viewBox="0 0 24 24">
                <path d="M20 7h-.7c.229-.467.349-.98.351-1.5a3.5 3.5 0 0 0-3.5-3.5c-1.717 0-3.215 1.2-4.331 2.481C10.4 2.842 8.949 2 7.5 2A3.5 3.5 0 0 0 4 5.5c.003.52.123 1.033.351 1.5H4a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9a2 2 0 0 0-2-2Zm-9.942 0H7.5a1.5 1.5 0 0 1 0-3c.9 0 2 .754 3.092 2.122-.219.337-.392.635-.534.878Zm6.1 0h-3.742c.933-1.368 2.371-3 3.739-3a1.5 1.5 0 0 1 0 3h.003ZM13 14h-2v8h2v-8Zm-4 0H4v6a2 2 0 0 0 2 2h3v-8Zm6 0v8h3a2 2 0 0 0 2-2v-6h-5Z"/>
            </svg>
        </a>
        <a href="#comments" aria-label="Event">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-25px w-25px" fill="#475569" viewBox="0 0 24 24">
                <path d="M7 9h5m3 0h2M7 12h2m3 0h5M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.616a1 1 0 0 0-.67.257l-2.88 2.592A.5.5 0 0 1 8 18.477V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
            </svg>
        </a>
    </footer>

    <div class="position-fixed bottom-0 end-1 mb-20 z-3">
        <audio id="useAudio" autoplay loop src="/mp3/Debu.mp3"></audio>
        <div class="controls text-center">
            <button type="button" onclick={playAudio} class="btn btn-outline-dark rounded-circle p-2" aria-label="Play">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Z" clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    </div>
{/snippet}

<svelte:head>
    <title>Indras & Ryan - Wedding Day 💖</title>
</svelte:head>

<style>
    .bg-burgundy {
        background-color: #3C0008;
    }

    .text-golden {
        color: #D6B84A;
    }

    .delius-regular {
        font-family: 'Delius', cursive;
    }
</style>