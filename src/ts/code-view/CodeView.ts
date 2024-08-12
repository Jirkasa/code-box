import CodeViewOptions from "./CodeViewOptions";
import CSSClasses from "../CSSClasses";
import GlobalConfig from "../GlobalConfig";
import HighlightBox from "./HighlightBox";
import { createCodeViewOptionsCopy, deleteEmptyStringFromArray } from "../utils/utils";
import HighlightBoxEntry from "./HighlightBoxEntry";
import HighlightBoxManager from "./HighlightBoxManager";
import EventSourcePoint from "../utils/EventSourcePoint";
import CodeViewMemento from "./CodeViewMemento";

/** Represents component displaying a code example. */
class CodeView {
    /** Initial options. */
    private initialOptions : CodeViewOptions;
    /** Root element of code view. */
    private rootElement : HTMLElement;
    /** Gutter element (container for line numbers). */
    private gutterElement : HTMLElement;
    /** Container element. */
    private containerElement : HTMLElement;
    /** Line number elements. */
    private lineNumberElements : HTMLElement[];
    /** Pre element. */
    private preElement : HTMLPreElement;
    /** Indicates whether line numbers are visible. */
    private lineNumberElementsVisible : boolean;
    /** Stores highlight boxes along with their managers. */
    private highlightBoxEntries = new Array<HighlightBoxEntry>();
    /** Event source to remove highlight box. */
    private removeHighlightBoxEventSource = new EventSourcePoint<HighlightBox, HighlightBox>();
    /** Line height of code. */
    public readonly lineHeight : number;
    /** Line height unit of code. */
    public readonly lineHeightUnit : string;
    /** Number of lines of code. */
    public readonly linesCount : number;

    /**
     * Creates new code view.
     * @param element Pre element with code element child.
     * @param options Code view options.
     */
    constructor(element : HTMLPreElement, options : CodeViewOptions = {}) {
        if (!(element instanceof HTMLPreElement)) throw new Error("Passed element is not pre element.");

        this.preElement = element;
        this.initialOptions = createCodeViewOptionsCopy(options);

        this.fillOptionsFromDataset(this.initialOptions, element.dataset);

        if (this.initialOptions.cssClasses) {
            deleteEmptyStringFromArray(this.initialOptions.cssClasses);
        }

        const codeElement = this.getCodeElement(element);
        
        this.lineHeight = this.initialOptions.lineHeight || GlobalConfig.DEFAULT_LINE_HEIGHT;
        this.lineHeightUnit = this.initialOptions.lineHeightUnit || GlobalConfig.DEFAULT_LINE_HEIGHT_UNIT;
        
        codeElement.style.lineHeight = this.lineHeight.toString() + this.lineHeightUnit;
        this.linesCount = this.getLinesCount(codeElement);
        
        // create root element and insert it before pre element
        this.rootElement = document.createElement("div");
        this.rootElement.classList.add(CSSClasses.CODE_VIEW);
        if (element.parentElement) {
            element.parentElement.insertBefore(this.rootElement, element);
        }
        this.rootElement.innerHTML = "";

        // create gutter element
        this.gutterElement = document.createElement("div");
        this.gutterElement.classList.add(CSSClasses.CODE_VIEW_GUTTER);
        this.rootElement.appendChild(this.gutterElement);

        // create container element
        this.containerElement = document.createElement("div");
        this.containerElement.classList.add(CSSClasses.CODE_VIEW_CONTAINER);
        this.rootElement.appendChild(this.containerElement);

        // create content container
        const contentContainerElement = document.createElement("div");
        contentContainerElement.classList.add(CSSClasses.CODE_VIEW_CONTENT_CONTAINER);
        this.containerElement.appendChild(contentContainerElement);
        contentContainerElement.appendChild(element);

        if (this.initialOptions.showLineNumbers === undefined || this.initialOptions.showLineNumbers) {
            this.lineNumberElementsVisible = true;
            this.lineNumberElements = this.fillLineNumbers(this.gutterElement);
        } else {
            this.lineNumberElementsVisible = false;
            this.lineNumberElements = this.fillLineNumbers(this.gutterElement, true);
        }

        this.removeHighlightBoxEventSource.subscribe((_, highlightBox) => this.onRemoveHighlightBox(highlightBox));

        this.reset();
    }

    /**
     * Appends code view to element.
     * @param element Element to append code view to.
     */
    public appendTo(element : HTMLElement) : void {
        element.appendChild(this.rootElement);
    }

