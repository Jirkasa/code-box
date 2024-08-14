import CodeViewMemento from "../code-view/CodeViewMemento";
import { CodeView } from "../main";
import CodeBox from "./CodeBox";

/** Code view entry for code box memento. */
export type CodeViewMementoEntry = {
    /** Code view. */
    codeView : CodeView;
    /** Identifier. */
    identifier : string;
    /** Code view memento. */
    codeViewMemento : CodeViewMemento;
}

/** File entry for code box memento. */
export type FileMementoEntry = {
    /** Download link or null. */
    downloadLink : string | null;
    /** Identifier. */
    identifier : string;
}

/** Represents saved state of code box. */
class CodeBoxMemento {
    /** Code box based on which memento was created. */
    private creator : CodeBox;
    /** Code view entries (code views in code box when memento was created). */
    private codeViewEntries : CodeViewMementoEntry[];
    /** File entries (files in code box when memento was created). */
    private fileEntries : FileMementoEntry[];
    /** Stores reference to code view that was active when memento was created. */
    private activeCodeView : CodeView | null;
    /** Function to add code view without making copy to code box based on which the memento was created. */
    private addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void;

    /**
     * Creates new code box memento.
     * @param creator Code box based on which the memento is created.
     * @param addCodeViewToCreatorCodeBox Function to add code view without making copy to code box based on which the memento was created.
     * @param codeViewEntries Code view entries.
     * @param fileEntries File entries.
     * @param activeCodeView Active code view.
     */
    constructor(creator : CodeBox, addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void, codeViewEntries : CodeViewMementoEntry[], fileEntries : FileMementoEntry[], activeCodeView : CodeView | null) {
        this.creator = creator;
        this.addCodeViewToCreatorCodeBox = addCodeViewToCreatorCodeBox;
        this.codeViewEntries = codeViewEntries;
        this.fileEntries = fileEntries;
        this.activeCodeView = activeCodeView;
    }

    /**
     * Returns code box, based on which the memento was created.
     * @returns Code box based on which the memento was created.
     */
    protected getCreator() : CodeBox {
        return this.creator;
    }

    /**
     * Applies memento to code box.
     * @param codeBox Code box.
     */
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