import CodeView from "./CodeView";
import CSSClasses from "../CSSClasses";

class HighlightBox {
    private readonly element : HTMLElement;
    public readonly codeView : CodeView;
    private start : number;
    private end : number;

    constructor(container : HTMLElement, start : number, end : number, codeView : CodeView) { // todo - potom si vzít příklad z CodeBoxCodeView a nějak to detachování propojit, ať to v CodeView nestraší
        this.start = Math.min(Math.max(Math.trunc(start), 1), codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), codeView.linesCount), this.start);
        this.codeView = codeView;

        this.element = document.createElement("div");
        this.element.classList.add(CSSClasses.CODE_VIEW_HIGHLIGHT_BOX);
        this.setRange(this.start, this.end);

        container.appendChild(this.element);
    }

    public detach() : void {
        this.element.remove();
    }

    public getElement() : HTMLElement { // todo - toto asi není úplně nejlepší nápad - možná si vzít příklad z CodeBoxCodeView třídy - tady tímto by to uživatel mohl nějak rozbít
        return this.element;
    }

    public getStart() : number {
        return this.start;
    }

    public getEnd() : number {
        return this.end;
    }

    public setRange(start : number, end : number = start) : void {
        this.start = Math.min(Math.max(Math.trunc(start), 1), this.codeView.linesCount);
        this.end = Math.max(Math.min(Math.trunc(end), this.codeView.linesCount), this.start);

        this.element.style.transform = `translateY(${this.codeView.lineHeight * (this.start-1)}${this.codeView.lineHeightUnit})`;
        this.element.style.height = `${this.codeView.lineHeight * (this.end-this.start+1)}${this.codeView.lineHeightUnit}`;
    }
}

export default HighlightBox;