interface Threads {
    tweets: string;
    images: string[] | null;
    timestamp: string;
    replies: number;
    likes: number;
}

async function useThreads() {
    const modules = import.meta.glob('/static/json/threads/*.json');

    const promises = Object.entries(modules).map(async ([path, loader]) => {
        const data: any = await loader();
        return {
            tweets: data.tweets,
            images: data.images,
            timestamp: data.timestamp,
            replies: data.replies,
            likes: data.likes,
        };
    });

    let results: Threads[] = await Promise.all(promises);

    return { results };
}

export { useThreads };