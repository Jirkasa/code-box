import CodeBoxCodeView from "../CodeBoxCodeView";
import TabCodeBox from "./TabCodeBox";

/** Represents code view of tab code box. */
class TabCodeBoxCodeView extends CodeBoxCodeView<TabCodeBox> {
    /**
     * Returns position of code view button.
     * @returns Position of code view button starting from 0.
     */
    public getButtonPosition() : number | null {
        if (!this.codeBox) return null;
        return this.codeBox.getCodeViewButtonPosition(this.identifier);
    }

    /**
     * Changes position of code view button by swapping it with different code view or file button.
     * @param position Position of code view or file button (starting from 0) with which should be code view button swapped.
     * @returns Indicates whether position has been successfully changed.
     */
    public setButtonPosition(position: number) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.setCodeViewButtonPosition(this.identifier, position);
    }
}

export default TabCodeBoxCodeView;