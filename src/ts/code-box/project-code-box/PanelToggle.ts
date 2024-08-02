import CSSClasses from "../../CSSClasses";

/** Manages opening/closing of project code box panel. */
class PanelToggle {
    /** Panel element. */
    private panelElement : HTMLElement;
    /** Open/Close button. */
    private buttonElement : HTMLButtonElement;
    /** Panel content container element. */
    private panelContentContainerElement : HTMLElement;
    /** Function that is called when panel is opened/closed. */
    private onToggle : () => void;

    /** Indicates whether panel is currently opened. */
    private opened : boolean = false;

    /** Text for button aria-label attribute when panel is closed. */
    private readonly openPanelAriaLabel : string;
    /** Text for button aria-label attribute when panel is opened. */
    private readonly closePanelAriaLabel : string;

    /**
     * Creates new panel toggle.
     * @param panelElement Panel element.
     * @param buttonElement Open/close button.
     * @param panelContentContainerElement Panel content container element.
     * @param openPanelAriaLabel Text for open/close button aria-label attribute when panel is closed.
     * @param closePanelAriaLabel Text for open/close button aria-label attribute when panel is opened.
     * @param onToggle Function to be called when panel is opened/closed.
     */
    constructor(panelElement : HTMLElement, buttonElement : HTMLButtonElement, panelContentContainerElement : HTMLElement, openPanelAriaLabel : string, closePanelAriaLabel : string, onToggle : () => void) {
        this.panelElement = panelElement;
        this.buttonElement = buttonElement;
        this.panelContentContainerElement = panelContentContainerElement;
        this.onToggle = onToggle;

        this.openPanelAriaLabel = openPanelAriaLabel;
        this.closePanelAriaLabel = closePanelAriaLabel;

        this.buttonElement.setAttribute("aria-expanded", "false");
        this.buttonElement.setAttribute("aria-label", this.openPanelAriaLabel);
        this.panelContentContainerElement.setAttribute("aria-hidden", "true");

        this.buttonElement.addEventListener("click", () => this.onButtonClick());
    }

    /**
     * Opens panel.
     */
    public open() : void {
        if (this.opened) return;

        this.opened = true;
        this.panelElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);

        this.buttonElement.setAttribute("aria-expanded", "true");
        this.buttonElement.setAttribute("aria-label", this.closePanelAriaLabel);
        this.panelContentContainerElement.setAttribute("aria-hidden", "false");

        this.onToggle();
    }

    /**
     * Closes panel.
     */
    public close() : void {
        if (!this.opened) return;

        this.opened = false;
        this.panelElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
        this.buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);

        this.buttonElement.setAttribute("aria-expanded", "false");
        this.buttonElement.setAttribute("aria-label", this.openPanelAriaLabel);
        this.panelContentContainerElement.setAttribute("aria-hidden", "true");

        this.onToggle();
    }

    /**
     * Checks whether panel is opened.
     * @returns Indicates whether panel is opened.
     */
    public isOpened() : boolean {
        return this.opened;
    }

    /**
     * Called when button is clicked.
     */
    private onButtonClick() : void {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }
}

export default PanelToggle;