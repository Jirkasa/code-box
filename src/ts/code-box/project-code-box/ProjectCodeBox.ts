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
- dořešit ty metody - ostatní přidám ještě potom
    - ještě k tomu přesouvání do složek... - co s automaticky generovanými složkami pro packages - když se třeba změní package, tak jak změnit item identifier? - možná předávat volitelný parametr, jestli se má změnit i identifier (složka)?
        - tohle musím promyslet (a hlavně to potom i napsat do dokumentace)
- ostatní metody
    - různé podobné věci ale třeba podle balíčků atd.
    - metoda na otevření/zavření panelu

- todo - podívat se jestli používám všude GlobalConfig.DATA_ATTRIBUTE_PREFIX - narazil jsem na kód, kde jsem to nepoužil
*/

/*
Takže jak to bude s mazáním code views a files v balíčcích?
Potřebuju si ujasnit:
    - jak to bude s mazáním balíčků (Package folders)
        - taky se tady bude ukládat, jestli byl package vygenerován automaticky
            - kdyžtak pokud by se metoda addPackage volala již pro existující package, tak by se to přepsalo
            - to je blbost - tak to dělat nebudu - to by bylo dost matoucí - nejdřív si tady nadefinuju ty další metody, které tady budu chtít implementovat a potom uvidím
                - třeba při mazání balíčků se může nastavit, jestli se mají smazat prázdné složky, jestli se má vymazat její obsah, atp.. - musím to promyslet
                    - bude to lepší než si pamatovat jestli se něco vytvořilo automaticky (to by bylo pro uživatele stejně matoucí a brali by to za chybu)
    - jak to bude s mazáním vygenerovaných složek pro balíčky
        - asi bude nejlepší, když se u každé složky bude ukládat, zda byla vytvořena automaticky pro balíček - to by asi bylo nejlepší
*/

/*
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
            - propojím s CodeBoxCodeView
        X - getCodeViewByFolderPath
        X - getCodeViewByPackage
    Files:
        X - getFiles
        X - getFile
        X - removeFile
        X - changeFileIdentifier
        X - changeFileDownloadLink
        --------
        X - getFilePackage - získá název balíčku, do kterého file patří
            - propojím s CodeBoxFile
        X - getFileByFolderPath
        X - getFileByPackage
    Složky:
        X - addFolder - přidá novou složku
        removeFolder - smaže složku (a podsložky) - a asi i jejich obsah
        renameFolder - přejmenuje složku - (tady se budou měnit identifiery - bude to složitější)
        X - openFolder - volitelný parametr: openParentFolders
        X - closeFolder - volitelný parametr: closeChildFolders
        X - folderExists - zjistí, jestli složka existuje
        X - isFolderOpened - zjistí, jestli je složka otevřená
    Balíčky:
        X - addPackage - jen přidá balíček - to by asi neměl být problém
        removePackage - odstraní balíček a odstraní z něj code views a files (pokud nebudou mít nastavenou složku mimo složku pro balíčky?) - defaultní balíček samozřejmě smazat nepůjde
        renamePackage - přejmenuje balíček
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

    CodeBoxCodeView a CodeBoxFile
        - přidat metody (možná):
            X - getFolderPath
            X - getFileName

    Dál bych měl potom přidat metody pro přidávání nových code views nebo files
        - to jsem ale ještě úplně nepromyslel - tady v tom případě by se to ale muselo při přidávání klonovat (a napsat to taky do dokumentace)
            - tady ty metody by byly definované v CodeBox třídě, protože bych to chtěl pro všechny code boxy

    - složka pro balíčky se asi nebude dát změnit, takže folders konfigurační elementy kdyžtak dovolit jen v root ProjectCodeBoxu
        - ale to ještě nevím, ono to možná vadit nebude - uvidím jak se ty věci ohledně balíčků budou dědit
*/