<script lang="ts">
    let ctx: CanvasRenderingContext2D | null = null;
    let drawing = false;

    const startDrawing = (event: MouseEvent | TouchEvent) => {
        if (!ctx) return;
        drawing = true;
        const { offsetX, offsetY } = getCoordinates(event);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (event: MouseEvent | TouchEvent) => {
        if (!drawing || !ctx) return;
        const { offsetX, offsetY } = getCoordinates(event);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const resetCanvas = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const stopDrawing = () => {
        drawing = false;
    };

    const getCoordinates = (event: MouseEvent | TouchEvent) => {
        if ('touches' in event) {
        const touch = event.touches[0];
        return {
        // @ts-ignore
            offsetX: touch.clientX - event.target.getBoundingClientRect().left,
        // @ts-ignore
            offsetY: touch.clientY - event.target.getBoundingClientRect().top
        };
        } else {
            return {
                offsetX: (event as MouseEvent).offsetX,
                offsetY: (event as MouseEvent).offsetY
            };
        }
    };

    $effect(() => {
        const canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
        ctx = canvas.getContext('2d');
    });
</script>
<div class="w-100">
  <!-- <button type="button" on:click={resetCanvas} class="btn btn-sm btn-light w-50 text-center text-dark mb-5">Reset Kanvas</button> -->
  <canvas
      id="whiteboard"
      class="w-100 bg-white rounded mb-4"
      height="500"
      width="350"
      onmousedown={startDrawing}
      ontouchstart={startDrawing}
      onmousemove={draw}
      ontouchmove={draw}
      onmouseup={stopDrawing}
      ontouchend={stopDrawing}
      onmouseleave={stopDrawing}
></canvas>
</div>
