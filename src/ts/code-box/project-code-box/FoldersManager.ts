import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeViewButton from "../CodeViewButton";
import Folder from "./Folder";
import FolderAndPackageMapping from "./FolderAndPackageMapping";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";

class FoldersManager {
    private packagesContainer : HTMLElement;
    private rootFolder : Folder;
    private packages = new Map<string, Folder>();
    private defaultPackage : Folder | null = null;
    private packagesFolderPath : string[];
    private createFoldersForPackages : boolean; // todo - kdyžtak potom nastavit jako readonly - a ty ostatní věci taky, uvidím
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

    constructor(folderStructureContainer : HTMLElement, packagesContainer : HTMLElement, rootFolderName : string, packagesFolderPath : string | null, defaultPackageName : string | null, createFoldersForPackages : boolean, foldersDelimiterForPackages : string | null, panelOpened : boolean, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, folderArrowIconName : string | null = null, projectIconName : string | null = null, folderIconName : string | null = null, packageIconName : string | null = null, codeFileIconName : string | null = null, fileIconName : string | null = null, downloadIconName : string | null = null) {
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

        this.rootFolder = new Folder(rootFolderName, panelOpened, openCloseAnimationSpeed, openCloseAnimationEasingFunction, svgSpritePath, folderArrowIconName, projectIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PROJECT_MODIFIER, folderStructureContainer);
    }

    public isCreateFoldersForPackagesEnabled() : boolean {
        return this.createFoldersForPackages;
    }

    public getItemIdentifier(fileName : string, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : string {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (folderPath === "") return fileName;
        return folderPath + "/" + fileName;
    }

    public getNormalizedFolderPath(folderPath : string) : string {
        return this.normalizeFolderPath(folderPath);
    }

    public setPackagesFolderPath(folderPath : string) : void {
        folderPath = this.normalizeFolderPath(folderPath);
        this.packagesFolderPath = this.parseFolderPath(folderPath);
    }

    public setRootFolderName(name : string) : void {
        this.rootFolder.setName(name);
    }

    public addFolder(folderPath : string) : void {
        folderPath = this.normalizeFolderPath(folderPath);
        const parsedFolderPath = this.parseFolderPath(folderPath);
        this.getFolder(parsedFolderPath, true);
    }

    public removeFolder(folderPath : string) : boolean {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);
        const folderName = parsedFolderPath.pop();
        if (folderName === undefined) return false;

        const parentFolder = this.getFolder(parsedFolderPath);
        if (!parentFolder) return false;

        const folder = parentFolder.getFolder(folderName);
        if (!folder) return false;

        for (let codeViewName of folder.getCodeViewNamesInFolderAndSubfolders()) {
            let path = folderPath + "/" + codeViewName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            if (path === this.activeCodeViewIdentifier) {
                this.activeCodeViewIdentifier = null;
            }

            const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedPath.join("/"), name);
            if (!packageItem) continue;

            this.codeViewFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, name);

            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (!packageFolder) continue;

