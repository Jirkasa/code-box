import CodeBoxFile from "../CodeBoxFile";
import FileButton from "../FileButton";

class FileFolderItem {
    public readonly codeBoxFile : CodeBoxFile;
    public readonly fileButton : FileButton;

    constructor(codeBoxFile : CodeBoxFile, fileButton : FileButton) {
        this.codeBoxFile = codeBoxFile;
        this.fileButton = fileButton;
    }
}

export default FileFolderItem;