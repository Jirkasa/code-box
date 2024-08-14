/** Represents file button. */
abstract class FileButton {
    /**
     * Appends button to element.
     * @param container Element to append button to.
     */
    public abstract appendTo(container : HTMLElement) : void;

    /**
     * Detaches button from its parent element.
     */
    public abstract detach() : void;

    /**
     * Sets text of button.
     * @param text Text.
     */
    public abstract setText(text : string) : void;

    /**
     * Sets download link.
     * @param downloadLink Download link (or null to disable download).
     */
    public abstract setDownloadLink(downloadLink : string | null) : void;

    /**
     * Returns download link of button.
     */
    public abstract getDownloadLink() : string | null;

    /**
     * Enables tab navigation.
     */
    public abstract enableTabNavigation() : void;

    /**
     * Disables tab navigation.
     */
    public abstract disableTabNavigation() : void;
}

export default FileButton;