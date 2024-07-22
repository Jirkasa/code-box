import CSSClasses from "../../CSSClasses";
import GlobalConfig from "../../GlobalConfig";
import { CodeView } from "../../main";
import EventSourcePoint from "../../utils/EventSourcePoint";
import Codebox, { CodeBoxItemInfo } from "../CodeBox";
import CodeViewButton from "../CodeViewButton";
import FoldersManager from "./FoldersManager";
import PanelToggle from "./PanelToggle";
import ProjectCodeBoxBuilder from "./ProjectCodeBoxBuilder";
import ProjectCodeBoxOptions from "./ProjectCodeBoxOptions";

class ProjectCodeBox extends Codebox {
    private panelToggle : PanelToggle;
    private foldersManager : FoldersManager;
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    private activeCodeViewButton : CodeViewButton | null = null;

    constructor(element : HTMLElement, options : ProjectCodeBoxOptions = {}, parentCodeBox : ProjectCodeBox | null = null) { // todo - ještě by možná mohlo jít nastavit, jestli dědit od aktuálního stavu code boxu nebo ne
        const codeBoxBuilder = new ProjectCodeBoxBuilder(
            options.folderStructureHeading || GlobalConfig.DEFAULT_PROJECT_FOLDER_STRUCTURE_HEADING,
            options.packagesHeading || GlobalConfig.DEFAULT_PROJECT_PACKAGES_HEADING,
            options.svgSpritePath || null,
            options.svgSpriteIcons ? (options.svgSpriteIcons.panelOpenButton || null) : null
        ); // todo - na to získávání ikony udělat nějakou helper metodu
        super(element, options, codeBoxBuilder);

        // todo - ale budu to chtít skrývat (ty packages), takže to potom nějak pořešit (ale ve FoldersManageru už ne, ten toho dělá už dost)

        this.panelToggle = new PanelToggle(codeBoxBuilder.getPanelElement(), codeBoxBuilder.getPanelOpenButtonElement(), () => this.onPanelToggled());
        if (options.svgSpritePath && options.svgSpriteIcons) {
            this.foldersManager = new FoldersManager(
                codeBoxBuilder.getFolderStructureContainer(),
                codeBoxBuilder.getPackagesContainer(),
                options.projectName || GlobalConfig.DEFAULT_PROJECT_NAME,
                options.packagesFolderPath || null,
                options.defaultPackageName || null,
                options.folderAnimationSpeed !== undefined ? options.folderAnimationSpeed : GlobalConfig.DEFAULT_FOLDER_ANIMATION_SPEED,
                options.folderAnimationEasingFunction || GlobalConfig.DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION,
                options.svgSpritePath,
                options.svgSpriteIcons.folderArrow || null,
                options.svgSpriteIcons.project || null,
                options.svgSpriteIcons.folder || null,
                options.svgSpriteIcons.package || null,
                options.svgSpriteIcons.codeFile || null,
                options.svgSpriteIcons.file || null,
                options.svgSpriteIcons.download || null
            );
        } else {
            this.foldersManager = new FoldersManager(
                codeBoxBuilder.getFolderStructureContainer(),
                codeBoxBuilder.getPackagesContainer(),
                options.projectName || GlobalConfig.DEFAULT_PROJECT_NAME,
                options.packagesFolderPath || null,
                options.defaultPackageName || null,
                options.folderAnimationSpeed !== undefined ? options.folderAnimationSpeed : GlobalConfig.DEFAULT_FOLDER_ANIMATION_SPEED,
                options.folderAnimationEasingFunction || GlobalConfig.DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION,
            );
        }

        this.showCodeViewEventSource.subscribe((codeViewButton, codeView) => this.onShowCodeView(codeViewButton, codeView));
    }

