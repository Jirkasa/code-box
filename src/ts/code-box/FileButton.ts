abstract class FileButton {
    public abstract setDownloadLink(downloadLink : string | null) : void;

    public abstract getDownloadLink() : string | null;

    public abstract appendTo(container : HTMLElement) : void;

    public abstract detach() : void;

    public abstract enableTabNavigation(parentElement : HTMLElement | null) : void;

    public abstract disableTabNavigation(parentElement : HTMLElement | null) : void;
}

export default FileButton;