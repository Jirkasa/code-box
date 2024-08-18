import CodeBoxOptions from "../code-box/CodeBoxOptions";
import GlobalConfig from "../GlobalConfig";
import VirtualCodeBox from "../code-box/virtual-code-box/VirtualCodeBox";
import { createCodeBoxOptionsCopy } from "../utils/utils";
import CodeBoxCreator from "./CodeBoxCreator";

/** Manages the creation of virtual code boxes. */
class VirtualCodeBoxCreator extends CodeBoxCreator<VirtualCodeBox, CodeBoxOptions> {
    /** Stores created code boxes by id (code boxes with no id are not stored). */
    private createdCodeBoxesById = new Map<string, VirtualCodeBox>();

    /**
     * Creates new virtual code box creator.
     * @param defaultCodeBoxOptions Default code box options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeBoxOptions : CodeBoxOptions = {}) {
        super(defaultCodeBoxOptions);
    }

    public getCreatedCodeBoxById(id : string) : VirtualCodeBox | null {
        return this.createdCodeBoxesById.get(id) || null;
    }

    protected createCodeBox(element: HTMLElement, codeBoxOptions: CodeBoxOptions) : VirtualCodeBox | null {
        try {
            const codeBox = new VirtualCodeBox(element, codeBoxOptions);

            const id = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Id"];
            if (id !== undefined && !this.createdCodeBoxesById.has(id)) {
                this.createdCodeBoxesById.set(id, codeBox);
            }

            return codeBox;
        } catch(err) {
            console.error(err);
            return null;
        }
    }

    protected createCodeBoxOptionsCopy(codeBoxOptions: CodeBoxOptions) : CodeBoxOptions {
        return createCodeBoxOptionsCopy(codeBoxOptions);
    }
}

export default VirtualCodeBoxCreator;