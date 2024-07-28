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
    private panelOpened : boolean = false;

    // todo - u složek generovaných pro balíčky se bude muset ukládat, jestli byly vygenerovány nebo ne - ne, tak to dělat nakonec nebude

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

    constructor(folderStructureContainer : HTMLElement, packagesContainer : HTMLElement, projectName : string, packagesFolderPath : string | null, defaultPackageName : string | null, createFoldersForPackages : boolean, foldersDelimiterForPackages : string | null, panelOpened : boolean, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, folderArrowIconName : string | null = null, projectIconName : string | null = null, folderIconName : string | null = null, packageIconName : string | null = null, codeFileIconName : string | null = null, fileIconName : string | null = null, downloadIconName : string | null = null) {
        this.packagesContainer = packagesContainer;
        this.packagesFolderPath = packagesFolderPath !== null ? this.parseFolderPath(packagesFolderPath) : [];
        this.createFoldersForPackages = createFoldersForPackages;
        this.foldersDelimiterForPackages = foldersDelimiterForPackages;
        this.panelOpened = panelOpened;

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

        this.rootFolder = new Folder(projectName, panelOpened, openCloseAnimationSpeed, openCloseAnimationEasingFunction, svgSpritePath, folderArrowIconName, projectIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PROJECT_MODIFIER, folderStructureContainer);
    }

    public getItemIdentifier(fileName : string, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : string {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (folderPath === "") return fileName;
        return folderPath + "/" + fileName;
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

    public addPackage(packageName : string) : void { // todo - ještě kdyžtak vytvářet podsložky pokud se mají vytvářet
        packageName = this.normalizePackageName(packageName);
        this.getPackageFolder(packageName, true);
    }

    public hasPackages() : boolean { // vrací jestli má alespoň jednu package folder
        return this.defaultPackage !== null || this.packages.size > 0;
    }

    public addCodeView(fileName : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : boolean {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath, true);
        if (!folder) return false;
        if (folder.getCodeView(fileName) !== null) return false;

        if (usePackage) {
            const packageFolder = this.getPackageFolder(packageName, true);
            if (!packageFolder) return false;
            if (packageFolder.getCodeView(fileName) !== null) return false;

            packageFolder.addCodeView(fileName, codeView, showCodeViewEventSource, this.svgSpritePath, this.codeFileIconName);
            this.codeViewFolderAndPackageMappings.add(fileName, folderPath, packageName);
        }

        folder.addCodeView(fileName, codeView, showCodeViewEventSource, this.svgSpritePath, this.codeFileIconName);
        return true;
    }

    public getCodeViewByFolderPath(folderPath : string | null, fileName : string) : CodeView | null { // todo - null může být pro root složku
        folderPath = this.normalizeFolderPath(folderPath || "");
        fileName = this.sanitizeFileName(fileName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const codeViewItem = folder.getCodeView(fileName);
        if (!codeViewItem) return null;

        return codeViewItem.codeView;
    }

    public getCodeViewByIdentifier(identifier : string) : CodeView | null {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return null;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const codeViewItem = folder.getCodeView(fileName);
        if (!codeViewItem) return null;

        return codeViewItem.codeView;
    }

    public getCodeViewByPackage(packageName : string | null, fileName : string) : CodeView | null { // todo - null pro default package
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

        const codeViewItem = packageFolder.getCodeView(fileName);
        if (!codeViewItem) return null;

        return codeViewItem.codeView;
    }

    public removeCodeViewByIdentifier(identifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        if (parsedFolderPath.length === 0) return false;
        const fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        const success =  folder.removeCodeView(fileName);
        if (!success) return false;

        if (identifier === this.activeCodeViewIdentifier) {
            this.activeCodeViewIdentifier = null;
        }

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);
        if (!packageItem) return true;

        const packageFolder = this.getPackageFolder(packageItem.packageName);
        packageFolder?.removeCodeView(fileName);

        this.codeViewFolderAndPackageMappings.removeByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        return true;
    }

    public removeCodeViewByPackage(packageName : string | null, fileName : string) : boolean {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const identifier = this.codeViewFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
        if (!identifier) return false;
        return this.removeCodeViewByIdentifier(identifier);
    }

    public changeCodeViewIdentifier(identifier : string, newIdentifier : string, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>) : boolean {
        identifier = this.normalizeFolderPath(identifier);
        newIdentifier = this.normalizeFolderPath(newIdentifier);
        const isActive = this.activeCodeViewIdentifier === identifier;

        if (isActive) this.setNoCodeViewButtonAsActive();

        if (this.getCodeViewByIdentifier(newIdentifier) !== null) return false;

        const codeView = this.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        let parsedFolderPath = this.parseFolderPath(identifier);
        let fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        const success = this.removeCodeViewByIdentifier(identifier);
        if (!success) return false;

        parsedFolderPath = this.parseFolderPath(newIdentifier);
        fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        this.addCodeView(fileName, codeView, showCodeViewEventSource, parsedFolderPath.join("/"), packageItem !== null, packageItem ? packageItem.packageName : null);
        
        if (isActive) this.setCodeViewButtonsAsActiveByIdentifier(newIdentifier);

        return true;
    }

    public addFile(fileName : string, codeBoxFile : CodeBoxFile, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : boolean {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath, true);
        if (!folder) return false;
        if (folder.getFile(fileName) !== null) return false;

        if (usePackage) {
            const packageFolder = this.getPackageFolder(packageName, true);
            if (!packageFolder) return false;
            if (packageFolder.getFile(fileName) !== null) return false;
            
            packageFolder.addFile(fileName, codeBoxFile, this.svgSpritePath, this.fileIconName, this.downloadIconName);
            this.fileFolderAndPackageMappings.add(fileName, folderPath, packageName);
        }

        folder.addFile(fileName, codeBoxFile, this.svgSpritePath, this.fileIconName, this.downloadIconName);
        return true;
    }

    public getFileByFolderPath(folderPath : string | null, fileName : string) : CodeBoxFile | null {
        folderPath = this.normalizeFolderPath(folderPath || "");
        fileName = this.sanitizeFileName(fileName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const fileItem = folder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    public getFileByIdentifier(identifier : string) : CodeBoxFile | null {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return null;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const fileItem = folder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    public getFileByPackage(packageName : string | null, fileName : string) : CodeBoxFile | null {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

        const fileItem = packageFolder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    public removeFileByIdentifier(identifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        if (parsedFolderPath.length === 0) return false;
        const fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        const success = folder.removeFile(fileName);
        if (!success) return false;

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);
        if (!packageItem) return true;

        const packageFolder = this.getPackageFolder(packageItem.packageName);
        packageFolder?.removeFile(fileName);

        this.fileFolderAndPackageMappings.removeByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        return true;
    }

    public removeFileByPackage(packageName : string | null, fileName : string) : boolean {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const identifier = this.fileFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
        if (!identifier) return false;
        return this.removeFileByIdentifier(identifier);
    }

    public changeFileIdentifier(identifier : string, newIdentifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);
        newIdentifier = this.normalizeFolderPath(newIdentifier);

        if (this.getFileByIdentifier(newIdentifier) !== null) return false;

        const codeBoxFile = this.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        let parsedFolderPath = this.parseFolderPath(identifier);
        let fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        const success = this.removeFileByIdentifier(identifier);
        if (!success) return false;

        parsedFolderPath = this.parseFolderPath(newIdentifier);
        fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        this.addFile(fileName, codeBoxFile, parsedFolderPath.join("/"), packageItem !== null, packageItem ? packageItem.packageName : null);

        return true;
    }

    public changeFileDownloadLinkByIdentifier(identifier : string, newDownloadLink : string | null) : boolean {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        let fileItem = folder.getFile(fileName);
        if (!fileItem) return false;

        fileItem.fileButton.setDownloadLink(newDownloadLink);

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);
        if (!packageItem) return true;

        const packageFolder = this.getPackageFolder(packageItem.packageName);
        if (!packageFolder) return true;

        fileItem = packageFolder.getFile(packageItem.fileName);
        if (!fileItem) return true;

        fileItem.fileButton.setDownloadLink(newDownloadLink);

        return true;
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
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return;

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return;

        let codeViewItem = folder.getCodeView(fileName);
        if (!codeViewItem) return;

        this.setNoCodeViewButtonAsActive();
        codeViewItem.codeViewButton.setAsActive();

        this.activeCodeViewIdentifier = identifier;

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (packageItem) {
            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (packageFolder) {
                codeViewItem = packageFolder.getCodeView(fileName);
                codeViewItem?.codeViewButton.setAsActive();
            }
        }
    }

    // todo - zkusit jak bude vypadat ta animace s openParentFolders na true - nevím jak to půjde
    public openFolder(folderPath : string, openParentFolders : boolean = false, animate : boolean = true) : void {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        let folder : Folder | null = this.rootFolder;

        for (let folderName of parsedFolderPath) {
            if (openParentFolders) folder.open(animate);
            folder = folder.getFolder(folderName);
            if (!folder) break;
        }

        if (folder) folder.open(animate);
    }

    // todo - closeFolder

    public openPackage(packageName : string | null, animate : boolean = true) {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return;

        packageFolder.open(animate);
    }

    // todo - closePackage

    public updateTabNavigation(panelOpened : boolean) : void {
        this.panelOpened = panelOpened;
        this.rootFolder.updateTabNavigation(panelOpened);
        if (this.defaultPackage) {
            this.defaultPackage.updateTabNavigation(panelOpened);
        }
        this.packages.forEach(packageFolder => packageFolder.updateTabNavigation(panelOpened));
    }

    private getFolder(folderPath : string[], createIfNotExist : boolean = false) : Folder | null {
        let parentOpened = this.panelOpened;
        let folder = this.rootFolder;
        for (let folderName of folderPath) {
            if (!folder.isOpened()) parentOpened = false;

            let subfolder = folder.getFolder(folderName);

            if (!subfolder) {
                if (createIfNotExist) {
                    subfolder = new Folder(folderName, parentOpened, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.folderIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FOLDER_MODIFIER);
                    folder.addFolder(folderName, subfolder);
                } else {
                    return null;
                }
            }
            folder = subfolder;
        }

        return folder;
    }

    private getPackageFolder(normalizedPackageName : string | null, createIfNotExist : boolean = false) : Folder | null {
        if (normalizedPackageName === null) {
            if (!this.defaultPackage) {
                if (createIfNotExist) {
                    this.getFolder(this.packagesFolderPath, true);
                    this.defaultPackage = new Folder(this.defaultPackageName, this.panelOpened, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DEFAULT_PACKAGE_MODIFIER, this.packagesContainer);
                } else {
                    return null;
                }
            }
            return this.defaultPackage;
        }

        let packageFolder = this.packages.get(normalizedPackageName);

        if (!packageFolder) {
            if (createIfNotExist) {
                const folderPath = this.packagesFolderPath.slice();
                if (this.foldersDelimiterForPackages !== null) {
                    const packageFolderNames = this.getPackageFolderNames(normalizedPackageName);
                    for (let folderName of packageFolderNames) {
                        folderPath.push(folderName);
                    }
                } else {
                    folderPath.push(normalizedPackageName);
                }

                this.getFolder(folderPath, true);
                packageFolder = new Folder(normalizedPackageName, this.panelOpened, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PACKAGE_MODIFIER, this.packagesContainer);
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
            if (this.foldersDelimiterForPackages !== null) {
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

    private sanitizeFileName(fileName : string) : string {
        // remove all slashes
        return fileName.replace(/\//g, '');
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