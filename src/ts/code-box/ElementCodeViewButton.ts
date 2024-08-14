import CodeView from "../code-view/CodeView";
import EventSourcePoint from "../utils/EventSourcePoint";
import CodeViewButton from "./CodeViewButton";

/** Represents code view button as button element. */
abstract class ElementCodeViewButton extends CodeViewButton {
    /** HTML Button element. */
    protected buttonElement : HTMLButtonElement;

    /**
     * Creates new code view button.
     * @param showCodeViewEventSource Event source for which will be fired event when code view to which the button belongs to should be set as active.
     * @param codeView Code view to which the button belongs to.
     */
    constructor(showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView) {
        super(showCodeViewEventSource, codeView);

        this.buttonElement = document.createElement("button");

        this.buttonElement.addEventListener("click", () => this.showCodeView());
    }

    public appendTo(container : HTMLElement) : void {
        container.appendChild(this.buttonElement);
    }

    public detach() : void {
        this.buttonElement.remove();
    }

    public enableTabNavigation() : void {
        this.buttonElement.setAttribute("tabindex", "0");
    }

    public disableTabNavigation() : void {
        this.buttonElement.setAttribute("tabindex", "-1");
    }
}

export default ElementCodeViewButton;