import { CodeView } from "../../main";
import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";

/** Used internally by VirtualCodeBox to store code view. */
class CodeViewEntry {
    /** Code box code view. */
    public readonly codeBoxCodeView : CodeBoxCodeView;
    /** Code view. */
    public readonly codeView : CodeView;
    /** Code box code view manager. */
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;

    /**
     * Creates new code view entry.
     * @param codeBoxCodeView Code box code view.
     * @param codeView Code view.
     * @param codeBoxCodeViewManager Code box code view manager.
     */
    constructor(codeBoxCodeView : CodeBoxCodeView, codeView : CodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeView = codeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
    }
}

export default CodeViewEntry;