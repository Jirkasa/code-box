import CodeBoxFile from "../CodeBoxFile";
import ProjectCodeBox from "./ProjectCodeBox";

class ProjectCodeBoxFile extends CodeBoxFile<ProjectCodeBox> {
    public getFolderPath() : string | null {
        const parsedFolderPath = this.identifier.split("/");
        parsedFolderPath.pop();
        return parsedFolderPath.join("/");
    }

    public getFileName() : string | null {
        const parsedFolderPath = this.identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined) return null;
        return fileName;
    }
    
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getFilePackage(this.identifier);
    }
}

export default ProjectCodeBoxFile;