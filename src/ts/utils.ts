export function deleteEmptyStringFromArray(array : string[]) : void {
    for (let i = 0; i < array.length; i++) {
        if (array[i].trim().length === 0) {
            array.splice(i, 1);
            i--;
        }
    }
}