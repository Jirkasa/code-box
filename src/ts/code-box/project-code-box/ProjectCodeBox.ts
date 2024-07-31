import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeViewButton from "../CodeViewButton";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import FoldersManager from "./FoldersManager";
import PackagesSectionToggle from "./PackagesSectionToggle";
import PanelToggle from "./PanelToggle";
import ProjectCodeBoxBuilder from "./ProjectCodeBoxBuilder";
import ProjectCodeBoxCodeView from "./ProjectCodeBoxCodeView";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";
import ProjectCodeBoxOptions from "./ProjectCodeBoxOptions";

class ProjectCodeBox extends CodeBox {
    private panelToggle : PanelToggle;
    private packagesSectionToggle : PackagesSectionToggle;
    private foldersManager : FoldersManager;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    private codeViewEntries = new Map<CodeView, CodeViewEntry>(); // todo - možná spíš podle identifieru?
    private fileEntries = new Map<ProjectCodeBoxFile, FileEntry>();
    private projectName : string;
    
    private readonly openActiveCodeViewFolderOnInit : boolean;
    private readonly openActiveCodeViewPackageOnInit : boolean;

    constructor(element : HTMLElement, options : ProjectCodeBoxOptions = {}, parentCodeBox : ProjectCodeBox | null = null) { // todo - ještě by možná mohlo jít nastavit, jestli dědit od aktuálního stavu code boxu nebo ne
        const codeBoxBuilder = new ProjectCodeBoxBuilder(
            options.svgSpritePath || null,
            options.svgSpriteIcons ? (options.svgSpriteIcons.panelOpenButton || null) : null
        );
        super(element, options, codeBoxBuilder);

        this.fillProjectCodeBoxOptionsFromDataset(options, element.dataset);

        this.projectName = options.projectName || GlobalConfig.DEFAULT_PROJECT_NAME;

        codeBoxBuilder.getFolderStructureHeadingElement().innerText = options.folderStructureHeading || GlobalConfig.DEFAULT_PROJECT_FOLDER_STRUCTURE_HEADING;
        codeBoxBuilder.getPackagesHeadingElement().innerText = options.packagesHeading || GlobalConfig.DEFAULT_PROJECT_PACKAGES_HEADING;

        this.panelToggle = new PanelToggle(codeBoxBuilder.getPanelElement(), codeBoxBuilder.getPanelOpenButtonElement(), () => this.onPanelToggled());
        this.packagesSectionToggle = new PackagesSectionToggle(
            codeBoxBuilder.getPanelContentElement(),
            codeBoxBuilder.getHorizontalRule(),
            codeBoxBuilder.getPackagesHeadingElement(),
            codeBoxBuilder.getPackagesContainer()
        );
        this.foldersManager = new FoldersManager(
            codeBoxBuilder.getFolderStructureContainer(),
            codeBoxBuilder.getPackagesContainer(),
            this.projectName,
            options.packagesFolderPath || null,
            options.defaultPackageName || null,
            options.createFoldersForPackages !== undefined ? options.createFoldersForPackages : GlobalConfig.DEFAULT_CREATE_FOLDERS_FOR_PACKAGES,
            options.foldersDelimiterForPackages || null,
            this.panelToggle.isOpened(),
            options.folderAnimationSpeed !== undefined ? options.folderAnimationSpeed : GlobalConfig.DEFAULT_FOLDER_ANIMATION_SPEED,
            options.folderAnimationEasingFunction || GlobalConfig.DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION,
            options.svgSpritePath,
            this.getIconName(options, "folderArrow"),
            this.getIconName(options, "project"),
            this.getIconName(options, "folder"),
            this.getIconName(options, "package"),
            this.getIconName(options, "codeFile"),
            this.getIconName(options, "file"),
            this.getIconName(options, "download")
        );
        if (options.openRootFolderOnInit !== undefined ? options.openRootFolderOnInit : true) { // todo - ale potom pro reset si to budu muset ukládat - dědit se to ale nebude - v dokumentaci bude napsáno, které options se dědí a které ne
            this.foldersManager.openFolder("/", false, false);
        }
        if (options.openPanelOnInit) {
            this.panelToggle.open();
        }

        this.openActiveCodeViewFolderOnInit = options.openActiveCodeViewFolderOnInit !== undefined ? options.openActiveCodeViewFolderOnInit : true;
        this.openActiveCodeViewPackageOnInit = options.openActiveCodeViewPackageOnInit !== undefined ? options.openActiveCodeViewPackageOnInit : true;

        this.showCodeViewEventSource.subscribe((_, codeView) => this.onShowCodeView(codeView));
    }

