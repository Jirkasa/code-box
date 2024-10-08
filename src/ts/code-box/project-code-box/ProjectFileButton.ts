import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import ElementFileButton from "../ElementFileButton";

/** Represents file button for project code box. */
class ProjectFileButton extends ElementFileButton {
    /** Download icon of button. */
    private downloadIcon : HTMLElement | null = null;
    /** Text element of button. */
    private textElement : HTMLElement;

    /**
     * Creates new file button.
     * @param text Text of button.
     * @param downloadLink Download link (or null to disable download).
     * @param svgSpritePath Path to SVG sprite.
     * @param iconName Name of icon for button.
     * @param downloadIconName Name of download icon for button.
     */
    constructor(text : string, downloadLink : string | null = null, svgSpritePath : string | null = null, iconName : string | null = null, downloadIconName : string | null = null) {
        super(downloadLink);

        this.buttonElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM, CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_FILE_MODIFIER);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        this.textElement = document.createElement("div");
        this.textElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_TEXT);
        this.textElement.innerText = text;
        this.buttonElement.appendChild(this.textElement);

        if (svgSpritePath && downloadIconName) {
            this.downloadIcon = document.createElement("div");
            this.downloadIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_ITEM_DOWNLOAD_ICON);
            this.downloadIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, downloadIconName);
            if (downloadLink !== null) {
                this.buttonElement.appendChild(this.downloadIcon);
            }
        }
    }

    public setText(text: string) : void {
        this.textElement.innerText = text;
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