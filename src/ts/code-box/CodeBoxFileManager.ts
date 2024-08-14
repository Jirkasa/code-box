/** Manager of code box file. */
class CodeBoxFileManager {
    /** Function, called when file identifier should be changed. */
    public onIdentifierChange : ((newIdentifier : string) => void) | null = null;
    /** Function, called when file download link should be changed. */
    public onDownloadLinkChange : ((newDownloadLink : string | null) => void) | null = null;
    /** Function, called when file should be unlinked from code box. */
    public onUnlinkCodeBox : (() => void) | null = null;

    /**
     * Changes identifier of file.
     * @param newIdentifier New identifier.
     */
    public changeIdentifier(newIdentifier : string) : void {
        if (!this.onIdentifierChange) return;
        this.onIdentifierChange(newIdentifier);
    }

    /**
     * Changes download link of file (or sets file as non-downloadable if null is passed).
     * @param newDownloadLink New download link.
     */
    public changeDownloadLink(newDownloadLink : string | null) : void {
        if (!this.onDownloadLinkChange) return;
        this.onDownloadLinkChange(newDownloadLink);
    }

    /**
     * Unlinks file from code box.
     */
    public unlinkCodeBox() : void {
        if (!this.onUnlinkCodeBox) return;
        this.onUnlinkCodeBox();
    }
}

export default CodeBoxFileManager;