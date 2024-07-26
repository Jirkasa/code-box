import CSSClasses from "../../CSSClasses";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeBoxFile from "../CodeBoxFile";
import CodeViewButton from "../CodeViewButton";
import FileButton from "../FileButton";
import CodeViewFolderItem from "./CodeViewFolderItem";
import Collapsible from "./Collapsible";
import FileFolderItem from "./FileFolderItem";
import ProjectCodeViewButton from "./ProjectCodeViewButton";
import ProjectFileButton from "./ProjectFileButton";

// ještě zbývají ty aria atributy, ale o tom se budu muset dozvědět více info

class Folder {
    protected buttonElement : HTMLButtonElement;
    private itemsContainer : HTMLElement;
    private collapsible : Collapsible;

    private subfolders = new Map<string, Folder>();
    private codeViewItems = new Map<string, CodeViewFolderItem>();
    private fileItems = new Map<string, FileFolderItem>();
    // private codeViewButtons = new Map<string, CodeViewButton>();
    // private fileButtons = new Map<string, FileButton>();

    private lastParentOpened : boolean = false; // todo - a tady to taky okomentovat - není to přímo jakoby parent

    //private opened : boolean = false;

    // todo - budu muset předávat, zda je parent otevřený - a budu si muset držet takovou proměnnou
    constructor(name : string, openCloseAnimationSpeed : number, openCloseAnimationEasingFunction : string, svgSpritePath : string | null = null, arrowIconName : string | null = null, folderIconName : string | null = null, cssModifierClass : string | null = null, parentElement : HTMLElement | null = null) {
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

        const buttonText = document.createElement("div");
        buttonText.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        buttonText.innerText = name;
        this.buttonElement.appendChild(buttonText);

        this.itemsContainer = document.createElement("div");
        this.itemsContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_COLLAPSIBLE);

        if (parentElement) {
            parentElement.appendChild(this.buttonElement);
            parentElement.appendChild(this.itemsContainer);
        }

        this.collapsible = new Collapsible(this.buttonElement, this.itemsContainer, openCloseAnimationSpeed, openCloseAnimationEasingFunction, () => this.onCollapsibleToggled());
        this.updateTabNavigation();
    }

    // pokud se volá open/close metoda, tak je tato metoda volána automaticky (open a close metodu zatím nemám)
    public updateTabNavigation(parentOpened : boolean = false) : void { // parentOpened není tak úplně parent opened (přejmenovat to - ale na co? - spíš přidám komentář)
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
        this.itemsContainer.appendChild(folder.buttonElement);
        this.itemsContainer.appendChild(folder.itemsContainer);

        folder.updateTabNavigation(this.lastParentOpened && this.collapsible.isOpened());
    }

    public getFolder(folderName : string) : Folder | null {
        const folder = this.subfolders.get(folderName);
        if (!folder) return null;
        return folder;
    }

    public addCodeView(name : string, codeView : CodeView, showCodeViewEventSource : EventSourcePoint<CodeViewButton, CodeView>, svgSpritePath : string | null = null, buttonIconName : string | null = null) : CodeViewFolderItem | null { // null to vrací, když už tam code view pod tímto názvem existuje
        if (this.codeViewItems.has(name)) return null;

        const codeViewButton = new ProjectCodeViewButton(name, showCodeViewEventSource, codeView, svgSpritePath, buttonIconName);
        codeViewButton.appendTo(this.itemsContainer);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            codeViewButton.enableTabNavigation();
        } else {
            codeViewButton.disableTabNavigation();
        }
        
        const item = new CodeViewFolderItem(codeView, codeViewButton);
        this.codeViewItems.set(name, item);
        return item;
    }

    public getCodeView(name : string) : CodeViewFolderItem | null {
        const codeViewItem = this.codeViewItems.get(name);
        if (!codeViewItem) return null;
        return codeViewItem;
    }

    public addFile(name : string, codeBoxFile : CodeBoxFile, svgSpritePath : string | null = null, buttonIconName : string | null = null, buttonDownloadIconName : string | null = null) : FileFolderItem | null {
        if (this.fileItems.has(name)) return null;

        const fileButton = new ProjectFileButton(name, codeBoxFile.getDownloadLink(), svgSpritePath, buttonIconName, buttonDownloadIconName);
        fileButton.appendTo(this.itemsContainer);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            fileButton.enableTabNavigation();
        } else {
            fileButton.disableTabNavigation();
        }

        const item = new FileFolderItem(codeBoxFile, fileButton);
        this.fileItems.set(name, item);
        return item;
    }

    public getFile(name : string) : FileFolderItem | null {
        const fileItem = this.fileItems.get(name);
        if (!fileItem) return null;
        return fileItem;
    }

    private onCollapsibleToggled() : void {
        this.updateTabNavigation(this.lastParentOpened);
    }
}

export default Folder;