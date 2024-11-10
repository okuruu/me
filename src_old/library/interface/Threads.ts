interface Threads {
    tweets : string;
    images : string|null,
    timestamp : string;
    replies : number;
    likes : number;
    reply : {
        view : boolean,
        replies: {
            tweets: string;
            images : string|null
        }[]   
    }
}

export type { Threads };