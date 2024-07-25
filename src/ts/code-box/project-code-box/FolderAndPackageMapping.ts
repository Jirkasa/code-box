type PackageItem = {
    packageName : string | null,
    fileName: string
}

class FolderAndPackageMapping {
    private folderPathsToPackages = new Map<string, PackageItem>();
    private packages = new Map<string | null, Map<string, string>>(); // obsahuje mapy podle názvů balíčků - tyto mapy obsahují folderPath+fileName podle názvu souboru

    public add(fileName : string, folderPath : string | null, packageName : string | null) {
        // if (!folderPath) folderPath = "";

        const fileFolderPath = folderPath ? (folderPath + "/" + fileName) : fileName;
        
        this.folderPathsToPackages.set(fileFolderPath, {packageName: packageName, fileName: fileName});

        let fileNames = this.packages.get(packageName);
        if (!fileNames) {
            fileNames = new Map<string, string>();
            this.packages.set(packageName, fileNames);
        }
        fileNames.set(fileName, fileFolderPath);
    }

    public getFileFolderPathByPackageItem(packageName : string | null, fileName : string) : string | null {
        const fileNames = this.packages.get(packageName);
        if (!fileNames) return null;

        const fileFolderPath = fileNames.get(fileName);
        if (!fileFolderPath) return null;
        return fileFolderPath;
    }

    public getPackageItemByFileFolderPath(folderPath : string | null, fileName : string) : PackageItem | null {
        const fileFolderPath = folderPath ? (folderPath + "/" + fileName) : fileName;

        const packageItem = this.folderPathsToPackages.get(fileFolderPath);
        if (!packageItem) return null;
        return {
            packageName: packageItem.packageName,
            fileName: packageItem.fileName
        };
    }

    // todo - ještě remove
}

export default FolderAndPackageMapping;