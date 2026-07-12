import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		files: {
			lib: 'src/library'
		},
		alias: {
			'$library': 'src/library',
			'$library/*': 'src/library/*'
		}
	}
};

export default config;
