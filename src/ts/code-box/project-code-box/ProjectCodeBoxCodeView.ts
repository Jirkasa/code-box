import ProjectCodeBox from "../../code-box/project-code-box/ProjectCodeBox";
import CodeBoxCodeView from "../CodeBoxCodeView";

/** Represents code view of project code box. */
class ProjectCodeBoxCodeView extends CodeBoxCodeView<ProjectCodeBox> {
    /**
     * Returns path to folder in which the code view is located.
     * @returns Path to folder in which the code view is located.
     */
    public getFolderPath() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        return parsedFolderPath.join("/");
    }

    /**
     * Moves code view to folder (if folder does not exist, it is created; package is not changed).
     * @param folderPath Path to folder.
     * @returns Indicates whether code view has been successfully moved to folder (it can return false if there already is code view with the same name).
     */
    public moveToFolder(folderPath : string) : boolean {
        if (!this.codeBox) return false;

        const parsedFolderPath = folderPath.split("/");
        const fileName = this.getFileName();
        if (fileName === null) return false;
        parsedFolderPath.push(fileName);

        return this.codeBox.changeCodeViewIdentifier(this.identifier, parsedFolderPath.join("/"));
    }

    /**
     * Returns file name of code view.
     * @returns File name of code view.
     */
    public getFileName() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined) return null;
        return fileName;
    }

    /**
     * Changes file name of code view.
     * @param newName New file name.
     * @returns Indicates whether file name of code view has been successfuly changed (it can return false if there already is code view with the same name in the same folder).
     */
    public changeFileName(newName : string) : boolean {
        if (!this.codeBox) return false;

        // remove all slashes
        newName = newName.replace(/\//g, '');

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        parsedFolderPath.push(newName);
        
        return this.codeBox.changeCodeViewIdentifier(this.identifier, parsedFolderPath.join("/"));
    }

    /**
     * Returns package of code view.
     * @returns Package of code view. If null is returned, code view belongs to default package. If undefined is returned, code view doesn't belong to any package.
     */
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getCodeViewPackage(this.identifier);
    }

    /**
     * Changes package of code view.
     * @param packageName Package name (null for default package). If package does not exist, it is created.
     * @param keepFolderPath  Determines whether code view should stay in the same folder (if false, code view can be moved to different folder based on package).
     * @returns Indicates whether change has been successfully completed.
     */
    public changePackage(packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeCodeViewPackage(this.identifier, packageName, keepFolderPath);
    }

    /**
     * Removes code view from package.
     * @returns Indicates whether code view has been successfully removed from package.
     */
    public removePackage() : void {
        if (!this.codeBox) return;
        this.codeBox.removeCodeViewPackage(this.identifier);
    }
}

export default ProjectCodeBoxCodeView;