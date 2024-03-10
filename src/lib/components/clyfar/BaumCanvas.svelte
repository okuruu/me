<script lang="ts">
    import { onMount } from 'svelte';

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
  
    onMount(() => {
      const canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
      ctx = canvas.getContext('2d');
    });
</script>
<div class="flex flex-col items-center">
  <canvas
      id="whiteboard"
      class="bg-white mb-4"
      height="500"
      on:mousedown="{startDrawing}"
      on:touchstart="{startDrawing}"
      on:mousemove="{draw}"
      on:touchmove="{draw}"
      on:mouseup="{stopDrawing}"
      on:touchend="{stopDrawing}"
      on:mouseleave="{stopDrawing}"
  />
  <button type="button" on:click={resetCanvas} class="btn btn-neutral w-full">Reset Kanvas</button>
</div>
