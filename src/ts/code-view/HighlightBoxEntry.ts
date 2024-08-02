import HighlightBox from "./HighlightBox";
import HighlightBoxManager from "./HighlightBoxManager";

/** Used internally by CodeView to store highlight box. */
class HighlightBoxEntry {
    /** Highlight box. */
    public readonly highlightBox : HighlightBox;
    /** Highlight box manager. */
    public readonly highlightBoxManager : HighlightBoxManager;

    /**
     * Creates new highlight box entry.
     * @param highlightBox Highlight box.
     * @param highlightBoxManager Highlight box manager.
     */
    constructor(highlightBox : HighlightBox, highlightBoxManager : HighlightBoxManager) {
        this.highlightBox = highlightBox;
        this.highlightBoxManager = highlightBoxManager;
    }
}

export default HighlightBoxEntry;