    /**
     * Detaches code view from its parent element.
     */
    public detach() : void {
        this.rootElement.remove();
    }

    /**
     * Resets code view to its initial state.
     */
    public reset() : void {
        this.removeHighlights();
        if (this.initialOptions.showGutter !== undefined && !this.initialOptions.showGutter) {
            this.hideGutter();
        } else {
            this.showGutter();
        }
        if (this.initialOptions.showLineNumbers === undefined || this.initialOptions.showLineNumbers && !this.lineNumberElementsVisible) {
            this.showLineNumbers();
        } else if (this.lineNumberElementsVisible) {
            this.hideLineNumbers();
        }
        if (this.initialOptions.highlight !== undefined) {
            this.initHighlights(this.initialOptions.highlight);
        }
        if (this.initialOptions.cssClasses !== undefined) {
            this.rootElement.classList.add(...this.initialOptions.cssClasses);
        }
    }

    /**
     * Creates memento.
     * @returns Memento.
     */
    public createMemento() : CodeViewMemento {
        return new CodeViewMemento(this);
    }

    /**
     * Applies memento.
     * @param memento Memento.
     */
    public applyMemento(memento : CodeViewMemento) : void {
        memento.apply(this);
    }

    /**
     * Creates copy of code view.
     * @returns Copy of code view.
     */
    public clone() : CodeView {
        const preElementCopy = this.preElement.cloneNode(true) as HTMLPreElement;
        preElementCopy.removeAttribute("id");
        return new CodeView(preElementCopy, this.initialOptions);
    }

    /**
     * Adds new highlight.
     * @param start Start line of highlight.
     * @param end End line of highlight (default is the same as start line).
     * @returns Created highlight box.
     */
    public addHighlight(start : number, end : number = start) : HighlightBox {
        const highlightBoxManager = new HighlightBoxManager();
        const highlightBox = new HighlightBox(this.containerElement, start, end, this, this.removeHighlightBoxEventSource, highlightBoxManager);
        this.highlightBoxEntries.push(new HighlightBoxEntry(highlightBox, highlightBoxManager));
        return highlightBox;
    }

