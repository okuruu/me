<script lang="ts">
    import Navbar from "../components/Navbar.svelte";
    import { useString } from "../library/resources/useString";
</script>
<div class="bg-dark vh-100 wh-100">
    <div class="container-xs">
        <Navbar/>
        <div class="d-flex justify-content-evenly">
            <img src="/images/avatar.jpg" alt="" class="avatar h-100px" />
            <div class="form-group mt-4">
                <h1 class="text-white">{useString.name}</h1>
                <span class="text-white">{useString.bio}</span>
                <br/>
                <a href="{useString.github.url}" class="text-muted">{useString.github.username}</a>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <div class="separator w-25 my-7"></div>
        </div>
        <h1 class="font-bold text-white">About</h1>
        <p class="mt-2 text-muted">{useString.about}</p>
        <div class="separator my-5"></div>
        {#each useString.experience as experience }
            <div class="row text-white mb-3">
                <div class="col-4">
                    <b>{experience.name} - {experience.year}</b>
                </div>
                <div class="col-8">
                    <b>{experience.achievement}</b>
                    <div class="mt-2">
                        {@html experience.desc}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>