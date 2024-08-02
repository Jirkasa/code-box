/** Component used to build code box. */
interface CodeBoxBuilder {
    /**
     * Customizes root element of code box.
     * @param element Root element of code box.
    */
    customizeRootElement(element : HTMLElement) : void;

    /**
     * Creates container for active code view.
     * @returns Code view container.
     */
    createCodeViewContainer() : HTMLElement;

    /**
     * Returns CSS class that should be used to hide code view container.
     * @returns CSS class that should be used to hide code view container.
     */
    getCodeViewContainerCSSHiddenClass() : string;

    /**
     * Creates element, that is displayed when no active code view is set.
     * @param height Height that should be set to created element.
     * @param text Text that should be displayed in created element.
     * @returns Element, that is displayed when no active code view is set.
     */
    createNoCodeViewSelectedElement(height : string, text : string) : HTMLElement;

    /**
     * Returns CSS class that should be used to hide no active code view selected element.
     * @returns CSS class that should be used to hide no active code view selected element.
     */
    getNoCodeViewCSSHiddenClass() : string;

    /**
     * 
     * @param rootElement Root element of code box.
     * @param codeViewContainer Container for active code view.
     * @param noCodeViewSelectedElement Element, that is displayed when no active code view is set.
     */
    assembleElements(rootElement : HTMLElement, codeViewContainer : HTMLElement, noCodeViewSelectedElement : HTMLElement) : void;
}

export default CodeBoxBuilder;