    public getCodeViews() : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();
        this.codeViewEntries.forEach(entry => codeBoxCodeViews.push(entry.codeBoxCodeView));
        return codeBoxCodeViews;
    }

    public getCodeViewsByFolderPath(folderPath : string, includeSubfolders : boolean = false) : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInFolder(folderPath, includeSubfolders);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeBoxCodeViews.push(codeViewEntry.codeBoxCodeView);
        }

        return codeBoxCodeViews;
    }

    public getCodeViewsByPackage(packageName : string | null) : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInPackage(packageName);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeBoxCodeViews.push(codeViewEntry.codeBoxCodeView);
        }

        return codeBoxCodeViews;
    }

    public getCodeView(identifier: string) : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public getCodeViewByFolderPath(folderPath : string, fileName : string) : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByFolderPath(folderPath, fileName);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public getCodeViewByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxCodeView | null { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByPackage(packageName, fileName);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public removeCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        const success = this.foldersManager.removeCodeViewByIdentifier(identifier);
        if (!success) return false;

        if (this.getCurrentlyActiveCodeView() === codeView) {
            this.changeActiveCodeView(null);
        }
        codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();

        this.codeViewEntries.delete(codeView);

        return true;
    }

    public changeCodeViewIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeCodeViewIdentifier(identifier, newIdentifier, this.showCodeViewEventSource);
        if (!success) return false;

        const codeView = this.foldersManager.getCodeViewByIdentifier(newIdentifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        codeViewEntry?.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        return true;
    }

    public changeCodeViewPackage(identifier : string, packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        let fileName = codeViewEntry.codeBoxCodeView.getFileName() || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
        let folderPath = keepFolderPath ? codeViewEntry.codeBoxCodeView.getFolderPath() : null;
        const newIdentifier = this.foldersManager.getItemIdentifier(fileName, folderPath, true, packageName !== "" ? packageName : null);

        if (codeViewEntry.codeBoxCodeView.getIdentifier() !== newIdentifier && this.foldersManager.getCodeViewByIdentifier(newIdentifier) !== null) return false;
        if (this.foldersManager.getCodeViewByPackage(packageName, fileName) !== null) return false;

        if (codeViewEntry.codeBoxCodeView.getIdentifier() === newIdentifier) {
            this.foldersManager.removeCodeViewByIdentifier(identifier);
        }

        let success = this.foldersManager.addCodeView(fileName, codeView, this.showCodeViewEventSource, folderPath, true, packageName !== "" ? packageName : null);
        if (!success) return false;

        if (codeViewEntry.codeBoxCodeView.getIdentifier() !== newIdentifier) {
            this.foldersManager.removeCodeViewByIdentifier(identifier);
        }

        if (codeView === this.getCurrentlyActiveCodeView()) {
            this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(newIdentifier);
        }

        codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        return true;
    }

    public removeCodeViewPackage(identifier : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.removeCodeViewPackage(identifier);
    }

    public getCodeViewPackage(identifier : string) : string | null | undefined { // undefined znamená, že code view nemá balíček
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getCodeViewPackage(identifier);
    }

    public setActiveCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
        this.changeActiveCodeView(codeView);

        return true;
    }

    public setNoActiveCodeView() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.setNoCodeViewButtonAsActive();
        this.changeActiveCodeView(null);
    }

    public getActiveCodeView() : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.getCurrentlyActiveCodeView();
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public getFiles() : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFiles = new Array<ProjectCodeBoxFile>();
        this.fileEntries.forEach((_, codeBoxFile) => codeBoxFiles.push(codeBoxFile));
        return codeBoxFiles;
    }

    public getFilesByFolderPath(folderPath : string, includeSubfolders : boolean = false) : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilesInFolder(folderPath, includeSubfolders);
    }

    public getFilesByPackage(packageName : string | null) : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilesInPackage(packageName);
    }

    public getFile(identifier: string) : ProjectCodeBoxFile | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByIdentifier(identifier);
    }

    public getFileByFolderPath(folderPath : string, fileName : string) : ProjectCodeBoxFile | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByFolderPath(folderPath, fileName);
    }

    public getFileByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxFile | null { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByPackage(packageName, fileName);
    }

    public removeFile(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        if (!fileEntry) return false;

        const success = this.foldersManager.removeFileByIdentifier(identifier);
        if (!success) return false;

        fileEntry.codeBoxFileManager.unlinkCodeBox();

        this.fileEntries.delete(codeBoxFile);

        return true;
    }

    public changeFileIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeFileIdentifier(identifier, newIdentifier);
        if (!success) return false;

        const codeBoxFile = this.foldersManager.getFileByIdentifier(newIdentifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        fileEntry?.codeBoxFileManager.changeIdentifier(newIdentifier);

        return true;
    }

    public changeFilePackage(identifier : string, packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        if (!fileEntry) return false;

        let fileName = codeBoxFile.getFileName() || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT;
        let folderPath = keepFolderPath ? codeBoxFile.getFolderPath() : null;
        const newIdentifier = this.foldersManager.getItemIdentifier(fileName, folderPath, true, packageName !== "" ? packageName : null);

        if (codeBoxFile.getIdentifier() !== newIdentifier && this.foldersManager.getFileByIdentifier(newIdentifier) !== null) return false;
        if (this.foldersManager.getFileByPackage(packageName, fileName) !== null) return false;

        if (codeBoxFile.getIdentifier() === newIdentifier) {
            this.foldersManager.removeFileByIdentifier(identifier);
        }

        let success = this.foldersManager.addFile(fileName, codeBoxFile, folderPath, true, packageName !== "" ? packageName : null);
        if (!success) return false;

        if (codeBoxFile.getIdentifier() !== newIdentifier) {
            this.foldersManager.removeFileByIdentifier(identifier);
        }

        fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);

        return true;
    }

    public removeFilePackage(identifier : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.removeFilePackage(identifier);
    }

    public changeFileDownloadLink(identifier: string, newDownloadLink: string | null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeFileDownloadLinkByIdentifier(identifier, newDownloadLink);
        if (!success) return false;

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        fileEntry?.codeBoxFileManager.changeDownloadLink(newDownloadLink);

        return true;
    }

    public getFilePackage(identifier : string) : string | null | undefined {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilePackage(identifier);
    }

    public addFolder(folderPath : string) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.addFolder(folderPath);
    }

    public removeFolder(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInFolder(folderPath, true);
        const codeBoxFiles = this.foldersManager.getFilesInFolder(folderPath, true);

        const success = this.foldersManager.removeFolder(folderPath);
        if (!success) return false;

        const activeCodeView = this.getCurrentlyActiveCodeView();

        for (let codeView of codeViews) {
            if (codeView === activeCodeView) {
                this.changeActiveCodeView(null);
            }

            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;            

            codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
            this.codeViewEntries.delete(codeView);
        }

        for (let codeBoxFile of codeBoxFiles) {
            const fileEntry = this.fileEntries.get(codeBoxFile);
            if (!fileEntry) continue;

            fileEntry.codeBoxFileManager.unlinkCodeBox();
            this.fileEntries.delete(codeBoxFile);
        }

        if (!this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.hide();
        }

        return true;
    }

    public renameFolder(folderPath : string, newName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const newFolderPath = this.foldersManager.renameFolder(folderPath, newName);
        if (newFolderPath === null) return false;

        folderPath = this.foldersManager.getNormalizedFolderPath(folderPath);
        
        const codeViews = this.foldersManager.getCodeViewsInFolder(newFolderPath, true);
        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;

            const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
            if (identifier === null) continue;

            const newIdentifier = identifier.replace(folderPath, newFolderPath);

            codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);
        }

        const codeBoxFiles = this.foldersManager.getFilesInFolder(newFolderPath, true);
        for (let codeBoxFile of codeBoxFiles) {
            const fileEntry = this.fileEntries.get(codeBoxFile);
            if (!fileEntry) continue;

            const identifier = codeBoxFile.getIdentifier();
            if (identifier === null) continue;

            const newIdentifier = identifier.replace(folderPath, newFolderPath);

            fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);
        }

        return true;
    }

    public openFolder(folderPath : string, openParentFolders : boolean = false, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.openFolder(folderPath, openParentFolders, animate);
    }

    public closeFolder(folderPath : string, closeChildFolders : boolean = false, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.closeFolder(folderPath, closeChildFolders, animate);
    }

    public folderExists(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.folderExists(folderPath);
    }

    public isFolderOpened(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.isFolderOpened(folderPath);
    }

    public addPackage(name : string) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.addPackage(name);
    }

    public removePackage(name : string, removePackageFoldersAndContents : boolean = true, removeAllCodeViewsAndFiles : boolean = false) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const activeCodeView = this.getCurrentlyActiveCodeView();

        if (this.foldersManager.isCreateFoldersForPackagesEnabled() && removePackageFoldersAndContents) {
            const packageFolderPath = this.foldersManager.getFolderPathToRemovePackage(name);
            if (packageFolderPath !== null) {
                if (removeAllCodeViewsAndFiles) {
                    const success = this.foldersManager.removePackage(name, true);
                    if (!success) return false;
                }
                return this.removeFolder(packageFolderPath);
            } else {
                const codeViews = this.foldersManager.getCodeViewsInPackage(name);
                const codeBoxFiles = this.foldersManager.getFilesInPackage(name);

                for (let codeView of codeViews) {
                    const codeViewEntry = this.codeViewEntries.get(codeView);
                    if (!codeViewEntry) continue;
                    const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
                    if (identifier === null) continue;
                    this.foldersManager.removeCodeViewByIdentifier(identifier);
                    codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
                    this.codeViewEntries.delete(codeView);

                    if (codeView === activeCodeView) {
                        this.changeActiveCodeView(null);
                    }
                }
                for (let codeBoxFile of codeBoxFiles) {
                    const fileEntry = this.fileEntries.get(codeBoxFile);
                    if (!fileEntry) continue;
                    const identifier = codeBoxFile.getIdentifier();
                    if (identifier === null) continue;
                    this.foldersManager.removeFileByIdentifier(identifier);
                    fileEntry.codeBoxFileManager.unlinkCodeBox();
                    this.fileEntries.delete(codeBoxFile);
                }

                return this.foldersManager.removePackage(name, removeAllCodeViewsAndFiles);
            }
        } else {
            if (removeAllCodeViewsAndFiles) {
                let codeViews = this.foldersManager.getCodeViewsInPackage(name);
                let codeBoxFiles = this.foldersManager.getFilesInPackage(name);

                const success = this.foldersManager.removePackage(name, true);
                if (!success) return false;

                for (let codeView of codeViews) {
                    const codeViewEntry = this.codeViewEntries.get(codeView);
                    codeViewEntry?.codeBoxCodeViewManager.unlinkCodeBox();
                    this.codeViewEntries.delete(codeView);

                    if (codeView === activeCodeView) {
                        this.changeActiveCodeView(null);
                    }
                }
                for (let codeBoxFile of codeBoxFiles) {
                    const fileEntry = this.fileEntries.get(codeBoxFile);
                    fileEntry?.codeBoxFileManager.unlinkCodeBox();
                    this.fileEntries.delete(codeBoxFile);
                }

                return true;
            } else {
                return this.foldersManager.removePackage(name);
            }
        }

    }

    public renamePackage(name : string, newName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (!this.foldersManager.packageExists(name)) return false;
        if (this.foldersManager.packageExists(newName)) return false;

        const codeViews = this.foldersManager.getCodeViewsInPackage(name);
        const codeBoxFiles = this.foldersManager.getFilesInPackage(name);

        const packageFolderPath = this.foldersManager.getPackageFolderPath(name);

        this.foldersManager.addPackage(newName);
        if (this.foldersManager.isPackageFolderOpened(name)) {
            this.foldersManager.openPackage(newName, false);
        }

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeViewEntry.codeBoxCodeView.changePackage(newName, codeViewEntry.codeBoxCodeView.getFolderPath() !== packageFolderPath);
        }
        for (let codeBoxFile of codeBoxFiles) {
            codeBoxFile.changePackage(newName, codeBoxFile.getFolderPath() !== packageFolderPath);
        }

        this.removePackage(name, true);

        return true;
    }

    public openPackage(packageName : string | null, animate : boolean = true) : void { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.openPackage(packageName, animate);
    }

    public closePackage(packageName : string | null, animate : boolean = true) : void { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.closePackage(packageName, animate);
    }

    public packageExists(packageName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.packageExists(packageName);
    }

    public isPackageOpened(packageName : string | null) : boolean { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.isPackageFolderOpened(packageName);
    }

    public getProjectName() : string {
        return this.projectName;
    }

    public setProjectName(newName : string) : void {
        this.projectName = newName;
        this.foldersManager.setRootFolderName(this.projectName);
    }

    public openPanel() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.panelToggle.open();
    }

    public closePanel() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.panelToggle.close();
    }

    public isPanelOpened() : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.panelToggle.isOpened();
    }

    protected onInit(codeBoxItemInfos: CodeBoxItemInfo[]) : void {
        // jenom jeden konfigurační element pro složky bude asi dovolen - uvidím, možná to vadit nebude
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "HTMLElement" && codeBoxItemInfo.element) {
                const element = codeBoxItemInfo.element;

                if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folders"] !== undefined) {
                    this.createFolderStructure(element);
                } else if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Commands"] !== undefined) {
                    // todo
                }
            }
        }

        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                let codeViewInfo = codeBoxItemInfo.codeViewInfo;

                let folderPath = this.getFolderPathFromDataset(codeViewInfo.dataset);
                let fileName = this.getNameFromDataset(codeViewInfo.dataset) || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                let packageName = this.getPackageNameFromDataset(codeViewInfo.dataset);
                let isActive = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined;

                const identifier = this.foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                const success = this.foldersManager.addCodeView(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (!success) {
                    if (!isActive) continue;

                    let activeCodeView = this.foldersManager.getCodeViewByIdentifier(identifier);
                    const success = this.foldersManager.removeCodeViewByIdentifier(identifier);
                    if (!success && packageName !== null) {
                        activeCodeView = this.foldersManager.getCodeViewByPackage(packageName !== "" ? packageName : null, fileName);
                        this.foldersManager.removeCodeViewByPackage(packageName !== "" ? packageName : null, fileName);
                    }
                    if (activeCodeView) {
                        this.codeViewEntries.delete(activeCodeView);
                    }
                    this.foldersManager.addCodeView(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);
                }

                const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
                const codeBoxCodeView = new ProjectCodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);
                this.codeViewEntries.set(codeViewInfo.codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager));

                if (isActive) {
                    this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
                    if (this.openActiveCodeViewFolderOnInit) {
                        this.foldersManager.openFolder(folderPath || "/", true, false);
                    }
                    if (this.openActiveCodeViewPackageOnInit) {
                        this.foldersManager.openPackage(packageName !== "" ? packageName : null, false);
                    }
                }
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                let fileInfo = codeBoxItemInfo.fileInfo;

                let folderPath = this.getFolderPathFromDataset(fileInfo.dataset);
                let fileName = this.getNameFromDataset(fileInfo.dataset) || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT;
                let packageName = this.getPackageNameFromDataset(fileInfo.dataset);

                const identifier = this.foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                const codeBoxFileManager = new CodeBoxFileManager();
                const codeBoxFile = new ProjectCodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

                const success = this.foldersManager.addFile(fileName, codeBoxFile, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (!success) continue;

                this.fileEntries.set(codeBoxFile, new FileEntry(codeBoxFileManager));
            }
        }

        if (this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.show();
        } else {
            this.packagesSectionToggle.hide();
        }
    }

    private onShowCodeView(codeView : CodeView) : void {
        this.changeActiveCodeView(codeView);

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;
        const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
        if (identifier === null) return;
        this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
    }

    private onPanelToggled() : void {
        this.foldersManager.updateTabNavigation(this.panelToggle.isOpened());
    }

    private createFolderStructure(element : HTMLElement, parentFolderNames : string[] = []) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];

            if (!(child instanceof HTMLElement)) continue;

            let folderName : string | null = null;
            let childElement : HTMLElement | null = null;

            child.childNodes.forEach(node => {
                if (node instanceof Text) {
                    let text = node.textContent?.trim();

                    if (text && text.length > 0) {
                        folderName = text;
                    }
                } else if (node instanceof HTMLElement) {
                    childElement = node;
                }
            });

            if (folderName) {
                const folderNames = [...parentFolderNames, folderName];
                const folderPath = folderNames.join("/");

                this.foldersManager.addFolder(folderPath);

                if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Opened"] !== undefined) {
                    this.foldersManager.openFolder(folderPath, false, false);
                }

                if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolder"] !== undefined) {
                    this.foldersManager.setPackagesFolderPath(folderPath);
                }

                if (childElement) {
                    this.createFolderStructure(childElement, folderNames);
                }
            }
        }
    }

    private getFolderPathFromDataset(dataset : DOMStringMap) : string | null {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folder"] || null;
    }

    private getNameFromDataset(dataset : DOMStringMap) : string | null {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || null;
    }

    private getPackageNameFromDataset(dataset : DOMStringMap) : string | null {
        const packageName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Package"];
        return packageName !== undefined ? packageName : null;
    }

    private getIconName(options : ProjectCodeBoxOptions, iconName : "codeFile" | "file" | "download" | "panelOpenButton" | "folderArrow" | "project" | "folder" | "package") : string | null {
        if (!options.svgSpriteIcons) return null;
        return options.svgSpriteIcons[iconName] || null;
    }

    private fillProjectCodeBoxOptionsFromDataset(options : ProjectCodeBoxOptions, dataset : DOMStringMap) : void {
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderStructureHeading"] !== undefined) {
            options.folderStructureHeading = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderStructureHeading"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesHeading"] !== undefined) {
            options.packagesHeading = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesHeading"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"] !== undefined) {
            options.projectName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] !== undefined) {
            options.packagesFolderPath = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "DefaultPackageName"] !== undefined) {
            options.defaultPackageName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "DefaultPackageName"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] !== undefined) {
            options.createFoldersForPackages = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"] !== undefined) {
            options.foldersDelimiterForPackages = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] !== undefined) {
            options.folderAnimationSpeed = Number.parseFloat(dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] || "");
            if (Number.isNaN(options.folderAnimationSpeed)) {
                throw new Error("Folder animation speed option must be a number.");
            }
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"] !== undefined) {
            options.folderAnimationEasingFunction = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewFolderOnInit"] !== undefined) {
            options.openActiveCodeViewFolderOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewFolderOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewPackageOnInit"] !== undefined) {
            options.openActiveCodeViewPackageOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewPackageOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenRootFolderOnInit"] !== undefined) {
            options.openRootFolderOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenRootFolderOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelOnInit"] !== undefined) {
            options.openPanelOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelOnInit"] === "true";
        }
    }
}

