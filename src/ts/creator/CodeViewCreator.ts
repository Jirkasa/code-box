import CodeViewOptions from "../code-view/CodeViewOptions";
import GlobalConfig from "../GlobalConfig";
import { CodeView } from "../main";
import { createCodeViewOptionsCopy } from "../utils/utils";

/** Entry for a CodeView created by code view creator along with the dataset of its corresponding HTML pre element. */
export type CodeViewCreatorEntry = {
    /** Code view. */
    codeView : CodeView;
    /** Dataset of HTML pre element used to create the code view. */
    preElementDataset : DOMStringMap;
}

/** Manages the creation of code views. */
class CodeViewCreator {
    /** Created code views stored by pre element. */
    private createdCodeViews = new Map<HTMLPreElement, CodeView>();
    /** Stores created code views by id (code views with no id are not stored). */
    private createdCodeViewsById = new Map<string, CodeView>();
    /** Default code view options used, when no options are provided to the create method. */
    private defaultCodeViewOptions : CodeViewOptions;

    /**
     * Creates new code view creator.
     * @param defaultCodeViewOptions Default code view options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeViewOptions : CodeViewOptions = {}) {
        this.defaultCodeViewOptions = createCodeViewOptionsCopy(defaultCodeViewOptions);
    }

    /**
     * Creates code views based on the provided selector.
     * @param selector Selector used to find HTML pre elements to create code views from.
     * @param codeViewOptions The options to be used, when creating code views. Defaults to the internal default options (provided to constructor).
     * @returns Number of created code views.
     */
    public create(selector : string, codeViewOptions : CodeViewOptions = this.defaultCodeViewOptions) : number {
        const elements = document.querySelectorAll(selector);

        let createdCodeViewsCount = 0;
        elements.forEach(element => {
            if (!(element instanceof HTMLPreElement)) return;
            if (this.createdCodeViews.has(element)) return;

            try {
                const codeView = new CodeView(element, codeViewOptions);
                this.createdCodeViews.set(element, codeView);

                const id = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Id"];
                if (id !== undefined && !this.createdCodeViewsById.has(id)) {
                    this.createdCodeViewsById.set(id, codeView);
                }

                createdCodeViewsCount++;
            } catch(err) {
                console.error(err);
            }
        });

        return createdCodeViewsCount;
    }

    /**
     * Returns created code view by id.
     * @param id Id of created code view.
     * @returns Code view (or null if code view was not found).
     */
    public getCreatedCodeViewById(id : string) : CodeView | null {
        return this.createdCodeViewsById.get(id) || null;
    }

    /**
     * Returns all created code views along with the dataset of their corresponding HTML `<pre>` elements.
     * @returns An array of objects, each containing a created CodeView instance and the dataset of the HTML `<pre>` element.
     */
    public getCreatedCodeViews() : CodeViewCreatorEntry[] {
        const entries = new Array<CodeViewCreatorEntry>();

        this.createdCodeViews.forEach((codeView, element) => {
            entries.push({
                codeView: codeView,
                preElementDataset: element.dataset
            });
        });

        return entries;
    }

    /**
     * Returns the number of created code views.
     * @returns The number of created code views.
     */
    public getCreatedCodeViewsCount() : number {
        return this.createdCodeViews.size;
    }
}

export default CodeViewCreator;