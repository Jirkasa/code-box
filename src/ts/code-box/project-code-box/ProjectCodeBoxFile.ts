import CodeBoxFile from "../CodeBoxFile";
import ProjectCodeBox from "./ProjectCodeBox";

class ProjectCodeBoxFile extends CodeBoxFile<ProjectCodeBox> {
    public getFolderPath() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        return parsedFolderPath.join("/");
    }

    public moveToFolder(folderPath : string) : boolean { // todo - napsat, že pokud složka neexistuje, tak se vytvoří
        if (!this.codeBox) return false;

        const parsedFolderPath = folderPath.split("/");
        const fileName = this.getFileName();
        if (fileName === null) return false;
        parsedFolderPath.push(fileName);

        return this.codeBox.changeFileIdentifier(this.identifier, parsedFolderPath.join("/"));
    }

    public getFileName() : string | null {
        if (!this.codeBox) return null;

        const parsedFolderPath = this.identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined) return null;
        return fileName;
    }

    public changeFileName(newName : string) : boolean {
        if (!this.codeBox) return false;

        // remove all slashes
        newName = newName.replace(/\//g, '');

        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        parsedFolderPath.push(newName);

        return this.codeBox.changeFileIdentifier(this.identifier, parsedFolderPath.join("/"));
    }
    
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getFilePackage(this.identifier);
    }

    public changePackage(packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.codeBox) return false;
        return this.codeBox.changeFilePackage(this.identifier, packageName, keepFolderPath);
    }

    public removePackage() : void {
        if (!this.codeBox) return;
        this.codeBox.removeFilePackage(this.identifier);
    }
}

export default ProjectCodeBoxFile;