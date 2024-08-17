import TabCodeBoxOptions from "../code-box/tab-code-box/TabCodeBoxOptions";
import { TabCodeBox } from "../main";
import { createTabCodeBoxOptionsCopy } from "../utils/utils";
import CodeBoxCreator from "./CodeBoxCreator";

/** Manages the creation of tab code boxes. */
class TabCodeBoxCreator extends CodeBoxCreator<TabCodeBox, TabCodeBoxOptions> {
    /**
     * Creates new tab code box creator.
     * @param defaultCodeBoxOptions Default code box options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeBoxOptions : TabCodeBoxOptions = {}) {
        super(defaultCodeBoxOptions);
    }

    protected createCodeBox(element: HTMLElement, codeBoxOptions: TabCodeBoxOptions) : TabCodeBox | null {
        try {
            return new TabCodeBox(element, codeBoxOptions);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    protected createCodeBoxOptionsCopy(codeBoxOptions: TabCodeBoxOptions) : TabCodeBoxOptions {
        return createTabCodeBoxOptionsCopy(codeBoxOptions);
    }
}

export default TabCodeBoxCreator;