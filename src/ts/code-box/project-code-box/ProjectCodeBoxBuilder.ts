import CSSClasses from "../../CSSClasses";
import SVGIconElementCreator from "../../utils/SVGIconElementCreator";
import CodeBoxBuilder from "../CodeBoxBuilder";

class ProjectCodeBoxBuilder implements CodeBoxBuilder {
    private panelElement : HTMLElement;
    private panelContentElement : HTMLElement;
    private panelOpenButton : HTMLButtonElement;

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
    }

    public getPanelElement() : HTMLElement {
        return this.panelElement;
    }

    public getPanelContentElement() : HTMLElement {
        return this.panelContentElement;
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

        this.panelElement.appendChild(this.panelContentElement);

        this.panelElement.appendChild(this.panelOpenButton);

        rootElement.appendChild(panelContainer);

        rootElement.appendChild(codeViewContainer);

        rootElement.appendChild(noCodeViewSelectedElement);

    }
}

export default ProjectCodeBoxBuilder;