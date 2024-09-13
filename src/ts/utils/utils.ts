import CodeBoxOptions from "../code-box/CodeBoxOptions";
import ProjectCodeBoxOptions from "../code-box/project-code-box/ProjectCodeBoxOptions";
import TabCodeBoxOptions from "../code-box/tab-code-box/TabCodeBoxOptions";
import CodeViewOptions from "../code-view/CodeViewOptions";

/**
 * Removes all empty string from array of strings.
 * @param array Array of strings.
 */
export function deleteEmptyStringFromArray(array : string[]) : void {
    for (let i = 0; i < array.length; i++) {
        if (array[i].trim().length === 0) {
            array.splice(i, 1);
            i--;
        }
    }
}

/**
 * Creates copy of code view options.
 * @param options Code view options.
 * @returns Copy of code view options.
 */
export function createCodeViewOptionsCopy(options : CodeViewOptions) : CodeViewOptions {
    return {
        highlight: options.highlight,
        lineHeight: options.lineHeight,
        lineHeightUnit: options.lineHeightUnit,
        showGutter: options.showGutter,
        showLineNumbers: options.showLineNumbers,
        cssClasses: options.cssClasses
    }
}

/**
 * Creates copy of code box options.
 * @param options Code box options.
 * @returns Copy of code box options.
 */
export function createCodeBoxOptionsCopy(options : CodeBoxOptions) : CodeBoxOptions {
    return {
        lazyInit: options.lazyInit,
        implicitActive: options.implicitActive,
        defaultCodeViewOptions: options.defaultCodeViewOptions && createCodeViewOptionsCopy(options.defaultCodeViewOptions),
        noCodeViewSelectedElementHeight: options.noCodeViewSelectedElementHeight,
        noCodeViewSelectedText: options.noCodeViewSelectedText,
        minCodeViewLinesCount: options.minCodeViewLinesCount
    }
}

/**
 * Creates copy of tab code box options.
 * @param options Tab code box options.
 * @returns Copy of tab code box options.
 */
export function createTabCodeBoxOptionsCopy(options : TabCodeBoxOptions) : TabCodeBoxOptions {
    return {
        lazyInit: options.lazyInit,
        implicitActive: options.implicitActive,
        defaultCodeViewOptions: options.defaultCodeViewOptions && createCodeViewOptionsCopy(options.defaultCodeViewOptions),
        noCodeViewSelectedElementHeight: options.noCodeViewSelectedElementHeight,
        noCodeViewSelectedText: options.noCodeViewSelectedText,
        minCodeViewLinesCount: options.minCodeViewLinesCount,
        svgSpritePath: options.svgSpritePath,
        svgSpriteIcons: options.svgSpriteIcons && {
            codeFile: options.svgSpriteIcons.codeFile,
            file: options.svgSpriteIcons.file,
            download: options.svgSpriteIcons.download
        }
    }
}

/**
 * Creates copy of project code box options.
 * @param options Project code box options.
 * @returns Copy of project code box options.
 */
export function createProjectCodeBoxOptionsCopy(options : ProjectCodeBoxOptions) : ProjectCodeBoxOptions {
    return {
        lazyInit: options.lazyInit,
        implicitActive: options.implicitActive,
        defaultCodeViewOptions: options.defaultCodeViewOptions && createCodeViewOptionsCopy(options.defaultCodeViewOptions),
        noCodeViewSelectedElementHeight: options.noCodeViewSelectedElementHeight,
        noCodeViewSelectedText: options.noCodeViewSelectedText,
        minCodeViewLinesCount: options.minCodeViewLinesCount,
        svgSpritePath: options.svgSpritePath,
        svgSpriteIcons: options.svgSpriteIcons && {
            codeFile: options.svgSpriteIcons.codeFile,
            file: options.svgSpriteIcons.file,
            download: options.svgSpriteIcons.download,
            panelOpenButton: options.svgSpriteIcons.panelOpenButton,
            folderArrow: options.svgSpriteIcons.folderArrow,
            folder: options.svgSpriteIcons.folder,
            project: options.svgSpriteIcons.project,
            package: options.svgSpriteIcons.package
        },
        folderStructureHeading: options.folderStructureHeading,
        packagesHeading: options.packagesHeading,
        projectName: options.projectName,
        packagesFolderPath: options.packagesFolderPath,
        defaultPackageName: options.defaultPackageName,
        createFoldersForPackages: options.createFoldersForPackages,
        foldersDelimiterForPackages: options.foldersDelimiterForPackages,
        folderAnimationSpeed: options.folderAnimationSpeed,
        folderAnimationEasingFunction: options.folderAnimationEasingFunction,
        openActiveCodeViewFolderOnInit: options.openActiveCodeViewFolderOnInit,
        openActiveCodeViewPackageOnInit: options.openActiveCodeViewPackageOnInit,
        preventActiveCodeViewFolderOpenOnInitIfPackage: options.preventActiveCodeViewFolderOpenOnInitIfPackage,
        openRootFolderOnInit: options.openRootFolderOnInit,
        closePanelOnCodeViewSelect: options.closePanelOnCodeViewSelect,
        openPanelOnInit: options.openPanelOnInit,
        openPanelButtonAriaLabel: options.openPanelButtonAriaLabel,
        closePanelButtonAriaLabel: options.closePanelButtonAriaLabel
    }
}