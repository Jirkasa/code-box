import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeViewButton from "../CodeViewButton";
import TabCodeBoxCodeView from "./TabCodeBoxCodeView";

/** Used internally by TabCodeBox to store code view. */
class CodeViewEntry {
    /** Code box code view. */
    public readonly codeBoxCodeView : TabCodeBoxCodeView;
    /** Code box code view manager. */
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    /** Code view button. */
    public readonly codeViewButton : CodeViewButton;
    /** Position of code view button. */
    public position : number;

    /**
     * Creates new code view entry.
     * @param codeBoxCodeView Code box code view.
     * @param codeBoxCodeViewManager Code box code view manager.
     * @param codeViewButton Code view button.
     * @param position Position of code view button.
     */
    constructor(codeBoxCodeView : TabCodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager, codeViewButton : CodeViewButton, position : number) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
        this.codeViewButton = codeViewButton;
        this.position = position;
    }
}

export default CodeViewEntry;