    /**
     * Removes highlights based on passed range (all intersecting highlights are removed).
     * @param start Start line.
     * @param end End line (default is the same as start line).
     */
    public removeHighlights(start : number | null = null, end : number | null = start) : void {
        if (start === null) start = 1;
        if (end === null) end = this.linesCount;
        
        for (let i = 0; i < this.highlightBoxEntries.length; i++) {
            const entry = this.highlightBoxEntries[i];
            if (
                entry.highlightBox.getStart() <= end
                && entry.highlightBox.getEnd() >= start
            ) {
                entry.highlightBoxManager.detach();
                entry.highlightBoxManager.unlinkCodeView();
                this.highlightBoxEntries.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Returns all highlight boxes in passed range (if no parameters are passed or null is passed, all highlight boxes are returned).
     * @param start Start line.
     * @param end End line (default is the same as start line).
     * @returns Highlight boxes.
     */
    public getHighlightBoxes(start : number | null = null, end : number | null = start) : Array<HighlightBox> {
        if (start === null) start = 1;
        if (end === null) end = this.linesCount;

        const highlightBoxes = new Array<HighlightBox>();

        for (let entry of this.highlightBoxEntries) {
            if (
                entry.highlightBox.getStart() <= end
                && entry.highlightBox.getEnd() >= start
            ) {
                highlightBoxes.push(entry.highlightBox);
            }
        }

        return highlightBoxes;
    }

    /**
     * Shows gutter.
     */
    public showGutter() : void {
        this.gutterElement.classList.remove(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    /**
     * Hides gutter.
     */
    public hideGutter() : void {
        this.gutterElement.classList.add(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    /**
     * Checks whether gutter is visible.
     * @returns Indicates whether gutter is visible.
     */
    public isGutterVisible() : boolean {
        return !this.gutterElement.classList.contains(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    /**
     * Shows line numbers.
     */
    public showLineNumbers() : void {
        this.lineNumberElementsVisible = true;
        for (let element of this.lineNumberElements) {
            element.classList.remove(CSSClasses.CODE_VIEW_LINE_NUMBER_HIDDEN_MODIFIER);
        }
    }

    /**
     * Hides line numbers.
     */
    public hideLineNumbers() : void {
        this.lineNumberElementsVisible = false;
        for (let element of this.lineNumberElements) {
            element.classList.add(CSSClasses.CODE_VIEW_LINE_NUMBER_HIDDEN_MODIFIER);
        }
    }

    /**
     * Checks whether line numbers are visible.
     * @returns Indicates whether line numbers are visible.
     */
    public areLineNumbersVisible() : boolean {
        return this.lineNumberElementsVisible;
    }

    /**
     * Called by highlight boxes when their remove method is called.
     * @param highlightBox Highlight box to be removed.
     */
    private onRemoveHighlightBox(highlightBox : HighlightBox) : void {
        for (let i = 0; i < this.highlightBoxEntries.length; i++) {
            const entry = this.highlightBoxEntries[i];
            if (entry.highlightBox !== highlightBox) continue;

            entry.highlightBoxManager.detach();
            entry.highlightBoxManager.unlinkCodeView();
            this.highlightBoxEntries.splice(i, 1);
            break;
        }
    }

    /**
     * Initializes highlights based on passed string with highlights definitions.
     * @param highlightString String with highlights definitions (for example: "1", "1-5", "2-4,6-8"...).
     */
    private initHighlights(highlightString : string) : void {
        const sections = highlightString.split(",");

        for (let section of sections) {
            let range = section.split("-");

            let startLine: number;
            let endLine: number;

            // determine start line of highlight box
            if (range[0]) {
                startLine = parseInt(range[0]);
                if (Number.isNaN(startLine)) continue;
                if (startLine < 1) startLine = 1;
            } else {
                continue;
            }
            // determine end line of highlight box
            if (range[1]) {
                endLine = parseInt(range[1]);
                if (Number.isNaN(endLine)) continue;
            } else {
                endLine = startLine;
            }

            this.addHighlight(startLine, endLine);
        }
    }

    /**
     * Fills passed container element by line number elements and returns them.
     * @param container Container in which should be created line number elements.
     * @param hidden Determines whether line numbers should be hidden.
     * @returns Created line number elements.
     */
    private fillLineNumbers(container : HTMLElement, hidden = false) : HTMLElement[] {
        const numberElements = new Array<HTMLElement>();

        for (let i = 1; i <= this.linesCount; i++) {
            const numberElement = document.createElement("div");
            numberElement.classList.add(CSSClasses.CODE_VIEW_LINE_NUMBER);
            if (hidden) numberElement.classList.add(CSSClasses.CODE_VIEW_LINE_NUMBER_HIDDEN_MODIFIER);
            numberElement.style.lineHeight = this.lineHeight.toString() + this.lineHeightUnit;
            numberElement.innerText = i.toString();
            container.appendChild(numberElement);
            numberElements.push(numberElement);
        }

        return numberElements;
    }

    /**
     * Returns lines count of passed code element.
     * @param codeElement Code element.
     * @returns Lines count.
     */
    private getLinesCount(codeElement : HTMLElement) : number {
        if (codeElement.textContent === null) return 0;
        return codeElement.textContent.split('\n').length;
    }

    /**
     * Fills code view options based on dataset.
     * @param options Code view options.
     * @param dataset Dataset.
     */
    private fillOptionsFromDataset(options : CodeViewOptions, dataset : DOMStringMap) : void {
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Highlight"] !== undefined) {
            options.highlight = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Highlight"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ShowGutter"] !== undefined) {
            options.showGutter = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ShowGutter"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ShowLineNumbers"] !== undefined) {
            options.showLineNumbers = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ShowLineNumbers"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeight"] !== undefined) {
            options.lineHeight = Number.parseFloat(dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeight"] || "");
            if (Number.isNaN(options.lineHeight)) {
                throw new Error("Line height option must be a number.");
            }
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeightUnit"] !== undefined) {
            options.lineHeightUnit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeightUnit"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CssClasses"] !== undefined) {
            options.cssClasses = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CssClasses"]?.split(" ") || new Array<string>();
        }
    }

    /**
     * Returns child code element of pre element. If pre element does not contains code element, error is returned.
     * @param preElement Pre element.
     * @returns Code element.
     */
    private getCodeElement(preElement : HTMLPreElement) : HTMLElement {
        const children = Array.from(preElement.children);
        for (let child of children) {
            if (child.tagName === "CODE" && child instanceof HTMLElement) {
                return child;
            }
        }
        throw new Error("Passed element does not have code element as its children");
    }
}

export default CodeView;