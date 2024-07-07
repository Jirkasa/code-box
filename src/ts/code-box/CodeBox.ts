import CodeView from "../code-view/CodeView";
import CodeBoxBuilder from "./CodeBoxBuilder";
import CodeBoxOptions from "./CodeBoxOptions";

abstract class Codebox {
    protected readonly rootElement : HTMLElement;
    private readonly codeViewContainer : HTMLElement;
    private readonly noCodeViewSelectedElement : HTMLElement;
    // private lazyInitialingElement : HTMLElement | null = null;

    constructor(element : HTMLElement, options : CodeBoxOptions, codeBoxBuilder : CodeBoxBuilder) { // možná předávat additional elementy, aby se brali tak, že nebyli přidáni až po inicializaci? - a asi by to možná bylo lepší? - no nevím, možná i code views by byla možnost posílat už napřímo // // ale psal jsem že resetování tu nebude - to bude na podtřídách jak to implementují, takže ne
        this.rootElement = element;

        codeBoxBuilder.customizeRootElement(this.rootElement);
        this.codeViewContainer = codeBoxBuilder.createCodeViewContainer();
        this.noCodeViewSelectedElement = codeBoxBuilder.createNoCodeViewSelectedElement();

        codeBoxBuilder.assembleElements(this.rootElement, this.codeViewContainer, this.noCodeViewSelectedElement);

        // tak určitě vím, že budu chtít zpracovat pre elementy, tak si to připravím
        //const preElements = new Array<HTMLPreElement>();

        const preElements = Array<HTMLPreElement>();

        for (let i = 0; i < this.rootElement.children.length; i++) {
            const child = this.rootElement.children[i];
            if (!(child instanceof HTMLPreElement)) continue;
            const codeElement = this.getCodeElement(child);
            if (!codeElement) continue;
            preElements.push(child);
        }

        if (options.lazyInit === undefined || options.lazyInit) {
            // let maxLinesCount = 
            // pro lazyInit bude ještě konfigurovatelný padding v options

            // if (this.rootElement.parentElement === null) throw new Error("Code box has to have parent element for lazy initializing.");
            // this.lazyInitialingElement = document.createElement("div");
            // this.rootElement.parentElement.insertBefore(this.lazyInitialingElement, this.rootElement);
        }
    }

    public init() : void { // pokud se tohle nezavolá hned, tak se to zavolá potom pro lazy inicializování | a nebo to může být voláno, pokud je lazy initializing zapnutý, ale ještě nedošlo k inicializování při najetí viewportu
        // pro ProjectCodeBoxy se bude jako argument do konstruktoru posílat code box, od kterého se dědí, takže tady není problém
            // na tvorbu ProjectCodeBoxů stejně bude ještě nějaká další třída
                // no jo, ale jak bude probíhat dědění?
                    // tak mohlo by se to třeba zatím nějak zablokovat?
                        // co ale potom se zobrazováním pro lazy loading, když se bude dědit a zobrazovat již starší code view?
                        // no - asi bych úplně nezobrazoval přímo skryté code view, ale spočítal bych si jeho řádky kódu plus výšku řádku (navíc tam mám i rem jednotky)
    }

    // protected abstract createNoCodeViewSelectedElement() : HTMLElement;

    // protected getMaxLinesCount() : number { // todo ve třídě ProjectCodeBox to přepíšu

    // } // - ne, mělo by to být pro aktivní code view

    protected setActiveCodeView(codeView : CodeView) {

    }

    // private hasElementCodeElementChild(element : HTMLElement) : boolean {
    //     const children = Array.from(element.children);
    //     for (let child of children) {
    //         if (child.tagName === "CODE") {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

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

    // když to nepůjde vidět, udělám to jako prázdný element...
    // protected createLoadingElement() : HTMLElement {
    //     const loadingElement = document.createElement("div");
    //     loadingElement.classList.add("something"); // todo - změnit
    //     loadingElement.innerText = "Waiting for initialization.";
    //     return loadingElement;
    // }
}

export default Codebox;

/**
Co tady teda implementovat:
    - lazy loading - ale jak?
    - 

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
    - mohla by se o lazy loading starat už i tato třída?
        - ne, ale její init metoda by se mohla klidně zavolat až potom
        - takže by se tato metoda ještě mohla starat o stav code boxu

    - lazy initializing
        - jak to udělat?
        - u project code boxů se kdyžtak načtou i ty, na kterých je ukázka závislá
            - takže je půjde kdyžtak inicializovat zavoláním metody
        - musí být nějaký element, který se nejdříve zobrazí namísto ukázky
            - měl by jej asi vytvořit implementující code box?
                - ne, asi tam hodím default, ale tak kdyby náhodou, tak to půjde přepsat
                - ale toto není tak důležité... - protože to stejně většinou vidět nepůjde - načte se to dřív, načte (nebo teda inicializuje) se to dřív, než se tam obrazovka dostane
            - a ten element nebude součástí root elementu
        - lazy initializing bude fungovat asi jen směrem dolů
            - vlastně můžu zjistit, jestli je nějaký code view nastaven jako aktivní a vzít to podle jeho výšky
                - a pokud ne, tak to vezmu podle výšky elementu, který zobrazuje, že žádná ukázka není vybrána

    - jaké stavy by tedy code box mohl mít?
        - uninitialized
        - initialized
            - nejsou to stavy - prostě to jen určuje, jestli je code box inicializován
    
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