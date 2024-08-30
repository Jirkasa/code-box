import CodeBoxOptions from "../CodeBoxOptions";

/** Project code box options. */
type ProjectCodeBoxOptions = {
    /** Path to SVG sprite that contains icons. */
    svgSpritePath ?: string;
    /** Names of the icons in the SVG sprite. */
    svgSpriteIcons ?: {
        /** Icon for code view button. */
        codeFile ?: string;
        /** Icon for file button. */
        file ?: string;
        /** Icon that is displayed on file buttons with a download link. */
        download ?: string;
        /** Icon for panel open/close button. */
        panelOpenButton ?: string;
        /** Icon for folder arrow. */
        folderArrow ?: string;
        /** Icon for folder. */
        folder ?: string;
        /** Icon for project (root) folder. */
        project ?: string;
        /** Icon for package. */
        package ?: string;
    };
    /** Folder structure heading (default = "Folder structure"). */
    folderStructureHeading ?: string;
    /** Packages heading (default = "Packages"). */
    packagesHeading ?: string;
    /** Name of project (root) folder. This option is not used if the code box has parent code box. */
    projectName ?: string;
    /** Path to folder for packages. This option is not used if the code box has parent code box. */
    packagesFolderPath ?: string;
    /** Name under which the default package should be displayed (default = "default"). */
    defaultPackageName ?: string;
    /** Specifies whether folders should be created for packages (default = true). This option is not used if the code box has parent code box. */
    createFoldersForPackages ?: boolean;
    /** Specifies delimiter to be used when creating folders for packages. For example, if the delimiter is "." and the package name is "io.github.jirkasa", folders "io/github/jirkasa" are created. This option is not used if the code box has a parent code box. */
    foldersDelimiterForPackages ?: string;
    /** Speed of folder open/close animation (in milliseconds) (default = 200). */
    folderAnimationSpeed ?: number;
    /** CSS easing function for folder open/close animation (default = "ease-in-out"). */
    folderAnimationEasingFunction ?: string;
    /** Specifies whether folder and its parent folders containing the active code view should be opened on initialization (default = true). */
    openActiveCodeViewFolderOnInit ?: boolean;
    /** Specifies whether package containing the active code view should be opened on initialization (default = true). */
    openActiveCodeViewPackageOnInit ?: boolean;
    /** Specifies whether the folder and its parent folders containing the active code view should not be opened on initialization when the code view is within a package. This option overrides openActiveCodeViewFolderOnInit when set to true and the active code view is within a package. (default = false) */
    preventActiveCodeViewFolderOpenOnInitIfPackage ?: boolean;
    /** Specifies whether the project (root) folder should be opened on initialization (default = true). This option has effect only in certain situations (openActiveCodeViewFolderOnInit option takes precedence). */
    openRootFolderOnInit ?: boolean;
    /** Specifies whether the side panel should be opened on initialization (default = false). */
    openPanelOnInit ?: boolean;
    /** Specifies whether the side panel should be closed when code view is selected by clicking on its button (default = true). */
    closePanelOnCodeViewSelect ?: boolean;
    /** Value of the panel open/close button aria-label attribute when panel is closed (default = "Open panel"). */
    openPanelButtonAriaLabel ?: string;
    /** Value of the panel open/close button aria-label attribute when panel is opened (default = "Close panel"). */
    closePanelButtonAriaLabel ?: string;
} & CodeBoxOptions;

export default ProjectCodeBoxOptions;