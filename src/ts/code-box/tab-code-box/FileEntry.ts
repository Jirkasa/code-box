import CodeBoxFile from "../CodeBoxFile";
import CodeBoxFileManager from "../CodeBoxFileManager";
import FileButton from "../FileButton";

class FileEntry { // todo - možná tady ty věci nebudou readonly - používá to jen TabCodeBox a ten to může chtít změnit
    public readonly codeBoxFile;
    public readonly codeBoxFileManager : CodeBoxFileManager;
    public readonly fileButton;

    constructor(codeBoxFile : CodeBoxFile, codeBoxFileManager : CodeBoxFileManager, fileButton : FileButton) {
        this.codeBoxFile = codeBoxFile;
        this.codeBoxFileManager = codeBoxFileManager;
        this.fileButton = fileButton;
    }
}

export default FileEntry;