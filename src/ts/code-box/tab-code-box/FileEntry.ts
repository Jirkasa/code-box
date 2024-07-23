import CodeBoxFile from "../CodeBoxFile";
import FileButton from "../FileButton";

class FileEntry { // todo - možná tady ty věci nebudou readonly - používá to jen TabCodeBox a ten to může chtít změnit
    public readonly codeBoxFile;
    public readonly fileButton;

    constructor(codeBoxFile : CodeBoxFile, fileButton : FileButton) {
        this.codeBoxFile = codeBoxFile;
        this.fileButton = fileButton;
    }
}

export default FileEntry;