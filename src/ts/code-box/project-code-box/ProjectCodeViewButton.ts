import CSSClasses from "../../CSSClasses";
import CodeView from "../../code-view/CodeView";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import ElementCodeViewButton from "../ElementCodeViewButton";

/** Represents code view button for project code box. */
class ProjectCodeViewButton extends ElementCodeViewButton {
    /** Text element of button. */
    private textElement : HTMLElement;

    /**
     * Creates new code view button.
     * @param text Text of button.
     * @param showCodeViewEventSource Event source for which will be fired event when code view to which the button belongs to should be set as active.
     * @param codeView Code view to which the button belongs to.
     * @param svgSpritePath Path to SVG sprite.
     * @param iconName Name of icon for button.
     */
    constructor(text : string, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView, svgSpritePath : string | null = null, iconName : string | null = null) {
        super(showCodeViewEventSource, codeView);

        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FILE_MODIFIER);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        this.textElement = document.createElement("div");
        this.textElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        this.textElement.innerText = text;
        this.buttonElement.appendChild(this.textElement);
    }

    public setText(text: string) : void {
        this.textElement.innerText = text;
    }

    public setAsActive() : void {
        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ACTIVE_MODIFIER);
    }

    public setAsInactive() : void {
        this.buttonElement.classList.remove(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ACTIVE_MODIFIER);
    }
}

export default ProjectCodeViewButton;