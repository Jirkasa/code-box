import CodeView from "../code-view/CodeView";
import EventSourcePoint from "../utils/EventSourcePoint";

/** Represents code view button. */
abstract class CodeViewButton {
    /** Event source for which is fired event when code view to which the button belongs to should be set as active. */
    private showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>;
    /** Code view to which the button belongs to. */
    private codeView : CodeView;

    /**
     * Creates new code view button.
     * @param showCodeViewEventSource Event source for which will be fired event when code view to which the button belongs to should be set as active.
     * @param codeView Code view to which the button belongs to.
     */
    constructor(showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, codeView : CodeView) {
        this.showCodeViewEventSource = showCodeViewEventSource;
        this.codeView = codeView;
    }

    /**
     * Appends button to element.
     * @param container Element to append button to.
     */
    public abstract appendTo(container : HTMLElement) : void;

    /**
     * Detaches button from its parent element.
     */
    public abstract detach() : void;

    /**
     * Sets text of button.
     * @param text Text.
     */
    public abstract setText(text : string) : void;

    /**
     * Displays button as active.
     */
    public abstract setAsActive() : void;

    /**
     * Displays button as inactive.
     */
    public abstract setAsInactive() : void;

    /**
     * Enables tab navigation.
     */
    public abstract enableTabNavigation() : void;

    /**
     * Disables tab navigation.
     */
    public abstract disableTabNavigation() : void;

    /**
     * Fires event to show code view to which the button belongs to.
     */
    protected showCodeView() : void {
        this.showCodeViewEventSource.fire(this, this.codeView);
    }
}

export default CodeViewButton;