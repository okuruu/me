<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';

    let token = 'Aguamenti';

    let timer: number = 750;
    let isPaused:boolean = false;
    const answerType:{ type: string; answer: string[] }[] = [
        {
            type : 'firstAnswer',
            answer : ['A','B','C','D','E','F']
        },
        {
            type : 'secondAnswer',
            answer : ['A','B','C','D','E']
        }
    ];

    const sections = [
    { second: 570, message: "Section 2 telah dibuka" },
    { second: 300, message: "Section 3 telah dibuka" },
    { second: 150, message: "Section 4 telah dibuka" },
    { second: 0, message: "End" } // Stop the interval!
    ];

    $: { 
        sections.forEach(section => {
            if (timer === section.second) {
                toast.success(section.message, { position: 'top-right' });
                if (section.message === "End") {
                    clearInterval(startInterval);
                }
            }
        });
    }

    const startInterval = setInterval(() => {
        if (!isPaused) {
            timer--;
            if (timer < 0) {
                clearInterval(startInterval);
                toast.success("End", { position: 'top-right' }); // Show "End" message when timer is done
            }
        }
    }, 10);

</script>
<Toaster/>
<div class="container mx-auto p-2">

    <div class="fixed-bottom d-flex justify-content-center p-3">
        <button class="btn btn-dark position-absolute bottom-0  mb-3">
            Sisa Waktu : {timer} Detik
        </button>
    </div>
    
    {#if timer <= 750 && timer >= 571}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                First Card
            </div>
        </div>
    {/if}
        
    {#if timer <= 570 && timer >= 301}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                Second Card
            </div>
        </div>
    {/if}

    {#if timer <= 300 && timer >= 151}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                Third Card
            </div>
        </div>
    {/if}
    
    {#if timer <= 150}
        <div class="card w-full bg-base-100 shadow-xl my-5">
            <div class="card-body">
                Fourth Card
            </div>
        </div>
    {/if}

</div>