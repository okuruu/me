<script lang="ts">
    export let mbti;
</script>
<div class="card shadow-sm bg-white my-5">
    <div class="card-header">
        <h3 class="card-title fw-bolder">Interpretasi MBTI</h3>
        <div class="card-toolbar">
            <button type="button" class="btn btn-sm btn-light">
                Interpretation Viewer
            </button>
        </div>
    </div>
    <div class="card-body">
        Tipe MBTI testee adalah: <span class="fw-bolder">{mbti}</span>
    </div>
</div>