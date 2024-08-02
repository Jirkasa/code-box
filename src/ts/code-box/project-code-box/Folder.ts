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

/**
 * Represents folder in project code box panel.
 */
class Folder {
    /** Folder button element. */
    protected buttonElement : HTMLButtonElement;
    /** Folder button text element. */
    private buttonTextElement : HTMLElement;
    /** Container for folder items. */
    private itemsContainer : HTMLElement;
    /** Collapsible functionality. */
    private collapsible : Collapsible;

    /** Subfolders stored by name. */
    private subfolders = new Map<string, Folder>();
    /** Code view items stored by name. */
    private codeViewItems = new Map<string, CodeViewFolderItem>();
    /** File items stored by name. */
    private fileItems = new Map<string, FileFolderItem>();

    /** Indicates whether all parent folders are opened. This value is changed when updateTabNavigation method is called. */
    private lastAllParentOpened : boolean;

    /**
     * Creates new folder.
     * @param name Name of folder.
     * @param parentOpened Indicates whether all parent folders are opened.
     * @param openCloseAnimationSpeed Open/close animation speed in miliseconds.
     * @param openCloseAnimationEasingFunction CSS easing function for open/close animation.
     * @param svgSpritePath Path to SVG sprite for icons.
     * @param arrowIconName Name of arrow icon.
     * @param folderIconName Name of folder icon.
     * @param cssModifierClass CSS class to be added to folder button.
     * @param parentElement Element into which should be folder appended (null if it should not be appended).
     */
    constructor(name : string, allParentsOpened : boolean, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, arrowIconName : string | null = null, folderIconName : string | null = null, cssModifierClass : string | null = null, parentElement : HTMLElement | null = null) {
        // create folder button
        this.buttonElement = document.createElement("button");
        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM);
        if (cssModifierClass) {
            this.buttonElement.classList.add(cssModifierClass);
        }

