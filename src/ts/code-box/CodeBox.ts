import CodeView from "../code-view/CodeView";
import CodeViewOptions from "../code-view/CodeViewOptions";
import GlobalConfig from "../GlobalConfig";
import { createCodeViewOptionsCopy } from "../utils/utils";
import ViewportIntersectionObserver from "../utils/ViewportIntersectionObserver";
import CodeBoxBuilder from "./CodeBoxBuilder";
import CodeBoxCodeView from "./CodeBoxCodeView";
import CodeBoxFile from "./CodeBoxFile";
import CodeBoxMemento from "./CodeBoxMemento";
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
    protected static readonly CODE_BOX_NOT_INITIALIZED_ERROR = "Code box is not initialized.";

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
    /** Initialization data that is passed to subclasses on initialization. */
    private initializationData : InitializationInfo[] | null;
    /** Placeholder element for lazy initialization. */
    private lazyInitPlaceholderElement : HTMLElement | null = null;
    /** Indicates whether lazy initialization is enabled. */
    protected readonly isLazyInitializationEnabled : boolean;

    /** Functions called after initialization of code box. */
    private onInitCallbacks : Array<() => void> | null = new Array<() => void>();

    /**
     * Creates new code box.
     * @param element Code box root element.
     * @param options Code box options.
     * @param codeBoxBuilder Code box builder that should be used to build code box.
     * @param customLazyInitPlaceholderElementHeight Custom height value for lazy initialization placeholder element (this can be useful in some situation, when for example new code view is set right after initialization).
     */
    constructor(element : HTMLElement, options : CodeBoxOptions, codeBoxBuilder : CodeBoxBuilder, customLazyInitPlaceholderElementHeight : string | null = null) {
        this.rootElement = element;

        this.fillOptionsFromDataset(options, element.dataset);

        this.defaultCodeViewOptions = options.defaultCodeViewOptions ? createCodeViewOptionsCopy(options.defaultCodeViewOptions) : null;
        this.minCodeViewLinesCount = options.minCodeViewLinesCount || null;
        this.isLazyInitializationEnabled = (options.lazyInit === undefined || options.lazyInit);

        const preElements = Array<HTMLPreElement>();
        this.initializationData = new Array<InitializationInfo>();
        let activePreElement : HTMLPreElement | null = null;

        // traverse all children of passed element
        // (get pre elements and create initialization data)
        for (let i = 0; i < this.rootElement.children.length; i++) {
            const child = this.rootElement.children[i];

            if (!(child instanceof HTMLElement)) continue;
            if (child instanceof HTMLPreElement) {
                const codeElement = CodeBox.getCodeElement(child);
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
            activePreElement = preElement;
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

        // potentionally prepare for lazy initialization
        if (this.isLazyInitializationEnabled && this.rootElement.parentElement) {
            // create placeholder element
            this.lazyInitPlaceholderElement = document.createElement("div");

            // set height of placeholder element
            if (customLazyInitPlaceholderElementHeight === null) {
                if (activePreElement) {
                    const codeElement = CodeBox.getCodeElement(activePreElement);
                    if (codeElement) {
                        const initialCodeViewLinesCount = CodeBox.getLinesCount(codeElement);
                        let linesCount;
                        if (this.minCodeViewLinesCount !== null && this.minCodeViewLinesCount >= initialCodeViewLinesCount) {
                            linesCount = this.minCodeViewLinesCount;
                        } else {
                            linesCount = initialCodeViewLinesCount;
                        }
                        const height = linesCount * CodeBox.getCodeViewLineHeight(activePreElement, options.defaultCodeViewOptions || {});
                        this.lazyInitPlaceholderElement.style.height = `${height}${CodeBox.getCodeViewLineHeightUnit(activePreElement, options.defaultCodeViewOptions || {})}`;
                    } else {
                        return;
                    }
                } else {
                    this.lazyInitPlaceholderElement.style.height = options.noCodeViewSelectedElementHeight || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT;
                }
            } else {
                this.lazyInitPlaceholderElement.style.height = customLazyInitPlaceholderElementHeight;
            }

            // display placeholder element instead of code box element for initialization
            this.rootElement.parentElement.insertBefore(this.lazyInitPlaceholderElement, this.rootElement);
            this.rootElement.style.setProperty("display", "none");

            // observe intersection between viewport and placeholder element
            ViewportIntersectionObserver.observe(this.lazyInitPlaceholderElement, isIntersecting => this.onLazyInitPlaceholderElementIntersectionChange(isIntersecting));
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
     * Initializes code box if it hasn't been initialized yet. (When lazy initialization is disabled, code box is initialized immediately after it is created.)
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

        this.onAfterInit();

        if (this.onInitCallbacks) {
            for (let callback of this.onInitCallbacks) {
                callback();
            }
            this.onInitCallbacks = null;
        }
    }

    /**
     * Checks whether code box is initialized.
     * @returns Indicates whether code box is initialized.
     */
    public isInitialized() : boolean {
        return this.initialized;
    }

    /**
     * Registeres function to be called when code box is initialized.
     * @param callback Function to be called after initialization of code box.
     */
    public addOnInitListener(callback : () => void) : void {
        if (this.isInitialized()) return;
        if (this.onInitCallbacks === null) return;

        this.onInitCallbacks.push(callback);
    }

    /**
     * Adds new code view to code box (copy of passed code view is made).
     * @param identifier Identifier under which the code view should be added to code box.
     * @param codeView Code view.
     * @returns Indicates whether code view has been successfully added.
     */
    public abstract addCodeView(identifier : string, codeView : CodeView) : boolean;

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
     * Removes all code views from code box.
     */
    public abstract removeAllCodeViews() : void;

    /**
     * Changes identifier of code view in code box.
     * @param identifier Identifier of code view whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other code view in code box, it returns false).
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
     * Adds new file to code box.
     * @param identifier Identifier under which the file should be added to code box.
     * @param downloadLink Download link (or null if file should not be downloadable).
     * @returns Indicates whether file has been successfully added.
     */
    public abstract addFile(identifier : string, downloadLink : string | null) : boolean;

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
     * @param identifier Identifier of file to be removed.
     * @returns Indicates whether file has been removed.
     */
    public abstract removeFile(identifier : string) : boolean;

    /**
     * Removes all files from code box.
     */
    public abstract removeAllFiles() : void;

    /**
     * Changes identifier of file in code box.
     * @param identifier Indentifier of file whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other file in code box, it returns false).
     */
    public abstract changeFileIdentifier(identifier : string, newIdentifier : string) : boolean;

    /**
     * Changes download link of file.
     * @param identifier Identifier of file whose download link should be changed.
     * @param newDownloadLink Download link (or null if file should not be downloadable).
     * @returns Indicates whether file was found and its download link has been successfully changed.
     */
    public abstract changeFileDownloadLink(identifier : string, newDownloadLink : string | null) : boolean;

    /**
     * Resets code box to its post-initialization state.
     */
    public abstract reset() : void;

    /**
     * Creates memento.
     * @returns Memento.
     */
    public abstract createMemento() : CodeBoxMemento;

    /**
     * Applies memento.
     * @param memento Memento.
     */
    public abstract applyMemento(memento : CodeBoxMemento) : void;

    /**
     * Called on initialization.
     * @param codeBoxItemInfos Info objects about code box items.
     */
    protected abstract onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void;

    /**
     * Called right after initialization. Can be implemented in subclasses.
     */
    protected onAfterInit() : void {}

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
     * Can be used to get pre elements before initialization of code box.
     * @returns Pre elements or null if code box is already initialized.
     */
    protected getPreElementsBeforeInitialization() : HTMLPreElement[] | null {
        if (!this.initializationData) return null;

        const preElements = new Array<HTMLPreElement>();
        for (let initializationInfo of this.initializationData) {
            if (initializationInfo.type === "PreElement" && initializationInfo.preElement) {
                preElements.push(initializationInfo.preElement);
            }
        }

        return preElements;
    }

    /**
     * Shows element with no selected code view message.
     */
    private showNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.remove(this.noCodeViewSelectedCSSHiddenClass);
        this.noCodeViewSelectedElement.setAttribute("aria-hidden", "false");
        this.codeViewContainer.classList.add(this.codeViewContainerCSSHiddenClass);
        this.codeViewContainer.setAttribute("aria-hidden", "true");
    }

    /**
     * Hides element with no selected code view message.
     */
    private hideNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.add(this.noCodeViewSelectedCSSHiddenClass);
        this.noCodeViewSelectedElement.setAttribute("aria-hidden", "true");
        this.codeViewContainer.classList.remove(this.codeViewContainerCSSHiddenClass);
        this.codeViewContainer.setAttribute("aria-hidden", "false");
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
    protected static getLinesCount(codeElement : HTMLElement) : number {
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
    protected static getCodeElement(preElement : HTMLPreElement) : HTMLElement | null {
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
    protected static getCodeViewLineHeight(preElement : HTMLPreElement, defaultCodeViewOptions : CodeViewOptions) : number {
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
    protected static getCodeViewLineHeightUnit(preElement : HTMLPreElement, defaultCodeViewOptions : CodeViewOptions) : string {
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