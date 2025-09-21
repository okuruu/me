import { toast } from "svelte-sonner";
import { useNotice } from "../validator/useNotice";
import { phraseBox } from "../resources/phraseBox";

interface ResponseType {
    data: any;
    status: string;
    message: string;
    redirectTo?: any;
}

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
}

// 🔐 Authorization (move to .env later)
const AUTH_KEY = "x9Fz!weird-fuzzy-key-123";

// Track previous requests so we can abort them
const activeControllers = new Map<string, AbortController>();

// 🛜 Check if user is offline before trying fetch
function checkOffline(): boolean {
    if (!navigator.onLine) {
        toast.error(useNotice.connection.noInternet || "Kamu sedang offline, periksa koneksi ya!");
        return true;
    }
    return false;
}

// Modified fetchWithRetry
const fetchWithRetry = async (
    url: string,
    options: FetchOptions = {}
): Promise<Response> => {
    const {
        timeout = 120000,
        retries = 3,
        ...fetchOptions
    } = options;

    // 🚫 Skip immediately if offline
    if (checkOffline()) {
        throw new Error("Offline");
    }

    // Abort previous request to same URL
    if (activeControllers.has(url)) {
        activeControllers.get(url)?.abort();
    }

    const controller = new AbortController();
    activeControllers.set(url, controller);

    let attempt = 0;
    let error: unknown;

    while (attempt <= retries) {
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            activeControllers.delete(url);
            return response;
        } catch (err) {
            clearTimeout(id);
            error = err;

            if (err instanceof Error) {
                if (err.message === "Offline") break; // 🚫 stop retry if offline
                if (err.name === "AbortError" && attempt === retries) {
                    throw new Error("Request timeout");
                }
            }

            if (attempt < retries) {
                const delay = Math.pow(2, attempt) * 500;
                await new Promise(res => setTimeout(res, delay));
                attempt++;
            } else {
                break;
            }
        }
    }

    activeControllers.delete(url);
    throw error;
};

// 🔹 GET (replacement for old useFetch)
export async function useFetch(id: string): Promise<any> {
    try {
        const sendRequest = await fetchWithRetry(phraseBox.url + id, {
            method: "GET",
            credentials: "include",
            headers: {
                "Authorization": AUTH_KEY
            },
            timeout: 30000,
            retries: 2
        });

        const doResponse = await sendRequest.json();
        return doResponse.data;
    } catch (error) {
        handleFetchError(error);
        return null;
    }
}

// 🔹 POST handler (like old db)
export async function db(data: FormData | Record<string, any>, url: string): Promise<ResponseType> {
    try {
        if (data instanceof FormData) {
            return await postForms(data, url);
        } else {
            return await postJson(data, url);
        }
    } catch (error) {
        handleFetchError(error);
        return { status: "error", message: getErrorMessage(error), data: null, redirectTo: null };
    }
}

// 🔹 POST FormData
async function postForms(forms: FormData, url: string): Promise<ResponseType> {
    try {
        const doPost = await fetchWithRetry(phraseBox.url + url, {
            method: "POST",
            headers: {
                "Authorization": AUTH_KEY
            },
            body: forms,
            timeout: 30000,
            retries: 2
        });

        return await doPost.json();
    } catch (error) {
        throw error;
    }
}

// 🔹 POST JSON
async function postJson(jsons: Record<string, any>, url: string): Promise<ResponseType> {
    try {
        const doPost = await fetchWithRetry(phraseBox.url + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": AUTH_KEY
            },
            body: JSON.stringify(jsons),
            timeout: 30000,
            retries: 2
        });

        return await doPost.json();
    } catch (error) {
        throw error;
    }
}

// 🔹 Update error handler
function handleFetchError(error: unknown): void {
    if (error instanceof Error) {
        switch (error.message) {
            case "Offline":
                toast.error(useNotice.connection.noInternet || "Kamu sedang offline");
                break;
            case "Request timeout":
                toast.error(useNotice.connection.timeout);
                break;
            case "Failed to fetch":
                toast.error(useNotice.connection.failedToFetch);
                break;
            default:
                toast.error(useNotice.connection.default);
        }
    } else {
        toast.error(useNotice.connection.default);
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        switch (error.message) {
            case "Request timeout":
                return "Waktu Permintaan Habis";
            case "Failed to fetch":
                return "Server Tidak Dapat Diakses";
            default:
                return "Kendala Sistem";
        }
    }
    return "Kendala Sistem";
}
