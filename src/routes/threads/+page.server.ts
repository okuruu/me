import { useThreads } from "../../library/hooks/threadsMounter";
export async function load() {
    const threads = await useThreads();
    return {
        threads : threads.results
    }
}