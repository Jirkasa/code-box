interface CodeBoxBuilder { // podtřídy kdyžtak můžou vytvořit konstruktor a předat si tam elementy
    customizeRootElement(element : HTMLElement) : void;
    createCodeViewContainer() : HTMLElement;
    createNoCodeViewSelectedElement() : HTMLElement;
    assembleElements(rootElement : HTMLElement, codeViewContainer : HTMLElement, noCodeViewSelectedElement : HTMLElement) : void;
}

export default CodeBoxBuilder;