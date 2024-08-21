class Collapsible {
    private static readonly DELAY_TIMEOUT = 5;
    private static readonly ANIMATION_SPEED = 200;
    private static readonly ANIMATION_EASING_FUNCTION = "ease-in-out";

    private buttonElement : HTMLElement;
    private collapsibleElement : HTMLElement;

    private opened : boolean = false;
    private isAnimating : boolean = false;
    private animationTimeoutId : number | null = null;
    private delayTimeoutId : number | null = null;

    private readonly collapsibleOpenedButtonCSSClass;
    private readonly collapsibleOpenedCollapsibleCSSClass;

    constructor(buttonElement : HTMLElement, collapsibleElement : HTMLElement, collapsibleOpenedButtonCSSClass : string | null = null, collapsibleOpenedCollapsibleCSSClass : string | null = null) {
        this.buttonElement = buttonElement;
        this.collapsibleElement = collapsibleElement;
        this.collapsibleOpenedButtonCSSClass = collapsibleOpenedButtonCSSClass;
        this.collapsibleOpenedCollapsibleCSSClass = collapsibleOpenedCollapsibleCSSClass;

        this.buttonElement.addEventListener("click", () => this.onButtonClick());

        this.close(false);
    }

    public open(animate : boolean = true) : void {
        // clear potential previous animation
        this.clearTimeouts();
        this.isAnimating = false;

        this.opened = true;

        // add CSS modifier classes
        if (this.collapsibleOpenedButtonCSSClass !== null) {
            this.buttonElement.classList.add(this.collapsibleOpenedButtonCSSClass);
        }
        if (this.collapsibleOpenedCollapsibleCSSClass) {
            this.collapsibleElement.classList.add(this.collapsibleOpenedCollapsibleCSSClass);
        }

        // change visibility
        this.collapsibleElement.style.setProperty("visibility", "visible");

        if (animate) {
            this.isAnimating = true;

            // get height of collapsible element
            const height = this.getCollapsibleElementHeight();
            this.collapsibleElement.style.setProperty("max-height", "0px");

            // set properties for animation
            this.collapsibleElement.style.setProperty("overflow", "hidden");
            this.collapsibleElement.style.setProperty("transition", `${Collapsible.ANIMATION_SPEED}ms ${Collapsible.ANIMATION_EASING_FUNCTION}`);
            // max-height is changed after small delay to trigger CSS animation
            this.delayTimeoutId = window.setTimeout(() => {
                this.collapsibleElement.style.setProperty("max-height", height + "px");
                this.delayTimeoutId = null;
            }, Collapsible.DELAY_TIMEOUT);

            // wait for CSS animation to complete
            this.animationTimeoutId = window.setTimeout(() => {
                this.isAnimating = false;

                // add/remove CSS properties after animation has been completed
                this.collapsibleElement.style.setProperty("max-height", "none");
                this.collapsibleElement.style.removeProperty("transition");
                this.collapsibleElement.style.removeProperty("overflow");

                this.animationTimeoutId = null;
            }, Collapsible.ANIMATION_SPEED);
        } else {
            this.collapsibleElement.style.setProperty("max-height", "none");
            this.collapsibleElement.style.removeProperty("overflow");
        }
    }

    public close(animate : boolean = true) : void {
        // clear potential previous animation
        this.clearTimeouts();
        this.isAnimating = false;

        this.opened = false;

        // remove CSS modifier classes
        if (this.collapsibleOpenedButtonCSSClass !== null) {
            this.buttonElement.classList.remove(this.collapsibleOpenedButtonCSSClass);
        }
        if (this.collapsibleOpenedCollapsibleCSSClass) {
            this.collapsibleElement.classList.remove(this.collapsibleOpenedCollapsibleCSSClass);
        }

        // change visibility and add overflow hidden
        this.collapsibleElement.style.setProperty("visibility", "hidden");
        this.collapsibleElement.style.setProperty("overflow", "hidden");

        if (animate) {
            this.isAnimating = true;

            // set properties for animation
            this.collapsibleElement.style.setProperty("transition", `${Collapsible.ANIMATION_SPEED}ms ${Collapsible.ANIMATION_EASING_FUNCTION}`);
            this.collapsibleElement.style.setProperty("max-height", this.getCollapsibleElementHeight() + "px");
            // max-height is changed after small delay to trigger CSS animation
            this.delayTimeoutId = window.setTimeout(() => {
                this.collapsibleElement.style.setProperty("max-height", "0px");
                this.delayTimeoutId = null;
            }, Collapsible.DELAY_TIMEOUT);

            // wait for CSS animation to complete
            this.animationTimeoutId = window.setTimeout(() => {
                this.isAnimating = false;

                // remove CSS properties after animation has been completed
                this.collapsibleElement.style.removeProperty("transition");

                this.animationTimeoutId = null;
            }, Collapsible.ANIMATION_SPEED);
        } else {
            this.collapsibleElement.style.setProperty("max-height", "0px");
        }
    }

    public isOpened() : boolean {
        return this.opened;
    }

    private onButtonClick() : void {
        if (this.isAnimating) return;

        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }

    private clearTimeouts() : void {
        if (this.animationTimeoutId !== null) {
            window.clearTimeout(this.animationTimeoutId);
        }
        if (this.delayTimeoutId !== null) {
            window.clearTimeout(this.delayTimeoutId);
        }
    }

    private getCollapsibleElementHeight() : number {
        this.collapsibleElement.style.setProperty("max-height", "none");
        const height = this.collapsibleElement.clientHeight;
        this.collapsibleElement.style.removeProperty("max-height");

        return height;
    }
}

export default Collapsible;