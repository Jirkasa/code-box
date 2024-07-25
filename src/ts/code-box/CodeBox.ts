import CodeView from "../code-view/CodeView";
import CodeViewOptions from "../code-view/CodeViewOptions";
import GlobalConfig from "../GlobalConfig";
import { createCodeViewOptionsCopy } from "../utils/utils";
import ViewportIntersectionObserver from "../utils/ViewportIntersectionObserver";
import CodeBoxBuilder from "./CodeBoxBuilder";
import CodeBoxCodeView from "./CodeBoxCodeView";
import CodeBoxFile from "./CodeBoxFile";
import CodeBoxOptions from "./CodeBoxOptions";

/** Informations about code view. */
export type CodeViewInfo = {
    /** Dataset of pre element used to create code view. */
    dataset : DOMStringMap;
    /** Code view. */
    codeView : CodeView;
}

/** Informations about file. */
export type FileInfo = {
    /** Dataset of element used to create file. */
    dataset : DOMStringMap;
    /** Name of file. */
    name : string;
    /** File download link (or null if no download link was set). */
    downloadLink : string | null;
}

/** Code box item informations. */
export type CodeBoxItemInfo = {
    /** Type of item. */
    type : "CodeViewInfo" | "FileInfo" | "HTMLElement";
    /** Informations about code view (if type is "CodeViewInfo"). */
    codeViewInfo ?: CodeViewInfo;
    /** Informations about file (if type is "FileInfo"). */
    fileInfo ?: FileInfo;
    /** HTML element (if type is "HTMLElement"). */
    element ?: HTMLElement;
}

/** Initialization informations about code box item. */
type InitializationInfo = {
    /** Type of initialization informations. */
    type : "PreElement" | "FileInfo" | "HTMLElement";
    /** Pre element (if type is "PreElement"). */
    preElement ?: HTMLPreElement;
    /** Informations about file (if type is "FileInfo"). */
    fileInfo ?: FileInfo;
    /** HTML element (if type is "HTMLElement"). */
    element ?: HTMLElement;
}

/** Base class for code boxes. */
abstract class CodeBox {
    protected static readonly PROJECT_NOT_INITIALIZED_ERROR = "Code box is not initialized.";

    /** Root element of code box. */
    private readonly rootElement : HTMLElement;
    /** Element in which code view are displayed. */
    private readonly codeViewContainer : HTMLElement;
    /** CSS class that is used to hide code view container. */
    private readonly codeViewContainerCSSHiddenClass : string;
    /** Element that is displayed when no code view is displayed. */
    private readonly noCodeViewSelectedElement : HTMLElement;
    /** CSS class that is used to hide element that is displayed when no code view is displayed. */
    private readonly noCodeViewSelectedCSSHiddenClass : string;

    /** Minimal number of code view lines count (used for setting minimal height of code view container). */
    private minCodeViewLinesCount : number | null = null;
    /** Default code view options. */
    private defaultCodeViewOptions : CodeViewOptions | null;
    /** Currently displayed code view. */
    private activeCodeView : CodeView | null = null;

    /** Indicates whether code box is initialized. */
    private initialized : boolean  = false;
    /** Number of code view lines count that is going to be displayed when code box is initialized. */
    protected initialCodeViewLinesCount : number | null = null;
    /** Initialization data that is passed to subclasses on initialization. */
    private initializationData : InitializationInfo[] | null;
    /** Placeholder element for lazy initialization. */
    private lazyInitPlaceholderElement : HTMLElement | null = null;

