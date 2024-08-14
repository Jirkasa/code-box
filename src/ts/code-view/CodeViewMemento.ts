import CodeView from "./CodeView";

/** Represents saved state of code view. */
class CodeViewMemento {
    /** Stores whether gutter was shown when memento was created. */
    private showGutter : boolean;
    /** Stores whether line numbers were shown when memento was created. */
    private showLineNumbers : boolean;
    /** Stores ranges of highlights displayed in code view when memento was created. */
    private highlights = new Array<[number, number]>();

    /**
     * Creates new code view memento.
     * @param codeView Code view based on which should be memento created.
     */
    constructor(codeView : CodeView) {
        this.showGutter = codeView.isGutterVisible();
        this.showLineNumbers = codeView.areLineNumbersVisible();

        for (let highlightBox of codeView.getHighlightBoxes()) {
            this.highlights.push([highlightBox.getStart(), highlightBox.getEnd()]);
        }
    }

    /**
     * Applies memento to code view.
     * @param codeView Code view.
     */
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