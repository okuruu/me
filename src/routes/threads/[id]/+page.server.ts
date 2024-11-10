import { threadsTweets } from '../../../resources/threads.js';

export function load ({params}) {
    return {
        threads : threadsTweets[Number(params.id)]
    }
}