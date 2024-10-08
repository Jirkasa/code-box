import CodeView from "../../code-view/CodeView";
import GlobalConfig from "../../GlobalConfig";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeBoxMemento from "../CodeBoxMemento";
import CodeViewButton from "../CodeViewButton";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import TabCodeBoxBuilder from "./TabCodeBoxBuilder";
import TabCodeBoxCodeView from "./TabCodeBoxCodeView";
import TabCodeBoxFile from "./TabCodeBoxFile";
import TabCodeBoxMemento, { TabCodeBoxCodeViewMementoEntry, TabCodeBoxFileMementoEntry } from "./TabCodeBoxMemento";
import TabCodeBoxOptions from "./TabCodeBoxOptions";
import TabCodeViewButton from "./TabCodeViewButton";
import TabFileButton from "./TabFileButton";

/** Tab code box. */
class TabCodeBox extends CodeBox {
    /** Path to SVG sprite. */
    private readonly svgSpritePath : string | null;
    /** Name of icon for code view buttons. */
    private readonly codeFileIconName : string | null;
    /** Name of icon for file buttons. */
    private readonly fileIconName : string | null;
    /** Name of download icon for file buttons. */
    private readonly downloadIconName : string | null;

    /** Container for code view and file buttons. */
    private tabsContainer : HTMLElement;
    /** Event source to set active code view of code box. */
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();

    /** Memento created after initialization of code box. */
    private initialMemento : CodeBoxMemento | null = null;

    /** Code views stored by identifiers. */
    private codeViews = new Map<string, CodeView>();
    /** Code view entries stored by code views. */
    private codeViewEntries = new Map<CodeView, CodeViewEntry>();
    /** File entries stored by identifiers. */
    private fileEntries = new Map<string, FileEntry>();

    /**
     * Creates new tab code box.
     * @param element Code box root element.
     * @param options Code box options.
     */
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

