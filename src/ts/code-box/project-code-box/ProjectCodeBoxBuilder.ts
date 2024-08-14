import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeBoxBuilder from "../CodeBoxBuilder";

/** Builder of project code box. */
class ProjectCodeBoxBuilder implements CodeBoxBuilder {
    /** Panel element. */
    private panelElement : HTMLElement;
    /** Panel content container. */
    private panelContentElement : HTMLElement;
    /** Panel open/close button. */
    private panelOpenButton : HTMLButtonElement;
    /** Folder structure heading element. */
    private folderStructureHeadingElement : HTMLElement;
    /** Container for folder structure. */
    private folderStructureContainer : HTMLElement;
    /** Horizontal rule between folder structure and packages section. */
    private horizontalRule : HTMLElement;
    /** Packages heading element. */
    private packagesHeadingElement : HTMLElement;
    /** Container for packages. */
    private packagesContainer : HTMLElement;

    /**
     * Creates new project code box builder.
     * @param svgSpritePath Path to SVG sprite.
     * @param openButtonIconName Name of panel open/close button icon.
     */
    constructor(svgSpritePath : string | null = null, openButtonIconName : string | null = null) {
        // create panel
        this.panelElement = document.createElement("div");
        this.panelElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL);

        // create panel content container
        this.panelContentElement = document.createElement("div");
        this.panelContentElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_CONTENT);

        // create panel open/close button
        this.panelOpenButton = document.createElement("button");
        this.panelOpenButton.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON);

        // create panel open/close button icon
        const panelOpenButtonIcon = document.createElement("div");
        panelOpenButtonIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_ICON);
        if (svgSpritePath != null && openButtonIconName != null) {
            panelOpenButtonIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, openButtonIconName);
        }
        this.panelOpenButton.appendChild(panelOpenButtonIcon);

        // create folder structure heading
        this.folderStructureHeadingElement = document.createElement("div");
        this.folderStructureHeadingElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HEADING);

        // create container for folder structure
        this.folderStructureContainer = document.createElement("div");
        this.folderStructureContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_FOLDER_STRUCTURE_CONTAINER);

        // create horizontal rule between folder structure and packages section
        this.horizontalRule = document.createElement("hr");
        this.horizontalRule.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HORIZONTAL_RULE);

        // create packages heading
        this.packagesHeadingElement = document.createElement("div");
        this.packagesHeadingElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HEADING);

        // create container for packages
        this.packagesContainer = document.createElement("div");
        this.packagesContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_PACKAGES_CONTAINER);
    }

    /**
     * Returns panel element.
     * @returns Panel element.
     */
    public getPanelElement() : HTMLElement {
        return this.panelElement;
    }

    /**
     * Returns panel content container.
     * @returns Panel content container.
     */
    public getPanelContentElement() : HTMLElement {
        return this.panelContentElement;
    }

    /**
     * Returns folder structure heading element.
     * @returns Folder structure heading element.
     */
    public getFolderStructureHeadingElement() : HTMLElement {
        return this.folderStructureHeadingElement;
    }

    /**
     * Returns container for folder structure.
     * @returns Container for folder structure.
     */
    public getFolderStructureContainer() : HTMLElement {
        return this.folderStructureContainer;
    }

    /**
     * Returns horizontal rule between folder structure and packages section.
     * @returns Horizontal rule between folder structure and packages section.
     */
    public getHorizontalRule() : HTMLElement {
        return this.horizontalRule;
    }

    /**
     * Returns packages heading element.
     * @returns Packages heading element.
     */
    public getPackagesHeadingElement() : HTMLElement {
        return this.packagesHeadingElement;
    }

    /**
     * Returns container for packages.
     * @returns Container for packages.
     */
    public getPackagesContainer() : HTMLElement {
        return this.packagesContainer;
    }

    /**
     * Returns panel open/close button.
     * @returns Panel open/close button.
     */
    public getPanelOpenButtonElement() : HTMLButtonElement {
        return this.panelOpenButton;
    }

    public customizeRootElement(element: HTMLElement) : void {
        element.classList.add(CSSClasses.PROJECT_CODE_BOX);
    }

    public createCodeViewContainer() : HTMLElement {
        const codeViewContainer = document.createElement("div");
        codeViewContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_CODE_VIEW_CONTAINER);
        return codeViewContainer;
    }

    public getCodeViewContainerCSSHiddenClass() : string {
        return CSSClasses.PROJECT_CODE_BOX_CODE_VIEW_CONTAINER_HIDDEN_MODIFIER;
    }

    public createNoCodeViewSelectedElement(height: string, text: string) : HTMLElement {
        const container = document.createElement("div");
        container.classList.add(CSSClasses.PROJECT_CODE_BOX_NO_CODE_VIEW);
        container.style.height = height;

        const message = document.createElement("p");
        message.classList.add(CSSClasses.PROJECT_CODE_BOX_NO_CODE_VIEW_MESSAGE);
        message.innerText = text;
        container.appendChild(message);

        return container;
    }

    public getNoCodeViewCSSHiddenClass() : string {
        return CSSClasses.PROJECT_CODE_BOX_NO_CODE_VIEW_HIDDEN_MODIFIER;
    }

    public assembleElements(rootElement: HTMLElement, codeViewContainer: HTMLElement, noCodeViewSelectedElement: HTMLElement) : void {
        const panelContainer = document.createElement("div");
        panelContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_CONTAINER);
        panelContainer.appendChild(this.panelElement);

        this.panelElement.appendChild(this.panelOpenButton);

        this.panelElement.appendChild(this.panelContentElement);

        rootElement.appendChild(codeViewContainer);

        rootElement.appendChild(noCodeViewSelectedElement);
        
        rootElement.appendChild(panelContainer);

        this.panelContentElement.appendChild(this.folderStructureHeadingElement);
        this.panelContentElement.appendChild(this.folderStructureContainer);
        this.panelContentElement.appendChild(this.horizontalRule);
        this.panelContentElement.appendChild(this.packagesHeadingElement);
        this.panelContentElement.appendChild(this.packagesContainer);
    }
}

export default ProjectCodeBoxBuilder;