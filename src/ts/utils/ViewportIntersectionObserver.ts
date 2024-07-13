import GlobalConfig from "../GlobalConfig";

class ViewportIntersectionObserver {
    private static instance : ViewportIntersectionObserver | null = null;

    private observer : IntersectionObserver;
    private elements = new Map<Element, (isIntersecting : boolean) => void>();

    private constructor() {
        this.observer = new IntersectionObserver(entries => this.intersectionObserverCallback(entries), {
            root: null,
            rootMargin: `${GlobalConfig.LAZY_INITIALIZATION_MARGIN} 0px ${GlobalConfig.LAZY_INITIALIZATION_MARGIN} 0px`
        });
    }

    public static observe(element : Element, handler : (isIntersecting : boolean) => void) : void {
        const instance = ViewportIntersectionObserver.getInstance();

        instance.observer.observe(element);
        instance.elements.set(element, handler);
    }

    public static unobserve(element : Element) : void {
        const instance = ViewportIntersectionObserver.getInstance();

        instance.observer.unobserve(element);
        instance.elements.delete(element);
    }

    private intersectionObserverCallback(entries : IntersectionObserverEntry[]) : void {
        for (let entry of entries) {
            const handler = this.elements.get(entry.target);
            if (!handler) continue;
            handler(entry.isIntersecting);
        }
    }

    private static getInstance() : ViewportIntersectionObserver {
        if (!ViewportIntersectionObserver.instance) {
            ViewportIntersectionObserver.instance = new ViewportIntersectionObserver();
        }

        return ViewportIntersectionObserver.instance;
    }
}

export default ViewportIntersectionObserver;