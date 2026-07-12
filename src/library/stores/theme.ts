import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'portfolio' | 'portfolio-dark';

const stored = browser ? (localStorage.getItem('theme') as Theme | null) : null;

export const theme = writable<Theme>(stored ?? 'portfolio-dark');

theme.subscribe((value) => {
    if (browser) localStorage.setItem('theme', value);
});

export function toggleTheme() {
    theme.update((t) => (t === 'portfolio-dark' ? 'portfolio' : 'portfolio-dark'));
}

