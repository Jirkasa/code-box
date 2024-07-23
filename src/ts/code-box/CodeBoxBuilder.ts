interface CodeBoxBuilder {
    customizeRootElement(element : HTMLElement) : void;
    createCodeViewContainer() : HTMLElement;
    getCodeViewContainerCSSHiddenClass() : string;
    createNoCodeViewSelectedElement(height : string, text : string) : HTMLElement;
    getNoCodeViewCSSHiddenClass() : string;
    assembleElements(rootElement : HTMLElement, codeViewContainer : HTMLElement, noCodeViewSelectedElement : HTMLElement) : void;
}

export default CodeBoxBuilder;