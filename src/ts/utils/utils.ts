export function deleteEmptyStringFromArray(array : string[]) : void {
    for (let i = 0; i < array.length; i++) {
        if (array[i].trim().length === 0) {
            array.splice(i, 1);
            i--;
        }
    }
}

export function parseFolderPath(folderPath : string) : string[] {
    if (folderPath.startsWith("/")) {
        folderPath = folderPath.substring(1, folderPath.length);
    }
    if (folderPath.endsWith("/")) {
        folderPath = folderPath.substring(0, folderPath.length-1);
    }

    const result = folderPath.split("/");
    if (result.length === 1 && result[0] === "") {
        return [];
    }
    return result;
}