import { writable } from "svelte/store";

export const baseConfig = writable({
    url : 'http://localhost:8000/',
    currentTest : '',
    pageTitle : 'Hello There!',
});