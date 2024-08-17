import CodeBoxFile from "../CodeBoxFile";
import CodeBoxFileManager from "../CodeBoxFileManager";

/** Used internally by VirtualCodeBox to store file. */
class FileEntry {
    /** Code box file. */
    public readonly codeBoxFile : CodeBoxFile;
    /** Code box file manager. */
    public readonly codeBoxFileManager : CodeBoxFileManager;

    /**
     * Creates new file entry.
     * @param codeBoxFile Code box file.
     * @param codeBoxFileManager Code box file manager.
     */
    constructor(codeBoxFile : CodeBoxFile, codeBoxFileManager : CodeBoxFileManager) {
        this.codeBoxFile = codeBoxFile;
        this.codeBoxFileManager = codeBoxFileManager;
    }
}

export default FileEntry;