import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBoxFile from "../CodeBoxFile";
import CodeViewButton from "../CodeViewButton";
import Folder from "./Folder";
import FolderAndPackageMapping from "./FolderAndPackageMapping";

class FoldersManager {
    private packagesContainer : HTMLElement;
    private rootFolder : Folder;
    private packages = new Map<string, Folder>();
    private defaultPackage : Folder | null = null;
    private packagesFolderPath : string[];
    private createFoldersForPackages : boolean;
    private foldersDelimiterForPackages : string | null;
    private codeViewFolderAndPackageMappings = new FolderAndPackageMapping();
    private fileFolderAndPackageMappings = new FolderAndPackageMapping();
    private activeCodeViewIdentifier : string | null = null;
    // tak tady nadefinovat něco jako package mapping - ale ono je možné umístit do jednoho balíčku dvě tlačítka se stejným textem - to by jít nemělo, takže budu muset zajistit, aby to nešlo
        // takže se podívat na to - jak vyřešit duplicity - a kdyžtak ty metody budou vracet false

    // todo - u složek generovaných pro balíčky se bude muset ukládat, jestli byly vygenerovány nebo ne

    private readonly svgSpritePath : string | null;
    private readonly folderArrowIconName : string | null;
    private readonly folderIconName : string | null;
    private readonly packageIconName : string | null;
    private readonly codeFileIconName : string | null;
    private readonly fileIconName : string | null;
    private readonly downloadIconName : string | null;
    private readonly defaultPackageName : string;
    private readonly openCloseAnimationSpeed : number;
    private readonly openCloseAnimationEasingFunction : string;

    constructor(folderStructureContainer : HTMLElement, packagesContainer : HTMLElement, projectName : string, packagesFolderPath : string | null, defaultPackageName : string | null, createFoldersForPackages : boolean, foldersDelimiterForPackages : string | null, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, folderArrowIconName : string | null = null, projectIconName : string | null = null, folderIconName : string | null = null, packageIconName : string | null = null, codeFileIconName : string | null = null, fileIconName : string | null = null, downloadIconName : string | null = null) {
        this.packagesContainer = packagesContainer;
        this.packagesFolderPath = packagesFolderPath !== null ? this.parseFolderPath(packagesFolderPath) : [];
        this.createFoldersForPackages = createFoldersForPackages;
        this.foldersDelimiterForPackages = foldersDelimiterForPackages;

        this.svgSpritePath = svgSpritePath;
        this.folderArrowIconName = folderArrowIconName;
        this.folderIconName = folderIconName;
        this.packageIconName = packageIconName;
        this.codeFileIconName = codeFileIconName;
        this.fileIconName = fileIconName;
        this.downloadIconName = downloadIconName;
        this.defaultPackageName = defaultPackageName || GlobalConfig.DEFAULT_DEFAULT_PACKAGE_NAME;
        this.openCloseAnimationSpeed = openCloseAnimationSpeed;
        this.openCloseAnimationEasingFunction = openCloseAnimationEasingFunction;

        this.rootFolder = new Folder(projectName, openCloseAnimationSpeed, openCloseAnimationEasingFunction, svgSpritePath, folderArrowIconName, projectIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PROJECT_MODIFIER, folderStructureContainer);
    }

    public getItemIdentifier(fileName : string, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : string {
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (folderPath === "") return fileName;
        return folderPath + fileName;
    }

    public setPackagesFolderPath(folderPath : string) : void {
        folderPath = this.normalizeFolderPath(folderPath);
        this.packagesFolderPath = this.parseFolderPath(folderPath);
    }

    public addFolder(folderPath : string) : void {
        folderPath = this.normalizeFolderPath(folderPath);
        const parsedFolderPath = this.parseFolderPath(folderPath);
        this.getFolder(parsedFolderPath, true);
    }

    public addPackage(packageName : string) : void {
        packageName = this.normalizePackageName(packageName);
        this.getPackageFolder(packageName, true);
    }

    public addCodeView(fileName : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null, isActive : boolean = false) : void {
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath, true);
        if (folder) {
            const codeViewButton = folder.addCodeView(fileName, codeView, showCodeViewEventSource, this.svgSpritePath, this.codeFileIconName);
            if (isActive) {
                codeViewButton.setAsActive();
            }
        }

        if (usePackage) {
            const packageFolder = this.getPackageFolder(packageName, true);
            if (packageFolder) {
                const codeViewButton = packageFolder.addCodeView(fileName, codeView, showCodeViewEventSource, this.svgSpritePath, this.codeFileIconName);
                if (isActive) {
                    codeViewButton.setAsActive();
                }
            }

            this.codeViewFolderAndPackageMappings.add(fileName, folderPath, packageName);
        }
    }

    public getCodeViewByFolderPath(folderPath : string | null, fileName : string) : CodeView | null { // todo - null může být pro root složku
        return null;
    }

    public getCodeViewByIdentifier(identifier : string) : CodeView | null {
        return null;
    }

    public getCodeViewByPackage(packageName : string | null, fileName : string) : CodeView | null { // todo - null pro default package
        return null;
    }

