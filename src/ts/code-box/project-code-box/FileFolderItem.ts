import FileButton from "../FileButton";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";

/** Represents file folder item. */
class FileFolderItem {
    /** Code box file. */
    public readonly codeBoxFile : ProjectCodeBoxFile;
    /** File button. */
    public readonly fileButton : FileButton;

    /**
     * Creates new file folder item.
     * @param codeBoxFile Code box file.
     * @param fileButton File button.
     */
    constructor(codeBoxFile : ProjectCodeBoxFile, fileButton : FileButton) {
        this.codeBoxFile = codeBoxFile;
        this.fileButton = fileButton;
    }
}

export default FileFolderItem;