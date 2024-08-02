import { CodeView } from "../../main";
import CodeViewButton from "../CodeViewButton";

/** Represents code view folder item. */
class CodeViewFolderItem {
    /** Code view. */
    public readonly codeView : CodeView;
    /** Code view button. */
    public readonly codeViewButton : CodeViewButton;

    /**
     * Creates new code view folder item.
     * @param codeView Code view.
     * @param codeViewButton Code view button.
     */
    constructor(codeView : CodeView, codeViewButton : CodeViewButton) {
        this.codeView = codeView;
        this.codeViewButton = codeViewButton;
    }
}

export default CodeViewFolderItem;