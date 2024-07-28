class CodeBoxFileManager {
    public onIdentifierChange : ((newIdentifier : string) => void) | null = null;
    public onDownloadLinkChange : ((newDownloadLink : string | null) => void) | null = null;
    public onUnlinkCodeBox : (() => void) | null = null;

    public changeIdentifier(newIdentifier : string) : void {
        if (!this.onIdentifierChange) return;
        this.onIdentifierChange(newIdentifier);
    }

    public changeDownloadLink(newDownloadLink : string | null) : void {
        if (!this.onDownloadLinkChange) return;
        this.onDownloadLinkChange(newDownloadLink);
    }

    public unlinkCodeBox() : void {
        if (!this.onUnlinkCodeBox) return;
        this.onUnlinkCodeBox();
    }
}

export default CodeBoxFileManager;