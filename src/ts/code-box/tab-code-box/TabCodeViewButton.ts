import CodeView from "../../code-view/CodeView";
import CSSClasses from "../../CSSClasses";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import ElementCodeViewButton from "../ElementCodeViewButton";

class TabCodeViewButton extends ElementCodeViewButton {
    constructor(text : string, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView, svgSpritePath : string | null = null, iconName : string | null = null) {
        super(showCodeViewEventSource, codeView);

        this.buttonElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        const textElement = document.createElement("div");
        textElement.innerText = text;
        textElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_TEXT);
        this.buttonElement.appendChild(textElement);
    }

    public setAsActive() : void {
        this.buttonElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_ACTIVE_MODIFIER);
    }

    public setAsInactive() : void {
        this.buttonElement.classList.remove(CSSClasses.TAB_CODE_BOX_TAB_ACTIVE_MODIFIER);
    }
}

export default TabCodeViewButton;