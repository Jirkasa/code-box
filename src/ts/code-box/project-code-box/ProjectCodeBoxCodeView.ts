import { ProjectCodeBox } from "../../main";
import CodeBoxCodeView from "../CodeBoxCodeView";

class ProjectCodeBoxCodeView extends CodeBoxCodeView<ProjectCodeBox> {
    public getPackage() : string | null | undefined {
        if (!this.codeBox) return undefined;
        return this.codeBox.getCodeViewPackage(this.identifier);
    }
}

export default ProjectCodeBoxCodeView;