export default ProjectCodeBox;

/*
- Teď udělat:
X - dořešit ty metody - ostatní přidám ještě potom
- ostatní metody
    - různé podobné věci ale třeba podle balíčků atd.

- todo - podívat se jestli používám všude GlobalConfig.DATA_ATTRIBUTE_PREFIX - narazil jsem na kód, kde jsem to nepoužil
*/

/*
TODO - ještě seřazování složek balíčků nemám hotové
X - TODO - changeIdentifier nemusí ještě fungovat tak jak má. Při přejmenování se může změnit i balíček. - to asi ještě nedělám - jen měním mapping myslím - takže předělat tak, aby se změnil i balíček - i když chci to tak? - nechci
TODO - a ještě metoda na přemístění code view - teď mám jen na přejmenování

Takže metody:
    Code Views:
        X - getCodeViews
        X - getCodeView
        X - removeCodeView
        X - changeCodeViewIdentifier
        X - setActiveCodeView
        X - setNoActiveCodeView
        X - getActiveCodeView
        --------
        X - getCodeViewPackage - získá název balíčku, do kterého code view patří
            X - propojím s CodeBoxCodeView
        X - getCodeViewByFolderPath
        X - getCodeViewByPackage
        -----------
        X - getCodeViewsByFolderPath (volitelný parametr: childFolders nebo tak něco)
        X - getCodeViewsByPackage
        X - changeCodeViewPackage
        X - removeCodeViewPackage
    Files:
        X - getFiles
        X - getFile
        X - removeFile
        X - changeFileIdentifier
        X - changeFileDownloadLink
        --------
        X - getFilePackage - získá název balíčku, do kterého file patří
            X - propojím s CodeBoxFile
        X - getFileByFolderPath
        X - getFileByPackage
        ------------
        X - getFilesByFolderPath (volitelný parametr: childFolders nebo tak něco)
        X - getFilesByPackage
        X - changeFilePackage
        X - removeFilePackage
    Složky:
        X - addFolder - přidá novou složku
        X - removeFolder - smaže složku (a podsložky) - a asi i jejich obsah
            - mělo by to odstraňovat packages?
                - asi by mělo - protože to se potom mezi těma složkama a packagem zruší vztah a vypadalo by to blbě
                    - samozřejmě se to bude dít jen, když bude nastaveno, že se pro ty packages vytváří složka
        X - renameFolder - přejmenuje složku - (tady se budou měnit identifiery - bude to složitější)

        X - openFolder - volitelný parametr: openParentFolders
        X - closeFolder - volitelný parametr: closeChildFolders
        X - folderExists - zjistí, jestli složka existuje
        X - isFolderOpened - zjistí, jestli je složka otevřená
    Balíčky:
        X - addPackage - jen přidá balíček - to by asi neměl být problém
        X - removePackage - odstraní balíček a odstraní z něj code views a files (pokud nebudou mít nastavenou složku mimo složku pro balíčky?) - defaultní balíček samozřejmě smazat nepůjde
            - odstraní se i složky? - možná na to vytvořit parametr (a volal bych removeFolder)
        X - renamePackage - přejmenuje balíček
        X - openPackage - otevře balíček
        X - closePackage - zavře balíček
        X - packageExists - zjistí, jestli balíček existuje
        X - isPackageOpened - zjistí, jestli je balíček otevřený
    Další:
        X - getProjectName
        X - setProjectName
        X - openPanel
        X - closePanel
        X - isPanelOpened
    Další u kterých nevím jestli dělat i verze na změnění:
        getPackagesFolderPath
        getFoldersDelimiterForPackages
    X - ještě nějaké píčoviny pro měnění balíčku pro code view a files - a tam se bude muset předávat, jestli se má změnit i složka - jestli se to má automaticky vygenerovat - no prostě kurva víš jak
        X - a taky složky... - i když, to jde přes identifier, tak uvidím
            X - ale mohl bych to přidat do ProjectCodeBoxCodeView

    CodeBoxCodeView a CodeBoxFile
        X - přidat metody (možná):
            X - getFolderPath
            X - getFileName
            X - ještě na změnu - to stejné, ale na změnu

    X - Todo - podívat se kde skrývat defaultní package - ve třídě FoldersManager

    Dál bych měl potom přidat metody pro přidávání nových code views nebo files
        - to jsem ale ještě úplně nepromyslel - tady v tom případě by se to ale muselo při přidávání klonovat (a napsat to taky do dokumentace)
            - tady ty metody by byly definované v CodeBox třídě, protože bych to chtěl pro všechny code boxy

    - složka pro balíčky se asi nebude dát změnit, takže folders konfigurační elementy kdyžtak dovolit jen v root ProjectCodeBoxu
        - ale to ještě nevím, ono to možná vadit nebude - uvidím jak se ty věci ohledně balíčků budou dědit

    - až ty metody dokončím, tak FoldersManager okomentovat - pořádně - ať je hned vidět co to dělá (i detaily popsat)
        - a taky ty metody v ProjectCodeBox třídě pořádně popsat

    - napsat testy na tady ty věci můžu
*/