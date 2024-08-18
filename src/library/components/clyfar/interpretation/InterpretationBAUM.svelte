<script lang="ts">
    import { userText } from "../../../strings";

    export let baum: string;
</script>
<div class="card shadow-sm bg-white my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi Baum</h3>
        <div class="card-toolbar">
            <button type="button" class="btn btn-sm btn-light">
                Interpretation Viewer
            </button>
        </div>
    </div>
    <div class="card-body">
        <div class="text-center">
            <img src="{`${userText.rawURL}BAUM/${baum}`}" alt="" class="img-fluid" />
        </div>
    </div>
</div>