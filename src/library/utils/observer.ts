import { tick } from 'svelte';

export async function setupFadeObserver(): Promise<() => void> {
    await tick();
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.fade-up:not(.visible)').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
}

