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
    private isRootFolderOpened : boolean;
    
    constructor(creator : ProjectCodeBox, codeViewEntries : ProjectCodeBoxCodeViewMementoEntry[], fileEntries : ProjectCodeBoxFileMementoEntry[], activeCodeView : CodeView | null, folderStructure : TreeNode<FolderInfo>[], packages : PackageInfo[], packagesFolderPath : string, projectName : string, isPanelOpened : boolean, isRootFolderOpened : boolean) {
        super(creator, codeViewEntries, fileEntries, activeCodeView);

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

    // napsat že highlights u code views se nedědí
    /*
    A taky se nedědí:
        - jestli je otevřený panel
        - otevření složek
        - packages folder path to nenastavuje
        - packages zůstavají i při přepsání code view (pokud se nenastavil balíček nový)
    */
    public applyToInherit(codeBox : ProjectCodeBox) : void { // napsat že se má volat po připravení code boxu ke zdědění z parent code boxu
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

    private createFolders(codeBox : ProjectCodeBox, node : TreeNode<FolderInfo>, parentFolderNames : string[] = [], openFolders : boolean = true) {
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