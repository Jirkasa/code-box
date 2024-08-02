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