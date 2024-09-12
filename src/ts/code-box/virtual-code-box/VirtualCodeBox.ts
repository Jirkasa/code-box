import GlobalConfig from "../../GlobalConfig";
import CodeView from "../../code-view/CodeView";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFile from "../CodeBoxFile";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeBoxMemento, { CodeViewMementoEntry, FileMementoEntry } from "../CodeBoxMemento";
import CodeBoxOptions from "../CodeBoxOptions";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import VirtualCodeBoxBuilder from "./VirtualCodeBoxBuilder";

/** Virtual code box. */
class VirtualCodeBox extends CodeBox {
    /** Memento created after initialization of code box. */
    private initialMemento : CodeBoxMemento | null = null;

    /** Code view entries stored by identifiers. */
    private codeViewEntries = new Map<string, CodeViewEntry>();
    /** File entries stored by identifiers. */
    private fileEntries = new Map<string, FileEntry>();
    /** Currently active code box code view. */
    private activeCodeBoxCodeView : CodeBoxCodeView | null = null;

    /**
     * Creates new virtual code box.
     * @param element Code box root element.
     * @param options Code box options.
     */
    constructor(element : HTMLElement, options : CodeBoxOptions = {}) {
        super(element, options, new VirtualCodeBoxBuilder());
        if (!this.isLazyInitializationEnabled) this.init();
    }

    public addCodeView(identifier: string, codeView: CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.codeViewEntries.has(identifier)) return false;

        const codeViewCopy = codeView.clone();

        return this._addCodeView(identifier, codeViewCopy);
    }

    /**
     * Adds new code view to code box without making copy of code view.
     * @param identifier Identifier under which the code view should be added to code box.
     * @param codeView Code view.
     * @returns Indicates whether code view has been successfully added.
     */
    private _addCodeView(identifier: string, codeView: CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.codeViewEntries.has(identifier)) return false;

        const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
        const codeBoxCodeView = new CodeBoxCodeView(identifier, codeView, this, codeBoxCodeViewManager);

        this.codeViewEntries.set(identifier, new CodeViewEntry(codeBoxCodeView, codeView, codeBoxCodeViewManager));
        return true;
    }

    public getCodeViews() : CodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxCodeViews = new Array<CodeBoxCodeView>();
        this.codeViewEntries.forEach(entry => codeBoxCodeViews.push(entry.codeBoxCodeView));
        return codeBoxCodeViews;
    }

    public getCodeView(identifier: string) : CodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewEntry = this.codeViewEntries.get(identifier);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public removeCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewEntry = this.codeViewEntries.get(identifier);
        if (!codeViewEntry) return false;

        if (this.getCurrentlyActiveCodeView() === codeViewEntry.codeView) {
            this.setNoActiveCodeView();
        }

        codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();

        this.codeViewEntries.delete(identifier);
        return true;
    }

    public removeAllCodeViews() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.codeViewEntries.forEach(codeViewEntry => codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox());
        this.codeViewEntries.clear();
        
        this.setNoActiveCodeView();
    }

    public changeCodeViewIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewEntry = this.codeViewEntries.get(identifier);
        if (!codeViewEntry) return false;
        if (this.codeViewEntries.has(newIdentifier)) return false;

        codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        this.codeViewEntries.delete(identifier);
        this.codeViewEntries.set(newIdentifier, codeViewEntry);

        return true;
    }

    public setActiveCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewEntry = this.codeViewEntries.get(identifier);
        if (!codeViewEntry) return false;

        this.changeActiveCodeView(codeViewEntry.codeView);
        this.activeCodeBoxCodeView = codeViewEntry.codeBoxCodeView;

        return true;
    }

    public setNoActiveCodeView() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.changeActiveCodeView(null);
        this.activeCodeBoxCodeView = null;
    }

    public getActiveCodeView() : CodeBoxCodeView | null {
        return this.activeCodeBoxCodeView;
    }

    public addFile(identifier: string, downloadLink: string | null = null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.fileEntries.has(identifier)) return false;

        const codeBoxFileManager = new CodeBoxFileManager();
        const codeBoxFile = new CodeBoxFile(identifier, downloadLink, this, codeBoxFileManager);

        this.fileEntries.set(identifier, new FileEntry(codeBoxFile, codeBoxFileManager));
        return true;
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

        fileEntry.codeBoxFileManager.unlinkCodeBox();

        this.fileEntries.delete(identifier);
        return true;
    }

    public removeAllFiles() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.fileEntries.forEach(fileEntry => fileEntry.codeBoxFileManager.unlinkCodeBox());
        this.fileEntries.clear();
    }

    public changeFileIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;
        if (this.fileEntries.has(newIdentifier)) return false;

        fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);

        this.fileEntries.delete(identifier);
        this.fileEntries.set(newIdentifier, fileEntry);

        return true;
    }

    public changeFileDownloadLink(identifier: string, newDownloadLink: string | null): boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const fileEntry = this.fileEntries.get(identifier);
        if (!fileEntry) return false;

        fileEntry.codeBoxFileManager.changeDownloadLink(newDownloadLink);

        return true;
    }

    public reset() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (!this.initialMemento) return;
        this.applyMemento(this.initialMemento);
    }

    public createMemento() : CodeBoxMemento {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViewMementoEntries = new Array<CodeViewMementoEntry>();
        const fileMementoEntries = new Array<FileMementoEntry>();

        this.codeViewEntries.forEach((codeViewEntry, identifier) => {
            codeViewMementoEntries.push({
                codeView: codeViewEntry.codeView,
                codeViewMemento: codeViewEntry.codeView.createMemento(),
                identifier: identifier
            });
        });
        this.fileEntries.forEach((fileEntry, identifier) => {
            fileMementoEntries.push({
                downloadLink: fileEntry.codeBoxFile.getDownloadLink(),
                identifier: identifier
            })
        });

        return new CodeBoxMemento(
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

    protected onInit(codeBoxItemInfos: CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                const codeViewInfo = codeBoxItemInfo.codeViewInfo;

                const identifier = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                const isActive = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined;

                if (this.codeViewEntries.has(identifier)) {
                    if (!isActive) continue;

                    // active code view takes precedence over others (other code views with the same identifier are removed)
                    const codeViewEntry = this.codeViewEntries.get(identifier);
                    if (codeViewEntry) {
                        codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
                    }
                    this.codeViewEntries.delete(identifier);
                }

                const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
                const codeBoxCodeView = new CodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);

                this.codeViewEntries.set(identifier, new CodeViewEntry(codeBoxCodeView, codeViewInfo.codeView, codeBoxCodeViewManager));
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                const fileInfo = codeBoxItemInfo.fileInfo;

                const identifier = fileInfo.name;

                if (this.fileEntries.has(identifier)) continue;

                const codeBoxFileManager = new CodeBoxFileManager();
                const codeBoxFile = new CodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

                this.fileEntries.set(identifier, new FileEntry(codeBoxFile, codeBoxFileManager));
            }
        }
    }

    protected onAfterInit() : void {
        this.initialMemento = this.createMemento();
    }
}

export default VirtualCodeBox;