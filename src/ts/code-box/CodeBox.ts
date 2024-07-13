import CodeView from "../code-view/CodeView";
import CodeViewOptions from "../code-view/CodeViewOptions";
import GlobalConfig from "../GlobalConfig";
import ViewportIntersectionObserver from "../utils/ViewportIntersectionObserver";
import CodeBoxBuilder from "./CodeBoxBuilder";
import CodeBoxOptions from "./CodeBoxOptions";

export type CodeViewInfo = {
    dataset : DOMStringMap;
    codeView : CodeView; // name by se mohlo taky předávat, ať to nemusím zjišťovat v podtřídách
}

export type FileInfo = {
    dataset : DOMStringMap;
    name : string;
    downloadLink : string | null;
}

export type CodeBoxItemInfo = {
    type : "CodeView" | "FileInfo";
    codeViewInfo ?: CodeViewInfo;
    fileInfo ?: FileInfo;
}

type InitializationInfo = {
    type : "PreElement" | "FileInfo";
    preElement ?: HTMLPreElement;
    fileInfo ?: FileInfo;
}

abstract class Codebox {
    protected readonly rootElement : HTMLElement;
    private readonly codeViewContainer : HTMLElement;
    private readonly noCodeViewSelectedElement : HTMLElement;
    private readonly noCodeViewSelectedCSSHiddenClass : string;
    protected initialCodeViewLinesCount : number | null = null;
    private initialized : boolean  = false;
    private initializationData : InitializationInfo[] | null;
    //private preElements : HTMLPreElement[] | null;
    private defaultCodeViewOptions : CodeViewOptions | null;
    private activeCodeView : CodeView | null = null;
    private lazyInitPlaceholderElement : HTMLElement | null = null;
    //private fileInfos : FileInfo[] | null;

    constructor(element : HTMLElement, options : CodeBoxOptions, codeBoxBuilder : CodeBoxBuilder) { // todo - dívat se na code box options v datasetu - na to jsem ještě u code boxu nemyslel
        this.rootElement = element;

        this.defaultCodeViewOptions = options.defaultCodeViewOptions || null;

        const preElements = Array<HTMLPreElement>();
        this.initializationData = new Array<InitializationInfo>();

        let activePreElement : HTMLPreElement | null = null;

        //this.fileInfos = new Array<FileInfo>();

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
            }
        }

        if (options.implicitActive && !activePreElement && preElements.length > 0) {
            const preElement = preElements[0];
            preElement.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] = "true";
        }

        this.rootElement.innerHTML = ""; // todo - pro získání dalších elementů během inicializace se může v podtřídách implementovat nějaká volitelná metoda - takže pro project code box půjdou vytvořit ty command elementy

        codeBoxBuilder.customizeRootElement(this.rootElement);
        this.codeViewContainer = codeBoxBuilder.createCodeViewContainer();
        this.noCodeViewSelectedCSSHiddenClass = codeBoxBuilder.getNoCodeViewCSSHiddenClass();
        this.noCodeViewSelectedElement = codeBoxBuilder.createNoCodeViewSelectedElement(options.noCodeViewSelectedElementHeight || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT, options.noCodeViewSelectedText || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_TEXT);

        codeBoxBuilder.assembleElements(this.rootElement, this.codeViewContainer, this.noCodeViewSelectedElement);

        if (preElements.length === 0 || (!options.implicitActive && !activePreElement)) {
            this.showNoCodeViewSelectedMessage();
        }

        if ((options.lazyInit === undefined || options.lazyInit) && this.rootElement.parentElement) { // todo - do dokumentace napsat, že aby se lazy inicializování aplikovalo, musí mít CodeBox parent element
            this.lazyInitPlaceholderElement = document.createElement("div");

            if (activePreElement) {
                const codeElement = this.getCodeElement(activePreElement);
                if (codeElement) {
                    this.initialCodeViewLinesCount = this.getLinesCount(codeElement);
                    const height = this.initialCodeViewLinesCount * this.getCodeViewLineHeight(activePreElement, options.defaultCodeViewOptions || {});
                    this.lazyInitPlaceholderElement.style.height = `${height}${this.getCodeViewLineHeightUnit(activePreElement, options.defaultCodeViewOptions || {})}`;
                } else {
                    this.init();
                    return;
                }
            } else {
                this.lazyInitPlaceholderElement.style.height = options.noCodeViewSelectedElementHeight || GlobalConfig.DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT;
            }

            this.rootElement.parentElement.insertBefore(this.lazyInitPlaceholderElement, this.rootElement);
            this.rootElement.style.setProperty("display", "none");

            ViewportIntersectionObserver.observe(this.lazyInitPlaceholderElement, isIntersecting => this.onLazyInitPlaceholderElementIntersectionChange(isIntersecting));
        } else {
            this.init();
        }
    }

    public init() : void {
        if (this.initialized) throw new Error("Code box is already initialized."); // todo - nevím jestli vyhazovat chybu... - možná ani ne, jen by se nic neprovedlo

        this.rootElement.style.removeProperty("display");

        if (this.lazyInitPlaceholderElement) {
            ViewportIntersectionObserver.unobserve(this.lazyInitPlaceholderElement);
            this.lazyInitPlaceholderElement.remove();
            this.lazyInitPlaceholderElement = null;
        }

        /*const codeViewInfos = new Array<CodeViewInfo>();
        if (this.preElements) {
            for (let preElement of this.preElements) {
                const codeView = new CodeView(preElement, this.defaultCodeViewOptions || {});
                codeView.detach();

                if (preElement.dataset.cbActive !== undefined) {
                    this.setActiveCodeView(codeView);
                }

                codeViewInfos.push({
                    dataset: preElement.dataset,
                    codeView: codeView
                });
            }
        }*/

        const codeBoxItemInfos = new Array<CodeBoxItemInfo>();
        if (this.initializationData) {
            for (let initializationInfo of this.initializationData) {
                if (initializationInfo.type === "PreElement" && initializationInfo.preElement) {
                    const preElement = initializationInfo.preElement;

                    const codeView = new CodeView(preElement, this.defaultCodeViewOptions || {});
                    codeView.detach();

                    if (preElement.dataset.cbActive !== undefined) {
                        this.setActiveCodeView(codeView);
                    }

                    codeBoxItemInfos.push({
                        type: "CodeView",
                        codeViewInfo: {
                            codeView: codeView,
                            dataset: preElement.dataset
                        }
                    })
                } else if (initializationInfo.type === "FileInfo" && initializationInfo.fileInfo) {
                    codeBoxItemInfos.push({
                        type: "FileInfo",
                        fileInfo: initializationInfo.fileInfo
                    })
                }
            }
        }

        //this.onInit(codeViewInfos, this.fileInfos || []);
        this.onInit(codeBoxItemInfos);

        //this.preElements = null;
        this.initializationData = null;
        this.defaultCodeViewOptions = null;
        this.initialized = true;
        //this.fileInfos = null;
    }

    public isInitialized() : boolean {
        return this.initialized;
    }

    //protected abstract onInit(codeViewInfos : CodeViewInfo[], fileInfos : FileInfo[]) : void;
    protected abstract onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void;

    protected setActiveCodeView(codeView : CodeView) {
        if (this.activeCodeView) {
            this.activeCodeView.detach();
        }

        codeView.appendTo(this.codeViewContainer);

        this.activeCodeView = codeView;

        this.hideNoCodeViewSelectedMessage();
    }

    // protected getInitialActiveCodeViewLinesCount() : number | null { // null pro nic
    //     return this.initialCodeViewLinesCount;
    // } // todo - tato metoda možná ani nebude potřeba

    private showNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.remove(this.noCodeViewSelectedCSSHiddenClass);
    }

    private hideNoCodeViewSelectedMessage() : void {
        this.noCodeViewSelectedElement.classList.add(this.noCodeViewSelectedCSSHiddenClass);
    }

    private onLazyInitPlaceholderElementIntersectionChange(isIntersecting : boolean) : void {
        if (isIntersecting) this.init();
    }

    private getLinesCount(codeElement : HTMLElement) : number {
        if (codeElement.textContent === null) return 0;
        return codeElement.textContent.split('\n').length;
    }

    private getCodeElement(preElement : HTMLPreElement) : HTMLElement | null {
        const children = Array.from(preElement.children);
        for (let child of children) {
            if (child.tagName === "CODE" && child instanceof HTMLElement) {
                return child;
            }
        }
        return null;
    }

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

