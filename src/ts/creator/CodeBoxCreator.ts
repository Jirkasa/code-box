import CodeBox from "../code-box/CodeBox";
import CodeBoxOptions from "../code-box/CodeBoxOptions";

/**
 * Entry for a CodeBox created by code box creator along with the dataset of its corresponding root element.
 * @template T The type of code box.
 */
export type CodeBoxCreatorEntry<T extends CodeBox> = {
    /** Code box. */
    codeBox: T;
    /** Dataset of the root element of the code box. */
    rootElementDataset : DOMStringMap;
}

/**
 * Data for a code box created additionally.
 * @template T The type of code box.
 */
export type AdditionalCodeBoxInfo<T extends CodeBox> = {
    /** Created code box. */
    codeBox : T;
    /** Root element of created code box. */
    rootElement : HTMLElement;
}

/**
 * Manages the creation of code boxes.
 * @template T The type of code box.
 * @template U The type of code box options.
*/
abstract class CodeBoxCreator<T extends CodeBox, U extends CodeBoxOptions> {
    /** Created code boxes stored by their root element. */
    private createdCodeBoxes = new Map<HTMLElement, T>;
    /** Default code box options used, when no options are provided to the created method. */
    private defaultCodeBoxOptions : U;

    /**
     * Creates new code box creator.
     * @param defaultCodeBoxOptions Default code box options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeBoxOptions : U) {
        this.defaultCodeBoxOptions = this.createCodeBoxOptionsCopy(defaultCodeBoxOptions);
    }

    /**
     * Creates code boxes based on the provided selector.
     * @param selector Selector used to find HTML elements to create code boxes from.
     * @param codeBoxOptions The options to be used, when creating code boxes. Defaults to the internal default options (provided to constructor).
     * @returns Number of created code boxes.
     */
    public create(selector : string, codeBoxOptions : U = this.defaultCodeBoxOptions) : number {
        const elements = document.querySelectorAll(selector);

        let createdCodeBoxesCount = 0;
        elements.forEach(element => {
            if (!(element instanceof HTMLElement)) return;
            if (this.createdCodeBoxes.has(element)) return;

            try {
                const codeBox = this.createCodeBox(element, codeBoxOptions);
                if (!codeBox) return;
                this.createdCodeBoxes.set(element, codeBox);
                createdCodeBoxesCount++;
            } catch(err) {
                console.error(err);
            }
        });

        for (let info of this.getAdditionallyCreatedCodeBoxes(codeBoxOptions)) {
            this.createdCodeBoxes.set(info.rootElement, info.codeBox);
            createdCodeBoxesCount++;
        }

        return createdCodeBoxesCount;
    }

    /**
     * Returns all created code boxes along with the dataset of their root elements.
     * @returns An array of objects, each containing a created code box and the dataset of its root element.
     */
    public getCreatedCodeBoxes() : CodeBoxCreatorEntry<T>[] {
        const entries = new Array<CodeBoxCreatorEntry<T>>();

        this.createdCodeBoxes.forEach((codeBox, element) => {
            entries.push({
                codeBox: codeBox,
                rootElementDataset: element.dataset
            });
        });

        return entries;
    }
    
    /**
     * Returns the number of created code boxes.
     * @returns The number of created code boxes.
     */
    public getCreatedCodeBoxesCount() : number {
        return this.createdCodeBoxes.size;
    }

    /**
     * Creates new code box.
     * @param element Element from which to create code box.
     * @param codeBoxOptions Options to use when creating code box.
     * @returns Created code box, or null if code box could not be created.
     */
    protected abstract createCodeBox(element : HTMLElement, codeBoxOptions : U) : T | null;

    /**
     * Returns additionally created code boxes. This method is called at the end of create method after createCodeBox method has been called for all elements obtained by the selector.
     * @param codeBoxOptions Options to be used when creating code boxes.
     * @returns Data for code boxes created additionally.
     */
    protected getAdditionallyCreatedCodeBoxes(codeBoxOptions : U) : AdditionalCodeBoxInfo<T>[] {
        return [];
    }

    /**
     * Returns copy of code box options.
     * @param codeBoxOptions Code box options.
     * @returns Copy of code box options.
     */
    protected abstract createCodeBoxOptionsCopy(codeBoxOptions : U) : U;
}

export default CodeBoxCreator;