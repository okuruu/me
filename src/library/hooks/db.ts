import { useString } from "../resources/useString";

interface ResponseType {
    data : any;
    status: string;
    message: string;
    redirectTo: any;
}

async function useFetch(id: string) {
    const sendRequest = await fetch(useString.url+ id, {
        method : 'get',
        credentials : 'include'
    });

    if (!sendRequest.ok) {
        throw new Error(`Error: ${sendRequest.status} - ${sendRequest.statusText}`);
    }

    const doResponse = await sendRequest.json();
    return doResponse.data;
}

async function db(data: FormData | Record<string, any>, url: string): Promise <ResponseType> {
    let response: ResponseType;

    if (data instanceof FormData) {
        response = await postForms(data, url);
    } else {
        response = await postJson(data, url);
    }

    return response;
}

async function postForms(forms: FormData, url: string): Promise <ResponseType> {
    try {
        const doPost = await fetch(useString.url + url, {
            method: 'post',
            body: forms
        });

        const { status, message, data, redirectTo } = await doPost.json();
        return { status, message, data, redirectTo };
    } catch {
        return { status: 'error', message: 'Internal Server Error', data : null, redirectTo : null };
    }
}

async function postJson(jsons: Record<string, any>, url: string): Promise <ResponseType> {
    try {
        const doPost = await fetch(useString.url + url, {
            method: 'post',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(jsons)
        });

        const { status, message, data, redirectTo } = await doPost.json();
        return { status, message, data, redirectTo };
    } catch (error) {
        console.log(error)
        return { status: 'error', message: 'Internal Server Error', data : null, redirectTo : null };
    }
}

export { db, useFetch };