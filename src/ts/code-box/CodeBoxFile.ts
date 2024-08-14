import CodeBox from "./CodeBox";
import CodeBoxFileManager from "./CodeBoxFileManager";

/** Represents file of code box. */
class CodeBoxFile<T extends CodeBox = CodeBox> {
    /** Identifier of file. */
    protected identifier : string;
    /** Download link or null if file is not downloadable. */
    protected downloadLink : string | null;
    /** Code box to which file belongs. */
    protected codeBox : T | null;

    /**
     * Creates new code box file.
     * @param identifier Identifier.
     * @param downloadLink Download link or null if file should not be downloadable.
     * @param codeBox Code box to which file belongs.
     * @param manager Manager of code box file.
     */
    constructor(identifier : string, downloadLink : string | null, codeBox : T, manager : CodeBoxFileManager) {
        this.identifier = identifier;
        this.downloadLink = downloadLink;
        this.codeBox = codeBox;

        manager.onIdentifierChange = newIdentifier => this.onIdentifierChange(newIdentifier);
        manager.onDownloadLinkChange = newDownloadLink => this.onDownloadLinkChange(newDownloadLink);
        manager.onUnlinkCodeBox = () => this.onUnlinkCodeBox();
    }

    /**
     * Returns identifier of file.
     * @returns Identifier.
     */
    public getIdentifier() : string | null {
        if (!this.codeBox) return null;
        return this.identifier;
    }

    /**
     * Changes identifier of file.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other file in code box, it should return false).
     */
    public changeIdentifier(newIdentifier : string) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeFileIdentifier(this.identifier, newIdentifier);
    }

    /**
     * Removes file from code box.
     */
    public remove() : void {
        if (!this.codeBox) return;
        this.codeBox.removeFile(this.identifier);
    }

    /**
     * Returns download link of file.
     * @returns Download link or null if file is not downloadable.
     */
    public getDownloadLink() : string | null {
        return this.downloadLink;
    }

    /**
     * Changes download link of file or sets 
     * @param downloadLink Download link (or null if file should not be downloadable).
     */
    public setDownloadLink(downloadLink : string | null) : void {
        if (!this.codeBox) return;
        this.codeBox.changeFileDownloadLink(this.identifier, downloadLink);
    }

    /**
     * Called by file manager when identifier should be changed.
     * @param newIdentifier New identifier.
     */
    private onIdentifierChange(newIdentifier : string) : void {
        this.identifier = newIdentifier;
    }

    /**
     * Called by file manager when download link should be changed.
     * @param newDownloadLink New download link or null.
     */
    private onDownloadLinkChange(newDownloadLink : string | null) : void {
        this.downloadLink = newDownloadLink;
    }

    /**
     * Called by file manager when file should be unlinked from code box.
     */
    private onUnlinkCodeBox() : void {
        this.codeBox = null;
    }
}

export default CodeBoxFile;