import HighlightBox from "./HighlightBox";
import HighlightBoxManager from "./HighlightBoxManager";

class HighlightBoxEntry {
    public readonly highlightBox : HighlightBox;
    public readonly highlightBoxManager : HighlightBoxManager;

    constructor(highlightBox : HighlightBox, highlightBoxManager : HighlightBoxManager) {
        this.highlightBox = highlightBox;
        this.highlightBoxManager = highlightBoxManager;
    }
}

export default HighlightBoxEntry;