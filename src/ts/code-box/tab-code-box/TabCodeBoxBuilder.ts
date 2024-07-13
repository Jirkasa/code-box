import CSSClasses from "../../CSSClasses";
import CodeBoxBuilder from "../CodeBoxBuilder";

class TabCodeBoxBuilder implements CodeBoxBuilder {
    private tabsContainer : HTMLElement;

    constructor(tabsContainer : HTMLElement) {
        this.tabsContainer = tabsContainer;

        this.tabsContainer.classList.add(CSSClasses.TAB_CODE_BOX_TABS);
    }

    public customizeRootElement(element: HTMLElement) : void {
        element.classList.add(CSSClasses.TAB_CODE_BOX);
    }

    public createCodeViewContainer(): HTMLElement {
        const codeViewContainer = document.createElement("div");
        codeViewContainer.classList.add(CSSClasses.TAB_CODE_BOX_CODE_VIEW_CONTAINER);
        return codeViewContainer;
    }

    public createNoCodeViewSelectedElement(height: string, text : string) : HTMLElement {
        const container = document.createElement("div");
        container.classList.add(CSSClasses.TAB_CODE_BOX_NO_CODE_VIEW);
        container.style.height = height;

        const message = document.createElement("p");
        message.classList.add(CSSClasses.TAB_CODE_BOX_NO_CODE_VIEW_MESSAGE);
        message.innerText = text;
        container.appendChild(message);

        return container;
    }

    public getNoCodeViewCSSHiddenClass(): string {
        return CSSClasses.TAB_CODE_BOX_NO_CODE_VIEW_HIDDEN_MODIFIER;
    }

    public assembleElements(rootElement: HTMLElement, codeViewContainer: HTMLElement, noCodeViewSelectedElement: HTMLElement) : void {
        rootElement.appendChild(this.tabsContainer);
        rootElement.appendChild(codeViewContainer);
        rootElement.appendChild(noCodeViewSelectedElement);
    }
}

export default TabCodeBoxBuilder;