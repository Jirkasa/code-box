import { CodeView } from "../../main";
import TreeNode from "../../utils/TreeNode";
import CodeBox from "../CodeBox";
import CodeBoxMemento, { CodeViewMementoEntry, FileMementoEntry } from "../CodeBoxMemento";
import FolderInfo from "./FolderInfo";
import PackageInfo from "./PackageInfo";
import ProjectCodeBox from "./ProjectCodeBox";

/** Code view entry for project code box memento. */
export type ProjectCodeBoxCodeViewMementoEntry = {
    /** Package name (null for default package and undefined for no package). */
    package : string | null | undefined;
} & CodeViewMementoEntry;

/** File entry for project code box memento. */
export type ProjectCodeBoxFileMementoEntry = {
    /** Package name (null for default package and undefined for no package). */
    package : string | null | undefined;
} & FileMementoEntry;

/** Represents saved state of project code box. */
class ProjectCodeBoxMemento extends CodeBoxMemento {
    /** Code view entries (code views in code box when memento was created). */
    private projectCodeBoxCodeViewEntries : ProjectCodeBoxCodeViewMementoEntry[];
    /** File entries (files in code box when memento was created). */
    private projectCodeBoxFileEntries : ProjectCodeBoxFileMementoEntry[];
    /** Folder structure of code box when memento was created. */
    private folderStructure : TreeNode<FolderInfo>[];
    /** Packages of code box when memento was created. */
    private packages : PackageInfo[];
    /** Project name of code box when memento was created. */
    private projectName : string;
    /** Indicates whether panel was opened when memento was created. */
    private isPanelOpened : boolean;
    /** Folder path for packages when memento was created. */
    private packagesFolderPath : string;
    /** Indicates whether root folder was opened when memento was created. */
    private isRootFolderOpened : boolean;
    
    /**
     * Creates new project code box memento.
     * @param creator Code box based on which the memento is created.
     * @param addCodeViewToCreatorCodeBox Function to add code view without making copy to code box based on which the memento was created.
     * @param codeViewEntries Code view entries.
     * @param fileEntries File entries.
     * @param activeCodeView Active code view.
     * @param folderStructure Folder structure.
     * @param packages Packages.
     * @param packagesFolderPath Folder path for packages.
     * @param projectName Project name.
     * @param isPanelOpened Indicates whether panel is opened.
     * @param isRootFolderOpened Indicates whether root folder is oepened.
     */
    constructor(creator : ProjectCodeBox, addCodeViewToCreatorCodeBox : (identifier : string, codeView : CodeView) => void, codeViewEntries : ProjectCodeBoxCodeViewMementoEntry[], fileEntries : ProjectCodeBoxFileMementoEntry[], activeCodeView : CodeView | null, folderStructure : TreeNode<FolderInfo>[], packages : PackageInfo[], packagesFolderPath : string, projectName : string, isPanelOpened : boolean, isRootFolderOpened : boolean) {
        super(creator, addCodeViewToCreatorCodeBox, codeViewEntries, fileEntries, activeCodeView);

        this.projectCodeBoxCodeViewEntries = codeViewEntries;
        this.projectCodeBoxFileEntries = fileEntries;
        this.folderStructure = folderStructure;
        this.packages = packages;
        this.projectName = projectName;
        this.isPanelOpened = isPanelOpened;
        this.packagesFolderPath = packagesFolderPath;
        this.isRootFolderOpened = isRootFolderOpened;
    }

    public apply(codeBox : CodeBox) : void {
        if (codeBox instanceof ProjectCodeBox) {
            codeBox.changePackagesFolderPathAndRemoveAll(this.packagesFolderPath);
        }

        super.apply(codeBox);
        if (!(codeBox instanceof ProjectCodeBox)) return;

        for (let node of this.folderStructure) {
            this.createFolders(codeBox, node);
        }
        this.createPackages(codeBox);
        
        if (this.isRootFolderOpened) {
            codeBox.openFolder("/", false, false);
        } else {
            codeBox.closeFolder("/", false, false);
        }

        codeBox.setProjectName(this.projectName);
        if (this.isPanelOpened) {
            codeBox.openPanel();
        } else {
            codeBox.closePanel();
        }

        for (let codeViewEntry of this.projectCodeBoxCodeViewEntries) {
            if (codeViewEntry.package === undefined) continue;
            codeBox.changeCodeViewPackage(codeViewEntry.identifier, codeViewEntry.package, true);
        }
        for (let fileEntry of this.projectCodeBoxFileEntries) {
            if (fileEntry.package === undefined) continue;
            codeBox.changeFilePackage(fileEntry.identifier, fileEntry.package, true);
        }
    }