        // create arrow icon of folder button
        const arrowIcon = document.createElement("div");
        arrowIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ARROW_ICON);
        if (svgSpritePath && arrowIconName) {
            arrowIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, arrowIconName);
        }
        this.buttonElement.appendChild(arrowIcon);

        // create folder icon
        const folderIcon = document.createElement("div");
        folderIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (svgSpritePath && folderIconName) {
            folderIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, folderIconName);
        }
        this.buttonElement.appendChild(folderIcon);

        // create folder button text element
        this.buttonTextElement = document.createElement("div");
        this.buttonTextElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        this.buttonTextElement.innerText = name;
        this.buttonElement.appendChild(this.buttonTextElement);

        // create container for folder items
        this.itemsContainer = document.createElement("div");
        this.itemsContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_COLLAPSIBLE);

        if (parentElement) {
            parentElement.appendChild(this.buttonElement);
            parentElement.appendChild(this.itemsContainer);
        }

        this.collapsible = new Collapsible(this.buttonElement, this.itemsContainer, openCloseAnimationSpeed, openCloseAnimationEasingFunction, () => this.onCollapsibleToggled());
        
        this.lastAllParentOpened = allParentsOpened;
        this.updateTabNavigation(this.lastAllParentOpened);
    }

    /**
     * Appends folder to element.
     * @param container Element to append folder to.
     */
    public appendTo(container : HTMLElement) : void {
        container.appendChild(this.buttonElement);
        container.appendChild(this.itemsContainer);
    }

    /**
     * Detaches folder from its parent element.
     */
    public detach() : void {
        this.buttonElement.remove();
        this.itemsContainer.remove();
    }

    /**
     * Sets name of folder.
     * @param name Name.
     */
    public setName(name : string) {
        this.buttonTextElement.innerText = name;
    }

    /**
     * Opens folder.
     * @param animate Determines whether animation should be used.
     */
    public open(animate : boolean = true) : void {
        if (this.collapsible.isOpened()) return;
        this.collapsible.open(animate);
    }

    /**
     * Closes folder.
     * @param animate Determines whether animation should be used.
     */
    public close(animate : boolean = true) : void {
        if (!this.collapsible.isOpened()) return;
        this.collapsible.close(animate);
    }

    /**
     * Checkes whether folder is opened.
     * @returns Indicates whether folder is opened.
     */
    public isOpened() : boolean {
        return this.collapsible.isOpened();
    }

    /**
     * Updates tab navigation.
     * @param allParentOpened Indicates whether all parent folders are opened.
     */
    public updateTabNavigation(allParentOpened : boolean) : void {
        if (allParentOpened) {
            this.buttonElement.setAttribute("tabindex", "0");
        } else {
            this.buttonElement.setAttribute("tabindex", "-1");
        }

        if (allParentOpened && this.collapsible.isOpened()) {
            this.codeViewItems.forEach(codeViewItem => codeViewItem.codeViewButton.enableTabNavigation());
            this.fileItems.forEach(fileItem => fileItem.fileButton.enableTabNavigation());
        } else {
            this.codeViewItems.forEach(codeViewItem => codeViewItem.codeViewButton.disableTabNavigation());
            this.fileItems.forEach(fileItem => fileItem.fileButton.disableTabNavigation());
        }

        this.subfolders.forEach(subfolder => {
            subfolder.updateTabNavigation(allParentOpened && this.collapsible.isOpened());
        });

        // update also aria attributes
        if (allParentOpened && this.collapsible.isOpened()) {
            this.buttonElement.setAttribute("aria-expanded", "true");
            this.itemsContainer.setAttribute("aria-hidden", "false");
        } else {
            this.buttonElement.setAttribute("aria-expanded", "false");
            this.itemsContainer.setAttribute("aria-hidden", "true");
        }

        this.lastAllParentOpened = allParentOpened;
    }

    /**
     * Adds folder as subfolder.
     * @param name Name of folder.
     * @param folder Folder.
     */
    public addFolder(name : string, folder : Folder) : void {
        if (this.subfolders.has(name)) return;

        this.subfolders.set(name, folder);

        folder.updateTabNavigation(this.lastAllParentOpened && this.collapsible.isOpened());

        this.sortItems();
    }

    /**
     * Returns subfolder by name.
     * @param folderName Folder name.
     * @returns Subfolder or null if subfolder wasn't found.
     */
    public getFolder(folderName : string) : Folder | null {
        const folder = this.subfolders.get(folderName);
        if (!folder) return null;
        return folder;
    }

    /**
     * Returns subfolders of folder.
     * @returns Subfolders.
     */
    public getFolders() : Folder[] {
        const folders = new Array<Folder>();

        this.subfolders.forEach(folder => folders.push(folder));

        return folders;
    }

    /**
     * Removes subfolder.
     * @param folderName Name of folder to be removed.
     * @returns Indicates whether subfolder was successfully found and removed.
     */
    public removeFolder(folderName : string) : boolean {
        const folder = this.subfolders.get(folderName);
        if (!folder) return false;

        folder.detach();

        this.subfolders.delete(folderName);
        return true;
    }

    /**
     * Renames subfolder.
     * @param folderName Name of folder to be renamed.
     * @param newFolderName New folder name.
     * @returns Indicates whether subfolder was successfully found and removed.
     */
    public renameFolder(folderName : string, newFolderName : string) : boolean {
        if (this.subfolders.has(newFolderName)) return false;

        const folder = this.subfolders.get(folderName);
        if (!folder) return false;

        folder.setName(newFolderName);
        this.subfolders.delete(folderName);
        this.subfolders.set(newFolderName, folder);

        return true;
    }

    /**
     * Returns number of subfolders (direct subfolders).
     * @returns Number of subfolders.
     */
    public getFoldersCount() : number {
        return this.subfolders.size;
    }

    /**
     * Adds code view to folder.
     * @param name Name of code view.
     * @param codeView Code view.
     * @param showCodeViewEventSource Event source to be used to fire event when code view button is clicked.
     * @param svgSpritePath Path to SVG sprite with icons.
     * @param buttonIconName Icon name for code view button.
     * @returns Created code view item or null if code view could not be added to folder (when there is already code view with same name).
     */
    public addCodeView(name : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, svgSpritePath : string | null = null, buttonIconName : string | null = null) : CodeViewFolderItem | null {
        if (this.codeViewItems.has(name)) return null;

        const codeViewButton = new ProjectCodeViewButton(name, showCodeViewEventSource, codeView, svgSpritePath, buttonIconName);
        if (this.lastAllParentOpened && this.collapsible.isOpened()) {
            codeViewButton.enableTabNavigation();
        } else {
            codeViewButton.disableTabNavigation();
        }
        
        const item = new CodeViewFolderItem(codeView, codeViewButton);
        this.codeViewItems.set(name, item);

        this.sortItems();

        return item;
    }

    /**
     * Returns code view item by name.
     * @param name Name of code view.
     * @returns Code view item or null if code view item wasn't found.
     */
    public getCodeView(name : string) : CodeViewFolderItem | null {
        const codeViewItem = this.codeViewItems.get(name);
        if (!codeViewItem) return null;
        return codeViewItem;
    }

    /**
     * Returns code view items in folder.
     * @param traverseSubfolders Determines whether code view items in subfolders should also be included.
     * @returns Code view items.
     */
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

    /**
     * Removes code view item.
     * @param name Name of code view.
     * @returns Indicates whether code view item was successfully found and removed.
     */
    public removeCodeView(name : string) : boolean {
        const codeViewItem = this.codeViewItems.get(name);
        if (!codeViewItem) return false;

        codeViewItem.codeViewButton.detach();

        this.codeViewItems.delete(name);
        return true;
    }

    /**
     * Returns number of code view items (code view items in subfolders are not included).
     * @returns Number of code view items.
     */
    public getCodeViewsCount() : number {
        return this.codeViewItems.size;
    }

    /**
     * Adds file to folder.
     * @param name Name of file.
     * @param codeBoxFile Code box file.
     * @param svgSpritePath Path to SVG sprite with icons.
     * @param buttonIconName Icon name for file button.
     * @param buttonDownloadIconName Download icon name for file button.
     * @returns Created file item or null if file could not be added to folder (when there is already file with the same name).
     */
    public addFile(name : string, codeBoxFile : ProjectCodeBoxFile, svgSpritePath : string | null = null, buttonIconName : string | null = null, buttonDownloadIconName : string | null = null) : FileFolderItem | null {
        if (this.fileItems.has(name)) return null;

        const fileButton = new ProjectFileButton(name, codeBoxFile.getDownloadLink(), svgSpritePath, buttonIconName, buttonDownloadIconName);
        if (this.lastAllParentOpened && this.collapsible.isOpened()) {
            fileButton.enableTabNavigation();
        } else {
            fileButton.disableTabNavigation();
        }

        const item = new FileFolderItem(codeBoxFile, fileButton);
        this.fileItems.set(name, item);

        this.sortItems();

        return item;
    }

    /**
     * Returns file item by name.
     * @param name Name of file.
     * @returns File item or null if file item wasn't found.
     */
    public getFile(name : string) : FileFolderItem | null {
        const fileItem = this.fileItems.get(name);
        if (!fileItem) return null;
        return fileItem;
    }

    /**
     * Returns file items in folder.
     * @param traverseSubfolders Determines whether file items in subfolders should also be included.
     * @returns File items.
     */
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

    /**
     * Removes file item.
     * @param name Name of file.
     * @returns Indicates whether file item was successfully found and removed.
     */
    public removeFile(name : string) : boolean {
        const fileItem = this.fileItems.get(name);
        if (!fileItem) return false;

        fileItem.fileButton.detach();

        this.fileItems.delete(name);
        return true;
    }

    /**
     * Returns number of file items (file items in subfolders are not included).
     * @returns Number of file items.
     */
    public getFilesCount() : number {
        return this.fileItems.size;
    }

    /**
     * Returns names of code view items in folder and subfolders. If code view item is located in subfolder, the final name can be for example "subfolder/filename.js" or "subfolder/anothersubfolder/filename.js".
     * @returns Code view names.
     */
    public getCodeViewNamesInFolderAndSubfolders() : string[] {
        const codeViewNames = new Array<string>();

        this.codeViewItems.forEach((_, name) => codeViewNames.push(name));

        this.subfolders.forEach((subfolder, subfolderName) => {
            for (let name of subfolder.getCodeViewNamesInFolderAndSubfolders()) {
                codeViewNames.push(subfolderName + "/" + name);
            }
        });

        return codeViewNames;
    }

    /**
     * Returns names of file items in folder and subfolders. If file item is located in subfolder, the final name can be for example "subfolder/filename.png" or "subfolder/anothersubfolder/filename.png".
     * @returns File names.
     */
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

    /**
     * Called by collapsible when it is toggled.
     */
    private onCollapsibleToggled() : void {
        this.updateTabNavigation(this.lastAllParentOpened);
    }

    /**
     * Sorts folder items alphabetically (first folders, then code view and file items).
     */
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