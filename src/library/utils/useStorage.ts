import { get } from "svelte/store";
import { userConfig } from "../config/baseConfiguration";

function getLocalStorage(){
    const userStorage = localStorage.getItem('user');
    if (userStorage !== null) {
        const user = JSON.parse(userStorage);
        return user;
    } else {
        console.log('User data not found in local storage');
        return null;
    }
}

function updateCurrentTest(newValue: string) {
    const userStorage = localStorage.getItem('user');
    if (userStorage !== null) {
        const user = JSON.parse(userStorage);
        get(userConfig).testPosition = newValue;
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        console.log('User data not found in local storage');
    }
}

export { getLocalStorage, updateCurrentTest };