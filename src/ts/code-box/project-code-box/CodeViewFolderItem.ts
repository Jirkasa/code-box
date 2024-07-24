import { CodeView } from "../../main";
import CodeViewButton from "../CodeViewButton";

class CodeViewFolderItem {
    public readonly codeView : CodeView; // todo - nevím jestli readonly
    public readonly codeViewButton : CodeViewButton;

    constructor(codeView : CodeView, codeViewButton : CodeViewButton) {
        this.codeView = codeView;
        this.codeViewButton = codeViewButton;
    }
}

export default CodeViewFolderItem;