    protected onInit(codeBoxItemInfos: CodeBoxItemInfo[]): void {
        // jenom jeden konfigurační element pro složky bude asi dovolen - uvidím, možná to vadit nebude
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "HTMLElement" && codeBoxItemInfo.element) {
                const element = codeBoxItemInfo.element;

                if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folders"] !== undefined) {
                    this.createFolderStructure(element);
                } else if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Commands"] !== undefined) {
                    // todo
                }
            }
        }

        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeView" && codeBoxItemInfo.codeViewInfo) {
                let codeViewInfo = codeBoxItemInfo.codeViewInfo;

                let folderPath = this.getFolderPathFromDataset(codeViewInfo.dataset);
                let fileName = this.getNameFromDataset(codeViewInfo.dataset) || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                let packageName = this.getPackageNameFromDataset(codeViewInfo.dataset);

                let codeViewButton = this.foldersManager.addCodeViewButton(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined) {
                    codeViewButton.setAsActive();
                    this.activeCodeViewButton = codeViewButton;
                }
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                let fileInfo = codeBoxItemInfo.fileInfo;

                let folderPath = this.getFolderPathFromDataset(fileInfo.dataset);
                let fileName = this.getNameFromDataset(fileInfo.dataset) || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT;
                let packageName = this.getPackageNameFromDataset(fileInfo.dataset);

                this.foldersManager.addFileButton(fileName, fileInfo.downloadLink, folderPath, packageName !== null, packageName !== "" ? packageName : null);
            }
        }
    }

    private onShowCodeView(codeViewButton : CodeViewButton, codeView : CodeView) {
        if (this.activeCodeViewButton) {
            this.activeCodeViewButton.setAsInactive();
        }

        codeViewButton.setAsActive();
        this.activeCodeViewButton = codeViewButton;

        this.setActiveCodeView(codeView);
    }

    private onPanelToggled() : void {
        this.foldersManager.updateTabNavigation(this.panelToggle.isOpened());
    }

    private createFolderStructure(element : HTMLElement, parentFolderNames : string[] = []) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];

            if (!(child instanceof HTMLElement)) continue;

            let folderName : string | null = null;
            let childElement : HTMLElement | null = null;

            child.childNodes.forEach(node => {
                if (node instanceof Text) {
                    let text = node.textContent?.trim();

                    if (text && text.length > 0) {
                        folderName = text;
                    }
                } else if (node instanceof HTMLElement) {
                    childElement = node;
                }
            });

            if (folderName) {
                const folderNames = [...parentFolderNames, folderName];
                const folderPath = folderNames.join("/");

                // todo - data-cb-opened

                this.foldersManager.addFolder(folderPath); // todo - potom se tam bude jako volitelný parametr předávat, zda se má složka automaticky otevřít

                if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolder"] !== undefined) {
                    this.foldersManager.setPackagesFolderPath(folderPath);
                }

                if (childElement) {
                    this.createFolderStructure(childElement, folderNames);
                }
            }
        }
    }

    private getFolderPathFromDataset(dataset : DOMStringMap) : string {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folder"] || "/";
    }

    private getNameFromDataset(dataset : DOMStringMap) : string | null {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || null;
    }

    private getPackageNameFromDataset(dataset : DOMStringMap) : string | null {
        const packageName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Package"];
        return packageName !== undefined ? packageName : null;
    }
}

export default ProjectCodeBox;

/*
Co tady potřebuju dělat:
    - vzít ty datasety code views a podle toho vytvořit v panelu tlačítka
        - promyslet jak to bude s balíčky (pro javu se vytvářejí automaticky složky - )
    - metody pro přidávání dalších code views
    - dědit od parent code boxu
        - bude se používat memento
    - zpracovat konfigurační objekt s folder strukturou
    - zpracovat command objekty
        - pro spouštění commandů budou asi i metody, ale nebudou se brát v potaz při dědění
    - 

Pokud bude mít code view data-cb-folder atribut, tak 

- todo - podívat se jestli používám všude GlobalConfig.DATA_ATTRIBUTE_PREFIX - narazil jsem na kód, kde jsem to nepoužil
*/