import CodeViewOptions from "./CodeViewOptions";
import CSSClasses from "../CSSClasses";
import GlobalConfig from "../GlobalConfig";
import HighlightBox from "./HighlightBox";
import { createCodeViewOptionsCopy, deleteEmptyStringFromArray } from "../utils/utils";

class CodeView { // todo - ještě přidat přesouvání do elementu, skrývání, atd..
    private initialOptions : CodeViewOptions;
    private rootElement : HTMLElement;
    private gutterElement : HTMLElement;
    private containerElement : HTMLElement;
    private lineNumberElements : HTMLElement[];
    private preElement : HTMLPreElement;
    private lineNumberElementsVisible : boolean;
    private highlightBoxes = new Array<HighlightBox>();
    public readonly lineHeight : number;
    public readonly lineHeightUnit : string;
    public readonly linesCount : number;

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
        
        this.rootElement = document.createElement("div");
        this.rootElement.classList.add(CSSClasses.CODE_VIEW);
        if (element.parentElement) {
            element.parentElement.insertBefore(this.rootElement, element);
        }
        this.rootElement.innerHTML = "";

        this.gutterElement = document.createElement("div");
        this.gutterElement.classList.add(CSSClasses.CODE_VIEW_GUTTER);
        this.rootElement.appendChild(this.gutterElement);

        this.containerElement = document.createElement("div");
        this.containerElement.classList.add(CSSClasses.CODE_VIEW_CONTAINER);
        this.rootElement.appendChild(this.containerElement);

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

        this.reset();
    }

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

    public appendTo(element : HTMLElement) : void {
        element.appendChild(this.rootElement);
    }

    public detach() : void {
        this.rootElement.remove();
    }

    public clone() : CodeView {
        const preElementCopy = this.preElement.cloneNode(true) as HTMLPreElement;
        preElementCopy.removeAttribute("id");
        return new CodeView(preElementCopy, this.initialOptions);
    }

    public addHighlight(start : number, end : number = start) : HighlightBox {
        const highlightBox = new HighlightBox(this.containerElement, start, end, this);
        this.highlightBoxes.push(highlightBox);
        return highlightBox;
    }

    public removeHighlights(start : number | null = null, end : number | null = start) : void {
        if (start === null) start = 1;
        if (end === null) end = this.linesCount;
        
        for (let i = 0; i < this.highlightBoxes.length; i++) {
            const highlightBox = this.highlightBoxes[i];
            if (
                highlightBox.getStart() <= end
                && highlightBox.getEnd() >= start
            ) {
                highlightBox.detach();
                this.highlightBoxes.splice(i, 1);
                i--;
            }
        }
    }

    public getHighlightBoxes(start : number | null = null, end : number | null = start) : Array<HighlightBox> {
        if (start === null) start = 1;
        if (end === null) end = this.linesCount;

        const highlightBoxes = new Array<HighlightBox>();

        for (let highlightBox of this.highlightBoxes) {
            if (
                highlightBox.getStart() <= end
                && highlightBox.getEnd() >= start
            ) {
                highlightBoxes.push(highlightBox);
            }
        }

        return highlightBoxes;
    }

    public showGutter() : void {
        this.gutterElement.classList.remove(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    public hideGutter() : void {
        this.gutterElement.classList.add(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    public isGutterVisible() : boolean {
        return !this.gutterElement.classList.contains(CSSClasses.CODE_VIEW_GUTTER_HIDDEN_MODIFIER);
    }

    public showLineNumbers() : void {
        this.lineNumberElementsVisible = true;
        for (let element of this.lineNumberElements) {
            element.classList.remove(CSSClasses.CODE_VIEW_LINE_NUMBER_HIDDEN_MODIFIER);
        }
    }

    public hideLineNumbers() : void {
        this.lineNumberElementsVisible = false;
        for (let element of this.lineNumberElements) {
            element.classList.add(CSSClasses.CODE_VIEW_LINE_NUMBER_HIDDEN_MODIFIER);
        }
    }

    public areLineNumbersVisible() : boolean {
        return this.lineNumberElementsVisible;
    }

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

    private getLinesCount(codeElement : HTMLElement) : number {
        if (codeElement.textContent === null) return 0;
        return codeElement.textContent.split('\n').length;
    }

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

/**
 * - javascript nastavení bude mít přednost před data atributy - ne, naopak to v mém případě dává větší smysl - uživatel tak bude mít možnost změnit nějakou věc pro jednu ukázku bez zasažení do js
 */