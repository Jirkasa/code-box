import CodeView from "./CodeView";
import CSSClasses from "../CSSClasses";
import HighlightBoxManager from "./HighlightBoxManager";
import EventSourcePoint from "../utils/EventSourcePoint";

class HighlightBox {
    private readonly element : HTMLElement;
    private codeView : CodeView | null;
    private start : number;
    private end : number;
    private removeHighlightBoxEventSource : EventSourcePoint<HighlightBox, HighlightBox>;

    // todo - předávat EventSourcePoint pro odstranění highlight boxu
    constructor(container : HTMLElement, start : number, end : number, codeView : CodeView, removeHighlightBoxEventSource : EventSourcePoint<HighlightBox, HighlightBox>, manager : HighlightBoxManager) { // todo - potom si vzít příklad z CodeBoxCodeView a nějak to detachování propojit, ať to v CodeView nestraší
        this.start = Math.min(Math.max(Math.trunc(start), 1), codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), codeView.linesCount), this.start);
        this.codeView = codeView;
        this.removeHighlightBoxEventSource = removeHighlightBoxEventSource;

        this.element = document.createElement("div");
        this.element.classList.add(CSSClasses.CODE_VIEW_HIGHLIGHT_BOX);
        this.setRange(this.start, this.end);

        manager.onDetach = () => this.onDetach();
        manager.onUnlinkCodeView = () => this.onUnlinkCodeView();

        container.appendChild(this.element);
    }

    // public detach() : void {
    //     this.element.remove();
    // }

    // public getElement() : HTMLElement { // todo - toto asi není úplně nejlepší nápad - možná si vzít příklad z CodeBoxCodeView třídy - tady tímto by to uživatel mohl nějak rozbít
    //     return this.element;
    // }

    public getStart() : number {
        return this.start;
    }

    public getEnd() : number {
        return this.end;
    }

    public setRange(start : number, end : number = start) : void {
        if (!this.codeView) return;

        this.start = Math.min(Math.max(Math.trunc(start), 1), this.codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), this.codeView.linesCount), this.start);

        this.element.style.transform = `translateY(${this.codeView.lineHeight * (this.start-1)}${this.codeView.lineHeightUnit})`;
        this.element.style.height = `${this.codeView.lineHeight * (this.end-this.start+1)}${this.codeView.lineHeightUnit}`;
    }

    public remove() : void {
        if (!this.codeView) return;
        
        this.removeHighlightBoxEventSource.fire(this, this);
    }

    private onDetach() : void {
        this.element.remove();
    }

    private onUnlinkCodeView() : void {
        this.codeView = null;
    }
}

export default HighlightBox;