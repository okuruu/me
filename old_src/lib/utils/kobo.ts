import { get } from "svelte/store";
import { baseConfig } from "$lib/strings/baseConfig";

interface ResponseType {
    data : any;
    status: string;
    message: string;
}

const baseConfigValue = get(baseConfig);

async function doFetch(id: string) {
    const sendRequest = await fetch(baseConfigValue.url + id, {
        method : 'get',
        credentials : 'include'
    });

    if (!sendRequest.ok) {
        throw new Error(`Error: ${sendRequest.status} - ${sendRequest.statusText}`);
    }

    const doResponse = await sendRequest.json();
    return doResponse.data;
}

async function kobo(data: FormData | Record<string, any>, url: string): Promise <ResponseType> {
    let response: ResponseType;

    if (data instanceof FormData) {
        response = await postForms(data, url);
    } else {
        response = await postJson(data, url);
    }

    return response;
}

async function postForms(forms: FormData, url: string): Promise<ResponseType> {
    try {
        const doPost = await fetch(baseConfigValue.url + url, {
            method: 'post',
            body: forms
        });

        const { status, message, data } = await doPost.json();
        return { status, message, data };
    } catch {
        return { status: 'error', message: 'Internal Server Error', data : null };
    }
}

async function postJson(jsons: Record<string, any>, url: string): Promise<ResponseType> {
    try {
        const doPost = await fetch(baseConfigValue.url + url, {
            method: 'post',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(jsons)
        });

        const { status, message, data } = await doPost.json();
        return { status, message, data };
    } catch (error) {
        return { status: 'error', message: 'Internal Server Error', data : null };
    }
}

export { kobo, doFetch };