import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeView from "../CodeBoxCodeView";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFile from "../CodeBoxFile";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeViewButton from "../CodeViewButton";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import FoldersManager from "./FoldersManager";
import PackagesSectionToggle from "./PackagesSectionToggle";
import PanelToggle from "./PanelToggle";
import ProjectCodeBoxBuilder from "./ProjectCodeBoxBuilder";
import ProjectCodeBoxOptions from "./ProjectCodeBoxOptions";

class ProjectCodeBox extends CodeBox {
    private panelToggle : PanelToggle;
    private packagesSectionToggle : PackagesSectionToggle;
    private foldersManager : FoldersManager;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    private codeViewEntries = new Map<CodeView, CodeViewEntry>(); // todo - možná spíš podle identifieru?
    private fileEntries = new Map<CodeBoxFile, FileEntry>();
    
    private readonly openActiveCodeViewFolderOnInit : boolean;
    private readonly openActiveCodeViewPackageOnInit : boolean;

    constructor(element : HTMLElement, options : ProjectCodeBoxOptions = {}, parentCodeBox : ProjectCodeBox | null = null) { // todo - ještě by možná mohlo jít nastavit, jestli dědit od aktuálního stavu code boxu nebo ne
        const codeBoxBuilder = new ProjectCodeBoxBuilder(
            options.folderStructureHeading || GlobalConfig.DEFAULT_PROJECT_FOLDER_STRUCTURE_HEADING,
            options.packagesHeading || GlobalConfig.DEFAULT_PROJECT_PACKAGES_HEADING,
            options.svgSpritePath || null,
            options.svgSpriteIcons ? (options.svgSpriteIcons.panelOpenButton || null) : null
        );
        super(element, options, codeBoxBuilder);

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
            options.projectName || GlobalConfig.DEFAULT_PROJECT_NAME,
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

    // BEGIN - NOT IMPLEMENTED (JUST TO GET RID OF ERRORS FOR NOW)
    public changeCodeViewIdentifier(identifier: string, newIdentifier: string): boolean {
        return false
    }

    public changeFileIdentifier(identifier: string, newIdentifier: string): boolean {
        return false;
    }

    public getCodeView(identifier: string): CodeBoxCodeView | null {
        return null;
    }

    public getCodeViews(): CodeBoxCodeView[] {
        return [];
    }

    public getFile(identifier: string): CodeBoxFile | null {
        return null;
    }

    public getFiles(): CodeBoxFile[] {
        return [];
    }

    public removeCodeView(identifier: string): boolean {
        return false;
    }

    public removeFile(identifier: string): boolean {
        return false;
    }

    public setActiveCodeView(identifier: string): boolean {
        return false;
    }

    public setNoActiveCodeView(): void {
        
    }

    public getActiveCodeView(): CodeBoxCodeView | null {
        return null;
    }

    public changeFileDownloadLink(identifier: string, newDownloadLink: string | null): boolean {
        return false;
    }
    // END - NOT IMPLEMENTED (JUST TO GET RID OF ERRORS FOR NOW)

    protected onInit(codeBoxItemInfos: CodeBoxItemInfo[]): void {
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

                    const success = this.foldersManager.removeCodeViewByIdentifier(identifier);
                    if (!success && packageName !== null) {
                        this.foldersManager.removeCodeViewByPackage(packageName !== "" ? packageName : null, fileName);
                    }
                    this.foldersManager.addCodeView(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);
                }

                const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
                const codeBoxCodeView = new CodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);
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
                const codeBoxFile = new CodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

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
}

export default ProjectCodeBox;

/*
Takže teď:
    - plnit options z data atributů

- todo - podívat se jestli používám všude GlobalConfig.DATA_ATTRIBUTE_PREFIX - narazil jsem na kód, kde jsem to nepoužil
*/