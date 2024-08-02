import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import ProjectCodeBoxCodeView from "./ProjectCodeBoxCodeView";

/** Used internally by ProjectCodeBox to store code view. */
class CodeViewEntry {
    /** Code box code view. */
    public readonly codeBoxCodeView : ProjectCodeBoxCodeView;
    /** Code box code view manager. */
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    
    /**
     * Creates new code view entry.
     * @param codeBoxCodeView Code box code view.
     * @param codeBoxCodeViewManager Code box code view manager.
     */
    constructor(codeBoxCodeView : ProjectCodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
    }
}

export default CodeViewEntry;