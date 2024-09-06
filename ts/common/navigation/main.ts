import Navigation from "./Navigation";
import NavigationToggle from "./NavigationToggle";

const NAVIGATION_TOGGLE_BUTTON_ID = "NavigationToggleButton";
const HEADER_NAVIGATION_ID = "MainNavigation";
const DOCUMENTATION_NAVIGATION_ID = "DocumentationNavigation";
const NAVIGATION_BREAKPOINT = `${900/16}em`; // this has to also be changed in LESS (less/abstracts/variables.less)
const CSS_NAVIGATION_TOGGLE_BUTTON_CHECKED_CLASS = "navigation-toggle-button--checked";
const CSS_HEADER_NAVIGATION_OPENED_CLASS = "header__navigation--opened";
const CSS_DOCUMENTATION_NAVIGATION_OPENED_CLASS = "documentation-page-layout__navigation--opened";
const NAVIGATION_TOGGLE_ANIMATION_SPEED = 200;

function initNavigationToggle() {
    const navigationToggleButton = document.getElementById(NAVIGATION_TOGGLE_BUTTON_ID);
    const headerNavigation = document.getElementById(HEADER_NAVIGATION_ID);
    const documentationNavigation = document.getElementById(DOCUMENTATION_NAVIGATION_ID);

    const mql = window.matchMedia(`(max-width: ${NAVIGATION_BREAKPOINT})`);

    const navigations : Navigation[] = [];

    if (headerNavigation) {
        navigations.push(new Navigation(
            headerNavigation,
            CSS_HEADER_NAVIGATION_OPENED_CLASS,
            mql,
            NAVIGATION_TOGGLE_ANIMATION_SPEED
        ));
    }
    if (documentationNavigation) {
        navigations.push(new Navigation(
            documentationNavigation,
            CSS_DOCUMENTATION_NAVIGATION_OPENED_CLASS,
            mql,
            NAVIGATION_TOGGLE_ANIMATION_SPEED
        ));
    }

    if (navigationToggleButton) {
        new NavigationToggle(
            navigationToggleButton,
            CSS_NAVIGATION_TOGGLE_BUTTON_CHECKED_CLASS,
            navigations
        );
    }
}

export default initNavigationToggle;