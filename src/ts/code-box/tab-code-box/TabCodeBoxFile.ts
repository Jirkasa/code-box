import CodeBoxFile from "../CodeBoxFile";
import TabCodeBox from "./TabCodeBox";

class TabCodeBoxFile extends CodeBoxFile<TabCodeBox> {
    public getButtonPosition() : number | null {
        if (!this.codeBox) return null;
        return this.codeBox.getFileButtonPosition(this.identifier);
    }

    public setButtonPosition(position: number) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.setFileButtonPosition(this.identifier, position);
    }
}

export default TabCodeBoxFile;