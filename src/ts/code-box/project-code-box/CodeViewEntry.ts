import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import ProjectCodeBoxCodeView from "./ProjectCodeBoxCodeView";

class CodeViewEntry {
    public readonly codeBoxCodeView : ProjectCodeBoxCodeView;
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    
    constructor(codeBoxCodeView : ProjectCodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
    }
}

export default CodeViewEntry;