export default Codebox;

/**
Co tady teda implementovat:
    X- lazy loading
    X- předávání code views
        - ještě brát v potaz file elementy - ty jsou taky společné pro oba code boxy, ale bude se předávat dataset

Co to vlastně code box je?
    - je to komponenta, obsahující code views, která je zobrazuje - to je v podstatě všechno co to je
    - bude možné přidávat code views
        - ale asi to bude implementované nějak v podtřídách
    - taky mazat
    - taky měnit názvy - názvy by možná řešili až podtřídy
 */

/**
Co by měla tato základní třída dělat:
- může najít všechny pre elementy v předaném elementu a vytvořit z nich code views
    - zároveň může taky vzít datasety, protože ty budou taky potřeba - ProjectCodeBox jich bude mít pro code view víc
- vytvoří root element, na kterém potom mohou podtřídy stavět
- taky by se to mohlo starat o zobrazování aktivních ukázek kódu v nějakém elementu, který by se vytvořil podtřídou
    - 

Operace, které bych chtěl u obou code boxů:
    - přidat code view
    - nastavit code view název
    - smazat code view
    - resetovat code view do initial stavu (v jakém byl než se aplikovali změny přes metody)
        - a nebo ne?
            - budu - kvůli lazy loadingu (ale to až u ProjectCodeBox)

    - lazy initializing
        - jak to udělat?
        - u project code boxů se kdyžtak načtou i ty, na kterých je ukázka závislá
            - takže je půjde kdyžtak inicializovat zavoláním metody
        - musí být nějaký element, který se nejdříve zobrazí namísto ukázky
            - měl by jej asi vytvořit implementující code box?
                - ne, asi tam hodím default, ale tak kdyby náhodou, tak to půjde přepsat
                - ale toto není tak důležité... - protože to stejně většinou vidět nepůjde - načte se to dřív, načte (nebo teda inicializuje) se to dřív, než se tam obrazovka dostane
            - a ten element nebude součástí root elementu
    
    - aby uživatel nemusel kdyžtak inicializovat code boxy a code views ručně, tak by na to mohla být nějaká speciální třída, kde by se předal selektor
        - CodeViewInitializer
        - TabCodeBoxInitializer
        - ProjectCodeBoxInitializer
            - je to ale hromadné, takže nějaký trochu jiný název

    - o resetování se asi tady ta základní třída vůbec starat nebude
    
    - Pluginy:
        - v options by byla vlastnost plugin
            - předával by se tam new PluginInitializer<MyPlugin>()
                - přičemž CodeView by mělo tohle jako typ:
                    plugins : PluginInitializer<extends CodeViewPlugin>[] - něco takového
 */