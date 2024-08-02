import GlobalConfig from "../GlobalConfig";

/** Component used to observe intersections between viewport and elements. */
class ViewportIntersectionObserver {
    /** Instance of ViewportIntersectionObserver. */
    private static instance : ViewportIntersectionObserver | null = null;

    /** Intersection observer. */
    private observer : IntersectionObserver;
    /** Map of handlers that are called when intersection between viewport and element changes. */
    private elements = new Map<Element, (isIntersecting : boolean) => void>();

    /**
     * Creates new instance.
     */
    private constructor() {
        this.observer = new IntersectionObserver(entries => this.intersectionObserverCallback(entries), {
            root: null,
            rootMargin: `${GlobalConfig.LAZY_INITIALIZATION_MARGIN} 0px ${GlobalConfig.LAZY_INITIALIZATION_MARGIN} 0px`
        });
    }

    /**
     * Starts to observe intersection changes between passed element and viewport.
     * @param element Element.
     * @param handler Function to be called when intersection between element and viewport changes.
     */
    public static observe(element : Element, handler : (isIntersecting : boolean) => void) : void {
        const instance = ViewportIntersectionObserver.getInstance();

        instance.observer.observe(element);
        instance.elements.set(element, handler);
    }

    /**
     * Stops to observe intersection changes between passed element and viewport.
     * @param element Element.
     */
    public static unobserve(element : Element) : void {
        const instance = ViewportIntersectionObserver.getInstance();

        instance.observer.unobserve(element);
        instance.elements.delete(element);
    }

    /**
     * Callback for IntersectionObserver (called when intersection between viewport and some observed element(s) changes).
     * @param entries Intersection observer entries.
     */
    private intersectionObserverCallback(entries : IntersectionObserverEntry[]) : void {
        for (let entry of entries) {
            const handler = this.elements.get(entry.target);
            if (!handler) continue;
            handler(entry.isIntersecting);
        }
    }

    /**
     * Returns instance of ViewportIntersectionObserver (this method should be used instead of constructor).
     * @returns Instance of ViewportIntersectionObserver.
     */
    private static getInstance() : ViewportIntersectionObserver {
        if (!ViewportIntersectionObserver.instance) {
            ViewportIntersectionObserver.instance = new ViewportIntersectionObserver();
        }

        return ViewportIntersectionObserver.instance;
    }
}

export default ViewportIntersectionObserver;