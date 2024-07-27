class PackagesSectionToggle {
    private container : HTMLElement;
    private horizontalRule : HTMLElement;
    private packagesHeadingElement : HTMLElement;
    private packagesContainer : HTMLElement;

    private visible : boolean = true;

    constructor(panelContentContainer : HTMLElement, horizontalRule : HTMLElement, packagesHeadingElement : HTMLElement, packagesContainer : HTMLElement) {
        this.container = panelContentContainer;
        this.horizontalRule = horizontalRule;
        this.packagesHeadingElement = packagesHeadingElement;
        this.packagesContainer = packagesContainer;
    }

    public show() : void {
        if (this.visible) return;

        this.container.appendChild(this.horizontalRule);
        this.container.appendChild(this.packagesHeadingElement);
        this.container.appendChild(this.packagesContainer);

        this.visible = true;
    }

    public hide() : void {
        if (!this.visible) return;

        this.horizontalRule.remove();
        this.packagesHeadingElement.remove();
        this.packagesContainer.remove();

        this.visible = false;
    }

    public isVisible() : boolean {
        return this.visible;
    }
}

export default PackagesSectionToggle;