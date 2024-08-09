import CodeView from "./CodeView";

class CodeViewMemento {
    private showGutter : boolean;
    private showLineNumbers : boolean;
    private highlights = new Array<[number, number]>();

    constructor(codeView : CodeView) {
        this.showGutter = codeView.isGutterVisible();
        this.showLineNumbers = codeView.areLineNumbersVisible();

        for (let highlightBox of codeView.getHighlightBoxes()) {
            this.highlights.push([highlightBox.getStart(), highlightBox.getEnd()]);
        }
    }

    public apply(codeView : CodeView) {
        if (this.showGutter) {
            codeView.showGutter();
        } else {
            codeView.hideGutter();
        }
        if (this.showLineNumbers) {
            codeView.showLineNumbers();
        } else {
            codeView.hideLineNumbers();
        }
        codeView.removeHighlights();
        for (let highlight of this.highlights) {
            codeView.addHighlight(highlight[0], highlight[1]);
        }
    }
}

export default CodeViewMemento;