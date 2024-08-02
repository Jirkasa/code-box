/** Info about package side of mapping. */
type PackageItem = {
    /** Package name. */
    packageName : string | null,
    /** File name. */
    fileName: string
}

/** Maps packages and folder paths for code views and files. */
class FolderAndPackageMapping {
    /** Packages stored by file folder paths. */
    private folderPathsToPackages = new Map<string, PackageItem>();
    /** File folder paths stored by packages (Contains maps by package names. These maps store folder path + file name by file name.). */
    private packages = new Map<string | null, Map<string, string>>();

    /**
     * Adds new mapping.
     * @param fileName File name.
     * @param folderPath Folder path (null can be used for root folder).
     * @param packageName Package name (null for default package).
     */
    public add(fileName : string, folderPath : string | null, packageName : string | null) {
        const fileFolderPath = folderPath ? (folderPath + "/" + fileName) : fileName;
        
        this.folderPathsToPackages.set(fileFolderPath, {packageName: packageName, fileName: fileName});

        let fileNames = this.packages.get(packageName);
        if (!fileNames) {
            fileNames = new Map<string, string>();
            this.packages.set(packageName, fileNames);
        }
        fileNames.set(fileName, fileFolderPath);
    }

    /**
     * Returns file folder path based on passed package name and file name.
     * @param packageName Package name (null for default package).
     * @param fileName File name.
     * @returns File folder path (folder path + file name).
     */
    public getFileFolderPathByPackageItem(packageName : string | null, fileName : string) : string | null {
        const fileNames = this.packages.get(packageName);
        if (!fileNames) return null;

        const fileFolderPath = fileNames.get(fileName);
        if (fileFolderPath === undefined) return null;
        return fileFolderPath;
    }

    /**
     * Returns package item based on passed folder path and file name.
     * @param folderPath Folder path (null can be used for root folder).
     * @param fileName File name.
     * @returns Package item (info about package side of mappping: package name and file name).
     */
    public getPackageItemByFileFolderPath(folderPath : string | null, fileName : string) : PackageItem | null {
        const fileFolderPath = folderPath ? (folderPath + "/" + fileName) : fileName;

        const packageItem = this.folderPathsToPackages.get(fileFolderPath);
        if (!packageItem) return null;
        return {
            packageName: packageItem.packageName,
            fileName: packageItem.fileName
        };
    }

    /**
     * Removes mapping based on passed folder path and file name.
     * @param folderPath Folder path (null can be used for root folder).
     * @param fileName File name.
     * @returns Indicates whether mapping was successfully removed.
     */
    public removeByFileFolderPath(folderPath : string | null, fileName : string) : boolean {
        const fileFolderPath = folderPath ? (folderPath + "/" + fileName) : fileName;

        const packageItem = this.folderPathsToPackages.get(fileFolderPath);
        if (!packageItem) return false;
        
        const fileNames = this.packages.get(packageItem.packageName);
        if (!fileNames) return false;

        this.folderPathsToPackages.delete(fileFolderPath);
        fileNames.delete(packageItem.fileName);
        if (fileNames.size === 0) {
            this.packages.delete(packageItem.packageName);
        }

        return true;
    }

    /**
     * Removes mapping based on passed package name and file name.
     * @param packageName Package name (null for default package).
     * @param fileName File name.
     * @returns Indicates whether mapping was successfully removed.
     */
    public removeByPackageItem(packageName : string | null, fileName : string) : boolean {
        const fileNames = this.packages.get(packageName);
        if (!fileNames) return false;

        const fileFolderPath = fileNames.get(fileName);
        if (fileFolderPath === undefined) return false;

        this.folderPathsToPackages.delete(fileFolderPath);
        fileNames.delete(fileName);
        if (fileNames.size === 0) {
            this.packages.delete(packageName);
        }

        return true;
    }
}

export default FolderAndPackageMapping;