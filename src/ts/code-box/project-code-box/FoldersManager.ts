import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import TreeNode from "../../utils/TreeNode";
import CodeViewButton from "../CodeViewButton";
import Folder from "./Folder";
import FolderAndPackageMapping from "./FolderAndPackageMapping";
import FolderInfo from "./FolderInfo";
import PackageInfo from "./PackageInfo";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";

/** Manages folders and its contents in project code box. */
class FoldersManager {
    /** Container for package folders. */
    private packagesContainer : HTMLElement;
    /** Root (project) folder. */
    private rootFolder : Folder;
    /** Package folders stored by package name. */
    private packages = new Map<string, Folder>();
    /** Default package folder. */
    private defaultPackage : Folder | null = null;
    /** Folder path for packages. */
    private packagesFolderPath : string[];
    /** Determines whether folders are created for packages. */
    private readonly createFoldersForPackages : boolean;
    /** Delimiter based on which are created folders for packages (if null, only single folder for package is created). */
    private readonly foldersDelimiterForPackages : string | null;
    /** Mappings between folder and package for code views. */
    private codeViewFolderAndPackageMappings = new FolderAndPackageMapping();
    /** Mappings between folder and package for files. */
    private fileFolderAndPackageMappings = new FolderAndPackageMapping();
    /** Code view identifier for which are currently buttons set as active. */
    private activeCodeViewIdentifier : string | null = null;
    /** Indicates whether panel is opened. */
    private panelOpened : boolean = false;

    /** Path to SVG sprite. */
    private readonly svgSpritePath : string | null;
    /** Name of folder arrow icon. */
    private readonly folderArrowIconName : string | null;
    /** Name of folder icon. */
    private readonly folderIconName : string | null;
    /** Name of package icon. */
    private readonly packageIconName : string | null;
    /** Name of icon for code view buttons. */
    private readonly codeFileIconName : string | null;
    /** Name of icon for file buttons. */
    private readonly fileIconName : string | null;
    /** Name of download icon. */
    private readonly downloadIconName : string | null;

    /** Name of folder for default package. */
    private readonly defaultPackageName : string;
    /** Animation speed in miliseconds for open/close folder animations. */
    private readonly openCloseAnimationSpeed : number;
    /** CSS easing function used for open/close folder animations. */
    private readonly openCloseAnimationEasingFunction : string;

    /**
     * Creates new folders manager.
     * @param folderStructureContainer Container for folder structure.
     * @param packagesContainer Container for package folders.
     * @param rootFolderName Name of root (project) folder.
     * @param packagesFolderPath Folder path for packages.
     * @param defaultPackageName Name of folder for default package.
     * @param createFoldersForPackages Determines whether folders should be created for packages.
     * @param foldersDelimiterForPackages Delimiter based on which should be created folders for packages (if null, only single folder for package is created).
     * @param panelOpened Indicates whether panel is opened (needed to properly update tab navigation).
     * @param openCloseAnimationSpeed Animation speed in miliseconds for open/close folder animations.
     * @param openCloseAnimationEasingFunction CSS easing function that should be used for open/close folder animations.
     * @param svgSpritePath Path to SVG sprite.
     * @param folderArrowIconName Name of folder arrow icon.
     * @param projectIconName Name of icon for root (project) folder.
     * @param folderIconName Name of folder icon.
     * @param packageIconName Name of package icon.
     * @param codeFileIconName Name of icon for code view buttons.
     * @param fileIconName Name of icon for file buttons.
     * @param downloadIconName Name of download icon.
     */
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

