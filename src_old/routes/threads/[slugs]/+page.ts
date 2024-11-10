import { threadsTweets } from '../../../library/threads.js'

export const load = ({params}) => {
    return {
        threads : threadsTweets[Number(params.slugs)]
    }
}