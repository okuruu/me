import type { Threads } from '../../../interface/Threads.js';
export async function load ({params,fetch}) {
    const threadsMain = await fetch(`/json/threads/${params.id}.json`);
    const useThreads: Threads = await threadsMain.json();
    return {
        threads : useThreads,
    }
}