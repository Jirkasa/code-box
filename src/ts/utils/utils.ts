import CodeViewOptions from "../code-view/CodeViewOptions";

export function deleteEmptyStringFromArray(array : string[]) : void {
    for (let i = 0; i < array.length; i++) {
        if (array[i].trim().length === 0) {
            array.splice(i, 1);
            i--;
        }
    }
}

// todo - uvidím jestli to nedám jen do FoldersManager
// export function parseFolderPath(folderPath : string) : string[] {
//     if (folderPath.startsWith("/")) {
//         folderPath = folderPath.substring(1, folderPath.length);
//     }
//     if (folderPath.endsWith("/")) {
//         folderPath = folderPath.substring(0, folderPath.length-1);
//     }

//     const result = folderPath.split("/");
//     if (result.length === 1 && result[0] === "") {
//         return [];
//     }
//     return result;
// }

// // todo - možná to potom přesunout do ProjectCodeBox třídy - nebo možná spíš všechny ty věci na parsování atd. přemístit sem?
// export function getProjectCodeBoxItemIdentifier(folderPath : string | null, fileName : string) : string {
//     const parsedFolderPath = parseFolderPath(folderPath || "/");
// }

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