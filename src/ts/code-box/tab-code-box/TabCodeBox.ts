import CodeView from "../../code-view/CodeView";
import GlobalConfig from "../../GlobalConfig";
import EventSourcePoint from "../../utils/EventSourcePoint";
import Codebox, { CodeBoxItemInfo, CodeViewInfo, FileInfo } from "../CodeBox";
import CodeViewButton from "../CodeViewButton";
import TabCodeBoxBuilder from "./TabCodeBoxBuilder";
import TabCodeBoxOptions from "./TabCodeBoxOptions";
import TabCodeViewButton from "./TabCodeViewButton";
import TabFileButton from "./TabFileButton";

class TabCodeBox extends Codebox {
    private tabsContainer : HTMLElement;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    private options : TabCodeBoxOptions; // todo - options jen tak neukládat, je to objekt, dá se měnit
    private activeCodeViewButton : CodeViewButton | null = null;

    constructor(element : HTMLElement, options : TabCodeBoxOptions = {}) {
        const tabsContainer = document.createElement("div");

        const codeBoxBuilder = new TabCodeBoxBuilder(tabsContainer);
        super(element, options, codeBoxBuilder);

        this.tabsContainer = tabsContainer;

        this.showCodeViewEventSource.subscribe((codeViewButton, codeView) => this.onShowCodeView(codeViewButton, codeView));

        this.options = options;
    }

    /*protected onInit(codeViewInfos : CodeViewInfo[], fileInfos : FileInfo[]) : void {
        for (let codeViewInfo of codeViewInfos) {
            let codeViewButton : TabCodeViewButton;
            let buttonText = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
            if (this.options.svgSpritePath && this.options.svgSpriteIcons && this.options.svgSpriteIcons.codeFile) {
                codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView, this.options.svgSpritePath, this.options.svgSpriteIcons.codeFile);
            } else {
                codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView);
            }
            if (codeViewInfo.dataset.cbActive !== undefined) {
                codeViewButton.setAsActive();
                this.activeCodeViewButton = codeViewButton;
            }
            codeViewButton.appendTo(this.tabsContainer);
        }

        for (let fileInfo of fileInfos) {
            let fileButton : TabFileButton;
            if (this.options.svgSpritePath && this.options.svgSpriteIcons) {
                fileButton = new TabFileButton(fileInfo.name, fileInfo.downloadLink, this.options.svgSpritePath, this.options.svgSpriteIcons.codeFile || null, this.options.svgSpriteIcons.download || null);
            } else {
                fileButton = new TabFileButton(fileInfo.name, fileInfo.downloadLink);
            }

            fileButton.appendTo(this.tabsContainer);
        }
    }*/

    protected onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeView" && codeBoxItemInfo.codeViewInfo) {
                let codeViewInfo = codeBoxItemInfo.codeViewInfo;

                let codeViewButton : TabCodeViewButton;
                let buttonText = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                if (this.options.svgSpritePath && this.options.svgSpriteIcons && this.options.svgSpriteIcons.codeFile) {
                    codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView, this.options.svgSpritePath, this.options.svgSpriteIcons.codeFile);
                } else {
                    codeViewButton = new TabCodeViewButton(buttonText, this.showCodeViewEventSource, codeViewInfo.codeView);
                }
                if (codeViewInfo.dataset.cbActive !== undefined) {
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

        this.setActiveCodeView(codeView);
    }
}

export default TabCodeBox;

// defaultně budou code boxy úplně bez ikon - ikony si budou muset přidat sami uživatelé

/**
Tady se akorát budou zobrazovat ukázky pomocí tab tlačítek.
- jen půjde nastavit, aby se automaticky vybrala jako aktivní první ukázka nebo ne
 */