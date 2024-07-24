import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import { parseFolderPath } from "../../utils/utils";
import CodeBoxFile from "../CodeBoxFile";
import CodeViewButton from "../CodeViewButton";
import FileButton from "../FileButton";
import Folder from "./Folder";
import ProjectCodeViewButton from "./ProjectCodeViewButton";
import ProjectFileButton from "./ProjectFileButton";
// import ProjectMultiElementCodeViewButton from "./ProjectMultiElementCodeViewButton";
// import ProjectMultiElementFileButton from "./ProjectMultiElementFileButton";

class FoldersManager {
    private rootFolder : Folder;
    private packages = new Map<string, Folder>();
    private defaultPackage : Folder | null = null;
    private packagesContainer : HTMLElement;
    private packagesFolderPath : string;

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

    constructor(folderStructureContainer : HTMLElement, packagesContainer : HTMLElement, projectName : string, packagesFolderPath : string | null, defaultPackageName : string | null, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, folderArrowIconName : string | null = null, projectIconName : string | null = null, folderIconName : string | null = null, packageIconName : string | null = null, codeFileIconName : string | null = null, fileIconName : string | null = null, downloadIconName : string | null = null) {
        this.packagesContainer = packagesContainer;
        this.packagesFolderPath = packagesFolderPath || "/";

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

    public setPackagesFolderPath(folderPath : string) : void {
        this.packagesFolderPath = folderPath;
    }

    public addFolder(folderPath : string) : void {
        this.getFolder(folderPath, true);
    }

    public addPackage(packageName : string) : void {
        this.getPackageFolder(packageName, true);
    }

    // todo - ještě pozor na duplicity
    // pořádně potom okomentovat, co se stane když se pošle třeba folderPath i packageName
    // přejmenovat na addCodeView (možná by se mohla předávat jen folderPath - přejmnovat na path? - spíš předávat folderPath i codeViewName (nebo to pojmenovat jako fileName))
    // public addCodeViewButton(buttonText : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : CodeViewButton {
    //     let codeViewButton : CodeViewButton;

    //     if (usePackage) {
    //         codeViewButton = new ProjectMultiElementCodeViewButton(buttonText, showCodeViewEventSource, codeView, this.svgSpritePath, this.codeFileIconName);

    //         const packageFolder = this.getPackageFolder(packageName, true);
    //         packageFolder?.addCodeViewButton(buttonText, codeViewButton);
    //     } else {
    //         codeViewButton = new ProjectCodeViewButton(buttonText, showCodeViewEventSource, codeView, this.svgSpritePath, this.codeFileIconName);
    //     }

    //     if (folderPath === null) {
    //         if (usePackage) {
    //             folderPath = this.packagesFolderPath;
    //         } else {
    //             folderPath = "/";
    //         }
    //     }

    //     const folder = this.getFolder(folderPath, true);
    //     folder?.addCodeViewButton(buttonText, codeViewButton);

    //     return codeViewButton;
    // }

    public addCodeView(fileName : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null, isActive : boolean = false) : void {
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const folder = this.getFolder(folderPath, true);
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
        }
    }

    public getCodeView(path : string) : CodeView | null {
        return null;
    }

    // todo - přejmenovat na addFile
    // public addFileButton(buttonText : string, downloadLink : string | null, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : FileButton {
    //     let fileButton : FileButton;

    //     if (usePackage) {
    //         fileButton = new ProjectMultiElementFileButton(buttonText, downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);

    //         const packageFolder = this.getPackageFolder(packageName, true);
    //         packageFolder?.addFileButton(buttonText, fileButton);
    //     } else {
    //         fileButton = new ProjectFileButton(buttonText, downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);
    //     }

    //     if (folderPath === null) {
    //         if (usePackage) {
    //             folderPath = this.packagesFolderPath;
    //         } else {
    //             folderPath = "/";
    //         }
    //     }

    //     const folder = this.getFolder(folderPath, true);
    //     folder?.addFileButton(buttonText, fileButton);

    //     return fileButton;
    // }

    public addFile(fileName : string, downloadLink : string | null, folderPath : string | null, usePackage : boolean = false, packageName : string | null = null) : void {
        folderPath = this.getFolderPath(folderPath, usePackage, packageName);

        const folder = this.getFolder(folderPath, true);
        folder?.addFile(fileName, downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);

        if (usePackage) {
            const packageFolder = this.getPackageFolder(packageName, true);
            packageFolder?.addFile(fileName, downloadLink, this.svgSpritePath, this.fileIconName, this.downloadIconName);
        }
    }

    public getFile(path : string) : CodeBoxFile | null {
        return null;
    }

    public updateTabNavigation(panelOpened : boolean) : void {
        this.rootFolder.updateTabNavigation(panelOpened);
        if (this.defaultPackage) {
            this.defaultPackage.updateTabNavigation(panelOpened);
        }
        this.packages.forEach(packageFolder => packageFolder.updateTabNavigation(panelOpened));
    }

    private getFolderPath(folderPath : string | null, usePackage : boolean, packageName : string | null) : string {
        if (folderPath !== null) return folderPath;
        if (usePackage) this.packagesFolderPath; // todo - potom kdyžtak ještě brát v potaz, že se můžou vytvořit ty další složky podle názvu balíčku
        return "/";
    }

    private getFolder(folderPath : string, createIfNotExist : boolean = false) : Folder | null {
        const parsedFolderPath = parseFolderPath(folderPath);

        let folder = this.rootFolder;
        for (let folderName of parsedFolderPath) {
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

    private getPackageFolder(packageName : string | null, createIfNotExist : boolean = false) : Folder | null { // todo - při vytváření balíčků ještě vytvářet složky ve složce pro balíčky (bude se předávat v konfiguraci, jestli se to má dělat a podle jakého znaku v názvu balíčku - pokud to bude null, tak se to bude do té složky jen dávat, nebudou se tam složky vytvářet)
        if (packageName === null) {
            if (!this.defaultPackage) {
                if (createIfNotExist) {
                    this.defaultPackage = new Folder(this.defaultPackageName, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DEFAULT_PACKAGE_MODIFIER, this.packagesContainer);
                } else {
                    return null;
                }
            }
            return this.defaultPackage;
        }

        let packageFolder = this.packages.get(packageName);

        if (!packageFolder) {
            if (createIfNotExist) {
                packageFolder = new Folder(packageName, this.openCloseAnimationSpeed, this.openCloseAnimationEasingFunction, this.svgSpritePath, this.folderArrowIconName, this.packageIconName, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_PACKAGE_MODIFIER, this.packagesContainer);
                this.packages.set(packageName, packageFolder);
            } else {
                return null;
            }
        }

        return packageFolder;
    }
}

export default FoldersManager;