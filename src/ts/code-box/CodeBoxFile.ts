import CodeBox from "./CodeBox";
import FileButton from "./FileButton";

class CodeBoxFile {
    private identifier : string;
    private fileButton : FileButton;
    private codeBox : CodeBox;

    constructor(identifier : string, fileButton : FileButton, codeBox : CodeBox) { // todo - pokud se potom bude mění fileButton, tak na to sem budu předávat metodu, pomocí které se to bude dát udělat
        this.identifier = identifier;
        this.fileButton = fileButton;
        this.codeBox = codeBox;
    }

    public getIdentifier() : string {
        return this.identifier;
    }

    public changeIdentifier(newIdentifier : string) : boolean {
        const success = this.codeBox.changeFileIdentifier(this.identifier, newIdentifier);
        if (success) this.identifier = newIdentifier;
        return success;
    }

    // todo - možná reset

    public remove() : void {
        this.codeBox.removeFile(this.identifier);
    }

    public getDownloadLink() : string | null {
        return this.fileButton.getDownloadLink();
    }

    public setDownloadLink(downloadLink : string | null) : void {
        this.fileButton.setDownloadLink(downloadLink);
    }
}

export default CodeBoxFile;