import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import FileButton from "../FileButton";

class ProjectMultiElementFileButton extends FileButton {
    private buttonElements : HTMLAnchorElement[];
    private downloadIcons : HTMLElement[];
    private currentButtonElementIndex : number = 0;
    private text : string;
    private downloadLink : string | null;
    private svgSpritePath : string | null;
    private iconName : string | null;
    private downloadIconName : string | null;

    constructor(text : string, downloadLink : string | null = null, svgSpritePath : string | null = null, iconName : string | null = null, downloadIconName : string | null = null) {
        super();

        this.buttonElements = new Array<HTMLAnchorElement>();
        this.downloadIcons = new Array<HTMLElement>();
        this.text = text;
        this.downloadLink = downloadLink;
        this.svgSpritePath = svgSpritePath;
        this.iconName = iconName;
        this.downloadIconName = downloadIconName;
    }

    public appendTo(container: HTMLElement) : void {
        let buttonElement : HTMLAnchorElement | undefined = this.buttonElements[this.currentButtonElementIndex];

        if (!buttonElement) {
            buttonElement = this.createButtonElement();
            this.buttonElements.push(buttonElement);
        }

        container.appendChild(buttonElement);

        this.currentButtonElementIndex++;
    }

    public detach() : void {
        for (let buttonElement of this.buttonElements) {
            buttonElement.remove();
        }
        this.currentButtonElementIndex = 0;
    }

    public enableTabNavigation(parentElement : HTMLElement | null) : void {
        for (let buttonElement of this.buttonElements) {
            if (parentElement !== null && buttonElement.parentElement !== parentElement) continue;
            buttonElement.setAttribute("tabindex", "0");
        }
    }

    public disableTabNavigation(parentElement : HTMLElement | null) : void {
        for (let buttonElement of this.buttonElements) {
            if (parentElement !== null && buttonElement.parentElement !== parentElement) continue;
            buttonElement.setAttribute("tabindex", "-1");
        }
    }

    public setDownloadLink(downloadLink: string | null) : void {
        for (let i = 0; i < this.buttonElements.length; i++) {
            const buttonElement = this.buttonElements[i];
            const downloadIcon = this.downloadIcons[i];

            if (downloadLink !== null) {
                buttonElement.setAttribute("href", downloadLink);
                if (downloadIcon) {
                    buttonElement.appendChild(downloadIcon);
                }
            } else {
                buttonElement.removeAttribute("href");
                if (downloadIcon) {
                    downloadIcon.remove();
                }
            }
        }
    }

    private createButtonElement() : HTMLAnchorElement {
        const buttonElement = document.createElement("a");

        buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FILE_MODIFIER);
        buttonElement.setAttribute("download", "");
        if (this.downloadLink !== null) {
            buttonElement.setAttribute("href", this.downloadLink);
        }

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (this.svgSpritePath && this.iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(this.svgSpritePath, this.iconName);
        }
        buttonElement.appendChild(iconElement);

        const textElement = document.createElement("div");
        textElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        textElement.innerText = this.text;
        buttonElement.appendChild(textElement);

        if (this.svgSpritePath && this.downloadIconName) {
            const downloadIcon = document.createElement("div");
            downloadIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DOWNLOAD_ICON);
            downloadIcon.innerHTML = SVGIconElementCreator.create(this.svgSpritePath, this.downloadIconName);
            if (this.downloadLink !== null) {
                buttonElement.appendChild(downloadIcon);
            }
            this.downloadIcons.push(downloadIcon);
        }

        return buttonElement;
    }
}

export default ProjectMultiElementFileButton;