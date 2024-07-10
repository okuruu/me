export function threadsLike(likes: number): string {
    if (likes >= 1000000) {
        return (likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (likes >= 1000) {
        return (likes / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    } else {
        return likes.toString();
    }
}