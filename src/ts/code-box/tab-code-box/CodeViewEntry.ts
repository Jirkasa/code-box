import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeViewButton from "../CodeViewButton";

class CodeViewEntry { // todo - možná tady ty věci nebudou readonly - používá to jen TabCodeBox a ten to může chtít změnit
    public readonly codeBoxCodeView : CodeBoxCodeView;
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    public readonly codeViewButton : CodeViewButton;

    constructor(codeBoxCodeView : CodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager, codeViewButton : CodeViewButton) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
        this.codeViewButton = codeViewButton;
    }
}

export default CodeViewEntry;