import CSSClasses from "../../CSSClasses";

class PanelToggle {
    private panelElement : HTMLElement;
    private buttonElement : HTMLButtonElement;
    private panelContentContainerElement : HTMLElement;
    private onToggle : () => void;
    private opened : boolean = false;

    private readonly openPanelAriaLabel : string;
    private readonly closePanelAriaLabel : string;

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

    public isOpened() : boolean {
        return this.opened;
    }

    private onButtonClick() : void {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }
}

export default PanelToggle;