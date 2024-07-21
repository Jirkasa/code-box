import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import ElementFileButton from "../ElementFileButton";

class ProjectFileButton extends ElementFileButton {
    private downloadIcon : HTMLElement | null = null;

    constructor(text : string, downloadLink : string | null = null, svgSpritePath : string | null = null, iconName : string | null = null, downloadIconName : string | null = null) {
        super(downloadLink);

        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FILE_MODIFIER);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        const textElement = document.createElement("div");
        textElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        textElement.innerText = text;
        this.buttonElement.appendChild(textElement);

        if (svgSpritePath && downloadIconName) {
            this.downloadIcon = document.createElement("div");
            this.downloadIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DOWNLOAD_ICON);
            this.downloadIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, downloadIconName);
            if (downloadLink !== null) {
                this.buttonElement.appendChild(this.downloadIcon);
            }
        }
    }

    public setDownloadLink(downloadLink: string | null): void {
        super.setDownloadLink(downloadLink);

        if (this.downloadIcon) {
            if (downloadLink !== null) {
                this.buttonElement.appendChild(this.downloadIcon);
            } else {
                this.downloadIcon.remove();
            }
        }
    }
}

export default ProjectFileButton;