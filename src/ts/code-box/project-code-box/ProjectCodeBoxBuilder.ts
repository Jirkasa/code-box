import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeBoxBuilder from "../CodeBoxBuilder";

class ProjectCodeBoxBuilder implements CodeBoxBuilder {
    private panelElement : HTMLElement;
    private panelContentElement : HTMLElement;
    private panelOpenButton : HTMLButtonElement;
    private folderStructureHeadingElement : HTMLElement;
    private folderStructureContainer : HTMLElement;
    private horizontalRule : HTMLElement;
    private packagesHeadingElement : HTMLElement;
    private packagesContainer : HTMLElement;

    constructor(svgSpritePath : string | null = null, openButtonIconName : string | null = null) {
        this.panelElement = document.createElement("div");
        this.panelElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL);

        this.panelContentElement = document.createElement("div");
        this.panelContentElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_CONTENT);

        this.panelOpenButton = document.createElement("button");
        this.panelOpenButton.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON);

        const panelOpenButtonIcon = document.createElement("div");
        panelOpenButtonIcon.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_OPEN_BUTTON_ICON);
        if (svgSpritePath != null && openButtonIconName != null) {
            panelOpenButtonIcon.innerHTML = SVGIconElementCreator.create(svgSpritePath, openButtonIconName);
        }
        this.panelOpenButton.appendChild(panelOpenButtonIcon);

        this.folderStructureHeadingElement = document.createElement("div");
        this.folderStructureHeadingElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HEADING);

        this.folderStructureContainer = document.createElement("div");
        this.folderStructureContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_FOLDER_STRUCTURE_CONTAINER);

        this.horizontalRule = document.createElement("hr");
        this.horizontalRule.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HORIZONTAL_RULE);

        this.packagesHeadingElement = document.createElement("div");
        this.packagesHeadingElement.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_HEADING);

        this.packagesContainer = document.createElement("div");
        this.packagesContainer.classList.add(CSSClasses.PROJECT_CODE_BOX_PANEL_PACKAGES_CONTAINER);
    }

    public getPanelElement() : HTMLElement {
        return this.panelElement;
    }

    public getPanelContentElement() : HTMLElement {
        return this.panelContentElement;
    }

    public getFolderStructureHeadingElement() : HTMLElement {
        return this.folderStructureHeadingElement;
    }

    public getFolderStructureContainer() : HTMLElement {
        return this.folderStructureContainer;
    }

    public getHorizontalRule() : HTMLElement {
        return this.horizontalRule;
    }

    public getPackagesHeadingElement() : HTMLElement {
        return this.packagesHeadingElement;
    }

    public getPackagesContainer() : HTMLElement {
        return this.packagesContainer;
    }

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