import { baseConfig } from '$lib/strings/baseConfig.js'
import { get } from 'svelte/store'

export const load = async ({fetch}) => {
    const url: string = get(baseConfig).url;
    const resource = await fetch(url + 'Clyfar/Dashboard');
    const response = await resource.json();

    return {
        data : response.data
    }
}