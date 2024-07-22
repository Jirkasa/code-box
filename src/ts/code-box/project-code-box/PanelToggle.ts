import CSSClasses from "../../CSSClasses";

class PanelToggle {
    private panelElement : HTMLElement;
    private buttonElement : HTMLButtonElement;
    private onToggle : () => void;
    private opened : boolean = false;

    constructor(panelElement : HTMLElement, buttonElement : HTMLButtonElement, onToggle : () => void) {
        this.panelElement = panelElement;
        this.buttonElement = buttonElement;
        this.onToggle = onToggle;

        this.buttonElement.addEventListener("click", () => this.onButtonClick());
    }

    public isOpened() : boolean {
        return this.opened;
    }

    private onButtonClick() : void {
        this.opened = !this.opened;

        if (this.opened) {
            this.panelElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
            this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);
        } else {
            this.panelElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
            this.buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);
        }

        this.onToggle();
    }
}

export default PanelToggle;