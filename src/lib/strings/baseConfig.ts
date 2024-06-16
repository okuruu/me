import { writable } from "svelte/store";

const isProduction: boolean = true;

export const baseConfig = writable({
    url : isProduction ? 'https://esdelfron.deabakery.co.id/api' : 'http://localhost:8000/api/',
    currentTest : '',
    pageTitle : 'Hello There!',
});