import CSSClasses from "../../CSSClasses";


// todo - nezapomenout na tabindexy - ale to spíš dělat nějak ve Folder nebo FoldersManageru

/** Represents collapsible. */
class Collapsible {
    /** Small delay that is used to trigger CSS animations. */
    private static readonly DELAY_TIMEOUT = 5;

    /** Button element. */
    private buttonElement : HTMLButtonElement;
    /** Collapsible element. */
    private collapsibleElement : HTMLElement;
    /** Open/close animation speed. */
    private animationSpeed : number;
    /** CSS easing function for open/close animation. */
    private animationEasingFunction : string;

    /** Indicates whether collapsible is currently opened. */
    private opened : boolean = false;
    /** Indicates whether collapsible is currently being animated. */
    private isAnimating : boolean = false;

    /** Timeout id of animation timeout function. */
    private animationTimeoutId : number | null = null;
    /** Tiemout id of delay timeout function, that is used to trigger animations. */
    private delayTimeoutId : number | null = null;

    /**
     * Creates new collapsible.
     * @param buttonElement Button element.
     * @param collapsibleElement Collapsible element.
     * @param animationSpeed Open/close animation speed.
     * @param animationEasingFunction CSS easing function for open/close animation.
     */
    constructor(buttonElement : HTMLButtonElement, collapsibleElement : HTMLElement, animationSpeed : number, animationEasingFunction : string) {
        this.buttonElement = buttonElement;
        this.collapsibleElement = collapsibleElement;
        this.animationSpeed = animationSpeed;
        this.animationEasingFunction = animationEasingFunction;

        this.buttonElement.addEventListener("click", () => this.onButtonClick());

        this.close(false);
    }

    /**
     * Opens collapsible.
     * @param animate Determines whether animation should be used.
     */
    public open(animate : boolean = true) : void {
        // clear potential previous animation
        this.clearTimeouts();
        this.isAnimating = false;

        this.opened = true;

        // add CSS modifier classes
        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FOLDER_OPENED_MODIFIER);
        this.collapsibleElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_COLLAPSIBLE_OPENED_MODIFIDER);

        // change visibility
        this.collapsibleElement.style.setProperty("visibility", "visible");

        if (animate) {
            this.isAnimating = true;

            // get height of collapsible element
            const height = this.getCollapsibleElementHeight();
            this.collapsibleElement.style.setProperty("max-height", "0px");

            // set properties for animation
            this.collapsibleElement.style.setProperty("overflow", "hidden");
            this.collapsibleElement.style.setProperty("transition", `${this.animationSpeed}ms ${this.animationEasingFunction}`);
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
            }, this.animationSpeed);
        } else {
            this.collapsibleElement.style.setProperty("max-height", "none");
            this.collapsibleElement.style.removeProperty("overflow");
        }
    }

    /**
     * Closes collapsible.
     * @param animate Determines whether animation should be used.
     */
    public close(animate : boolean = true) : void {
        // clear potential previous animation
        this.clearTimeouts();
        this.isAnimating = false;

        this.opened = false;

        // remove CSS modifier classes
        this.buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FOLDER_OPENED_MODIFIER);
        this.collapsibleElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_COLLAPSIBLE_OPENED_MODIFIDER);

        // change visibility and add overflow hidden
        this.collapsibleElement.style.setProperty("visibility", "hidden");
        this.collapsibleElement.style.setProperty("overflow", "hidden");

        if (animate) {
            this.isAnimating = true;

            // set properties for animation
            this.collapsibleElement.style.setProperty("transition", `${this.animationSpeed}ms ${this.animationEasingFunction}`);
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
            }, this.animationSpeed);
        } else {
            this.collapsibleElement.style.setProperty("max-height", "0px");
        }
    }

    /**
     * Called when button is clicked.
     */
    private onButtonClick() : void {
        if (this.isAnimating) return;

        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Clears timeout functions.
     */
    private clearTimeouts() : void {
        if (this.animationTimeoutId !== null) {
            window.clearTimeout(this.animationTimeoutId);
        }
        if (this.delayTimeoutId !== null) {
            window.clearTimeout(this.delayTimeoutId);
        }
    }

    /**
     * Returns height of collapsible element. (After calling this method, "max-height" property is removed and must be reassigned if necessary.)
     * @returns Height of collapsible element.
     */
    private getCollapsibleElementHeight() : number {
        this.collapsibleElement.style.setProperty("max-height", "none");
        const height = this.collapsibleElement.clientHeight;
        this.collapsibleElement.style.removeProperty("max-height");

        return height;
    }
}

export default Collapsible;