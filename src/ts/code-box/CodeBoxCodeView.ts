import CodeViewMemento from "../code-view/CodeViewMemento";
import HighlightBox from "../code-view/HighlightBox";
import { CodeView } from "../main";
import CodeBox from "./CodeBox";
import CodeBoxCodeViewManager from "./CodeBoxCodeViewManager";

/** Represents code view of code box. */
class CodeBoxCodeView<T extends CodeBox = CodeBox> {
    /** Identifier of code view. */
    protected identifier : string;
    /** Code view. */
    protected codeView : CodeView;
    /** Code box to which code view belongs. */
    protected codeBox : T | null;

    /** Line height of code. */
    public readonly lineHeight : number;
    /** Line height unit of code. */
    public readonly lineHeightUnit : string;
    /** Number of lines of code. */
    public readonly linesCount : number;

    /**
     * Creates new code box code view.
     * @param identifier Identifier.
     * @param codeView Code view.
     * @param codeBox Code box to which code view belongs.
     * @param manager Manager of code box code view.
     */
    constructor(identifier : string, codeView : CodeView, codeBox : T, manager : CodeBoxCodeViewManager) {
        this.identifier = identifier;
        this.codeView = codeView;
        this.codeBox = codeBox;

        this.lineHeight = codeView.lineHeight;
        this.lineHeightUnit = codeView.lineHeightUnit;
        this.linesCount = codeView.linesCount;

        manager.onIdentifierChange = newIdentifier => this.onIdentifierChange(newIdentifier);
        manager.onUnlinkCodeBox = () => this.onUnlinkCodeBox();
    }

    /**
     * Returns identifier of code view.
     * @returns Identifier.
     */
    public getIdentifier() : string | null {
        if (!this.codeBox) return null;
        return this.identifier;
    }

    /**
     * Changes identifier of code view.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other code view in code box, it should return false).
     */
    public changeIdentifier(newIdentifier : string) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeCodeViewIdentifier(this.identifier, newIdentifier);
    }

    /**
     * Sets code view as active (displays it in code box).
     */
    public setAsActive() : void {
        if (!this.codeBox) return;
        this.codeBox.setActiveCodeView(this.identifier);
    }

    /**
     * Removes code view from code box.
     */
    public remove() : void {
        if (!this.codeBox) return;
        this.codeBox.removeCodeView(this.identifier);
    }

    /**
     * Resets code view to its initial state.
     */
    public reset() : void {
        this.codeView.reset();
    }

    /**
     * Creates memento.
     * @returns Memento.
     */
    public createMemento() : CodeViewMemento {
        return this.codeView.createMemento();
    }

    /**
     * Applies memento.
     * @param memento Memento.
     */
    public applyMemento(memento : CodeViewMemento) : void {
        this.codeView.applyMemento(memento);
    }

    /**
     * Returns copy of code view.
     * @returns Copy of code view.
     */
    public clone() : CodeView {
        return this.codeView.clone();
    }

    /**
     * Adds new highlight.
     * @param start Start line of highlight.
     * @param end End line of highlight (default is the same as start line).
     * @returns Created highlight box.
     */
    public addHighlight(start : number, end : number = start) : HighlightBox {
        return this.codeView.addHighlight(start, end);
    }

    /**
     * Removes highlights based on passed range (all intersecting highlights are removed).
     * @param start Start line.
     * @param end End line (default is the same as start line).
     */
    public removeHighlights(start : number | null = null, end : number | null = start) : void {
        this.codeView.removeHighlights(start, end);
    }

    /**
     * Returns all highlight boxes in passed range (if no parameters are passed or null is passed, all highlight boxes are returned).
     * @param start Start line.
     * @param end End line (default is the same as start line).
     * @returns Highlight boxes.
     */
    public getHighlightBoxes(start : number | null = null, end : number | null = start) : Array<HighlightBox> {
        return this.codeView.getHighlightBoxes(start, end);
    }

    /**
     * Shows gutter.
     */
    public showGutter() : void {
        this.codeView.showGutter();
    }

    /**
     * Hides gutter.
     */
    public hideGutter() : void {
        this.codeView.hideGutter();
    }

    /**
     * Checks whether gutter is visible.
     * @returns Indicates whether gutter is visible.
     */
    public isGutterVisible() : boolean {
        return this.codeView.isGutterVisible();
    }

    /**
     * Shows line numbers.
     */
    public showLineNumbers() : void {
        this.codeView.showLineNumbers();
    }

    /**
     * Hides line numbers.
     */
    public hideLineNumbers() : void {
        this.codeView.hideLineNumbers();
    }

    /**
     * Checks whether line numbers are visible.
     * @returns Indicates whether line numbers are visible.
     */
    public areLineNumbersVisible() : boolean {
        return this.codeView.areLineNumbersVisible();
    }

    /**
     * Returns displayed code.
     * @returns Displayed code.
     */
    public getCode() : string {
        return this.codeView.getCode();
    }

    /**
     * Called by code view manager when identifier should be changed.
     * @param newIdentifier New identifier.
     */
    private onIdentifierChange(newIdentifier : string) : void {
        this.identifier = newIdentifier;
    }

    /**
     * Called by code view manager when code view should be unlinked from code box.
     */
    private onUnlinkCodeBox() : void {
        this.codeBox = null;
    }
}

export default CodeBoxCodeView;