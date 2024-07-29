import FileButton from "../FileButton";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";

class FileFolderItem {
    public readonly codeBoxFile : ProjectCodeBoxFile;
    public readonly fileButton : FileButton;

    constructor(codeBoxFile : ProjectCodeBoxFile, fileButton : FileButton) {
        this.codeBoxFile = codeBoxFile;
        this.fileButton = fileButton;
    }
}

export default FileFolderItem;