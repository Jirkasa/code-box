import CodeBoxFileManager from "../CodeBoxFileManager";

/** Used internally by ProjectCodeBox to store file. */
class FileEntry {
    /** Code box file manager. */
    public readonly codeBoxFileManager : CodeBoxFileManager;

    /**
     * Creates new file entry.
     * @param codeBoxFileManager Code box file manager.
     */
    constructor(codeBoxFileManager : CodeBoxFileManager) {
        this.codeBoxFileManager = codeBoxFileManager;
    }
}

export default FileEntry;