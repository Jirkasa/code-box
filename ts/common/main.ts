import Collapsible from "./Collapsible";

const NAVIGATION_COLLAPSIBLE_OPENED_BUTTON_CLASS = "navigation__item-dropdown-button--opened";
const CODE_EXAMPLE_COLLAPSIBLE_CONTAINER_CLASS = "code-example__collapsible";
const CODE_EXAMPLE_COLLAPSIBLE_OPENED_BUTTON_CLASS = "code-example__collapsible-button--opened"

function createNavigationCollapsibles(navigationItemsContainer : HTMLElement) : void {
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

function createCodeExampleCollapsibles(pageContentContainer : HTMLElement) : void {
    const collapsibleElements = pageContentContainer.querySelectorAll("." + CODE_EXAMPLE_COLLAPSIBLE_CONTAINER_CLASS);

    collapsibleElements.forEach(collapsibleElement => {
        const button = collapsibleElement.previousElementSibling;
        if (!button) return;

        if (button && button instanceof HTMLElement && collapsibleElement instanceof HTMLElement) {
            const collapsible = new Collapsible(button, collapsibleElement, CODE_EXAMPLE_COLLAPSIBLE_OPENED_BUTTON_CLASS);
            if (collapsibleElement.dataset.collapsibleClosed === undefined) {
                collapsible.open(false);
            }
        }
    });
}

const documentationNavigationItemsContainer = document.getElementById("DocumentationNavigationItems");
const documentationPageContentContainer = document.getElementById("DocumentationPageContent");

if (documentationNavigationItemsContainer && documentationNavigationItemsContainer instanceof HTMLElement) {
    createNavigationCollapsibles(documentationNavigationItemsContainer);
}
if (documentationPageContentContainer && documentationPageContentContainer instanceof HTMLElement) {
    createCodeExampleCollapsibles(documentationPageContentContainer);
}