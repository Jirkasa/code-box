import CodeBoxFileManager from "../CodeBoxFileManager";
import FileButton from "../FileButton";
import TabCodeBoxFile from "./TabCodeBoxFile";

class FileEntry { // todo - možná tady ty věci nebudou readonly - používá to jen TabCodeBox a ten to může chtít změnit
    public readonly codeBoxFile : TabCodeBoxFile;
    public readonly codeBoxFileManager : CodeBoxFileManager;
    public readonly fileButton : FileButton;
    public position : number;

    constructor(codeBoxFile : TabCodeBoxFile, codeBoxFileManager : CodeBoxFileManager, fileButton : FileButton, position : number) {
        this.codeBoxFile = codeBoxFile;
        this.codeBoxFileManager = codeBoxFileManager;
        this.fileButton = fileButton;
        this.position = position;
    }
}

export default FileEntry;