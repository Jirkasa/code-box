/** Toggles visibility of packages section in project code box panel. */
class PackagesSectionToggle {
    /** Panel content container. */
    private container : HTMLElement;
    /** Horizontal rule displayed before packages section. */
    private horizontalRule : HTMLElement;
    /** Packages heading element. */
    private packagesHeadingElement : HTMLElement;
    /** Container of package collapsibles. */
    private packagesContainer : HTMLElement;

    /** Indicates whether packages section is currently visible. */
    private visible : boolean = true;

    /**
     * Creates new package section toggle.
     * @param panelContentContainer Panel content container.
     * @param horizontalRule Horizontal rule displayed before packages section.
     * @param packagesHeadingElement Packages heading element.
     * @param packagesContainer Container of packages collapsibles.
     */
    constructor(panelContentContainer : HTMLElement, horizontalRule : HTMLElement, packagesHeadingElement : HTMLElement, packagesContainer : HTMLElement) {
        this.container = panelContentContainer;
        this.horizontalRule = horizontalRule;
        this.packagesHeadingElement = packagesHeadingElement;
        this.packagesContainer = packagesContainer;
    }

    /**
     * Shows packages section.
     */
    public show() : void {
        if (this.visible) return;

        this.container.appendChild(this.horizontalRule);
        this.container.appendChild(this.packagesHeadingElement);
        this.container.appendChild(this.packagesContainer);

        this.visible = true;
    }

    /**
     * Hides packages section.
     */
    public hide() : void {
        if (!this.visible) return;

        this.horizontalRule.remove();
        this.packagesHeadingElement.remove();
        this.packagesContainer.remove();

        this.visible = false;
    }

    /**
     * Checks whether packages section is visible.
     * @returns Indicates whether packages section is visible.
     */
    public isVisible() : boolean {
        return this.visible;
    }
}

export default PackagesSectionToggle;