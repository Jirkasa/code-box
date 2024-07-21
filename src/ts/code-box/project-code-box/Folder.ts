import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeViewButton from "../CodeViewButton";
import FileButton from "../FileButton";

class Folder {
    protected buttonElement : HTMLButtonElement;
    private itemsContainer : HTMLElement;

    private subfolders = new Map<string, Folder>();
    private codeViewButtons = new Map<string, CodeViewButton>();
    private fileButtons = new Map<string, FileButton>();

    constructor(name : string, svgSpritePath : string | null = null, arrowIconName : string | null = null, folderIconName : string | null = null, cssModifierClass : string | null = null, parentElement : HTMLElement | null = null) {
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
    }

    /*public appendTo(parent : HTMLElement | Folder) : void {
        if (parent instanceof HTMLElement) {
            parent.appendChild(this.buttonElement);
            parent.appendChild(this.itemsContainer);
        } else {
            parent.itemsContainer.appendChild(this.buttonElement);
            parent.itemsContainer.appendChild(this.itemsContainer);
        }
    }

    public detach() : void {
        this.buttonElement.remove();
        this.itemsContainer.remove();
    }*/

    public addFolder(name : string, folder : Folder) {
        this.subfolders.set(name, folder);
        this.itemsContainer.appendChild(folder.buttonElement);
        this.itemsContainer.appendChild(folder.itemsContainer);
    }

    public getFolder(folderName : string) : Folder | null {
        const folder = this.subfolders.get(folderName);
        if (!folder) return null;
        return folder;
    }

    public addCodeViewButton(codeViewButton : CodeViewButton) {
        codeViewButton.appendTo(this.itemsContainer);
    }

    public addFileButton(fileButton : FileButton) {
        fileButton.appendTo(this.itemsContainer);
    }
}

export default Folder;