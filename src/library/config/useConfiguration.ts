import { writable } from "svelte/store";

const userConfig = writable({
    testPosition : 'startPage'
});

export { userConfig };