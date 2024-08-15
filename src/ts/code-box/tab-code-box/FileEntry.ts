import CodeBoxFileManager from "../CodeBoxFileManager";
import FileButton from "../FileButton";
import TabCodeBoxFile from "./TabCodeBoxFile";

/** Used internally by TabCodeBox to store file. */
class FileEntry {
    /** Code box file. */
    public readonly codeBoxFile : TabCodeBoxFile;
    /** Code box file manager. */
    public readonly codeBoxFileManager : CodeBoxFileManager;
    /** File button. */
    public readonly fileButton : FileButton;
    /** Position of file button. */
    public position : number;

    /**
     * Creates new file entry.
     * @param codeBoxFile Code box file.
     * @param codeBoxFileManager Code box file manager.
     * @param fileButton File button.
     * @param position Position of file button.
     */
    constructor(codeBoxFile : TabCodeBoxFile, codeBoxFileManager : CodeBoxFileManager, fileButton : FileButton, position : number) {
        this.codeBoxFile = codeBoxFile;
        this.codeBoxFileManager = codeBoxFileManager;
        this.fileButton = fileButton;
        this.position = position;
    }
}

export default FileEntry;