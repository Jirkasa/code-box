class Navigation {
    private element : HTMLElement;
    private openedCSSClass : string;
    private mql : MediaQueryList;
    private animationSpeed : number;
    private timeoutId : number | null = null;

    constructor(element : HTMLElement, openedCSSClass : string, mql : MediaQueryList, animationSpeed : number) {
        this.element = element;
        this.openedCSSClass = openedCSSClass;
        this.mql = mql;
        this.animationSpeed = animationSpeed;

        mql.addEventListener("change", () => this.onMediaQueryListChange());
        this.updateVisibility();
    }

    public open() : void {
        this.element.classList.add(this.openedCSSClass);

        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
        }
        this.updateVisibility();
    }

    public close() : void {
        this.element.classList.remove(this.openedCSSClass);

        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
        }
        this.timeoutId = window.setTimeout(() => this.updateVisibility(), this.animationSpeed);
    }

    public isOpened() : boolean {
        return this.element.classList.contains(this.openedCSSClass);
    }

    private onMediaQueryListChange() : void {
        this.updateVisibility();
    }

    private updateVisibility() : void {
        if (this.mql.matches && !this.isOpened()) {
            this.element.style.setProperty("visibility", "hidden");
        } else {
            this.element.style.removeProperty("visibility");
        }
    }
}

export default Navigation;