    /**
     * This method can be called after code box is prepared to inherit from its parent code box. (These things are not inherited: open/close state of panel, open/close state of folders and packages, highlights of code views. Folder path for packages is also not changed. Packages of overwritten code views and files are not changed unless new package was explicitely assigned.)
     * @param codeBox Code box.
     */
    public applyToInherit(codeBox : ProjectCodeBox) : void {
        for (let codeViewEntry of this.projectCodeBoxCodeViewEntries) {
            const codeBoxCodeView = codeBox.getCodeView(codeViewEntry.identifier);

            if (!codeBoxCodeView) {
                let codeView = codeViewEntry.codeView.clone();
                codeView.applyMemento(codeViewEntry.codeViewMemento);
                codeView.removeHighlights();
                codeBox.addCodeView(codeViewEntry.identifier, codeView);
            }

            if (codeViewEntry.package === undefined) continue;
            if (codeBoxCodeView && codeBoxCodeView.getPackage() !== undefined) continue;

            codeBox.changeCodeViewPackage(codeViewEntry.identifier, codeViewEntry.package, true);
        }

        for (let fileEntry of this.projectCodeBoxFileEntries) {
            const codeBoxFile = codeBox.getFile(fileEntry.identifier);

            if (!codeBoxFile) {
                codeBox.addFile(fileEntry.identifier, fileEntry.downloadLink);
            }
            
            if (fileEntry.package === undefined) continue;
            if (codeBoxFile && codeBoxFile.getPackage() !== undefined) continue;

            codeBox.changeFilePackage(fileEntry.identifier, fileEntry.package, true);
        }

        for (let node of this.folderStructure) {
            this.createFolders(codeBox, node, [], false);
        }
        this.createPackages(codeBox, false);

        codeBox.setProjectName(this.projectName);
    }

    /**
     * Returns code view height based on passed identifier if code view is stored in memento.
     * @param identifier Identifier of code view.
     * @param minLinesCount Minimum number of lines.
     * @returns Height.
     */
    public getCodeViewHeightByIdentifier(identifier : string, minLinesCount : number | null) : string | null {
        for (let codeViewEntry of this.projectCodeBoxCodeViewEntries) {
            if (codeViewEntry.identifier !== identifier) continue;

            const codeView = codeViewEntry.codeView;

            let linesCount = codeView.linesCount;
            if (minLinesCount !== null && linesCount < minLinesCount) {
                linesCount = minLinesCount;
            }
            return `${linesCount * codeView.lineHeight}${codeView.lineHeightUnit}`;
        }
        return null;
    }

    /**
     * Helper method to create folders in code box.
     * @param codeBox Code box.
     * @param node Node with folder info.
     * @param parentFolderNames Parent folder names (used internally).
     * @param openFolders Determines whether folders that should be open should be opened.
     */
    private createFolders(codeBox : ProjectCodeBox, node : TreeNode<FolderInfo>, parentFolderNames : string[] = [], openFolders : boolean = true) : void {
        if (node.children.length === 0) {
            const folderPath = parentFolderNames.join("/") + "/" + node.value.name;
            codeBox.addFolder(folderPath);
            if (openFolders && node.value.opened) {
                codeBox.openFolder(folderPath, false, false);
            }
            return;
        }

        for (let child of node.children) {
            parentFolderNames.push(node.value.name);
            this.createFolders(codeBox, child, parentFolderNames, openFolders);
            parentFolderNames.pop();
        }

        if (openFolders && node.value.opened) {
            const folderPath = parentFolderNames.join("/") + "/" + node.value.name;
            codeBox.openFolder(folderPath, false, false);
        }
    }

    /**
     * Helper method to create package in code box.
     * @param codeBox Code box.
     * @param openPackages Determines whether packages that should be open should be opened.
     */
    private createPackages(codeBox : ProjectCodeBox, openPackages : boolean = true) {
        for (let packageInfo of this.packages) {
            codeBox.addPackage(packageInfo.name);
            if (openPackages && packageInfo.opened) {
                codeBox.openPackage(packageInfo.name, false);
            }
        }
    }
}

export default ProjectCodeBoxMemento;