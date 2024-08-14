import CodeBoxFile from "../CodeBoxFile";
import ProjectCodeBox from "./ProjectCodeBox";

/** Represents file of project code box. */
class ProjectCodeBoxFile extends CodeBoxFile<ProjectCodeBox> {
    /**
     * Returns path to folder in which the file is located.
     * @returns Path to folder in which the file is located.
     */
    public getFolderPath() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        return parsedFolderPath.join("/");
    }

    /**
     * Moves file to folder (if folder does not exist, it is created; package is not changed).
     * @param folderPath Path to folder.
     * @returns Indicates whether file has been successfully moved to folder (it can return false if there already is file with the same name).
     */
    public moveToFolder(folderPath : string) : boolean {
        if (!this.codeBox) return false;

        const parsedFolderPath = folderPath.split("/");
        const fileName = this.getFileName();
        if (fileName === null) return false;
        parsedFolderPath.push(fileName);

        return this.codeBox.changeFileIdentifier(this.identifier, parsedFolderPath.join("/"));
    }

    /**
     * Returns name of file.
     * @returns File name.
     */
    public getFileName() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined) return null;
        return fileName;
    }

    /**
     * Changes name of file.
     * @param newName New file name.
     * @returns Indicates whether name of file has been successfully changed (it can return false if there already is file with the same name in the same folder).
     */
    public changeFileName(newName : string) : boolean {
        if (!this.codeBox) return false;

        // remove all slashes
        newName = newName.replace(/\//g, '');

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        parsedFolderPath.push(newName);

        return this.codeBox.changeFileIdentifier(this.identifier, parsedFolderPath.join("/"));
    }
    
    /**
     * Returns package of file.
     * @returns Package of file. If null is returned, file belongs to default package. If undefined is returned, file doesn't belong to any package.
     */
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getFilePackage(this.identifier);
    }

    /**
     * Changes package of file.
     * @param packageName Package name (null for default package). If package does not exist, it is created.
     * @param keepFolderPath Determines whether file should stay in the same folder (if false, file can be moved to different folder based on package).
     * @returns Indicates whether change has been successfully completed.
     */
    public changePackage(packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeFilePackage(this.identifier, packageName, keepFolderPath);
    }

    /**
     * Removes file from package.
     * @returns Indicates whether file has been successfully removed from package.
     */
    public removePackage() : void {
        if (!this.codeBox) return;
        this.codeBox.removeFilePackage(this.identifier);
    }
}

export default ProjectCodeBoxFile;