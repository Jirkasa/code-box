import CSSClasses from "../../CSSClasses";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import CodeViewFolderItem from "./CodeViewFolderItem";
import Collapsible from "./Collapsible";
import FileFolderItem from "./FileFolderItem";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";
import ProjectCodeViewButton from "./ProjectCodeViewButton";
import ProjectFileButton from "./ProjectFileButton";

// ještě zbývají ty aria atributy, ale o tom se budu muset dozvědět více info

class Folder {
    protected buttonElement : HTMLButtonElement;
    private buttonTextElement : HTMLElement;
    private itemsContainer : HTMLElement;
    private collapsible : Collapsible;

    private subfolders = new Map<string, Folder>();
    private codeViewItems = new Map<string, CodeViewFolderItem>();
    private fileItems = new Map<string, FileFolderItem>();

    private lastParentOpened : boolean; // todo - a tady to taky okomentovat - není to přímo jakoby parent

    constructor(name : string, parentOpened : boolean, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, arrowIconName : string | null = null, folderIconName : string | null = null, cssModifierClass : string | null = null, parentElement : HTMLElement | null = null) {
        this.buttonElement = document.createElement("button");
        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM);
        if (cssModifierClass) {
            this.buttonElement.classList.add(cssModifierClass);
        }

        const arrowIcon = document.createElement("div");
        arrowIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ARROW_ICON);
        if (svgSpritePath && arrowIconName) {
            arrowIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, arrowIconName);
        }
        this.buttonElement.appendChild(arrowIcon);

        const folderIcon = document.createElement("div");
        folderIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (svgSpritePath && folderIconName) {
            folderIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, folderIconName);
        }
        this.buttonElement.appendChild(folderIcon);

        this.buttonTextElement = document.createElement("div");
        this.buttonTextElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        this.buttonTextElement.innerText = name;
        this.buttonElement.appendChild(this.buttonTextElement);

        this.itemsContainer = document.createElement("div");
        this.itemsContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_COLLAPSIBLE);

        if (parentElement) {
            parentElement.appendChild(this.buttonElement);
            parentElement.appendChild(this.itemsContainer);
        }

        this.collapsible = new Collapsible(this.buttonElement, this.itemsContainer, openCloseAnimationSpeed, openCloseAnimationEasingFunction, () => this.onCollapsibleToggled());
        
        this.lastParentOpened = parentOpened;
        this.updateTabNavigation(this.lastParentOpened);
    }

    public detach() : void {
        this.buttonElement.remove();
        this.itemsContainer.remove();
    }

    public setName(name : string) {
        this.buttonTextElement.innerText = name;
    }

    public open(animate : boolean = true) : void {
        if (this.collapsible.isOpened()) return;
        this.collapsible.open(animate);
    }

    public close(animate : boolean = true) : void {
        if (!this.collapsible.isOpened()) return;
        this.collapsible.close(animate);
    }

    public isOpened() : boolean {
        return this.collapsible.isOpened();
    }

    public updateTabNavigation(parentOpened : boolean) : void { // parentOpened není tak úplně parent opened (přejmenovat to - ale na co? - spíš přidám komentář)
        if (parentOpened) {
            this.buttonElement.setAttribute("tabindex", "0");
        } else {
            this.buttonElement.setAttribute("tabindex", "-1");
        }

        if (parentOpened && this.collapsible.isOpened()) {
            this.codeViewItems.forEach(codeViewItem => codeViewItem.codeViewButton.enableTabNavigation());
            this.fileItems.forEach(fileItem => fileItem.fileButton.enableTabNavigation());
        } else {
            this.codeViewItems.forEach(codeViewItem => codeViewItem.codeViewButton.disableTabNavigation());
            this.fileItems.forEach(fileItem => fileItem.fileButton.disableTabNavigation());
        }

        this.subfolders.forEach(subfolder => {
            subfolder.updateTabNavigation(parentOpened && this.collapsible.isOpened());
        });

        this.lastParentOpened = parentOpened;
    }

    public addFolder(name : string, folder : Folder) : void {
        if (this.subfolders.has(name)) return;

        this.subfolders.set(name, folder);

        folder.updateTabNavigation(this.lastParentOpened && this.collapsible.isOpened());

        this.sortItems();
    }

    public getFolder(folderName : string) : Folder | null {
        const folder = this.subfolders.get(folderName);
        if (!folder) return null;
        return folder;
    }

    public getFolders() : Folder[] {
        const folders = new Array<Folder>();

        this.subfolders.forEach(folder => folders.push(folder));

        return folders;
    }

    public removeFolder(folderName : string) : boolean {
        const folder = this.subfolders.get(folderName);
        if (!folder) return false;

        folder.detach();

        this.subfolders.delete(folderName);
        return true;
    }

    public renameFolder(folderName : string, newFolderName : string) : boolean {
        if (this.subfolders.has(newFolderName)) return false;

        const folder = this.subfolders.get(folderName);
        if (!folder) return false;

        folder.setName(newFolderName);
        this.subfolders.delete(folderName);
        this.subfolders.set(newFolderName, folder);

        return true;
    }

    public addCodeView(name : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, svgSpritePath : string | null = null, buttonIconName : string | null = null) : CodeViewFolderItem | null { // null to vrací, když už tam code view pod tímto názvem existuje
        if (this.codeViewItems.has(name)) return null;

        const codeViewButton = new ProjectCodeViewButton(name, showCodeViewEventSource, codeView, svgSpritePath, buttonIconName);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            codeViewButton.enableTabNavigation();
        } else {
            codeViewButton.disableTabNavigation();
        }
        
        const item = new CodeViewFolderItem(codeView, codeViewButton);
        this.codeViewItems.set(name, item);

        this.sortItems();

        return item;
    }

    public getCodeView(name : string) : CodeViewFolderItem | null {
        const codeViewItem = this.codeViewItems.get(name);
        if (!codeViewItem) return null;
        return codeViewItem;
    }

    public getCodeViews(traverseSubfolders : boolean = false) : CodeViewFolderItem[] {
        const codeViewItems = new Array<CodeViewFolderItem>();

        this.codeViewItems.forEach(codeViewItem => codeViewItems.push(codeViewItem));

        if (traverseSubfolders) {
            this.subfolders.forEach(subfolder => {
                for (let codeViewItem of subfolder.getCodeViews(true)) {
                    codeViewItems.push(codeViewItem);
                }
            });
        }

        return codeViewItems;
    }

    // public getCodeViewNames(traverseSubfolders : boolean = false) : string[] {
    //     const codeViewNames = new Array<string>();

    //     this.codeViewItems.forEach((_, name) => codeViewNames.push(name));

    //     if (traverseSubfolders) {
    //         this.subfolders.forEach(subfolder => {
    //             for (let name of subfolder.getCodeViewNames(true)) {
    //                 codeViewNames.push(name);
    //             }
    //         });
    //     }

    //     return codeViewNames;
    // }

    public removeCodeView(name : string) : boolean {
        const codeViewItem = this.codeViewItems.get(name);
        if (!codeViewItem) return false;

        codeViewItem.codeViewButton.detach();

        this.codeViewItems.delete(name);
        return true;
    }

    public addFile(name : string, codeBoxFile : ProjectCodeBoxFile, svgSpritePath : string | null = null, buttonIconName : string | null = null, buttonDownloadIconName : string | null = null) : FileFolderItem | null {
        if (this.fileItems.has(name)) return null;

        const fileButton = new ProjectFileButton(name, codeBoxFile.getDownloadLink(), svgSpritePath, buttonIconName, buttonDownloadIconName);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            fileButton.enableTabNavigation();
        } else {
            fileButton.disableTabNavigation();
        }

        const item = new FileFolderItem(codeBoxFile, fileButton);
        this.fileItems.set(name, item);

        this.sortItems();

        return item;
    }

    public getFile(name : string) : FileFolderItem | null {
        const fileItem = this.fileItems.get(name);
        if (!fileItem) return null;
        return fileItem;
    }

    public getFiles(traverseSubfolders : boolean = false) : FileFolderItem[] {
        const fileItems = new Array<FileFolderItem>();

        this.fileItems.forEach(fileItem => fileItems.push(fileItem));

        if (traverseSubfolders) {
            this.subfolders.forEach(subfolder => {
                for (let fileItem of subfolder.getFiles(true)) {
                    fileItems.push(fileItem);
                }
            });
        }

        return fileItems;
    }

    public removeFile(name : string) : boolean {
        const fileItem = this.fileItems.get(name);
        if (!fileItem) return false;

        fileItem.fileButton.detach();

        this.fileItems.delete(name);
        return true;
    }

    public getCodeViewNamesInFolderAndSubfolders() : string[] { // pro subfolders to vrací i s takovou cestou - nějak to sem napsat do komentáře
        const codeViewNames = new Array<string>();

        this.codeViewItems.forEach((_, name) => codeViewNames.push(name));

        this.subfolders.forEach((subfolder, subfolderName) => {
            for (let name of subfolder.getCodeViewNamesInFolderAndSubfolders()) {
                codeViewNames.push(subfolderName + "/" + name);
            }
        });

        return codeViewNames;
    }

    public getFileNamesInFolderAndSubfolders() : string[] {
        const fileNames = new Array<string>();

        this.fileItems.forEach((_, name) => fileNames.push(name));

        this.subfolders.forEach((subfolder, subfolderName) => {
            for (let name of subfolder.getFileNamesInFolderAndSubfolders()) {
                fileNames.push(subfolderName + "/" + name);
            }
        });

        return fileNames;
    }

    private onCollapsibleToggled() : void {
        this.updateTabNavigation(this.lastParentOpened);
    }

    private sortItems() : void {
        const folders = Array.from(this.subfolders);
        folders.sort((folder1, folder2) => folder1[0] > folder2[0] ? 1 : -1);

        const items = new Array<[string, CodeViewFolderItem | FileFolderItem]>();
        this.codeViewItems.forEach((item, name) => items.push([name, item]));
        this.fileItems.forEach((item, name) => items.push([name, item]));
        items.sort((item1, item2) => item1[0] > item2[0] ? 1 : -1);

        for (let folder of folders) {
            this.itemsContainer.appendChild(folder[1].buttonElement);
            this.itemsContainer.appendChild(folder[1].itemsContainer);
        }

        for (let item of items) {
            if (item[1] instanceof CodeViewFolderItem) {
                item[1].codeViewButton.appendTo(this.itemsContainer);
            } else if (item[1] instanceof FileFolderItem) {
                item[1].fileButton.appendTo(this.itemsContainer);
            }
        }
    }
}

export default Folder;