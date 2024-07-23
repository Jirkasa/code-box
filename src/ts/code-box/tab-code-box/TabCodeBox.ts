import CodeView from "../../code-view/CodeView";
import GlobalConfig from "../../GlobalConfig";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeViewButton from "../CodeViewButton";
import TabCodeBoxBuilder from "./TabCodeBoxBuilder";
import TabCodeBoxOptions from "./TabCodeBoxOptions";
import TabCodeViewButton from "./TabCodeViewButton";
import TabFileButton from "./TabFileButton";

class TabCodeBox extends CodeBox {
    private tabsContainer : HTMLElement;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    private options : TabCodeBoxOptions; // todo - options jen tak neukládat, je to objekt, dá se měnit (uložit to jinak - to co potřebuju - ale měl bych stejně vytvářet kopii pro CodeBox třídu, takže to je asi jedno)
    private activeCodeViewButton : CodeViewButton | null = null;

    constructor(element : HTMLElement, options : TabCodeBoxOptions = {}) {
        const codeBoxBuilder = new TabCodeBoxBuilder();
        super(element, options, codeBoxBuilder);

        this.tabsContainer = codeBoxBuilder.getTabsContainer();

        this.showCodeViewEventSource.subscribe((codeViewButton, codeView) => this.onShowCodeView(codeViewButton, codeView));

        this.options = options;
    }

    protected onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                let codeViewInfo = codeBoxItemInfo.codeViewInfo;

                let codeViewButton : TabCodeViewButton;
                let buttonText = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                if (this.options.svgSpritePath && this.options.svgSpriteIcons && this.options.svgSpriteIcons.codeFile) {
                    codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView, this.options.svgSpritePath, this.options.svgSpriteIcons.codeFile);
                } else {
                    codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView);
                }
                if (codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined) {
                    codeViewButton.setAsActive();
                    this.activeCodeViewButton = codeViewButton;
                }
                codeViewButton.appendTo(this.tabsContainer);
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                let fileInfo = codeBoxItemInfo.fileInfo;

                let fileButton : TabFileButton;
                if (this.options.svgSpritePath && this.options.svgSpriteIcons) {
                    fileButton = new TabFileButton(fileInfo.name, fileInfo.downloadLink, this.options.svgSpritePath, this.options.svgSpriteIcons.file || null, this.options.svgSpriteIcons.download || null);
                } else {
                    fileButton = new TabFileButton(fileInfo.name, fileInfo.downloadLink);
                }

                fileButton.appendTo(this.tabsContainer);
            }
        }
    }

    private onShowCodeView(codeViewButton : CodeViewButton, codeView : CodeView) : void {
        if (this.activeCodeViewButton) {
            this.activeCodeViewButton.setAsInactive();
        }

        codeViewButton.setAsActive();
        this.activeCodeViewButton = codeViewButton;

        this.changeActiveCodeView(codeView);
    }
}

export default TabCodeBox;

// defaultně budou code boxy úplně bez ikon - ikony si budou muset přidat sami uživatelé

/**
Tady se akorát budou zobrazovat ukázky pomocí tab tlačítek.
- jen půjde nastavit, aby se automaticky vybrala jako aktivní první ukázka nebo ne
 */

/*

Potřeboval bych to nějak uklidit, ať se můžu posunout dál a považovat TabCodeBox prozatím za hotový.
- Budu muset promyslet jak to bude s options - když si to tu budu držet vše, tak to asi bude jednodušší, ale moc se mi to nelíbí

Teď jinak. Co tu budu chtít za metody, nebo co budu chtít mít možnost udělat:
    - získat přístup ke code views - ale jak v tomto případě? - asi podle názvu - takže tam nemůže být vícekrát
        - udělám to tak - bude abstraktní metoda v CodeBox třídě
        - a v tom případě tam bude taky metoda pro získání code view podle toho názvu (id)
    - přidávat nové code views (na nějakou klidně i pozici, podle indexu - a nebo nakonec)
        - ale pokud na to bude abstraktní metoda, tak jak?
            - nevím jestli mi to dovolí přidat nový paremetr, kdyžtak vytvořím novou metodu
            - spíš bych třeba vytvořil na to reordnutí novou metodu
    - mazat code views
    - půjde zobrazit konkrétní code view
    - získat aktivní code view

    - stejné operace bych potřeboval s file elementy

    - uživatel může se zíkanými code views dělat různé operace. Co když ale to code view detachne?
        - že bych to obalil do nějakého objektu? Stejně to bude muset být v něčem obalené
        - Takže řekněme že to bude CodeBoxCodeView:
            - bude navíc obsahovat i vlastnost název
                - půjde změnit přes metodu, ale pokud se nezmění (pokud už bude mít tento název někdo jiný, tak se vrátí false)
            - bude tam obsahovat i metodu na odstranění - takže chci vůbec samostatnou metodu i na toto, když to bude tady?
        - budu muset předělat i ty code view buttons atd...
            - nebo nebudu - stejně si budu muset nějak držet i ty normální CodeViews abych s nimi mohl pracovat - takže jinak, jednodušeji:
                - bude mapa: CodeView -> CodeBoxCodeView

    - to co jsem teď napsal se týká jen Code views. Nic dalšího potřebovat nebudu? Zdá se že asi ne.
    - ještě by se teda hodila metoda pro destroynutí celého code boxu.
    - možná ani ne tak pro destroynutí, ale třeba i přemístění, aby se to dalo přemístit
        - bude mít metody appendTo a detach
            - možná by se hodilo vytvořit ještě metodu insertBefore (i pro CodeView)
    - a ještě abstraktní reset metodu bych mohl nadefinovat v CodeBoxu
    
    - potom jsem chtěl vytvářet i ty pluginy, ale to nechám asi až na potom
        - nebo přidat tam tady tu možnost vůbec - myslím že asi jo, na nějaké věci, které by třeba do toho code boxu ještě něco přidali
            - ale to potom teda uvidím
            - ale zase, jak to dělat...
*/