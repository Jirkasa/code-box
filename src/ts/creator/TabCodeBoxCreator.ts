import TabCodeBoxOptions from "../code-box/tab-code-box/TabCodeBoxOptions";
import GlobalConfig from "../GlobalConfig";
import { TabCodeBox } from "../main";
import { createTabCodeBoxOptionsCopy } from "../utils/utils";
import CodeBoxCreator from "./CodeBoxCreator";

/** Manages the creation of tab code boxes. */
class TabCodeBoxCreator extends CodeBoxCreator<TabCodeBox, TabCodeBoxOptions> {
    /** Stores created code boxes by id (code boxes with no id are not stored). */
    private createdCodeBoxesById = new Map<string, TabCodeBox>();

    /**
     * Creates new tab code box creator.
     * @param defaultCodeBoxOptions Default code box options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeBoxOptions : TabCodeBoxOptions = {}) {
        super(defaultCodeBoxOptions);
    }

    public getCreatedCodeBoxById(id : string) : TabCodeBox | null {
        return this.createdCodeBoxesById.get(id) || null;
    }

    protected createCodeBox(element: HTMLElement, codeBoxOptions: TabCodeBoxOptions) : TabCodeBox | null {
        try {
            const codeBox = new TabCodeBox(element, codeBoxOptions);

            const id = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Id"];
            if (id !== undefined && !this.createdCodeBoxesById.has(id)) {
                this.createdCodeBoxesById.set(id, codeBox);
            }

            return codeBox;
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