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

    constructor(creator : CodeBox, codeViewEntries : CodeViewMementoEntry[], fileEntries : FileMementoEntry[], activeCodeView : CodeView | null) {
        this.creator = creator;
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
            let codeView = codeBox === this.creator ? codeViewEntry.codeView : codeViewEntry.codeView.clone();
            codeView.applyMemento(codeViewEntry.codeViewMemento);
            codeBox.addCodeView(codeViewEntry.identifier, codeView);

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