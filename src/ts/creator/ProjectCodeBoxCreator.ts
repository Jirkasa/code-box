import ProjectCodeBoxOptions from "../code-box/project-code-box/ProjectCodeBoxOptions";
import GlobalConfig from "../GlobalConfig";
import { ProjectCodeBox } from "../main";
import { createProjectCodeBoxOptionsCopy } from "../utils/utils";
import CodeBoxCreator, { AdditionalCodeBoxInfo } from "./CodeBoxCreator";

/** Manages the creation of project code boxes. */
class ProjectCodeBoxCreator extends CodeBoxCreator<ProjectCodeBox, ProjectCodeBoxOptions> {
    /** Stores created code boxes by id (code boxes with no id are not stored). */
    private createdCodeBoxesById = new Map<string, ProjectCodeBox>();

    /** Stores elements for which creation of code boxes were postponed for call of getAdditionallyCreatedCodeBoxes method. */
    private postponedCodeBoxElements : HTMLElement[] = [];

    /**
     * Creates new project code box creator.
     * @param defaultCodeBoxOptions Default code box options to be used, when no options are provided to the create method.
     */
    constructor(defaultCodeBoxOptions : ProjectCodeBoxOptions = {}) {
        super(defaultCodeBoxOptions);
    }

    public getCreatedCodeBoxById(id : string) : ProjectCodeBox | null {
        return this.createdCodeBoxesById.get(id) || null;
    }

    protected createCodeBox(element: HTMLElement, codeBoxOptions: ProjectCodeBoxOptions) : ProjectCodeBox | null {
        const parentCodeBoxId = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Extends"];

        let parentCodeBox : ProjectCodeBox | null = null;
        if (parentCodeBoxId !== undefined) {
            parentCodeBox = this.createdCodeBoxesById.get(parentCodeBoxId) || null;

            if (parentCodeBox === null) {
                this.postponedCodeBoxElements.push(element);
                return null;
            }
        }

        try {
            const codeBox = new ProjectCodeBox(element, codeBoxOptions, parentCodeBox);
    
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

    protected getAdditionallyCreatedCodeBoxes(codeBoxOptions : ProjectCodeBoxOptions) : AdditionalCodeBoxInfo<ProjectCodeBox>[] {
        const codeBoxInfos = new Array<AdditionalCodeBoxInfo<ProjectCodeBox>>();
        
        while (this.postponedCodeBoxElements.length > 0) {
            let resolvedCount = 0;

            for (let i = 0; i < this.postponedCodeBoxElements.length; i++) {
                const element = this.postponedCodeBoxElements[i];

                const parentCodeBoxId = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Extends"];
                if (parentCodeBoxId === undefined) {
                    this.postponedCodeBoxElements.splice(i, 1);
                    i--;
                    continue;
                }

                let parentCodeBox = this.createdCodeBoxesById.get(parentCodeBoxId);
                if (!parentCodeBox) continue;

                try {
                    const codeBox = new ProjectCodeBox(element, codeBoxOptions, parentCodeBox);
                    const id = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Id"];
                    if (id !== undefined && !this.createdCodeBoxesById.has(id)) {
                        this.createdCodeBoxesById.set(id, codeBox);
                    }
    
                    codeBoxInfos.push({
                        codeBox: codeBox,
                        rootElement: element
                    });
                } catch(err) {
                    console.error(err);
                }

                this.postponedCodeBoxElements.splice(i, 1);
                i--;
                resolvedCount++;
            }

            if (resolvedCount === 0) break;
        }

        this.postponedCodeBoxElements.splice(0, this.postponedCodeBoxElements.length);

        return codeBoxInfos;
    }

    protected createCodeBoxOptionsCopy(codeBoxOptions: ProjectCodeBoxOptions) : ProjectCodeBoxOptions {
        return createProjectCodeBoxOptionsCopy(codeBoxOptions);
    }
}

export default ProjectCodeBoxCreator;