<script lang="ts">
    import { userText } from "../library/strings";
</script>
<div class="bg-dark vh-100 wh-100">
    <div class="container-xs">

        <div class="d-flex justify-content-evenly">
            <img src="/images/avatar.jfif" alt="" class="avatar h-100px" />
            <div class="form-group mt-4">
                <h1 class="text-white">{userText.name}</h1>
                <span class="text-white">{userText.bio}</span>
                <br/>
                <a href="{userText.github.url}" class="text-muted">{userText.github.username}</a>
            </div>
        </div>

        <div class="d-flex justify-content-center">
            <div class="separator w-25 my-7"></div>
        </div>

        <!-- Bio -->
        <h1 class="font-bold text-white">About</h1>
        <p class="mt-2 text-muted">{userText.about}</p>

        <div class="separator my-5"></div>

        <!-- Currently At -->
         {#each userText.experience as experience }
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