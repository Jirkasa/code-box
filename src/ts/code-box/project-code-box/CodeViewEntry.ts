import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";

class CodeViewEntry {
    public readonly codeBoxCodeView : CodeBoxCodeView;
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    
    constructor(codeBoxCodeView : CodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
    }
}

export default CodeViewEntry;