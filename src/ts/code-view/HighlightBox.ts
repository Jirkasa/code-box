import CodeView from "./CodeView";
import CSSClasses from "../CSSClasses";
import HighlightBoxManager from "./HighlightBoxManager";
import EventSourcePoint from "../utils/EventSourcePoint";

/** Represents highlight in code view. */
class HighlightBox {
    /** Highlight element. */
    private readonly element : HTMLElement;
    /** Code view to which the highlight belongs. */
    private codeView : CodeView | null;
    /** Event source that is used to fire event when remove method is called. */
    private removeHighlightBoxEventSource : EventSourcePoint<HighlightBox, HighlightBox>;
    /** Start line of highlight. */
    private start : number;
    /** End line of highlight. */
    private end : number;

    /**
     * Creates new highlight box.
     * @param container Element into which should be added highlight element.
     * @param start Start line of highlight.
     * @param end End line of highlight.
     * @param codeView Code view to which the highlight belongs.
     * @param removeHighlightBoxEventSource Event source to be used to fire event when remove method is called.
     * @param manager Manager of highlight box.
     */
    constructor(container : HTMLElement, start : number, end : number, codeView : CodeView, removeHighlightBoxEventSource : EventSourcePoint<HighlightBox, HighlightBox>, manager : HighlightBoxManager) {
        this.codeView = codeView;
        this.removeHighlightBoxEventSource = removeHighlightBoxEventSource;
        this.start = Math.min(Math.max(Math.trunc(start), 1), codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), codeView.linesCount), this.start);

        this.element = document.createElement("div");
        this.element.classList.add(CSSClasses.CODE_VIEW_HIGHLIGHT_BOX);
        this.setRange(this.start, this.end);

        manager.onDetach = () => this.onDetach();
        manager.onUnlinkCodeView = () => this.onUnlinkCodeView();

        container.appendChild(this.element);
    }

    /**
     * Returns start line of highlight.
     * @returns Start line of highlight.
     */
    public getStart() : number {
        return this.start;
    }

    /**
     * Returns end line of highlight.
     * @returns End line of highlight.
     */
    public getEnd() : number {
        return this.end;
    }

    /**
     * Sets new range for highlight.
     * @param start Start line.
     * @param end End line.
     */
    public setRange(start : number, end : number = start) : void {
        if (!this.codeView) return;

        this.start = Math.min(Math.max(Math.trunc(start), 1), this.codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), this.codeView.linesCount), this.start);

        this.element.style.transform = `translateY(${this.codeView.lineHeight * (this.start-1)}${this.codeView.lineHeightUnit})`;
        this.element.style.height = `${this.codeView.lineHeight * (this.end-this.start+1)}${this.codeView.lineHeightUnit}`;
    }

    /**
     * Removes highlight.
     */
    public remove() : void {
        if (!this.codeView) return;

        this.removeHighlightBoxEventSource.fire(this, this);
    }

    /**
     * Called by highlight box manager to detach highlight.
     */
    private onDetach() : void {
        this.element.remove();
    }

    /**
     * Called by highlight box manager to unlink code view.
     */
    private onUnlinkCodeView() : void {
        this.codeView = null;
    }
}

export default HighlightBox;