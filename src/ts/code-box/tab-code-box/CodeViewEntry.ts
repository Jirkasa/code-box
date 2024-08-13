import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeViewButton from "../CodeViewButton";
import TabCodeBoxCodeView from "./TabCodeBoxCodeView";

class CodeViewEntry { // todo - možná tady ty věci nebudou readonly - používá to jen TabCodeBox a ten to může chtít změnit
    public readonly codeBoxCodeView : TabCodeBoxCodeView;
    public readonly codeBoxCodeViewManager : CodeBoxCodeViewManager;
    public readonly codeViewButton : CodeViewButton;
    public position : number;

    constructor(codeBoxCodeView : TabCodeBoxCodeView, codeBoxCodeViewManager : CodeBoxCodeViewManager, codeViewButton : CodeViewButton, position : number) {
        this.codeBoxCodeView = codeBoxCodeView;
        this.codeBoxCodeViewManager = codeBoxCodeViewManager;
        this.codeViewButton = codeViewButton;
        this.position = position;
    }
}

export default CodeViewEntry;