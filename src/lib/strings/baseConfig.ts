import { writable } from "svelte/store";

export const baseConfig = writable({
    url : 'http://localhost:3000/',
    currentTest : '',
    pageTitle : 'Hello There!',
});