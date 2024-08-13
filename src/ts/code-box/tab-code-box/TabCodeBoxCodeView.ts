import CodeBoxCodeView from "../CodeBoxCodeView";
import TabCodeBox from "./TabCodeBox";

class TabCodeBoxCodeView extends CodeBoxCodeView<TabCodeBox> {
    public getButtonPosition() : number | null {
        if (!this.codeBox) return null;
        return this.codeBox.getCodeViewButtonPosition(this.identifier);
    }

    public setButtonPosition(position: number) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.setCodeViewButtonPosition(this.identifier, position);
    }
}

export default TabCodeBoxCodeView;