        if (!this.isLazyInitializationEnabled) this.init();
    }

    public addCodeView(identifier: string, codeView: CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.codeViews.has(identifier)) return false;

        const codeViewCopy = codeView.clone();

        return this._addCodeView(identifier, codeViewCopy);
    }

    /**
     * Adds new code view to code box without making copy of code view.
     * @param identifier Identifier under which the code view should be added to code box.
     * @param codeView Code view.
     * @returns Indicates whether code view has been successfully added.
     */
    private _addCodeView(identifier : string, codeView : CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.codeViews.has(identifier)) return false;

        let codeViewButton = new TabCodeViewButton(identifier, this.showCodeViewEventSource, codeView, this.svgSpritePath, this.codeFileIconName);
        codeViewButton.appendTo(this.tabsContainer);

        const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
        const codeBoxCodeView = new TabCodeBoxCodeView(identifier, codeView, this, codeBoxCodeViewManager);

        this.codeViews.set(identifier, codeView);
        const position = this.codeViewEntries.size + this.fileEntries.size;
        this.codeViewEntries.set(codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager, codeViewButton, position));

        return true;
    }

    public getCodeViews() : TabCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxCodeViews = new Array<TabCodeBoxCodeView>();
        this.codeViewEntries.forEach(entry => codeBoxCodeViews.push(entry.codeBoxCodeView));
        return codeBoxCodeViews;
    }

    public getCodeView(identifier: string) : TabCodeBoxCodeView | null {
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

        this.decrementItemPositionsAfterPosition(codeViewEntry.position);

        return true;
    }

    public removeAllCodeViews() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.codeViews.forEach(codeView => {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) return;

            codeViewEntry.codeViewButton.detach();
            codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();

            this.decrementItemPositionsAfterPosition(codeViewEntry.position);
        });

        this.codeViews.clear();
        this.codeViewEntries.clear();

        this.setNoActiveCodeView();
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

    /**
     * Returns position of code view button.
     * @param identifier Identifier of code view.
     * @returns Position of code view button starting from 0 (or null if code view does not exist).
     */
    public getCodeViewButtonPosition(identifier : string) : number | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.position;
    }

    /**
     * Changes position of code view button by swapping it with different code view or file button.
     * @param identifier Identifier of code view.
     * @param position Position of code view or file button (starting from 0) with which should be code view button swapped.
     * @returns Indicates whether the position has been successfully changed.
     */
    public setCodeViewButtonPosition(identifier : string, position: number) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        position = Math.trunc(position);

        const maxPosition = this.codeViewEntries.size + this.fileEntries.size - 1;
        if (position < 0 || position > maxPosition) return false;

        const codeView = this.codeViews.get(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        let positionUpdated = false;
        this.codeViewEntries.forEach(entry => {
            if (entry.position === position) {
                entry.position = codeViewEntry.position;
                positionUpdated = true;
            }
        });
        if (!positionUpdated) {
            this.fileEntries.forEach(entry => {
                if (entry.position === position) {
                    entry.position = codeViewEntry.position;
                    positionUpdated = true;
                }
            });
        }

        if (!positionUpdated) return false;

        codeViewEntry.position = position;
        this.updateButtonsOrder();
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

    public getActiveCodeView() : TabCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.getCurrentlyActiveCodeView();
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public addFile(identifier: string, downloadLink: string | null = null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.fileEntries.has(identifier)) return false;

        let fileButton = new TabFileButton(identifier, downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);
        fileButton.appendTo(this.tabsContainer);

        const codeBoxFileManager = new CodeBoxFileManager();
        const codeBoxFile = new TabCodeBoxFile(identifier, downloadLink, this, codeBoxFileManager);

        const position = this.codeViewEntries.size + this.fileEntries.size;
        this.fileEntries.set(identifier, new FileEntry(codeBoxFile, codeBoxFileManager, fileButton, position));
        return true;
    }

    public getFiles() : TabCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFiles = new Array<TabCodeBoxFile>();
        this.fileEntries.forEach(entry => codeBoxFiles.push(entry.codeBoxFile));
        return codeBoxFiles;
    }

    public getFile(identifier: string) : TabCodeBoxFile | null {
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

        this.decrementItemPositionsAfterPosition(fileEntry.position);

        return true;
    }

    public removeAllFiles() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.fileEntries.forEach(fileEntry => {
            fileEntry.fileButton.detach();

            this.decrementItemPositionsAfterPosition(fileEntry.position);
        });

        this.fileEntries.clear();
    }

    public changeFileIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;
        if (this.fileEntries.has(newIdentifier)) return false;

        fileEntry.fileButton.setText(newIdentifier);
        fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);

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

    /**
     * Returns position of file button.
     * @param identifier Identifier of file.
     * @returns Position of file button starting from 0 (or null if file does not exist).
     */
    public getFileButtonPosition(identifier : string) : number | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return null;

        return fileEntry.position;
    }

    /**
     * Changes position of file button by swapping it with different code view or file button.
     * @param identifier Identifier of file.
     * @param position Position of code view or file button (starting from 0) with which should be file button swapped.
     * @returns Indicates whether the position has been successfully changed.
     */
    public setFileButtonPosition(identifier : string, position: number) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        position = Math.trunc(position);

        const maxPosition = this.codeViewEntries.size + this.fileEntries.size - 1;
        if (position < 0 || position > maxPosition) return false;

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;

        let positionUpdated = false;
        this.codeViewEntries.forEach(entry => {
            if (entry.position === position) {
                entry.position = fileEntry.position;
                positionUpdated = true;
            }
        });
        if (!positionUpdated) {
            this.fileEntries.forEach(entry => {
                if (entry.position === position) {
                    entry.position = fileEntry.position;
                    positionUpdated = true;
                }
            });
        }

        if (!positionUpdated) return false;

        fileEntry.position = position;
        this.updateButtonsOrder();
        return true;
    }

    public reset() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (!this.initialMemento) return;
        this.applyMemento(this.initialMemento);
    }

    public createMemento() : CodeBoxMemento {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewMementoEntries = new Array<TabCodeBoxCodeViewMementoEntry>();
        const fileMementoEntries = new Array<TabCodeBoxFileMementoEntry>();

        this.codeViewEntries.forEach((codeViewEntry, codeView) => {
            const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
            if (identifier === null) return;
            codeViewMementoEntries.push({
                codeView: codeView,
                codeViewMemento: codeView.createMemento(),
                identifier: identifier,
                position: codeViewEntry.position
            });
        });
        this.fileEntries.forEach(fileEntry => {
            const identifier = fileEntry.codeBoxFile.getIdentifier();
            if (identifier === null) return;
            fileMementoEntries.push({
                downloadLink: fileEntry.codeBoxFile.getDownloadLink(),
                identifier: identifier,
                position: fileEntry.position
            });
        });

        return new TabCodeBoxMemento(
            this,
            (identifier, codeView) => this._addCodeView(identifier, codeView),
            codeViewMementoEntries,
            fileMementoEntries,
            this.getCurrentlyActiveCodeView()
        );
    }

    public applyMemento(memento: CodeBoxMemento) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);
        
        memento.apply(this);
    }

    protected onInit(codeBoxItemInfos : CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                const codeViewInfo = codeBoxItemInfo.codeViewInfo;

                const identifier = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                const isActive = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined;

                if (this.codeViews.has(identifier)) {
                    if (!isActive) continue;
                    
                    // active code view takes precedence over others (other code views with the same identifier are removed)
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
                const codeBoxCodeView = new TabCodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);

                this.codeViews.set(identifier, codeViewInfo.codeView);
                const position = this.codeViewEntries.size + this.fileEntries.size;
                this.codeViewEntries.set(codeViewInfo.codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager, codeViewButton, position));
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                const fileInfo = codeBoxItemInfo.fileInfo;

                const identifier = fileInfo.name;

                if (this.fileEntries.has(identifier)) continue;

                let fileButton = new TabFileButton(identifier, fileInfo.downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);
                fileButton.appendTo(this.tabsContainer);

                const codeBoxFileManager = new CodeBoxFileManager();
                const codeBoxFile = new TabCodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

                const position = this.codeViewEntries.size + this.fileEntries.size;
                this.fileEntries.set(identifier, new FileEntry(codeBoxFile, codeBoxFileManager, fileButton, position));
            }
        }
    }

    protected onAfterInit() : void {
        this.initialMemento = this.createMemento();
    }

    /**
     * Called by code view buttons when they are clicked.
     * @param codeViewButton Code view button that requested change of active code view.
     * @param codeView Code view that should be set as active.
     */
    private onShowCodeView(codeViewButton : CodeViewButton, codeView : CodeView) : void {
        const activeCodeView = this.getCurrentlyActiveCodeView();
        if (activeCodeView) {
            const activeCodeViewEntry = this.codeViewEntries.get(activeCodeView);
            activeCodeViewEntry?.codeViewButton.setAsInactive();
        }

        codeViewButton.setAsActive();

        this.changeActiveCodeView(codeView);
    }

    /**
     * Decrements positions of all code views and files that have position after passed position.
     * @param position Position.
     */
    private decrementItemPositionsAfterPosition(position : number) : void {
        this.codeViewEntries.forEach(entry => {
            if (entry.position > position) {
                entry.position--;
            }
        });
        this.fileEntries.forEach(entry => {
            if (entry.position > position) {
                entry.position--;
            }
        });
    }

    /**
     * Updates code view and file buttons based on positions.
     */
    private updateButtonsOrder() : void {
        const items = new Array<CodeViewEntry | FileEntry>();

        this.codeViewEntries.forEach(entry => items.push(entry));
        this.fileEntries.forEach(entry => items.push(entry));

        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            items[i] = items[entry.position];
            items[entry.position] = entry;
        }

        for (let item of items) {
            if (item instanceof CodeViewEntry) {
                item.codeViewButton.appendTo(this.tabsContainer);
            } else {
                item.fileButton.appendTo(this.tabsContainer);
            }
        }
    }
}

export default TabCodeBox;