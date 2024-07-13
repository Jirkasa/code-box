import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import ElementFileButton from "../ElementFileButton";

class TabFileButton extends ElementFileButton {
    private downloadIcon : HTMLElement | null = null;

    constructor(text : string, downloadLink : string | null = null, svgSpritePath : string | null = null, iconName : string | null = null, downloadIconName : string | null = null) {
        super(downloadLink);

        this.buttonElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB);

        const iconElement = document.createElement("div");
        iconElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_ICON);
        if (svgSpritePath && iconName) {
            iconElement.innerHTML = SVGIconElementCreator.create(svgSpritePath, iconName);
        }
        this.buttonElement.appendChild(iconElement);

        const textElement = document.createElement("div");
        textElement.innerText = text;
        textElement.classList.add(CSSClasses.TAB_CODE_BOX_TAB_TEXT);
        this.buttonElement.appendChild(textElement);

        if (svgSpritePath && downloadIconName) {
            this.downloadIcon = document.createElement("div");
            this.downloadIcon.classList.add(CSSClasses.TAB_CODE_BOX_TAB_DOWNLOAD_ICON);
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

export default TabFileButton;