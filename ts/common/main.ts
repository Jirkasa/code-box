import Collapsible from "./Collapsible";

const NAVIGATION_COLLAPSIBLE_OPENED_BUTTON_CLASS = "navigation__item-dropdown-button--opened";

function createNavigationCollapsibles(navigationItemsContainer : HTMLElement) {
    for (let i = 0; i < navigationItemsContainer.children.length; i++) {
        const child = navigationItemsContainer.children[i];

        const button = child.querySelector("[data-collapsible-button]");
        const collapsibleElement = child.querySelector("[data-collapsible]");

        if (button && collapsibleElement && button instanceof HTMLElement && collapsibleElement instanceof HTMLElement) {
            const collapsible = new Collapsible(button, collapsibleElement, NAVIGATION_COLLAPSIBLE_OPENED_BUTTON_CLASS);
            if (collapsibleElement.dataset.collapsibleOpened !== undefined) {
                collapsible.open(false);
            }
        }
    }
}

const documentationNavigationItemsContainer = document.getElementById("DocumentationNavigationItems");

if (documentationNavigationItemsContainer && documentationNavigationItemsContainer instanceof HTMLElement) {
    createNavigationCollapsibles(documentationNavigationItemsContainer);
}