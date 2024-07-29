import HighlightBox from "../code-view/HighlightBox";
import { CodeView } from "../main";
import CodeBox from "./CodeBox";
import CodeBoxCodeViewManager from "./CodeBoxCodeViewManager";

class CodeBoxCodeView<T extends CodeBox = CodeBox> {
    protected identifier : string;
    protected codeView : CodeView;
    protected codeBox : T | null;

    constructor(identifier : string, codeView : CodeView, codeBox : T, manager : CodeBoxCodeViewManager) {
        this.identifier = identifier;
        this.codeView = codeView;
        this.codeBox = codeBox;

        manager.onIdentifierChange = newIdentifier => this.onIdentifierChange(newIdentifier);
        manager.onUnlinkCodeBox = () => this.onUnlinkCodeBox();
    }

    public getIdentifier() : string | null {
        if (!this.codeBox) return null;
        return this.identifier;
    }

    public changeIdentifier(newIdentifier : string) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeCodeViewIdentifier(this.identifier, newIdentifier);
    }

    public setAsActive() : void {
        if (!this.codeBox) return;
        this.codeBox.setActiveCodeView(this.identifier);
    }

    public remove() : void {
        if (!this.codeBox) return;
        this.codeBox.removeCodeView(this.identifier);
    }

    public reset() : void {
        this.codeView.reset();
    }

    public clone() : CodeView {
        return this.codeView.clone();
    }

    public addHighlight(start : number, end : number = start) : HighlightBox {
        return this.codeView.addHighlight(start, end);
    }

    public removeHighlights(start : number | null = null, end : number | null = start) : void {
        this.codeView.removeHighlights(start, end);
    }

    public getHighlightBoxes(start : number | null = null, end : number | null = start) : Array<HighlightBox> {
        return this.codeView.getHighlightBoxes(start, end);
    }

    public showGutter() : void {
        this.codeView.showGutter();
    }

    public hideGutter() : void {
        this.codeView.hideGutter();
    }

    public showLineNumbers() : void {
        this.codeView.showLineNumbers();
    }

    public hideLineNumbers() : void {
        this.codeView.hideLineNumbers();
    }

    public areLineNumbersVisible() : boolean {
        return this.codeView.areLineNumbersVisible();
    }

    private onIdentifierChange(newIdentifier : string) : void {
        this.identifier = newIdentifier;
    }

    private onUnlinkCodeBox() : void {
        this.codeBox = null;
    }
}

export default CodeBoxCodeView;