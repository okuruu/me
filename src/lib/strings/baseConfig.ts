import { writable } from "svelte/store";

export const baseConfig = writable({
    url : 'http://localhost:8080',
    currentTest : '',
    pageTitle : 'Hello There!',
});