        this.rootFolder = new Folder(
            rootFolderName,
            panelOpened,
            openCloseAnimationSpeed,
            openCloseAnimationEasingFunction,
            svgSpritePath,
            folderArrowIconName,
            projectIconName,
            CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PROJECT_MODIFIER,
            folderStructureContainer
        );
    }

    /**
     * Checks whether folders are created for packages.
     * @returns Indicates whether folders are created for packages.
     */
    public isCreateFoldersForPackagesEnabled() : boolean {
        return this.createFoldersForPackages;
    }

    /**
     * Returns identifier based on passed parameters.
     * @param fileName File name.
     * @param folderPath Folder path.
     * @param usePackage Determines whether item is added to package.
     * @param packageName Name of package.
     * @returns Identifier.
     */
    public getItemIdentifier(fileName : string, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : string {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (folderPath === "") return fileName;
        return folderPath + "/" + fileName;
    }

    /**
     * Returns normalized version of folder path (removes starting and ending slashes and so on..).
     * @param folderPath Folder path.
     * @returns Normalized folder path.
     */
    public getNormalizedFolderPath(folderPath : string) : string {
        return this.normalizeFolderPath(folderPath);
    }

    /**
     * Sets name of root (project) folder.
     * @param name Name.
     */
    public setRootFolderName(name : string) : void {
        this.rootFolder.setName(name);
    }

    /**
     * Creates new folder(s) (this does not create packages if folders are created in folder for packages).
     * @param folderPath Folder path based on which should be created new folder(s).
     */
    public addFolder(folderPath : string) : void {
        folderPath = this.normalizeFolderPath(folderPath);
        const parsedFolderPath = this.parseFolderPath(folderPath);
        this.getFolder(parsedFolderPath, true);
    }

    /**
     * Removes folder and its contents. This might also remove packages if their folders are removed (if generation of folders for packages is enabled).
     * @param folderPath Folder path to folder that should be removed.
     * @returns Indicates whether folder has been successfully removed.
     */
    public removeFolder(folderPath : string) : boolean {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);
        const folderName = parsedFolderPath.pop();
        if (folderName === undefined) return false;

        const parentFolder = this.getFolder(parsedFolderPath);
        if (!parentFolder) return false;

        const folder = parentFolder.getFolder(folderName);
        if (!folder) return false;

        // remove code views in folder and subfolders from packages
        for (let codeViewName of folder.getCodeViewNamesInFolderAndSubfolders()) {
            let path = folderPath + "/" + codeViewName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            // if active code view is being removed
            if (path === this.activeCodeViewIdentifier) {
                this.activeCodeViewIdentifier = null;
            }

            const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedPath.join("/"), name);
            if (!packageItem) continue;

            // remove mapping
            this.codeViewFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, name);

            // remove code view from package folder
            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (!packageFolder) continue;
            packageFolder.removeCodeView(name);
        }

        // remove files in folder and subfolders from packages
        for (let fileName of folder.getFileNamesInFolderAndSubfolders()) {
            let path = folderPath + "/" + fileName;
            let parsedPath = this.parseFolderPath(path);
            let name = parsedPath.pop();
            if (name === undefined) continue;

            const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedPath.join("/"), name);
            if (!packageItem) continue;

            // remove mapping
            this.fileFolderAndPackageMappings.removeByPackageItem(packageItem.packageName, name);


            // remove file from package folder
            const packageFolder = this.getPackageFolder(packageItem.packageName);
            if (!packageFolder) continue;
            packageFolder.removeFile(name);
        }

        // if folders are created for packages, some packages might need to be deleted
        if (this.createFoldersForPackages) {
            const packagesFolderPath = this.packagesFolderPath.join("/");

            // if folder for packages is located inside folder to be deleted, all packages are deleted
            if ((packagesFolderPath + "/").startsWith(folderPath + "/")) {

                // potentionally remove default package
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

            // if folder to be deleted is located inside folder for packages, some packages can be deleted
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

                    // if last folder for package is located inside folder to be deleted, package must be deleted
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

    /**
     * Renames folder. This can also change (rename) folder for packages and rename packages.
     * @param folderPath Path to folder that should be renamed.
     * @param newName New name for folder.
     * @returns Path to renamed folder or null if renaming wasn't successfull.
     */
    public renameFolder(folderPath : string, newName : string) : string | null {
        folderPath = this.normalizeFolderPath(folderPath);
        newName = this.sanitizeFolderName(newName);

        if (newName === "") return null;

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

        // potentionally change folder path for packages
        if ((packagesFolderPath + "/").startsWith(oldFolderPath + "/")) {
            const path = packagesFolderPath.replace(oldFolderPath, newFolderPath);
            this.packagesFolderPath = this.parseFolderPath(path);
        }

        // if folders are created for packages and rename folder is located inside folder for packages or it is folder for packages, some packages might need to be renamed
        if (this.createFoldersForPackages && oldFolderPath.startsWith(packagesFolderPath + "/")) {
            // get folders names inside package folder based on folder path...
            const packagesFolderNames = oldFolderPath.replace(packagesFolderPath + "/", "").split("/");
            const index = packagesFolderNames.length-1;

            const changes = new Array<{oldName: string, newName: string}>;
            // potentionally changes names of some packages
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

                // change mappings for code views
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

                // change mappings for files
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

            this.sortPackageFolders();
        }

        const renamedFolder = parentFolder.getFolder(newName);
        if (!renamedFolder) return newFolderPath;

        // change package mapping for code views located in renamed folder and subfolders
        for (let codeViewName of renamedFolder.getCodeViewNamesInFolderAndSubfolders()) {
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

        // change package mapping for files located in renamed folder and subfolders
        for (let fileName of renamedFolder.getFileNamesInFolderAndSubfolders()) {
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

    /**
     * Checks whether folder exists.
     * @param folderPath Path to folder.
     * @returns Indicates whether folder exists.
     */
    public folderExists(folderPath : string) : boolean {
        folderPath = this.normalizeFolderPath(folderPath);
        
        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        return true;
    }

    /**
     * Checks whether folder is opened.
     * @param folderPath Path to folder.
     * @returns Indicates whether folder is opened (false might also be returned if folder does not exists).
     */
    public isFolderOpened(folderPath : string) : boolean {
        folderPath = this.normalizeFolderPath(folderPath);
        
        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return false;

        return folder.isOpened();
    }

    /**
     * Returns subfolder names of folder.
     * @param folderPath Path to folder.
     * @returns Names of subfolders.
     */
    public getSubfolderNames(folderPath : string) : string[] | null {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const folderNames = new Array<string>();

        for (let subfolder of folder.getFolders()) {
            folderNames.push(subfolder.getName());
        }

        return folderNames;
    }

    /**
     * Adds new package (if generation of folders for packages is enabled, folders might also be created).
     * @param packageName Package name.
     * @returns Indicates whether package could be added. Only returns false if package could not be created because of bad package name, otherwise it always returns true (if the package already exists, it also returns true).
     */
    public addPackage(packageName : string) : boolean {
        packageName = this.normalizePackageName(packageName);
        if (packageName === "") return false;
        this.getPackageFolder(packageName, true);
        return true;
    }

    /**
     * Removes package (this does not remove folders for package if folders generation is enabled).
     * @param packageName Package name.
     * @param deleteCodeViewsAndFiles Determines whether code views and files should be deleted also in folders.
     * @returns Indicates whether package was successfully removed.
     */
    public removePackage(packageName : string, deleteCodeViewsAndFiles : boolean = false) : boolean {
        packageName = this.normalizePackageName(packageName);
        if (packageName === "") return false;

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

    /**
     * Returns folder path for package.
     * @param packageName Package name.
     * @returns Package folder path or null if package does not exists.
     */
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

    /**
     * Returns folder path that can be used to delete folder to delete package or null, if folder for package cannot be deleted (for example when folders generation is disabled or there is subpackage - basically whenever there is something else that does not belong to package).
     * @param packageName Package name.
     * @returns Folder path that can be used to delete folder to delete package or null, if folder for package cannot be deleted.
     */
    public getFolderPathToRemovePackage(packageName : string) : string | null {
        if (!this.createFoldersForPackages) return null;

        packageName = this.normalizePackageName(packageName);

        if (packageName === "") return null;

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

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

        let folder = this.getFolder(packageFolderPath);
        if (!folder) return null;

        if (
            folder.getCodeViewsCount() > packageFolder.getCodeViewsCount()
            || folder.getFilesCount() > packageFolder.getFilesCount()
            || folder.getFoldersCount() > 0
        ) return null;

        let folderPath = packageFolderPath.join("/");

        packageFolderPath.pop();
        while (packageFolderPath.length > this.packagesFolderPath.length) {
            folder = this.getFolder(packageFolderPath);
            if (!folder) break;
            if (folder.getCodeViewsCount() > 0 || folder.getFilesCount() > 0 || folder.getFoldersCount() > 1) break;

            folderPath = packageFolderPath.join("/");
            packageFolderPath.pop();
        }

        return folderPath;
    }

    /**
     * Checks whether package exists.
     * @param packageName Package name.
     * @returns Indicates whether package exists.
     */
    public packageExists(packageName : string) : boolean {
        packageName = this.normalizePackageName(packageName);

        if (packageName === "") return false;

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return false;

        return true;
    }

    /**
     * Checks whether package package is opened.
     * @param packageName Package name.
     * @returns Indicates whether package is opened (false might also be returned if folder does not exists).
     */
    public isPackageFolderOpened(packageName : string | null) : boolean {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        if (packageName === "") return false;

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return false;

        return packageFolder.isOpened();
    }

    /**
     * Checkes whether at least one package exists (default package included).
     * @returns Indicates whether at least one package exists (default package included).
     */
    public hasPackages() : boolean {
        return this.defaultPackage !== null || this.packages.size > 0;
    }

    /**
     * Adds code view.
     * @param fileName Name of code view.
     * @param codeView Code view.
     * @param showCodeViewEventSource Event source to be used to fire event when code view button is clicked.
     * @param folderPath Path to folder into which should be code view added (if folder does not exist, it is created).
     * @param usePackage Determines whether code view should be put into package.
     * @param packageName Name of package into which should be code view put (null for default package) (if package does not exist, it is created).
     * @returns Indicates whether code view has been successfully added (code view might not be added if there is already another code view the same name in the same folder or package).
     */
    public addCodeView(fileName : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : boolean {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (fileName === "") return false;
        if (usePackage && packageName === "") return false;

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

    /**
     * Finds code view by folder path.
     * @param folderPath Path to folder (null can be used for root folder).
     * @param fileName Name of code view.
     * @returns Found code view or null if code view wasn't found.
     */
    public getCodeViewByFolderPath(folderPath : string | null, fileName : string) : CodeView | null {
        folderPath = this.normalizeFolderPath(folderPath || "");
        fileName = this.sanitizeFileName(fileName);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return null;

        const codeViewItem = folder.getCodeView(fileName);
        if (!codeViewItem) return null;

        return codeViewItem.codeView;
    }

    /**
     * Finds code view by identifier.
     * @param identifier Identifier (folder path + file name).
     * @returns Found code view or null if code view wasn't found.
     */
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

    /**
     * Finds code view by package.
     * @param packageName Package name (null for default package).
     * @param fileName Name of code view.
     * @returns Found code view or null if code view wasn't found.
     */
    public getCodeViewByPackage(packageName : string | null, fileName : string) : CodeView | null {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

        const codeViewItem = packageFolder.getCodeView(fileName);
        if (!codeViewItem) return null;

        return codeViewItem.codeView;
    }

    /**
     * Returns code views in folder.
     * @param folderPath Path to folder.
     * @param traverseSubfolders Determines whether code views in subfolders should also be included.
     * @returns Code views.
     */
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

    /**
     * Returns code views in package.
     * @param packageName Package name (null for default package).
     * @returns Code views.
     */
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

    /**
     * Removes code view by identifier.
     * @param identifier Identifier (folder path + file name).
     * @returns Indicates whether code view was successfully found and removed.
     */
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

        // potentionally remove folder for default package if it is empty
        if (packageFolder && packageFolder === this.defaultPackage) {
            if (packageFolder.getCodeViewsCount() === 0 && packageFolder.getFilesCount() === 0) {
                packageFolder.detach();
                this.defaultPackage = null;
            }
        }

        this.codeViewFolderAndPackageMappings.removeByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        return true;
    }

    /**
     * Removes code view by package.
     * @param packageName Package name.
     * @param fileName Name of code view.
     * @returns Indicates whether code view was successfully found and removed.
     */
    public removeCodeViewByPackage(packageName : string | null, fileName : string) : boolean {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const identifier = this.codeViewFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
        if (!identifier) return false;
        return this.removeCodeViewByIdentifier(identifier);
    }

    /**
     * Changes identifier of code view. It can change folder path and name of code view but it never changes package of code view.
     * @param identifier Identifier (folder path + file name) of code view whose identifier should be changed.
     * @param newIdentifier New identifier (folder path + file name).
     * @param showCodeViewEventSource Event source to be used to fire event when code view button is clicked.
     * @returns Indicates whether identifier has been successfully changed.
     */
    public changeCodeViewIdentifier(identifier : string, newIdentifier : string, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>) : boolean {
        identifier = this.normalizeFolderPath(identifier);
        newIdentifier = this.normalizeFolderPath(newIdentifier);
        const isActive = this.activeCodeViewIdentifier === identifier;

        if (newIdentifier === "") return false;

        if (this.getCodeViewByIdentifier(newIdentifier) !== null) return false;

        const codeView = this.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        let parsedFolderPath = this.parseFolderPath(identifier);
        let fileName = parsedFolderPath.pop();
        if (!fileName) return false;
        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        parsedFolderPath = this.parseFolderPath(newIdentifier);
        let newFileName = parsedFolderPath.pop();
        if (!newFileName) return false;

        if (isActive) this.setNoCodeViewButtonAsActive();

        const success = this.removeCodeViewByIdentifier(identifier);
        if (!success) return false;

        this.addCodeView(newFileName, codeView, showCodeViewEventSource, parsedFolderPath.join("/"), packageItem !== null, packageItem ? packageItem.packageName : null);
        
        if (isActive) this.setCodeViewButtonsAsActiveByIdentifier(newIdentifier);

        return true;
    }

    /**
     * Returns package of code view.
     * @param identifier Identifier (folder path + file name) of code view.
     * @returns Package name or null for default package. If undefined is returned, code view is not associated with package or does not exist.
     */
    public getCodeViewPackage(identifier : string) : string | null | undefined {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return undefined;

        const packageItem = this.codeViewFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return undefined;

        return packageItem.packageName;
    }

    /**
     * Removes code view from package.
     * @param identifier Identifier (folder path + file name) of code view.
     * @returns Indicates whether code view was found and successfully removed from package.
     */
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

        // potentionally remove folder for default package if it is empty
        if (packageFolder === this.defaultPackage) {
            if (packageFolder.getCodeViewsCount() === 0 && packageFolder.getFilesCount() === 0) {
                packageFolder.detach();
                this.defaultPackage = null;
            }
        }

        return true;
    }

    /**
     * Adds file.
     * @param fileName Name of file.
     * @param codeBoxFile Code box file.
     * @param folderPath Path to folder into which should be file added (if folder does not exist, it is created).
     * @param usePackage Determines whether file should be put into package.
     * @param packageName Name of package into which should be file put (null for default package) (if package does not exist, it is created).
     * @returns Indicates whether file has been successfully added (file might not be added if there is already another file with the same name in the same folder or package).
     */
    public addFile(fileName : string, codeBoxFile : ProjectCodeBoxFile, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : boolean {
        fileName = this.sanitizeFileName(fileName);
        if (folderPath !== null) folderPath = this.normalizeFolderPath(folderPath);
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        if (fileName === "") return false;
        if (usePackage && packageName === "") return false;

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

    /**
     * Finds file by folder path.
     * @param folderPath Path to folder (null can be used for root folder).
     * @param fileName Name of file.
     * @returns Found file or null if file wasn't found.
     */
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

    /**
     * Finds file by identifier.
     * @param identifier Identifier (folder path + file name).
     * @returns Found file or null if file wasn't found.
     */
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

    /**
     * Finds file by package.
     * @param packageName Package name (null for default package).
     * @param fileName Name of file.
     * @returns Found file or null if file wasn't found.
     */
    public getFileByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxFile | null {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return null;

        const fileItem = packageFolder.getFile(fileName);
        if (!fileItem) return null;

        return fileItem.codeBoxFile;
    }

    /**
     * Returns files in folder.
     * @param folderPath Path to folder.
     * @param traverseSubfolders Determines whether files in subfolders should also be included.
     * @returns Files.
     */
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

    /**
     * Returns files in package.
     * @param packageName Package name (null for default package).
     * @returns Files.
     */
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

    /**
     * Removes file by identifier.
     * @param identifier Identifier (folder path + file name).
     * @returns Indicates whether file was successfully found and removed.
     */
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

        // potentionally remove folder for default package if it is empty
        if (packageFolder && packageFolder === this.defaultPackage) {
            if (packageFolder.getCodeViewsCount() === 0 && packageFolder.getFilesCount() === 0) {
                packageFolder.detach();
                this.defaultPackage = null;
            }
        }

        return true;
    }

    /**
     * Removes file by package.
     * @param packageName Package name.
     * @param fileName Name of file.
     * @returns Indicates whether file was successfully found and removed.
     */
    public removeFileByPackage(packageName : string | null, fileName : string) : boolean {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);
        fileName = this.sanitizeFileName(fileName);

        const identifier = this.fileFolderAndPackageMappings.getFileFolderPathByPackageItem(packageName, fileName);
        if (!identifier) return false;
        return this.removeFileByIdentifier(identifier);
    }

    /**
     * Changes identifier of file. It can change folder path and name of file but it never changes package of file.
     * @param identifier Identifier (folder path + file name) of file whose identifier should be changed.
     * @param newIdentifier New identifier (folder path + file name).
     * @returns Indicates whether identifier has been successfully changed.
     */
    public changeFileIdentifier(identifier : string, newIdentifier : string) : boolean {
        identifier = this.normalizeFolderPath(identifier);
        newIdentifier = this.normalizeFolderPath(newIdentifier);

        if (newIdentifier === "") return false;

        if (this.getFileByIdentifier(newIdentifier) !== null) return false;

        const codeBoxFile = this.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        let parsedFolderPath = this.parseFolderPath(identifier);
        let fileName = parsedFolderPath.pop();
        if (!fileName) return false;
        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.length > 0 ? parsedFolderPath.join("/") : null, fileName);

        parsedFolderPath = this.parseFolderPath(newIdentifier);
        let newFileName = parsedFolderPath.pop();
        if (!newFileName) return false;

        const success = this.removeFileByIdentifier(identifier);
        if (!success) return false;

        this.addFile(newFileName, codeBoxFile, parsedFolderPath.join("/"), packageItem !== null, packageItem ? packageItem.packageName : null);

        return true;
    }

    /**
     * Changes download link of file (or sets file as non-downloadable).
     * @param identifier Identifier (folder path + file name) of file.
     * @param newDownloadLink Download link or null to set file as non-downloadable.
     * @returns Indicates whether file was successfully found and updated.
     */
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

    /**
     * Returns package of file.
     * @param identifier Identifier (folder path + file name) of file.
     * @returns Package name or null for default package. If undefined is returned, file is not associated with package or does not exist.
     */
    public getFilePackage(identifier : string) : string | null | undefined {
        identifier = this.normalizeFolderPath(identifier);

        const parsedFolderPath = this.parseFolderPath(identifier);
        const fileName = parsedFolderPath.pop();
        if (!fileName) return undefined;

        const packageItem = this.fileFolderAndPackageMappings.getPackageItemByFileFolderPath(parsedFolderPath.join("/"), fileName);
        if (!packageItem) return undefined;

        return packageItem.packageName;
    }

    /**
     * Removes file from package.
     * @param identifier Identifier (folder path + file name) of file.
     * @returns Indicates whether file was found and successfully removed from package.
     */
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

        // potentionally remove folder for default package if it is empty
        if (packageFolder === this.defaultPackage) {
            if (packageFolder.getCodeViewsCount() === 0 && packageFolder.getFilesCount() === 0) {
                packageFolder.detach();
                this.defaultPackage = null;
            }
        }

        return true;
    }

    /**
     * Sets no code view button as active.
     */
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

    /**
     * Sets buttons of code view as active (previously active buttons are set as inactive).
     * @param identifier Identifier (folder path + file name) of code view which buttons should be set as active.
     */
    public setCodeViewButtonsAsActiveByIdentifier(identifier : string) : void {
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

    /**
     * Opens folder.
     * @param folderPath Path to folder to open.
     * @param openParentFolders Determines whether parent folders of folder should open too.
     * @param animate Determines whether animation should be used.
     */
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

    /**
     * Closes folder.
     * @param folderPath Path to folder to close.
     * @param closeSubfolders Determines whether subfolders should close too.
     * @param animate Determines whether animation should be used.
     */
    public closeFolder(folderPath : string, closeSubfolders : boolean = false, animate : boolean = true) : void {
        folderPath = this.normalizeFolderPath(folderPath);

        const parsedFolderPath = this.parseFolderPath(folderPath);

        const folder = this.getFolder(parsedFolderPath);
        if (!folder) return;

        if (closeSubfolders) {
            this.closeFolderAndSubfolders(folder);
        } else {
            folder.close(animate);
        }
    }

    /**
     * Opens package.
     * @param packageName Package name (null for default package).
     * @param animate Determines whether animation should be used.
     */
    public openPackage(packageName : string | null, animate : boolean = true) : void {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return;

        packageFolder.open(animate);
    }

    /**
     * Closes package.
     * @param packageName Package name (null for default package).
     * @param animate Determines whether animation should be used.
     */
    public closePackage(packageName : string | null, animate : boolean = true) : void {
        if (packageName !== null) packageName = this.normalizePackageName(packageName);

        const packageFolder = this.getPackageFolder(packageName);
        if (!packageFolder) return;

        packageFolder.close(animate);
    }

    /**
     * Updates tab navigation.
     * @param panelOpened Indicates whether panel is opened.
     */
    public updateTabNavigation(panelOpened : boolean) : void {
        this.panelOpened = panelOpened;

        this.rootFolder.updateTabNavigation(panelOpened);
        if (this.defaultPackage) {
            this.defaultPackage.updateTabNavigation(panelOpened);
        }
        this.packages.forEach(packageFolder => packageFolder.updateTabNavigation(panelOpened));
    }

    /**
     * Returns folder structure.
     * @returns Folder structure.
     */
    public getFolderStructure() : TreeNode<FolderInfo>[] {
        return this.rootFolder.getFolderStructure().children;
    }

    /**
     * Returns package names.
     * @returns Package names.
     */
    public getPackageNames() : string[] {
        const packageNames = new Array<string>();

        this.packages.forEach((_, packageName) => packageNames.push(packageName));

        return packageNames;
    }

    /**
     * Returns package infos.
     * @returns Package infos.
     */
    public getPackageInfos() : PackageInfo[] {
        const packageInfos = new Array<PackageInfo>();

        this.packages.forEach((packageFolder, packageName) => {
            packageInfos.push({
                name: packageName,
                opened: packageFolder.isOpened()
            });
        });

        return packageInfos;
    }

    /**
     * Returns path to folder used for packages.
     * @returns Folder path for packages.
     */
    public getPackagesFolderPath() : string {
        return this.packagesFolderPath.join("/");
    }

    /**
     * Sets new folder path for packages. (This method should be called only when folders manager is empty, otherwise problems may occur.)
     * @param newPackagesFolderPath New folder path for packages.
     */
    public setPackagesFolderPath(newPackagesFolderPath : string) : void {
        newPackagesFolderPath = this.normalizeFolderPath(newPackagesFolderPath);
        this.packagesFolderPath = this.parseFolderPath(newPackagesFolderPath);
    }

    /**
     * Closes folder and its subfolders.
     * @param folder Folder to be closed.
     * @param animate Determines whether animation should be used.
     */
    private closeFolderAndSubfolders(folder : Folder, animate : boolean = true) {
        folder.close(animate);

        for (let subfolder of folder.getFolders()) {
            this.closeFolderAndSubfolders(subfolder, animate);
        }
    }

    /**
     * Sorts packages (default is always first, then alphabetically).
     */
    private sortPackageFolders() : void {
        if (this.defaultPackage) {
            this.defaultPackage.appendTo(this.packagesContainer);
        }

        const packageFolders = Array.from(this.packages);
        packageFolders.sort((folder1, folder2) => folder1[0] > folder2[0] ? 1 : -1);

        for (let folder of packageFolders) {
            folder[1].appendTo(this.packagesContainer);
        }
    }

    /**
     * Returns folder based on passed path.
     * @param folderPath Path to folder.
     * @param createIfNotExist Determines whether folder should be created if it doesn't exist.
     * @returns Folder or null if folder wasn't found.
     */
    private getFolder(folderPath : string[], createIfNotExist : boolean = false) : Folder | null {
        let allParentsOpened = this.panelOpened;

        let folder = this.rootFolder;
        for (let folderName of folderPath) {
            if (!folder.isOpened()) allParentsOpened = false;

            let subfolder = folder.getFolder(folderName);

            if (!subfolder) {
                if (createIfNotExist) {
                    subfolder = new Folder(
                        folderName,
                        allParentsOpened,
                        this.openCloseAnimationSpeed,
                        this.openCloseAnimationEasingFunction,
                        this.svgSpritePath,
                        this.folderArrowIconName,
                        this.folderIconName,
                        CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FOLDER_MODIFIER
                    );
                    folder.addFolder(folderName, subfolder);
                } else {
                    return null;
                }
            }
            folder = subfolder;
        }

        return folder;
    }

    /**
     * Returns package folder based on package name.
     * @param normalizedPackageName Package name (normalized) (null for default package).
     * @param createIfNotExist Determines whether package folder should be created if it doesn't exist.
     * @returns Package folder or null if folder wasn't found.
     */
    private getPackageFolder(normalizedPackageName : string | null, createIfNotExist : boolean = false) : Folder | null {
        if (normalizedPackageName === null) {
            if (!this.defaultPackage) {
                if (createIfNotExist) {
                    this.getFolder(this.packagesFolderPath, true);
                    this.defaultPackage = new Folder(
                        this.defaultPackageName,
                        this.panelOpened,
                        this.openCloseAnimationSpeed,
                        this.openCloseAnimationEasingFunction,
                        this.svgSpritePath,
                        this.folderArrowIconName,
                        this.packageIconName,
                        CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DEFAULT_PACKAGE_MODIFIER,
                        this.packagesContainer
                    );
                    this.sortPackageFolders();
                } else {
                    return null;
                }
            }
            return this.defaultPackage;
        }

        let packageFolder = this.packages.get(normalizedPackageName);

        if (!packageFolder) {
            if (createIfNotExist) {
                // potentionally create folders for package
                if (this.createFoldersForPackages) {
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
                }

                packageFolder = new Folder(
                    normalizedPackageName,
                    this.panelOpened,
                    this.openCloseAnimationSpeed,
                    this.openCloseAnimationEasingFunction,
                    this.svgSpritePath,
                    this.folderArrowIconName,
                    this.packageIconName,
                    CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PACKAGE_MODIFIER,
                    this.packagesContainer
                );
                this.packages.set(normalizedPackageName, packageFolder);
                this.sortPackageFolders();
            } else {
                return null;
            }
        }

        return packageFolder;
    }

    /**
     * Determines folder path for code view or file based on passed parameters.
     * @param normalizedFolderPath Folder path (normalized) (null means, folder path was not specified).
     * @param usePackage Determines whether package should be used.
     * @param normalizedPackageName Package name (normalized) (null for default package).
     * @returns Folder path.
     */
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

    /**
     * Sanitizes file name (removes all slashes).
     * @param fileName File name.
     * @returns Sanitized file name.
     */
    private sanitizeFileName(fileName : string) : string {
        // remove all slashes
        return fileName.trim().replace(/\//g, '');
    }

    /**
     * Sanitizes folder name (removes all slashes).
     * @param folderName Folder name.
     * @returns Sanitized folder name.
     */
    private sanitizeFolderName(folderName : string) : string {
        // remove all slashes
        return folderName.trim().replace(/\//g, '');
    }

    /**
     * Normalizes folder path (removes unnecessery slashes and so on).
     * @param folderPath Folder path.
     * @returns Normalized folder path.
     */
    private normalizeFolderPath(folderPath : string) : string {
        folderPath = folderPath.trim();

        // remove starting and ending slashes
        folderPath = folderPath.replace(/^\/+|\/+$/g, '');
        
        // replace multiple slashes next to each other by one
        folderPath = folderPath.replace(/\/+/g, '/');

        return folderPath;
    }

    /**
     * Normalizes package name.
     * @param packageName Package name.
     * @returns Normalized package name.
     */
    private normalizePackageName(packageName : string) : string {
        const delimiter = this.foldersDelimiterForPackages;
        if (!this.createFoldersForPackages || delimiter === null) return packageName.trim();
        
        const startEndRegex = new RegExp(`^\\${delimiter}+|\\${delimiter}+$`, 'g');
        const multipleSeparatorRegex = new RegExp(`\\${delimiter}+`, 'g');

        packageName = packageName.trim();

        // remove all spaces
        packageName = packageName.replace(/\s+/g, '');
        
        // remove starting and ending delimiter characters
        packageName = packageName.replace(startEndRegex, '');
        
        // replace multiple delimiter characters next to each other by one
        packageName = packageName.replace(multipleSeparatorRegex, delimiter);
        
        return packageName;
    }

    /**
     * Parses folder path.
     * @param normalizedFolderPath Normalized folder path.
     * @returns Parsed folder path (array with folder names).
     */
    private parseFolderPath(normalizedFolderPath : string) : string[] {
        const result = normalizedFolderPath.split("/");
        if (result.length === 1 && result[0] === "") {
            return [];
        }
        return result;
    }

    /**
     * Returns folder names that should be created in packages folder for package.
     * @param normalizedPackageName Normalized package name.
     * @returns Folder names.
     */
    private getPackageFolderNames(normalizedPackageName : string) : string[] {
        if (!this.createFoldersForPackages) return [];
        if (this.foldersDelimiterForPackages === null) return [normalizedPackageName];

        const result = normalizedPackageName.split(this.foldersDelimiterForPackages);
        if (result.length === 1 && result[0] === "") {
            return [];
        }
        return result;
    }
}

export default FoldersManager;