    public setNoCodeViewButtonAsActive() : void {
        if (this.activeCodeViewIdentifier === null) return;

        const parsedFolderPath = this.parseFolderPath(this.activeCodeViewIdentifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return;

        const folder = this.getFolder(parsedFolderPath);
        if (folder) {
            const codeViewItem = folder.getCodeView(fileName);
            codeViewItem?.codeViewButton.setAsInactive();
        }

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (packageItem) {
            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (packageFolder) {
                const codeViewItem = packageFolder.getCodeView(fileName);
                codeViewItem?.codeViewButton.setAsInactive();
            }
        }
    }

    public setCodeViewButtonsAsActiveByIdentifier(identifier : string) : void { // todo - ostatní metody můžu kdyžtak přidat potom
        this.setNoCodeViewButtonAsActive();
        // todo - tady budu pokračovat - ještě nejdřív ale normalizovat i fileName (odstraňovat všechny lomítka)
            // - a nastavovat activeCodeViewIdentifier - proto to nefungovalo
    }

    public addFile(fileName : string, codeBoxFile : CodeBoxFile, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) {
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath, true);
        folder?.addFile(fileName, codeBoxFile, this.svgSpritePath, this.fileIconName, this.downloadIconName);

        if (usePackage) {
            const packageFolder = this.getPackageFolder(packageName, true);
            packageFolder?.addFile(fileName, codeBoxFile, this.svgSpritePath, this.fileIconName, this.downloadIconName);

            this.fileFolderAndPackageMappings.add(fileName, folderPath, packageName);
        }
    }

    public getFileByFolderPath(folderPath : string | null, fileName : string) : CodeBoxFile | null {
        return null;
    }

    public getFileByIdentifier(identifier : string) : CodeBoxFile | null {
        return null;
    }

    public getFileByPackage(packageName : string | null, fileName : string) : CodeBoxFile | null {
        return null;
    }

    public updateTabNavigation(panelOpened : boolean) : void {
        this.rootFolder.updateTabNavigation(panelOpened);
        if (this.defaultPackage) {
            this.defaultPackage.updateTabNavigation(panelOpened);
        }
        this.packages.forEach(packageFolder => packageFolder.updateTabNavigation(panelOpened));
    }

    private getFolder(folderPath : string[], createIfNotExist : boolean = false) : Folder | null {
        let folder = this.rootFolder;
        for (let folderName of folderPath) {
            let subfolder = folder.getFolder(folderName);

            if (!subfolder) {
                if (createIfNotExist) {
                    subfolder = new Folder(folderName, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.folderIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FOLDER_MODIFIER);
                    folder.addFolder(folderName, subfolder);
                } else {
                    return null;
                }
            }
            folder = subfolder;
        }

        return folder;
    }

    private getPackageFolder(normalizedPackageName : string | null, createIfNotExist : boolean = false) : Folder | null { // todo - při vytváření balíčků ještě vytvářet složky ve složce pro balíčky (bude se předávat v konfiguraci, jestli se to má dělat a podle jakého znaku v názvu balíčku - pokud to bude null, tak se to bude do té složky jen dávat, nebudou se tam složky vytvářet)
        if (normalizedPackageName === null) {
            if (!this.defaultPackage) {
                if (createIfNotExist) {
                    this.defaultPackage = new Folder(this.defaultPackageName, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DEFAULT_PACKAGE_MODIFIER, this.packagesContainer);
                } else {
                    return null;
                }
            }
            return this.defaultPackage;
        }

        let packageFolder = this.packages.get(normalizedPackageName);

        if (!packageFolder) {
            if (createIfNotExist) {
                packageFolder = new Folder(normalizedPackageName, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PACKAGE_MODIFIER, this.packagesContainer);
                this.packages.set(normalizedPackageName, packageFolder);
            } else {
                return null;
            }
        }

        return packageFolder;
    }

    private getFolderPath(normalizedFolderPath : string | null, usePackage : boolean, normalizedPackageName : string | null) : string {
        if (normalizedFolderPath !== null) return normalizedFolderPath;
        if (usePackage) {
            if (!this.createFoldersForPackages || normalizedPackageName === null) return this.packagesFolderPath.join("/");

            const packageFolderPath = this.packagesFolderPath.slice();
            if (this.foldersDelimiterForPackages) {
                for (let folderName of this.getPackageFolderNames(normalizedPackageName)) {
                    packageFolderPath.push(folderName);
                }
            } else {
                packageFolderPath.push(normalizedPackageName);
            }

            return packageFolderPath.join("/");
        }
        return "";
    }

    private normalizeFolderPath(folderPath : string) : string {
        // remove starting and ending slashes
        folderPath = folderPath.replace(/^\/+|\/+$/g, '');
        
        // replace multiple slashes next to each other by one
        folderPath = folderPath.replace(/\/+/g, '/');

        return folderPath;
    }

    private normalizePackageName(packageName : string) : string {
        const delimiter = this.foldersDelimiterForPackages;
        if (delimiter === null) return packageName;
        
        const startEndRegex = new RegExp(`^\\${delimiter}+|\\${delimiter}+$`, 'g');
        const multipleSeparatorRegex = new RegExp(`\\${delimiter}+`, 'g');
        
        // remove starting and ending delimiter characters
        packageName = packageName.replace(startEndRegex, '');
        
        // replace multiple delimiter characters next to each other by one
        packageName = packageName.replace(multipleSeparatorRegex, delimiter);
        
        return packageName;
    }

    private parseFolderPath(normalizedFolderPath : string) : string[] {
        // folderPath = this.sanitizeFolderPath(folderPath);
    
        const result = normalizedFolderPath.split("/");
        if (result.length === 1 && result[0] === "") {
            return [];
        }
        return result;
    }

    private getPackageFolderNames(normalizedPackageName : string) : string[] {
        if (this.foldersDelimiterForPackages === null) return [normalizedPackageName];

        const result = normalizedPackageName.split(this.foldersDelimiterForPackages);
        if (result.length === 1 && result[0] === "") {
            return [];
        }
        return result;
    }
}

export default FoldersManager;