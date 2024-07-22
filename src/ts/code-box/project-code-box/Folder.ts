import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import FileButton from "../FileButton";
import Collapsible from "./Collapsible";

/**
 * Tab indexy:
 * 
 * - ......
 */

class Folder {
    protected buttonElement : HTMLButtonElement;
    private itemsContainer : HTMLElement;
    private collapsible : Collapsible;

    private subfolders = new Map<string, Folder>();
    private codeViewButtons = new Map<string, CodeViewButton>();
    private fileButtons = new Map<string, FileButton>();

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
            
            this.codeViewButtons.forEach(codeViewButton => {
                codeViewButton.enableTabNavigation(this.itemsContainer);
            });
            this.fileButtons.forEach(fileButton => {
                fileButton.enableTabNavigation(this.itemsContainer);
            });
        } else {
            
            this.codeViewButtons.forEach(codeViewButton => {
                codeViewButton.disableTabNavigation(this.itemsContainer);
            });
            this.fileButtons.forEach(fileButton => {
                fileButton.disableTabNavigation(this.itemsContainer);
            });
        }

        this.subfolders.forEach(subfolder => {
            subfolder.updateTabNavigation(parentOpened && this.collapsible.isOpened());
        });

        this.lastParentOpened = parentOpened;
    }

    public addFolder(name : string, folder : Folder) : void {
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

    public addCodeViewButton(name : string, codeViewButton : CodeViewButton) : void {
        codeViewButton.appendTo(this.itemsContainer);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            codeViewButton.enableTabNavigation(this.itemsContainer);
        } else {
            codeViewButton.disableTabNavigation(this.itemsContainer);
        }
        this.codeViewButtons.set(name, codeViewButton);
    }

    public addFileButton(name : string, fileButton : FileButton) : void {
        fileButton.appendTo(this.itemsContainer);
        if (this.lastParentOpened && this.collapsible.isOpened()) {
            fileButton.enableTabNavigation(this.itemsContainer);
        } else {
            fileButton.disableTabNavigation(this.itemsContainer);
        }
        this.fileButtons.set(name, fileButton);
    }

    private onCollapsibleToggled() : void {
        this.updateTabNavigation(this.lastParentOpened);
    }
}

export default Folder;