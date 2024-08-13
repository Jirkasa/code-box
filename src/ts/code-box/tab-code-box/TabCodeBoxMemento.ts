import { CodeView } from "../../main";
import CodeBox from "../CodeBox";
import CodeBoxMemento, { CodeViewMementoEntry, FileMementoEntry } from "../CodeBoxMemento";
import TabCodeBox from "./TabCodeBox";

export type TabCodeBoxCodeViewMementoEntry = {
    position : number;
} & CodeViewMementoEntry;

export type TabCodeBoxFileMementoEntry = {
    position: number;
} & FileMementoEntry;

class TabCodeBoxMemento extends CodeBoxMemento {
    private tabCodeBoxCodeViewEntries : TabCodeBoxCodeViewMementoEntry[];
    private tabCodeBoxFileEntries : TabCodeBoxFileMementoEntry[];

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