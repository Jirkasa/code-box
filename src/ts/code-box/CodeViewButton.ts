import CodeView from "../code-view/CodeView";
import EventSourcePoint from "../utils/EventSourcePoint";

abstract class CodeViewButton {
    private showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>;
    private codeView : CodeView;

    constructor(showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView) {
        this.showCodeViewEventSource = showCodeViewEventSource;
        this.codeView = codeView;
    }

    public abstract appendTo(container : HTMLElement) : void;

    public abstract detach() : void;

    public abstract setText(text : string) : void;

    public abstract setAsActive() : void;

    public abstract setAsInactive() : void;

    public abstract enableTabNavigation() : void;

    public abstract disableTabNavigation() : void;

    protected showCodeView() : void {
        this.showCodeViewEventSource.fire(this, this.codeView);
    }
}

export default CodeViewButton;