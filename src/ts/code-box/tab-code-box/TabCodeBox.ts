import CodeView from "../../code-view/CodeView";
import GlobalConfig from "../../GlobalConfig";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFile from "../CodeBoxFile";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeViewButton from "../CodeViewButton";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import TabCodeBoxBuilder from "./TabCodeBoxBuilder";
import TabCodeBoxOptions from "./TabCodeBoxOptions";
import TabCodeViewButton from "./TabCodeViewButton";
import TabFileButton from "./TabFileButton";

class TabCodeBox extends CodeBox {
    private readonly svgSpritePath : string | null;
    private readonly codeFileIconName : string | null;
    private readonly fileIconName : string | null;
    private readonly downloadIconName : string | null;

    private tabsContainer : HTMLElement;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();

    private codeViews = new Map<string, CodeView>();
    private codeViewEntries = new Map<CodeView, CodeViewEntry>();
    private fileEntries = new Map<string, FileEntry>();

    constructor(element : HTMLElement, options : TabCodeBoxOptions = {}) {
        const codeBoxBuilder = new TabCodeBoxBuilder();
        super(element, options, codeBoxBuilder);

        this.tabsContainer = codeBoxBuilder.getTabsContainer();

        this.showCodeViewEventSource.subscribe((codeViewButton, codeView) => this.onShowCodeView(codeViewButton, codeView));

        this.svgSpritePath = options.svgSpritePath || null;
        if (options.svgSpriteIcons) {
            this.codeFileIconName = options.svgSpriteIcons.codeFile || null;
            this.fileIconName = options.svgSpriteIcons.file || null;
            this.downloadIconName = options.svgSpriteIcons.download || null;
        } else {
            this.codeFileIconName = null;
            this.fileIconName = null;
            this.downloadIconName = null;
        }
    }

    public getCodeViews() : CodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxCodeViews = new Array<CodeBoxCodeView>();
        this.codeViewEntries.forEach(entry => codeBoxCodeViews.push(entry.codeBoxCodeView));
        return codeBoxCodeViews;
    }

    public getCodeView(identifier: string) : CodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public removeCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        codeViewEntry.codeViewButton.detach();
        if (this.getCurrentlyActiveCodeView() === codeView) {
            this.setNoActiveCodeView();
        }

        codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();

        this.codeViews.delete(identifier);
        this.codeViewEntries.delete(codeView);

        return true;
    }

    public changeCodeViewIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return false;
        if (this.codeViews.has(newIdentifier)) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        codeViewEntry.codeViewButton.setText(newIdentifier);
        codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        this.codeViews.delete(identifier);
        this.codeViews.set(newIdentifier, codeView);

        return true;
    }

    public setActiveCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        const activeCodeView = this.getCurrentlyActiveCodeView();
        if (activeCodeView) {
            const activeCodeViewEntry = this.codeViewEntries.get(activeCodeView);
            activeCodeViewEntry?.codeViewButton.setAsInactive();
        }
        
        codeViewEntry.codeViewButton.setAsActive();

        this.changeActiveCodeView(codeView);

        return true;
    }

    public setNoActiveCodeView() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const activeCodeView = this.getCurrentlyActiveCodeView();
        if (activeCodeView) {
            const activeCodeViewEntry = this.codeViewEntries.get(activeCodeView);
            activeCodeViewEntry?.codeViewButton.setAsInactive();
        }

        this.changeActiveCodeView(null);
    }

    public getActiveCodeView() : CodeBoxCodeView | null {
        const codeView = this.getCurrentlyActiveCodeView();
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public getFiles() : CodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFiles = new Array<CodeBoxFile>();
        this.fileEntries.forEach(entry => codeBoxFiles.push(entry.codeBoxFile));
        return codeBoxFiles;
    }

    public getFile(identifier: string) : CodeBoxFile | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return null;

        return fileEntry.codeBoxFile;
    }

    public removeFile(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;

        fileEntry.fileButton.detach();
        
        this.fileEntries.delete(identifier);

        return true;
    }

    public changeFileIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;
        if (this.fileEntries.has(newIdentifier)) return false;

        fileEntry.fileButton.setText(newIdentifier);

        this.fileEntries.delete(identifier);
        this.fileEntries.set(newIdentifier, fileEntry);

        return true;
    }

    public changeFileDownloadLink(identifier: string, newDownloadLink: string | null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;

        fileEntry.codeBoxFileManager.changeDownloadLink(newDownloadLink);
        fileEntry.fileButton.setDownloadLink(newDownloadLink);

        return true;
    }

    protected onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                const codeViewInfo = codeBoxItemInfo.codeViewInfo;

                const identifier = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                const isActive = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined;

                if (this.codeViews.has(identifier)) {
                    if (!isActive) continue;
                    
                    const codeView = this.codeViews.get(identifier);
                    if (codeView) {
                        const codeViewEntry = this.codeViewEntries.get(codeView);
                        if (codeViewEntry) {
                            codeViewEntry.codeViewButton.detach();
                            codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
                        }
                        this.codeViews.delete(identifier);
                        this.codeViewEntries.delete(codeView);
                    }
                }

                let codeViewButton = new TabCodeViewButton(identifier, this.showCodeViewEventSource, codeViewInfo.codeView, this.svgSpritePath, this.codeFileIconName);
                if (isActive) {
                    codeViewButton.setAsActive();
                }
                codeViewButton.appendTo(this.tabsContainer);

                const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
                const codeBoxCodeView = new CodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);

                this.codeViews.set(identifier, codeViewInfo.codeView);
                this.codeViewEntries.set(codeViewInfo.codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager, codeViewButton));
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                const fileInfo = codeBoxItemInfo.fileInfo;

                const identifier = fileInfo.name;

                if (this.fileEntries.has(identifier)) continue;

                let fileButton = new TabFileButton(identifier, fileInfo.downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);
                fileButton.appendTo(this.tabsContainer);

                const codeBoxFileManager = new CodeBoxFileManager();
                const codeBoxFile = new CodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

                this.fileEntries.set(identifier, new FileEntry(codeBoxFile, codeBoxFileManager, fileButton));
            }
        }
    }

    private onShowCodeView(codeViewButton : CodeViewButton, codeView : CodeView) : void {
        const activeCodeView = this.getCurrentlyActiveCodeView();
        if (activeCodeView) {
            const activeCodeViewEntry = this.codeViewEntries.get(activeCodeView);
            activeCodeViewEntry?.codeViewButton.setAsInactive();
        }

        codeViewButton.setAsActive();

        this.changeActiveCodeView(codeView);
    }
}

export default TabCodeBox;

/*
Todo
- reordrování
- potom možná přidat i metodu insertBefore
- reset metoda v code boxu (možná - ještě uvidím, ale asi jo)
- ještě jsem chtěl metodu na přidávání code views - ale jak to řešit?
- todo - ještě metodu na měnění download linku
*/

/*
    - potom jsem chtěl vytvářet i ty pluginy, ale to nechám asi až na potom
        - nebo přidat tam tady tu možnost vůbec - myslím že asi jo, na nějaké věci, které by třeba do toho code boxu ještě něco přidali
            - ale to potom teda uvidím
            - ale zase, jak to dělat...
*/