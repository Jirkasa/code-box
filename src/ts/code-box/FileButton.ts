abstract class FileButton {
    public abstract setDownloadLink(downloadLink : string | null) : void;

    public abstract appendTo(container : HTMLElement) : void;

    public abstract detach() : void;
}

export default FileButton;