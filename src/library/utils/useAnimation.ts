// src/lib/actions/scrollAnimate.ts
export function scrollAnimate(
    node: HTMLElement,
    options: {
        y?: number;
        x?: number;
        duration?: number;
        once?: boolean;
        threshold?: number;
    } = {}
) {
    const {
        y = 50,
        x = 0,
        duration = 700,
        once = true,
        threshold = 0.2
    } = options;

    // Initial hidden state
    node.style.opacity = '0';
    node.style.transform = `translate(${x}px, ${y}px)`;
    node.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                node.style.opacity = '1';
                node.style.transform = 'translate(0, 0)';

                if (once) observer.unobserve(node);
            } else {
                if (!once) {
                    node.style.opacity = '0';
                    node.style.transform = `translate(${x}px, ${y}px)`;
                }
            }
        },
        {
            threshold
        }
    );

    observer.observe(node);

    return {
        destroy() {
            observer.unobserve(node);
        }
    };
}
