import CodeView from "../../code-view/CodeView";
import CSSClasses from "../../CSSClasses";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import ElementCodeViewButton from "../ElementCodeViewButton";

/** Represents code view button for tab code box. */
class TabCodeViewButton extends ElementCodeViewButton {
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

        this.buttonElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        this.textElement = document.createElement("div");
        this.textElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_TEXT);
        this.textElement.innerText = text;
        this.buttonElement.appendChild(this.textElement);
    }

    public setText(text: string) : void {
        this.textElement.innerText = text;
    }

    public setAsActive() : void {
        this.buttonElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_ACTIVE_MODIFIER);
    }

    public setAsInactive() : void {
        this.buttonElement.classList.remove(CSSClasses.TAB_CODE_BOX_TAB_ACTIVE_MODIFIER);
    }
}

export default TabCodeViewButton;