import CodeView from "../code-view/CodeView";
import EventSourcePoint from "../utils/EventSourcePoint";
import CodeViewButton from "./CodeViewButton";

abstract class ElementCodeViewButton extends CodeViewButton {
    protected buttonElement : HTMLButtonElement;

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
}

export default ElementCodeViewButton;