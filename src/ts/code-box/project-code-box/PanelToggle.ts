import CSSClasses from "../../CSSClasses";

class PanelToggle {
    private panelElement : HTMLElement;
    private buttonElement : HTMLButtonElement;
    private isOpened : boolean = false;

    constructor(panelElement : HTMLElement, buttonElement : HTMLButtonElement) {
        this.panelElement = panelElement;
        this.buttonElement = buttonElement;

        this.buttonElement.addEventListener("click", () => this.onButtonClick());
    }

    private onButtonClick() : void {
        this.isOpened = !this.isOpened;

        if (this.isOpened) {
            this.panelElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
            this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);
        } else {
            this.panelElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPENED_MODIFIER);
            this.buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_OPENED_MODIFIER);
        }
    }
}

export default PanelToggle;