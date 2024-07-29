import CodeBoxFile from "../CodeBoxFile";
import ProjectCodeBox from "./ProjectCodeBox";

class ProjectCodeBoxFile extends CodeBoxFile<ProjectCodeBox> {
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getFilePackage(this.identifier);
    }
}

export default ProjectCodeBoxFile;