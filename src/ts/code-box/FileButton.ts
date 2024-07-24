abstract class FileButton {
    public abstract setText(text : string) : void;

    public abstract setDownloadLink(downloadLink : string | null) : void;

    public abstract getDownloadLink() : string | null;

    public abstract appendTo(container : HTMLElement) : void;

    public abstract detach() : void;

    public abstract enableTabNavigation() : void;

    public abstract disableTabNavigation() : void;
}

export default FileButton;