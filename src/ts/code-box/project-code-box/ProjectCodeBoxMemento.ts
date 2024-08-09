import { CodeView } from "../../main";
import TreeNode from "../../utils/TreeNode";
import CodeBox from "../CodeBox";
import CodeBoxMemento, { CodeViewMementoEntry, FileMementoEntry } from "../CodeBoxMemento";
import FolderInfo from "./FolderInfo";
import PackageInfo from "./PackageInfo";
import ProjectCodeBox from "./ProjectCodeBox";

export type ProjectCodeBoxCodeViewMementoEntry = {
    package : string | null | undefined;
} & CodeViewMementoEntry;

export type ProjectCodeBoxFileMementoEntry = {
    package : string | null | undefined;
} & FileMementoEntry;

class ProjectCodeBoxMemento extends CodeBoxMemento {
    private projectCodeBoxCodeViewEntries : ProjectCodeBoxCodeViewMementoEntry[];
    private projectCodeBoxFileEntries : ProjectCodeBoxFileMementoEntry[];
    private folderStructure : TreeNode<FolderInfo>[];
    private packages : PackageInfo[];
    private projectName : string;
    private isPanelOpened : boolean;
    private packagesFolderPath : string;
    
    constructor(creator : ProjectCodeBox, codeViewEntries : ProjectCodeBoxCodeViewMementoEntry[], fileEntries : ProjectCodeBoxFileMementoEntry[], activeCodeView : CodeView | null, folderStructure : TreeNode<FolderInfo>[], packages : PackageInfo[], packagesFolderPath : string, projectName : string, isPanelOpened : boolean) {
        super(creator, codeViewEntries, fileEntries, activeCodeView);

        this.projectCodeBoxCodeViewEntries = codeViewEntries;
        this.projectCodeBoxFileEntries = fileEntries;
        this.folderStructure = folderStructure;
        this.packages = packages;
        this.projectName = projectName;
        this.isPanelOpened = isPanelOpened;
        this.packagesFolderPath = packagesFolderPath;
    }

    public apply(codeBox : CodeBox) : void {
        
        if (codeBox instanceof ProjectCodeBox) {
            codeBox.changePackagesFolderPathAndRemoveAll(this.packagesFolderPath);
        }

        super.apply(codeBox);
        if (!(codeBox instanceof ProjectCodeBox)) return;
        // todo - ještě je tam vlastnost createFoldersForPackages a foldersDelimiterForPackages - co s tím? - nic - ono by se to teď stejně mělo brát podle složky, takže tohle vůbec nepřichází do hry - vytvoří se to všude stejně - na tomto nastavení nezáleží

        for (let node of this.folderStructure) {
            this.createFolders(codeBox, node);
        }
        this.createPackages(codeBox);

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

    private createFolders(codeBox : ProjectCodeBox, node : TreeNode<FolderInfo>, parentFolderNames : string[] = []) {
        if (node.children.length === 0) {
            const folderPath = parentFolderNames.join("/") + "/" + node.value.name;
            codeBox.addFolder(folderPath);
            if (node.value.opened) {
                codeBox.openFolder(folderPath, false, false);
            }
            return;
        }

        for (let child of node.children) {
            parentFolderNames.push(node.value.name);
            this.createFolders(codeBox, child, parentFolderNames);
            parentFolderNames.pop();
        }

        if (node.value.opened) {
            const folderPath = parentFolderNames.join("/") + "/" + node.value.name;
            codeBox.openFolder(folderPath, false, false);
        }
    }

    private createPackages(codeBox : ProjectCodeBox) {
        for (let packageInfo of this.packages) {
            codeBox.addPackage(packageInfo.name);
            if (packageInfo.opened) {
                codeBox.openPackage(packageInfo.name, false);
            }
        }
    }
}

export default ProjectCodeBoxMemento;

/**
 * Nové abstraktní metody pro CodeBox:
 * reset() - resetne to do stavu po inicializaci
 *  - nebudu to asi potřebovat pro TabCodeBox - takže jen pro ProjectCodeBox? - v TabCodeBoxu to nedává až takový smysl
 * createMemento()
 * applyMemento() - přidám type guard - když to bude instance ProjectCodeBoxMemento, tak udělám něco navíc
 */