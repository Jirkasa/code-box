import CSSClasses from "../../CSSClasses";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";

class ProjectMultiElementCodeViewButton extends CodeViewButton {
    private buttonElements : HTMLButtonElement[];
    private textElements : HTMLElement[];
    private currentButtonElementIndex : number = 0;
    private isActive : boolean = false;
    private text : string;
    private svgSpritePath : string | null;
    private iconName : string | null;

    constructor(text : string,  showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView, svgSpritePath : string | null = null, iconName : string | null = null) {
        super(showCodeViewEventSource, codeView);

        this.buttonElements = new Array<HTMLButtonElement>();
        this.textElements = new Array<HTMLElement>();
        this.text = text;
        this.svgSpritePath = svgSpritePath;
        this.iconName = iconName;
    }

    public appendTo(container : HTMLElement) : void {
        let buttonElement : HTMLButtonElement | undefined = this.buttonElements[this.currentButtonElementIndex];

        if (!buttonElement) {
            buttonElement = this.createButtonElement();
            if (this.isActive) {
                buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ACTIVE_MODIFIER);
            }
            buttonElement.addEventListener("click", () => this.showCodeView());
            this.buttonElements.push(buttonElement);
        }

        container.appendChild(buttonElement);

        this.currentButtonElementIndex++;
    }

    public detach() : void {
        for (let buttonElement of this.buttonElements) {
            buttonElement.remove();
        }
        this.currentButtonElementIndex = 0;
    }

    public setText(text: string) : void {
        this.text = text;
        for (let textElement of this.textElements) {
            textElement.innerText = text;
        }
    }
    
    public setAsActive() : void {
        for (let buttonElement of this.buttonElements) {
            buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ACTIVE_MODIFIER);
        }
    }

    public setAsInactive() : void {
        for (let buttonElement of this.buttonElements) {
            buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ACTIVE_MODIFIER);
        }
    }

    public enableTabNavigation(parentElement : HTMLElement | null) : void {
        for (let buttonElement of this.buttonElements) {
            if (parentElement !== null && buttonElement.parentElement !== parentElement) continue;
            buttonElement.setAttribute("tabindex", "0");
        }
    }

    public disableTabNavigation(parentElement : HTMLElement | null) : void {
        for (let buttonElement of this.buttonElements) {
            if (parentElement !== null && buttonElement.parentElement !== parentElement) continue;
            buttonElement.setAttribute("tabindex", "-1");
        }
    }

    private createButtonElement() : HTMLButtonElement {
        const buttonElement = document.createElement("button");

        buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FILE_MODIFIER);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (this.svgSpritePath && this.iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(this.svgSpritePath, this.iconName);
        }
        buttonElement.appendChild(iconElement);

        const textElement = document.createElement("div");
        textElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        textElement.innerText = this.text;
        buttonElement.appendChild(textElement);
        this.textElements.push(textElement);

        return buttonElement;
    }
}

export default ProjectMultiElementCodeViewButton;