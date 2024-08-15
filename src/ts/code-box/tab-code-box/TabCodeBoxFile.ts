import CodeBoxFile from "../CodeBoxFile";
import TabCodeBox from "./TabCodeBox";

/** Represents file of tab code box. */
class TabCodeBoxFile extends CodeBoxFile<TabCodeBox> {
    /**
     * Returns position of file button.
     * @returns Position of file button starting from 0.
     */
    public getButtonPosition() : number | null {
        if (!this.codeBox) return null;
        return this.codeBox.getFileButtonPosition(this.identifier);
    }

    /**
     * Changes position of file button by swapping it with different code view or file button.
     * @param position Position of code view or file button (starting from 0) with which should be file button swapped.
     * @returns Indicates whether position has been successfully changed.
     */
    public setButtonPosition(position: number) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.setFileButtonPosition(this.identifier, position);
    }
}

export default TabCodeBoxFile;