import HighlightBox from "../code-view/HighlightBox";
import { CodeView } from "../main";
import CodeBox from "./CodeBox";

class CodeBoxCodeView {
    private identifier : string;
    private codeView : CodeView;
    private codeBox : CodeBox;

    constructor(identifier : string, codeView : CodeView, codeBox : CodeBox) {
        this.identifier = identifier;
        this.codeView = codeView;
        this.codeBox = codeBox;
    }

    public getIdentifier() : string {
        return this.identifier;
    }

    public changeIdentifier(newIdentifier : string) : boolean {
        const success = this.codeBox.changeCodeViewIdentifier(this.identifier, newIdentifier);
        if (success) this.identifier = newIdentifier;
        return success;
    }

    public setAsActive() : void {
        this.codeBox.setActiveCodeView(this.identifier);
    }

    public remove() : void {
        this.codeBox.removeCodeView(this.identifier);
    }

    public reset() : void {
        this.codeView.reset();
    }

    public clone() : CodeView {
        return this.codeView.clone();
    }

    public addHighlight(start : number, end : number = start) : void { // todo - toto by mohlo zároveň i vracet ten HighlightBox - asi jo, asi to tak udělám, bude to lepší
        this.codeView.addHighlight(start, end);
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
}

export default CodeBoxCodeView;