            packageFolder.removeCodeView(name);
        }

        for (let fileName of folder.getFileNamesInFolderAndSubfolders()) {
            let path = folderPath + "/" + fileName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedPath.join("/"), name);
            if (!packageItem) continue;

            this.fileFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, name);

            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (!packageFolder) continue;

            packageFolder.removeFile(name);
        }

        if (this.createFoldersForPackages) {
            const packagesFolderPath = this.packagesFolderPath.join("/");

            if ((packagesFolderPath + "/").startsWith(folderPath + "/")) {

                if (this.defaultPackage) {
                    for (let codeViewName of this.defaultPackage.getCodeViewNamesInFolderAndSubfolders()) {
                        this.codeViewFolderAndPackageMappings.removeByPackageItem(null, codeViewName);
                        this.defaultPackage.removeCodeView(codeViewName);
                    }
                    for (let fileName of this.defaultPackage.getFileNamesInFolderAndSubfolders()) {
                        this.fileFolderAndPackageMappings.removeByPackageItem(null, fileName);
                        this.defaultPackage.removeFile(fileName);
                    }
                    this.defaultPackage.detach();
                    this.defaultPackage = null;
                }
                
                this.packages.forEach((packageFolder, packageName) => {
                    for (let codeViewName of packageFolder.getCodeViewNamesInFolderAndSubfolders()) {
                        this.codeViewFolderAndPackageMappings.removeByPackageItem(packageName, codeViewName);
                        packageFolder.removeCodeView(codeViewName);
                    }
                    for (let fileName of packageFolder.getFileNamesInFolderAndSubfolders()) {
                        this.fileFolderAndPackageMappings.removeByPackageItem(packageName, fileName);
                        packageFolder.removeFile(fileName);
                    }
                    packageFolder.detach();
                });
                this.packages.clear();
            }

            if (folderPath.startsWith(packagesFolderPath + "/")) {
                const deletedPackageNames = new Array<string>();
                this.packages.forEach((packageFolder, packageName) => {
                    let parsedPackageName : string[];
                    if (this.foldersDelimiterForPackages !== null) {
                        parsedPackageName = packageName.split(this.foldersDelimiterForPackages);
                    } else {
                        parsedPackageName = [packageName];
                    }

                    const packageFolderPath = packagesFolderPath + "/" + parsedPackageName.join("/");

                    if ((packageFolderPath + "/").startsWith(folderPath + "/")) {
                        for (let codeViewName of packageFolder.getCodeViewNamesInFolderAndSubfolders()) {
                            this.codeViewFolderAndPackageMappings.removeByPackageItem(packageName, codeViewName);
                            packageFolder.removeCodeView(codeViewName);
                        }
                        for (let fileName of packageFolder.getFileNamesInFolderAndSubfolders()) {
                            this.fileFolderAndPackageMappings.removeByPackageItem(packageName, fileName);
                            packageFolder.removeFile(fileName);
                        }
                        packageFolder.detach();
                        deletedPackageNames.push(packageName);
                    }
                });
                for (let packageName of deletedPackageNames) {
                    this.packages.delete(packageName);
                }
            }
        }

        parentFolder.removeFolder(folderName);

        return true;
    }

    public renameFolder(folderPath : string, newName : string) : string | null { // vrací to novou cestu pro složku
        folderPath = this.normalizeFolderPath(folderPath);
        newName = this.sanitizeFolderName(newName);

        const parsedFolderPath = this.parseFolderPath(folderPath);
        const oldName = parsedFolderPath.pop();
        if (oldName === undefined) return null;

        const parentFolder = this.getFolder(parsedFolderPath);
        if (!parentFolder) return null;

        const success = parentFolder.renameFolder(oldName, newName);
        if (!success) return null;

        parsedFolderPath.push(newName);
        const oldFolderPath = folderPath;
        const newFolderPath = parsedFolderPath.join("/");
        const packagesFolderPath = this.packagesFolderPath.join("/");

        // if (oldFolderPath === packagesFolderPath) { // TODO - problém - co když změním složku předtím? - to by se potom mělo taky změnit? - jo, když to na to začíná, tak asi jo. - zapsat kdyžtak do dokumentace
        //     this.packagesFolderPath = this.parseFolderPath(newFolderPath);
        // }
        if ((packagesFolderPath + "/").startsWith(oldFolderPath + "/")) {
            const path = packagesFolderPath.replace(oldFolderPath, newFolderPath);
            this.packagesFolderPath = this.parseFolderPath(path);
        }

        if (this.createFoldersForPackages) {
            if (oldFolderPath.startsWith(packagesFolderPath + "/")) {
                const packagesFolderNames = oldFolderPath.replace(packagesFolderPath + "/", "").split("/");
                const index = packagesFolderNames.length-1;
    
                const changes = new Array<{oldName: string, newName: string}>;
                this.packages.forEach((packageFolder, packageName) => {
                    let parsedPackageName : string[];

                    if (this.foldersDelimiterForPackages !== null) {
                        parsedPackageName = packageName.split(this.foldersDelimiterForPackages);
                    } else {
                        parsedPackageName = [packageName];
                    }

                    if (parsedPackageName.length-1 < index) return;
                    if (parsedPackageName[index] !== oldName) return;

                    parsedPackageName[index] = newName;

                    let newPackageName : string;
                    if (this.foldersDelimiterForPackages !== null) {
                        newPackageName = parsedPackageName.join(this.foldersDelimiterForPackages);
                    } else {
                        newPackageName = parsedPackageName[0];
                    }

                    changes.push({oldName: packageName, newName: newPackageName});

                    for (let codeViewName of packageFolder.getCodeViewNamesInFolderAndSubfolders()) {
                        const parsedName = codeViewName.split("/");
                        codeViewName = parsedName.pop() || "";

                        const fileFolderPath = this.codeViewFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, codeViewName);
                        if (fileFolderPath === null) continue;

                        const parsedFileFolderPath = fileFolderPath.split("/");
                        parsedFileFolderPath.pop();

                        this.codeViewFolderAndPackageMappings.removeByPackageItem(packageName, codeViewName);
                        this.codeViewFolderAndPackageMappings.add(codeViewName, parsedFileFolderPath.length > 0 ? parsedFileFolderPath.join("/") : null, newPackageName);
                    }

                    for (let fileName of packageFolder.getFileNamesInFolderAndSubfolders()) {
                        const parsedName = fileName.split("/");
                        fileName = parsedName.pop() || "";

                        const fileFolderPath = this.fileFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
                        if (fileFolderPath === null) continue;

                        const parsedFileFolderPath = fileFolderPath.split("/");
                        parsedFileFolderPath.pop();

                        this.fileFolderAndPackageMappings.removeByPackageItem(packageName, fileName);
                        this.fileFolderAndPackageMappings.add(fileName, parsedFileFolderPath.length > 0 ? parsedFileFolderPath.join("/") : null, newPackageName);
                    }
                });

                for (let change of changes) {
                    const packageFolder = this.packages.get(change.oldName);
                    if (!packageFolder) continue;

                    packageFolder.setName(change.newName);
                    this.packages.delete(change.oldName);
                    this.packages.set(change.newName, packageFolder);
                }
            }
        }

        const folder = parentFolder.getFolder(newName);
        if (!folder) return newFolderPath;

        for (let codeViewName of folder.getCodeViewNamesInFolderAndSubfolders()) {
            let path = oldFolderPath + "/" + codeViewName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            const oldItemPath = parsedPath.join("/");

            if (path === this.activeCodeViewIdentifier) {
                this.activeCodeViewIdentifier = newFolderPath + "/" + codeViewName;
            }

            const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(oldItemPath, name);
            if (!packageItem) continue;

            path = newFolderPath + "/" + codeViewName;
            parsedPath = this.parseFolderPath(path);
            parsedPath.pop();

            const newItemPath = parsedPath.join("/");

            this.codeViewFolderAndPackageMappings.removeByFileFolderPath(oldItemPath, name);
            this.codeViewFolderAndPackageMappings.add(name, newItemPath, packageItem.packageName);
        }

        for (let fileName of folder.getFileNamesInFolderAndSubfolders()) {
            let path = oldFolderPath + "/" + fileName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            const oldItemPath = parsedPath.join("/");

            const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(oldItemPath, name);
            if (!packageItem) continue;

            path = newFolderPath + "/" + fileName;
            parsedPath = this.parseFolderPath(path);
            parsedPath.pop();

            const newItemPath = parsedPath.join("/");

            this.fileFolderAndPackageMappings.removeByFileFolderPath(oldItemPath, name);
            this.fileFolderAndPackageMappings.add(name, newItemPath, packageItem.packageName);
        }

        return newFolderPath;
    }

    public folderExists(folderPath : string) : boolean {
        folderPath = this.normalizeFolderPath(folderPath);
        
        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        return true;
    }

    public isFolderOpened(folderPath : string) : boolean { // todo - napsat, že to vrací false, i když složka neexistuje
        folderPath = this.normalizeFolderPath(folderPath);
        
        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        return folder.isOpened();
    }

    public addPackage(packageName : string) : void { // todo - ještě kdyžtak vytvářet podsložky pokud se mají vytvářet - a nevytvářejí se? - myslím že už jo
        packageName = this.normalizePackageName(packageName);
        this.getPackageFolder(packageName, true);
    }

    public removePackage(packageName : string, deleteCodeViewsAndFiles : boolean = false) : boolean {
        packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return false;

        for (let codeViewName of packageFolder.getCodeViewNamesInFolderAndSubfolders()) {
            if (deleteCodeViewsAndFiles) {
                const identifier = this.codeViewFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, codeViewName);
                if (identifier === null) continue;
                this.removeCodeViewByIdentifier(identifier);
            } else {
                this.codeViewFolderAndPackageMappings.removeByPackageItem(packageName, codeViewName);
            }
        }
        for (let fileName of packageFolder.getFileNamesInFolderAndSubfolders()) {
            if (deleteCodeViewsAndFiles) {
                const identifier = this.fileFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
                if (identifier === null) continue;
                this.removeFileByIdentifier(identifier);
            } else {
                this.fileFolderAndPackageMappings.removeByPackageItem(packageName, fileName);
            }
        }

        packageFolder.detach();
        this.packages.delete(packageName);
        return true;
    }

    public getPackageFolderPath(packageName : string | null) : string | null {
        if (packageName === null) return this.packagesFolderPath.join("/");
        packageName = this.normalizePackageName(packageName);
        
        if (!this.packageExists(packageName)) return null;
        if (!this.createFoldersForPackages) return this.packagesFolderPath.join("/");

        let parsedPackageName : string[];
        if (this.foldersDelimiterForPackages !== null) {
            parsedPackageName = packageName.split(this.foldersDelimiterForPackages);
        } else {
            parsedPackageName = [packageName];
        }

        const packageFolderPath = [];
        for (let folderName of this.packagesFolderPath) {
            packageFolderPath.push(folderName);
        }
        for (let folderName of parsedPackageName) {
            packageFolderPath.push(folderName);
        }

        return packageFolderPath.join("/");
    }

    public getFolderPathToRemovePackage(packageName : string) : string | null { // null, pokud není možné složku odstranit - existuje třeba podbalíček a ještě v některých dalších případech
        if (!this.createFoldersForPackages) return null;

        packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;
        // if (!this.packages.has(packageName)) return null;

        // const packagesFolderPath = this.packagesFolderPath.join("/");

        let parsedPackageName : string[];
        if (this.foldersDelimiterForPackages !== null) {
            parsedPackageName = packageName.split(this.foldersDelimiterForPackages);
        } else {
            parsedPackageName = [packageName];
        }

        // const packageFolderPath = packagesFolderPath !== "" ? packagesFolderPath + "/" + parsedPackageName.join("/") : parsedPackageName.join("/");

        const packageFolderPath = [];
        for (let folderName of this.packagesFolderPath) {
            packageFolderPath.push(folderName);
        }
        for (let folderName of parsedPackageName) {
            packageFolderPath.push(folderName);
        }

        // let folderPath = packageFolderPath.join("/");
        let folderPath : string | null = null;
        let folder = this.getFolder(packageFolderPath);
        if (!folder) return null;
        // packageFolderPath.pop();

        if (
            folder.getCodeViewsCount() > packageFolder.getCodeViewsCount()
            || folder.getFilesCount() > packageFolder.getFilesCount()
            || folder.getFoldersCount() > 0
        ) return null;

        folderPath = packageFolderPath.join("/");

        packageFolderPath.pop();
        while (packageFolderPath.length > this.packagesFolderPath.length) {
            folder = this.getFolder(packageFolderPath);
            if (!folder) break;
            if (folder.getCodeViewsCount() > 0 || folder.getFilesCount() > 0 || folder.getFoldersCount() > 1) break;

            folderPath = packageFolderPath.join("/");
            packageFolderPath.pop();
        }



        return folderPath;

        // takže teď to procházet odzadu a:
            // - vytvářet vždy folderPath
                // vzít tu folderPath a zjistit, jestli obsahuje i nějaké další itemy než jen podsložku
                    // - vždy se vezme alespoň ta nejdelší cesta, ať už tam jsou i nějaké další code views a files nebo ne - taky napsat do dokumentace - pokud tam mají ještě nějaké další věci, které ale s balíčkem nejsou spjaty, tak se taky vymažou - a napsat, že když je removeFolders false, tak se smaže jen balíček, ale všechno ostatní se ponechá tak jak je
    }

    // public getFolderPathToRenamePackage(packageName : string, newPackageName : string) : string | null { // ne - tohle nepůjde
    //     if (!this.createFoldersForPackages) return null;
    //     if (!this.packages.has(packageName)) return null;
    //     if (this.packages.has(newPackageName)) return null;

    //     return null;
    // }

    public packageExists(packageName : string) : boolean {
        packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return false;

        return true;
    }

    public isPackageFolderOpened(packageName : string | null) : boolean { // todo - napsat, že to vrací false, i když složka pro package neexistuje
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return false;

        return packageFolder.isOpened();
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

    public getCodeViewsInFolder(folderPath : string | null, traverseSubfolders : boolean = false) : CodeView[] {
        folderPath = this.normalizeFolderPath(folderPath || "");

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        
        const codeViews = new Array<CodeView>();
        if (!folder) return codeViews;

        for (let codeViewItem of folder.getCodeViews(traverseSubfolders)) {
            codeViews.push(codeViewItem.codeView);
        }

        return codeViews;
    }

    public getCodeViewsInPackage(packageName : string | null) : CodeView[] {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);

        const codeViews = new Array<CodeView>();
        if (!packageFolder) return codeViews;

        for (let codeViewItem of packageFolder.getCodeViews()) {
            codeViews.push(codeViewItem.codeView);
        }

        return codeViews;
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

    public changeCodeViewIdentifier(identifier : string, newIdentifier : string, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>) : boolean { // připsat že balíček se nemění - i do ProjectCodeBoxu, protože přes něj to uživatelé budou používat
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

    public getCodeViewPackage(identifier : string) : string | null | undefined {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return undefined;

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return undefined;

        return packageItem.packageName;
    }

    public removeCodeViewPackage(identifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return false;

        const packageFolder = this.getPackageFolder(packageItem.packageName);
        if (!packageFolder) return false;

        packageFolder.removeCodeView(fileName);
        this.codeViewFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, fileName);
        return true;
    }

    public addFile(fileName : string, codeBoxFile : ProjectCodeBoxFile, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : boolean {
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

    public getFileByFolderPath(folderPath : string | null, fileName : string) : ProjectCodeBoxFile | null {
        folderPath = this.normalizeFolderPath(folderPath || "");
        fileName = this.sanitizeFileName(fileName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const fileItem = folder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    public getFileByIdentifier(identifier : string) : ProjectCodeBoxFile | null {
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

    public getFileByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxFile | null {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

        const fileItem = packageFolder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    public getFilesInFolder(folderPath : string | null, traverseSubfolders : boolean = false) : ProjectCodeBoxFile[] {
        folderPath = this.normalizeFolderPath(folderPath || "");

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);

        const codeBoxFiles = new Array<ProjectCodeBoxFile>();
        if (!folder) return codeBoxFiles;

        for (let fileItem of folder.getFiles(traverseSubfolders)) {
            codeBoxFiles.push(fileItem.codeBoxFile);
        }

        return codeBoxFiles;
    }

    public getFilesInPackage(packageName : string | null) : ProjectCodeBoxFile[] {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);

        const codeBoxFiles = new Array<ProjectCodeBoxFile>();
        if (!packageFolder) return codeBoxFiles;

        for (let fileItem of packageFolder.getFiles()) {
            codeBoxFiles.push(fileItem.codeBoxFile);
        }

        return codeBoxFiles;
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

    public getFilePackage(identifier : string) : string | null | undefined {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return undefined;

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return undefined;

        return packageItem.packageName;
    }

    public removeFilePackage(identifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return false;

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return false;

        const packageFolder = this.getPackageFolder(packageItem.packageName);
        if (!packageFolder) return false;

        packageFolder.removeFile(fileName);
        this.fileFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, fileName);
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

    // todo - zkusit jak bude vypadat ta animace s openParentFolders na true - nevím jak to půjde - není to úplně ono, ale hrabat se v tom nebudu
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

    public closeFolder(folderPath : string, closeChildFolders : boolean = false, animate : boolean = true) : void {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return;

        if (closeChildFolders) {
            this.closeFolderAndSubfolders(folder);
        } else {
            folder.close(animate);
        }
    }

    public openPackage(packageName : string | null, animate : boolean = true) : void {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return;

        packageFolder.open(animate);
    }

    public closePackage(packageName : string | null, animate : boolean = true) : void {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return;

        packageFolder.close(animate);
    }

    public updateTabNavigation(panelOpened : boolean) : void {
        this.panelOpened = panelOpened;
        this.rootFolder.updateTabNavigation(panelOpened);
        if (this.defaultPackage) {
            this.defaultPackage.updateTabNavigation(panelOpened);
        }
        this.packages.forEach(packageFolder => packageFolder.updateTabNavigation(panelOpened));
    }

    private closeFolderAndSubfolders(folder : Folder, animate : boolean = true) {
        folder.close(animate);

        for (let subfolder of folder.getFolders()) {
            this.closeFolderAndSubfolders(subfolder, animate);
        }
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

    private sanitizeFolderName(folderName : string) : string {
        // remove all slashes
        return folderName.replace(/\//g, '');
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