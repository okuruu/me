import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        target: 'esnext',
    },
    server: {
        warmup: {
            clientFiles: [
                './src/routes/+page.svelte',
                './src/routes/+layout.svelte',
                './src/routes/projects/[slug]/+page.svelte',
            ],
        },
    },
});
