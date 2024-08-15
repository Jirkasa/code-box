import { CodeView } from "../../main";
import CodeBox from "../CodeBox";
import CodeBoxMemento, { CodeViewMementoEntry, FileMementoEntry } from "../CodeBoxMemento";
import TabCodeBox from "./TabCodeBox";

/** Code view entry for tab code box memento. */
export type TabCodeBoxCodeViewMementoEntry = {
    /** Position of code view button. */
    position : number;
} & CodeViewMementoEntry;

/** File entry for tab code box memento. */
export type TabCodeBoxFileMementoEntry = {
    /** Position of file button. */
    position: number;
} & FileMementoEntry;

/** Represents saved state of tab code box. */
class TabCodeBoxMemento extends CodeBoxMemento {
    /** Code view entries (code views in code box when memento was created). */
    private tabCodeBoxCodeViewEntries : TabCodeBoxCodeViewMementoEntry[];
    /** File entries (files in code box when memento was created). */
    private tabCodeBoxFileEntries : TabCodeBoxFileMementoEntry[];

    /**
     * Creates new tab code box memento.
     * @param creator Code box based on which the memento is created.
     * @param addCodeViewToCreatorCodeBox Function to add code view without making copy to code box based on which the memento was created.
     * @param codeViewEntries Code view entries.
     * @param fileEntries File entries.
     * @param activeCodeView Active code view.
     */
    constructor(creator: TabCodeBox, addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void, codeViewEntries : TabCodeBoxCodeViewMementoEntry[], fileEntries : TabCodeBoxFileMementoEntry[], activeCodeView : CodeView | null) {
        super(creator, addCodeViewToCreatorCodeBox, codeViewEntries, fileEntries, activeCodeView);
        this.tabCodeBoxCodeViewEntries = codeViewEntries;
        this.tabCodeBoxFileEntries = fileEntries;
    }

    public apply(codeBox : CodeBox) : void {
        super.apply(codeBox);
        if (!(codeBox instanceof TabCodeBox)) return;

        for (let entry of this.tabCodeBoxCodeViewEntries) {
            codeBox.setCodeViewButtonPosition(entry.identifier, entry.position);
        }
        for (let entry of this.tabCodeBoxFileEntries) {
            codeBox.setFileButtonPosition(entry.identifier, entry.position);
        }
    }
}

export default TabCodeBoxMemento;