import CodeBox from "./CodeBox";
import CodeBoxFileManager from "./CodeBoxFileManager";

class CodeBoxFile {
    private identifier : string;
    private downloadLink : string | null;
    private codeBox : CodeBox | null;

    constructor(identifier : string, downloadLink : string | null, codeBox : CodeBox, manager : CodeBoxFileManager) {
        this.identifier = identifier;
        this.downloadLink = downloadLink;
        this.codeBox = codeBox;

        manager.onDownloadLinkChange = newDownloadLink => this.onDownloadLinkChange(newDownloadLink);
        manager.onUnlinkCodeBox = () => this.onUnlinkCodeBox();
    }

    public getIdentifier() : string | null {
        if (!this.codeBox) return null;
        return this.identifier;
    }

    public changeIdentifier(newIdentifier : string) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeFileIdentifier(this.identifier, newIdentifier);
        // if (success) this.identifier = newIdentifier; // todo - toto není potřeba, ale ověřit to
        // return success;
    }

    // todo - možná reset

    public remove() : void {
        if (!this.codeBox) return;
        this.codeBox.removeFile(this.identifier);
    }

    public getDownloadLink() : string | null {
        return this.downloadLink;
    }

    public setDownloadLink(downloadLink : string | null) : void {
        if (!this.codeBox) return;
        this.codeBox.changeFileDownloadLink(this.identifier, downloadLink);
    }

    private onDownloadLinkChange(newDownloadLink : string | null) : void {
        this.downloadLink = newDownloadLink;
    }

    private onUnlinkCodeBox() : void {
        this.codeBox = null;
    }
}

export default CodeBoxFile;