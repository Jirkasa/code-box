import CodeViewMemento from "../code-view/CodeViewMemento";
import { CodeView } from "../main";
import CodeBox from "./CodeBox";

export type CodeViewMementoEntry = {
    codeView : CodeView;
    identifier : string;
    codeViewMemento : CodeViewMemento;
}

export type FileMementoEntry = {
    downloadLink : string | null;
    identifier : string;
}

class CodeBoxMemento {
    private creator : CodeBox;
    private codeViewEntries : CodeViewMementoEntry[];
    private fileEntries : FileMementoEntry[];
    private activeCodeView : CodeView | null;
    private addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void;

    constructor(creator : CodeBox, addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void, codeViewEntries : CodeViewMementoEntry[], fileEntries : FileMementoEntry[], activeCodeView : CodeView | null) {
        this.creator = creator;
        this.addCodeViewToCreatorCodeBox = addCodeViewToCreatorCodeBox;
        this.codeViewEntries = codeViewEntries;
        this.fileEntries = fileEntries;
        this.activeCodeView = activeCodeView;
    }

    protected getCreator() : CodeBox {
        return this.creator;
    }

    public apply(codeBox : CodeBox) {
        codeBox.removeAllCodeViews();
        codeBox.removeAllFiles();

        for (let codeViewEntry of this.codeViewEntries) {
            if (codeBox === this.creator) {
                codeViewEntry.codeView.applyMemento(codeViewEntry.codeViewMemento);
                this.addCodeViewToCreatorCodeBox(codeViewEntry.identifier, codeViewEntry.codeView);
            } else {
                codeBox.addCodeView(codeViewEntry.identifier, codeViewEntry.codeView);
                const codeView = codeBox.getCodeView(codeViewEntry.identifier);
                codeView?.applyMemento(codeViewEntry.codeViewMemento);
            }

            if (this.activeCodeView === codeViewEntry.codeView) {
                codeBox.setActiveCodeView(codeViewEntry.identifier);
            }
        }

        for (let fileEntry of this.fileEntries) {
            codeBox.addFile(fileEntry.identifier, fileEntry.downloadLink);
        }
    }
}

export default CodeBoxMemento;