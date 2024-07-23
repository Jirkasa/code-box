import FileButton from "./FileButton";

abstract class ElementFileButton extends FileButton {
    protected buttonElement : HTMLAnchorElement;

    constructor(downloadLink : string | null = null) {
        super();

        this.buttonElement = document.createElement("a");

        this.buttonElement.setAttribute("download", "");

        this.setDownloadLink(downloadLink);
    }

    public setDownloadLink(downloadLink: string | null) : void {
        if (downloadLink !== null) {
            this.buttonElement.setAttribute("href", downloadLink);
        } else {
            this.buttonElement.removeAttribute("href");
        }
    }

    public getDownloadLink() : string | null {
        return this.buttonElement.getAttribute("href");
    }

    public appendTo(container : HTMLElement) : void {
        container.appendChild(this.buttonElement);
    }

    public detach() : void {
        this.buttonElement.remove();
    }

    public enableTabNavigation() : void {
        this.buttonElement.setAttribute("tabindex", "0");
    }

    public disableTabNavigation() : void {
        this.buttonElement.setAttribute("tabindex", "-1");
    }
}

export default ElementFileButton;