    /**
     * Creates new code box.
     * @param element Code box root element.
     * @param options Code box options.
     * @param codeBoxBuilder Code box builder that should be used to build code box.
     */
    constructor(element : HTMLElement, options : CodeBoxOptions, codeBoxBuilder : CodeBoxBuilder) {
        this.rootElement = element;

        this.fillOptionsFromDataset(options, element.dataset);

        this.defaultCodeViewOptions = options.defaultCodeViewOptions ? createCodeViewOptionsCopy(options.defaultCodeViewOptions) : null;
        this.minCodeViewLinesCount = options.minCodeViewLinesCount || null;

        const preElements = Array<HTMLPreElement>();
        this.initializationData = new Array<InitializationInfo>();
        let activePreElement : HTMLPreElement | null = null;

        // traverse all children of passed element
        // (get pre elements and create initialization data)
        for (let i = 0; i < this.rootElement.children.length; i++) {
            const child = this.rootElement.children[i];

            if (!(child instanceof HTMLElement)) continue;
            if (child instanceof HTMLPreElement) {
                const codeElement = this.getCodeElement(child);
                if (!codeElement) continue;
                if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined) {
                    if (activePreElement) {
                        delete activePreElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"];
                    }
                    activePreElement = child;
                }
                preElements.push(child);
                this.initializationData.push({
                    type: "PreElement",
                    preElement: child
                })
            } else if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "File"] !== undefined) {
                const fileInfo = {
                    dataset: child.dataset,
                    name: child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT,
                    downloadLink: child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "File"] || null
                };
                this.initializationData.push({
                    type: "FileInfo",
                    fileInfo: fileInfo
                });
            } else {
                this.initializationData.push({
                    type: "HTMLElement",
                    element: child
                });
            }
        }

        // if no active pre element was found and implicit one should be set, set it
        if (options.implicitActive && !activePreElement && preElements.length > 0) {
            const preElement = preElements[0];
            preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] = "true";
        }

        // build code box elements
        this.rootElement.innerHTML = "";
        codeBoxBuilder.customizeRootElement(this.rootElement);
        this.codeViewContainer = codeBoxBuilder.createCodeViewContainer();
        this.codeViewContainerCSSHiddenClass = codeBoxBuilder.getCodeViewContainerCSSHiddenClass();
        this.noCodeViewSelectedCSSHiddenClass = codeBoxBuilder.getNoCodeViewCSSHiddenClass();
        this.noCodeViewSelectedElement = codeBoxBuilder.createNoCodeViewSelectedElement(options.noCodeViewSelectedElementHeight || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT, options.noCodeViewSelectedText || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_TEXT);
        codeBoxBuilder.assembleElements(this.rootElement, this.codeViewContainer, this.noCodeViewSelectedElement);

        // potentionally show no code view selected message
        if (preElements.length === 0 || (!options.implicitActive && !activePreElement)) {
            this.showNoCodeViewSelectedMessage();
        }

        // prepare for lazy initialization or initialize right away
        if ((options.lazyInit === undefined || options.lazyInit) && this.rootElement.parentElement) {
            // create placeholder element
            this.lazyInitPlaceholderElement = document.createElement("div");

            // set height of placeholder element
            if (activePreElement) {
                const codeElement = this.getCodeElement(activePreElement);
                if (codeElement) {
                    this.initialCodeViewLinesCount = this.getLinesCount(codeElement);
                    let linesCount;
                    if (this.minCodeViewLinesCount !== null && this.minCodeViewLinesCount >= this.initialCodeViewLinesCount) {
                        linesCount = this.minCodeViewLinesCount;
                    } else {
                        linesCount = this.initialCodeViewLinesCount;
                    }
                    const height = linesCount * this.getCodeViewLineHeight(activePreElement, options.defaultCodeViewOptions || {});
                    this.lazyInitPlaceholderElement.style.height = `${height}${this.getCodeViewLineHeightUnit(activePreElement, options.defaultCodeViewOptions || {})}`;
                } else {
                    // just to be sure
                    this.init();
                    return;
                }
            } else {
                this.lazyInitPlaceholderElement.style.height = options.noCodeViewSelectedElementHeight || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT;
            }

            // display placeholder element instead of code box element for initialization
            this.rootElement.parentElement.insertBefore(this.lazyInitPlaceholderElement, this.rootElement);
            this.rootElement.style.setProperty("display", "none");

            // observe intersection between viewport and placeholder element
            ViewportIntersectionObserver.observe(this.lazyInitPlaceholderElement, isIntersecting => this.onLazyInitPlaceholderElementIntersectionChange(isIntersecting));
        } else {
            this.init();
        }
    }

    /**
     * Appends code box to element.
     * @param element Element to append code box to.
     */
    public appendTo(element : HTMLElement) : void {
        element.appendChild(this.rootElement);
    }

    /**
     * Detaches code box from its parent element.
     */
    public detach() : void {
        this.rootElement.remove();
    }

    /**
     * Initializes code box if it hasn't been initialized yet. (When lazy initialization is disabled, code box is initialized right away.)
     */
    public init() : void {
        if (this.initialized) return;

        this.rootElement.style.removeProperty("display");

        // remove placeholder element
        if (this.lazyInitPlaceholderElement) {
            ViewportIntersectionObserver.unobserve(this.lazyInitPlaceholderElement);
            this.lazyInitPlaceholderElement.remove();
            this.lazyInitPlaceholderElement = null;
        }

        // create info objects about items in code box
        const codeBoxItemInfos = new Array<CodeBoxItemInfo>();
        if (this.initializationData) {
            for (let initializationInfo of this.initializationData) {
                if (initializationInfo.type === "PreElement" && initializationInfo.preElement) {
                    const preElement = initializationInfo.preElement;

                    const codeView = new CodeView(preElement, this.defaultCodeViewOptions || {});
                    codeView.detach();

                    if (preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined) {
                        this.changeActiveCodeView(codeView);
                    }

                    codeBoxItemInfos.push({
                        type: "CodeViewInfo",
                        codeViewInfo: {
                            codeView: codeView,
                            dataset: preElement.dataset
                        }
                    });
                } else if (initializationInfo.type === "FileInfo" && initializationInfo.fileInfo) {
                    codeBoxItemInfos.push({
                        type: "FileInfo",
                        fileInfo: initializationInfo.fileInfo
                    });
                } else if (initializationInfo.type === "HTMLElement" && initializationInfo.element) {
                    codeBoxItemInfos.push({
                        type: "HTMLElement",
                        element: initializationInfo.element
                    });
                }
            }
        }

        this.onInit(codeBoxItemInfos);

        this.initializationData = null;
        this.defaultCodeViewOptions = null;

        this.initialized = true;
    }

    /**
     * Checks whether code box is initialized.
     * @returns Indicates whether code box is initialized.
     */
    public isInitialized() : boolean {
        return this.initialized;
    }

    /**
     * Returns all code views of code box.
     * @returns Code views.
     */
    public abstract getCodeViews() : CodeBoxCodeView[];

    /**
     * Returns code view based on identifier.
     * @param identifier Identifier of code view.
     * @returns Code view (or null if code view wasn't found).
     */
    public abstract getCodeView(identifier : string) : CodeBoxCodeView | null;

    /**
     * Removes code view from code box.
     * @param identifier Identifier of code view to be removed.
     * @returns Indicates whether code view has been removed.
     */
    public abstract removeCodeView(identifier : string) : boolean;

    /**
     * Changes identifier of code view in code box.
     * @param identifier Identifier of code view whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other code view in code box, it should return false).
     */
    public abstract changeCodeViewIdentifier(identifier : string, newIdentifier : string) : boolean;

    /**
     * Sets code view as active (displays it in code box).
     * @param identifier Identifier of code view which should be set as active.
     * @returns Indicates whether code view was found and has been successfully set as active.
     */
    public abstract setActiveCodeView(identifier : string) : boolean;

    /**
     * Displays no code view in code box.
     */
    public abstract setNoActiveCodeView() : void;

    /**
     * Returns currently active code view.
     * @returns Active code view or null if no code view is set as active.
     */
    public abstract getActiveCodeView() : CodeBoxCodeView | null;

    /**
     * Returns all files of code box.
     * @returns Files.
     */
    public abstract getFiles() : CodeBoxFile[];

    /**
     * Returns file based on identifier.
     * @param identifier Identifier of file.
     * @returns File (or null if file wasn't found).
     */
    public abstract getFile(identifier : string) : CodeBoxFile | null;

    /**
     * Removes file from code box.
     * @param identifier Identifier of file to be remove.
     * @returns Indicates whether file has been removed.
     */
    public abstract removeFile(identifier : string) : boolean;

    /**
     * Changes identifier of file in code box.
     * @param identifier Indentifier of file whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other file in code box, it should return false).
     */
    public abstract changeFileIdentifier(identifier : string, newIdentifier : string) : boolean;

    /**
     * Changes download link of file.
     * @param identifier Identifier of file whose download link should be changed.
     * @param newDownloadLink Download link (or null if file should not be downloadable).
     * @returns Indicates whether file was found and its link has been successfully changed.
     */
    public abstract changeFileDownloadLink(identifier : string, newDownloadLink : string | null) : boolean;

    /**
     * Called on initialization.
     * @param codeBoxItemInfos Info objects about code box items.
     */
    protected abstract onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void;

    /**
     * Changes active code view displayed in code box.
     * @param codeView Code view that should be displayed in code box or null if no code view should be displayed.
     */
    protected changeActiveCodeView(codeView : CodeView | null) : void {
        if (this.activeCodeView) {
            this.activeCodeView.detach();
        }

        this.activeCodeView = codeView;

        if (codeView !== null) {
            codeView.appendTo(this.codeViewContainer);
    
            // potentionally set min height to code view container
            if (this.minCodeViewLinesCount !== null) {
                const minHeight = this.minCodeViewLinesCount * codeView.lineHeight;
                this.codeViewContainer.style.setProperty("min-height", minHeight + codeView.lineHeightUnit);
            } else {
                this.codeViewContainer.style.removeProperty("min-height");
            }

            this.hideNoCodeViewSelectedMessage();
        } else {
            this.showNoCodeViewSelectedMessage();
        }
    }

    /**
     * Returns currently active instance of CodeView.
     * @returns Currently active instance of CodeView.
     */
    protected getCurrentlyActiveCodeView() : CodeView | null {
        return this.activeCodeView;
    }

    /**
     * Shows element with no selected code view message.
     */
    private showNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.remove(this.noCodeViewSelectedCSSHiddenClass);
        this.codeViewContainer.classList.add(this.codeViewContainerCSSHiddenClass);
    }

    /**
     * Hides element with no selected code view message.
     */
    private hideNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.add(this.noCodeViewSelectedCSSHiddenClass);
        this.codeViewContainer.classList.remove(this.codeViewContainerCSSHiddenClass);
    }

    /**
     * Called when intersection between placeholder element and viewport changes.
     * @param isIntersecting Indicates whether placeholder element and viewport are intersecting.
     */
    private onLazyInitPlaceholderElementIntersectionChange(isIntersecting : boolean) : void {
        if (isIntersecting) this.init();
    }

    /**
     * Returns number of lines count in code element.
     * @param codeElement Code element.
     * @returns Number of lines count in code element.
     */
    private getLinesCount(codeElement : HTMLElement) : number {
        if (codeElement.textContent === null) return 0;
        return codeElement.textContent.split('\n').length;
    }

    /**
     * Fills code box options based on dataset.
     * @param options Code box options.
     * @param dataset Dataset.
     */
    private fillOptionsFromDataset(options : CodeBoxOptions, dataset : DOMStringMap) {
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LazyInit"] !== undefined) {
            options.lazyInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LazyInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ImplicitActive"] !== undefined) {
            options.implicitActive = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ImplicitActive"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "NoCodeViewSelectedElementHeight"] !== undefined) {
            options.noCodeViewSelectedElementHeight = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "NoCodeViewSelectedElementHeight"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "NoCodeViewSelectedText"] !== undefined) {
            options.noCodeViewSelectedText = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "NoCodeViewSelectedText"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "MinCodeViewLinesCount"] !== undefined) {
            options.minCodeViewLinesCount = Number.parseInt(dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "MinCodeViewLinesCount"] || "");
            if (Number.isNaN(options.minCodeViewLinesCount)) {
                throw new Error("Min code view lines count option must be a number.");
            }
        }
    }

    /**
     * Returns child code element of pre element.
     * @param preElement Pre element.
     * @returns Code element.
     */
    private getCodeElement(preElement : HTMLPreElement) : HTMLElement | null {
        const children = Array.from(preElement.children);
        for (let child of children) {
            if (child.tagName === "CODE" && child instanceof HTMLElement) {
                return child;
            }
        }
        return null;
    }

    /**
     * Returns code view line height.
     * @param preElement Pre element.
     * @param defaultCodeViewOptions Default code view options.
     * @returns Code view line height.
     */
    private getCodeViewLineHeight(preElement : HTMLPreElement, defaultCodeViewOptions : CodeViewOptions) : number {
        if (preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeight"] !== undefined) {
            const lineHeight = Number.parseFloat(preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeight"] || "");
            if (Number.isNaN(lineHeight)) return GlobalConfig.DEFAULT_LINE_HEIGHT;
            return lineHeight;
        } else if (defaultCodeViewOptions.lineHeight !== undefined) {
            return defaultCodeViewOptions.lineHeight;
        } else {
            return GlobalConfig.DEFAULT_LINE_HEIGHT;
        }
    }

    /**
     * Returns code view line height unit.
     * @param preElement Pre element.
     * @param defaultCodeViewOptions Default code view options.
     * @returns Code view line height unit.
     */
    private getCodeViewLineHeightUnit(preElement : HTMLPreElement, defaultCodeViewOptions : CodeViewOptions) : string {
        if (preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeightUnit"] !== undefined) {
            return preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LineHeightUnit"] || GlobalConfig.DEFAULT_LINE_HEIGHT_UNIT;
        } else if (defaultCodeViewOptions.lineHeightUnit !== undefined) {
            return defaultCodeViewOptions.lineHeightUnit;
        } else {
            return GlobalConfig.DEFAULT_LINE_HEIGHT_UNIT;
        }
    }
}

export default CodeBox;

/*
todo - ještě teda budu muset nějak zajistit resetování
        - možná
     - 
 */

/**
    - aby uživatel nemusel kdyžtak inicializovat code boxy a code views ručně, tak by na to mohla být nějaká speciální třída, kde by se předal selektor
        - CodeViewInitializer
        - TabCodeBoxInitializer
        - ProjectCodeBoxInitializer
            - je to ale hromadné, takže nějaký trochu jiný název
    
    - Pluginy (uvidím jak to s pluginama nakonec bude):
        - v options by byla vlastnost plugin
            - předával by se tam new PluginInitializer<MyPlugin>()
                - přičemž CodeView by mělo tohle jako typ:
                    plugins : PluginInitializer<extends CodeViewPlugin>[] - něco takového
 */