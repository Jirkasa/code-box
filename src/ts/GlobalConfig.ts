/** Global config of library. */
const GlobalConfig = {
    /** Data attribute prefix used for all data attributes of library. */
    DATA_ATTRIBUTE_PREFIX: "cb",
    /** Margin for lazy initialization of code boxes. */
    LAZY_INITIALIZATION_MARGIN: "100px",
    /** Default line height value for code view. */
    DEFAULT_LINE_HEIGHT: 2,
    /** Default line height unit for code view. */
    DEFAULT_LINE_HEIGHT_UNIT: "rem",
    /** Default height of element that is displayed when no code view is set as active in code box. */
    DEFAULT_NO_CODE_VIEW_SELECTED_ELEMENT_HEIGHT: "50rem",
    /** Default text of element that is displayed when no code view is set as active in code box. */
    DEFAULT_NO_CODE_VIEW_SELECTED_TEXT: "No code view selected",
    /** Default text for code view button in code box. */
    DEFAULT_CODE_VIEW_BUTTON_TEXT: "unnamed",
    /** Default text for file button in code box. */
    DEFAULT_FILE_BUTTON_TEXT: "unnamed",
    /** Default name of project (root) folder in project code box. */
    DEFAULT_PROJECT_NAME: "unnamed",
    /** Default folder structure section heading for project code box. */
    DEFAULT_PROJECT_FOLDER_STRUCTURE_HEADING: "Folder structure",
    /** Default packages section heading for project code box. */
    DEFAULT_PROJECT_PACKAGES_HEADING: "Packages",
    /** Default name under which is displayed default package in project code box. */
    DEFAULT_DEFAULT_PACKAGE_NAME: "default",
    /** Default speed of folder open/close animation in project code box. */
    DEFAULT_FOLDER_ANIMATION_SPEED: 200,
    /** Default CSS easing function for folder open/close animation in project code box. */
    DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION: "ease-in-out",
    /** Determines whether folders should be created for packages by default in project code box. */
    DEFAULT_CREATE_FOLDERS_FOR_PACKAGES: true,
    /** Default value of panel open/close button aria-label attribute in project code box when panel is closed. */
    DEFAULT_OPEN_PANEL_BUTTON_ARIA_LABEL: "Open panel",
    /** Default value of panel open/close button aria-label attribute in project code box when panel is opened. */
    DEFAULT_CLOSE_PANEL_BUTTON_ARIA_LABEL: "Close panel"
}

export default GlobalConfig;