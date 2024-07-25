class CodeBoxFileManager {
    public onDownloadLinkChange : ((newDownloadLink : string | null) => void) | null = null;
    public onUnlinkCodeBox : (() => void) | null = null;

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