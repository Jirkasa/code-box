import CodeBoxFileManager from "../CodeBoxFileManager";

class FileEntry {
    public readonly codeBoxFileManager : CodeBoxFileManager;

    constructor(codeBoxFileManager : CodeBoxFileManager) {
        this.codeBoxFileManager = codeBoxFileManager;
    }
}

export default FileEntry;