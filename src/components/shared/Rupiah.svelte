<script lang="ts">
    let { value = $bindable(), useClass, id }: { value: string | number; useClass: string, id: string } = $props();
    function formatCurrency(): string {
        let formattedValue: string = value.toString();
        if (typeof(value) == "string") {
            formattedValue = formattedValue.replace(/[^0-9]/g, '');
        }
        formattedValue = Number(formattedValue).toLocaleString('id-ID');
        value = 'Rp ' + formattedValue;
        return value;
    }
</script>

<input type="text" id={id} bind:value={value} class={useClass} oninput={formatCurrency} placeholder="Rp. 0"/>