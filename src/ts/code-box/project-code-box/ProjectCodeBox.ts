import CodeViewOptions from "../../code-view/CodeViewOptions";
import GlobalConfig from "../../GlobalConfig";
import CodeView from "../../code-view/CodeView";
import EventSourcePoint from "../../utils/EventSourcePoint";
import CodeBox, { CodeBoxItemInfo } from "../CodeBox";
import CodeBoxCodeViewManager from "../CodeBoxCodeViewManager";
import CodeBoxFileManager from "../CodeBoxFileManager";
import CodeBoxMemento from "../CodeBoxMemento";
import CodeViewButton from "../CodeViewButton";
import CodeViewEntry from "./CodeViewEntry";
import FileEntry from "./FileEntry";
import FoldersManager from "./FoldersManager";
import PackagesSectionToggle from "./PackagesSectionToggle";
import PanelToggle from "./PanelToggle";
import ProjectCodeBoxBuilder from "./ProjectCodeBoxBuilder";
import ProjectCodeBoxCodeView from "./ProjectCodeBoxCodeView";
import ProjectCodeBoxFile from "./ProjectCodeBoxFile";
import ProjectCodeBoxMemento, { ProjectCodeBoxCodeViewMementoEntry, ProjectCodeBoxFileMementoEntry } from "./ProjectCodeBoxMemento";
import ProjectCodeBoxOptions from "./ProjectCodeBoxOptions";

/** Project code box. */
class ProjectCodeBox extends CodeBox {
    private static readonly COMMAND_RENAME_PROJECT = "rename project";
    private static readonly COMMAND_ADD_FOLDER = "add folder";
    private static readonly COMMAND_REMOVE_FOLDER = "remove folder";
    private static readonly COMMAND_RENAME_FOLDER = "rename folder";
    private static readonly COMMAND_OPEN_FOLDER = "open folder";
    private static readonly COMMAND_CLOSE_FOLDER = "close folder";
    private static readonly COMMAND_ADD_PACKAGE ="add package";
    private static readonly COMMAND_REMOVE_PACKAGE = "remove package";
    private static readonly COMMAND_RENAME_PACKAGE = "rename package";
    private static readonly COMMAND_OPEN_PACKAGE = "open package";
    private static readonly COMMAND_CLOSE_PACKAGE = "close package";
    private static readonly COMMAND_REMOVE_CODE_VIEW = "remove code view";
    private static readonly COMMAND_RENAME_CODE_VIEW = "rename code view";
    private static readonly COMMAND_MOVE_CODE_VIEW_TO_FOLDER = "move code view to folder";
    private static readonly COMMAND_CHANGE_CODE_VIEW_PACKAGE = "change code view package";
    private static readonly COMMAND_REMOVE_CODE_VIEW_PACKAGE = "remove code view package";
    private static readonly COMMAND_REMOVE_ALL_CODE_VIEWS = "remove all code views";
    private static readonly COMMAND_ADD_CODE_VIEW_HIGHLIGHT = "add code view highlight";
    private static readonly COMMAND_REMOVE_CODE_VIEW_HIGHLIGHT = "remove code view highlight";
    private static readonly COMMAND_SET_ACTIVE_CODE_VIEW = "set active code view";
    private static readonly COMMAND_SET_NO_ACTIVE_CODE_VIEW = "set no active code view";
    private static readonly COMMAND_REMOVE_FILE = "remove file";
    private static readonly COMMAND_RENAME_FILE = "rename file";
    private static readonly COMMAND_MOVE_FILE_TO_FOLDER = "move file to folder";
    private static readonly COMMAND_CHANGE_FILE_PACKAGE = "change file package";
    private static readonly COMMAND_REMOVE_FILE_PACKAGE = "remove file package";
    private static readonly COMMAND_REMOVE_ALL_FILES = "remove all files";

    /** Manages opening/closing of panel. */
    private panelToggle : PanelToggle;
    /** Manages visibility of packages section. */
    private packagesSectionToggle : PackagesSectionToggle;
    /** Manages folders and its contents (and package folders). */
    private foldersManager : FoldersManager;

    /** Reference to parent code box. */
    private readonly parentCodeBox : ProjectCodeBox | null;
    /** Command objects that are processed after initialization of code box. */
    private commands : Array<any> | null;
    /** Memento created after initialization of code box. */
    private initialMemento : ProjectCodeBoxMemento | null = null;
    /** Stores folder path for packages that was (or will be) set after initialization of code box. */
    private initialPackagesFolderPath : string | null;

    /** Event source to set active code view of code box. */
    private showCodeViewEventSource = new EventSourcePoint<CodeViewButton, CodeView>();
    /** Code view entries stored by code view. */
    private codeViewEntries = new Map<CodeView, CodeViewEntry>();
    /** File entries stored by code box files. */
    private fileEntries = new Map<ProjectCodeBoxFile, FileEntry>();
    /** Project name. */
    private projectName : string;
    
    /** Determines whether active code view folder should be opened on initialization. */
    private readonly openActiveCodeViewFolderOnInit : boolean;
    /** Determines whether active code view package should be opened on initialization. */
    private readonly openActiveCodeViewPackageOnInit : boolean;
    /** Determines whether the folder and its parent folders containing the active code view should not be opened on initialization when the code view is within a package. This option overrides openActiveCodeViewFolderOnInit when set to true and the active code view is within a package. */
    private readonly preventActiveCodeViewFolderOpenOnInitIfPackage : boolean;
    /** Determines whether panel should be closed when code view is selected by clicking on its button. */
    private readonly closePanelOnCodeViewSelect : boolean;

    /**
     * Creates new project code box.
     * @param element Code box root element.
     * @param options Code box options.
     * @param parentCodeBox Parent code box or null if code box does not have parent code box.
     */
    constructor(element : HTMLElement, options : ProjectCodeBoxOptions = {}, parentCodeBox : ProjectCodeBox | null = null) {
        const commandElements = element.querySelectorAll(`script[data-${GlobalConfig.DATA_ATTRIBUTE_PREFIX}-commands]`);
        const commands = new Array<any>();

        // get defined commands
        commandElements.forEach(commandElement => {
            if (commandElement.textContent === null) return;
            try {
                const commandsList = JSON.parse(commandElement.textContent);
                if (!(commandsList instanceof Array)) return;
                for (let command of commandsList) {
                    commands.push(command);
                }
            } catch {
                return;
            }
        });

        const codeBoxBuilder = new ProjectCodeBoxBuilder(
            options.svgSpritePath || null,
            options.svgSpriteIcons ? (options.svgSpriteIcons.panelOpenButton || null) : null
        );

        // get values for FoldersManager based on options
        let projectName : string;
        let packagesFolderPath : string | null;
        let createFoldersForPackages : boolean;
        let foldersDelimiterForPackages : string | null;
        if (parentCodeBox) {
            projectName = parentCodeBox.projectName;
            packagesFolderPath = parentCodeBox.initialPackagesFolderPath;
            createFoldersForPackages = parentCodeBox.foldersManager.isCreateFoldersForPackagesEnabled();
            foldersDelimiterForPackages = parentCodeBox.foldersManager.getFoldersDelimiterForPackages();
        } else {
            projectName = options.projectName || GlobalConfig.DEFAULT_PROJECT_NAME;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"] !== undefined) {
                projectName = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"] || GlobalConfig.DEFAULT_PROJECT_NAME;
            }
            packagesFolderPath = options.packagesFolderPath || null;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] !== undefined) {
                packagesFolderPath = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] || null;
            }
            createFoldersForPackages = options.createFoldersForPackages !== undefined ? options.createFoldersForPackages : GlobalConfig.DEFAULT_CREATE_FOLDERS_FOR_PACKAGES;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] !== undefined) {
                createFoldersForPackages = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] === "true";
            }
            foldersDelimiterForPackages = options.foldersDelimiterForPackages || null;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"] !== undefined) {
                foldersDelimiterForPackages = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"] || null;
            }
        }
        let folderAnimationSpeed = options.folderAnimationSpeed !== undefined ? options.folderAnimationSpeed : GlobalConfig.DEFAULT_FOLDER_ANIMATION_SPEED;
        if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] !== undefined) {
            const speed = Number.parseFloat(element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] || "");
            if (!Number.isNaN(speed)) folderAnimationSpeed = speed;
        }
        let folderAnimationEasingFunction = options.folderAnimationEasingFunction || GlobalConfig.DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION;
        if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"] !== undefined) {
            folderAnimationEasingFunction = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"] || GlobalConfig.DEFAULT_FOLDER_ANIMATION_EASING_FUNCTION;
        }

        const foldersManager = new FoldersManager(
            codeBoxBuilder.getFolderStructureContainer(),
            codeBoxBuilder.getPackagesContainer(),
            projectName,
            packagesFolderPath,
            options.defaultPackageName || null,
            createFoldersForPackages,
            foldersDelimiterForPackages,
            false,
            folderAnimationSpeed,
            folderAnimationEasingFunction,
            options.svgSpritePath,
            ProjectCodeBox.getIconName(options, "folderArrow"),
            ProjectCodeBox.getIconName(options, "project"),
            ProjectCodeBox.getIconName(options, "folder"),
            ProjectCodeBox.getIconName(options, "package"),
            ProjectCodeBox.getIconName(options, "codeFile"),
            ProjectCodeBox.getIconName(options, "file"),
            ProjectCodeBox.getIconName(options, "download")
        );

        // active code view identifier based on commands
        let activeCodeViewIdentifier : string | null = null;

        // determine initial folder path for packages
        let initialPackagesFolderPath : string | null;
        if (parentCodeBox) {
            initialPackagesFolderPath = parentCodeBox.initialPackagesFolderPath;
        } else {
            initialPackagesFolderPath = options.packagesFolderPath || null;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] !== undefined) {
                initialPackagesFolderPath = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] || null;
            }
        }
        if (initialPackagesFolderPath !== null) {
            initialPackagesFolderPath = foldersManager.getNormalizedFolderPath(initialPackagesFolderPath);
            if (initialPackagesFolderPath === "") {
                initialPackagesFolderPath = null;
            }
        }

        // based on commands: get active code view identifier and potentionally change initial folder path for packages
        for (let command of commands) {
            if (typeof command !== "object") continue;
            if (command.command === ProjectCodeBox.COMMAND_SET_ACTIVE_CODE_VIEW) {
                if (typeof command.identifier !== "string") continue;
                activeCodeViewIdentifier = command.identifier;
            } else if (command.command === ProjectCodeBox.COMMAND_RENAME_FOLDER && initialPackagesFolderPath !== null) {
                if (typeof command.folderPath !== "string") continue;
                if (typeof command.newName !== "string") continue;

                const oldFolderPath = foldersManager.getNormalizedFolderPath(command.folderPath);
                const newFolderName = foldersManager.getSanitizedFolderName(command.newName);

                if ((initialPackagesFolderPath + "/").startsWith(oldFolderPath + "/")) {
                    const parsedFolderPath = oldFolderPath.split("/");
                    if (parsedFolderPath[0] === "") continue;
                    parsedFolderPath.pop();
                    parsedFolderPath.push(newFolderName);
    
                    const newFolderPath = parsedFolderPath.join("/");

                    initialPackagesFolderPath = initialPackagesFolderPath.replace(oldFolderPath, newFolderPath);
                }
            }
        }
        
        // check whether lazy initialization is enabled
        let isLazyInitializationEnabled = options.lazyInit !== undefined ? options.lazyInit : true;
        if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LazyInit"] !== undefined) {
            isLazyInitializationEnabled = element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "LazyInit"] === "true";
        }

        let lazyInitPlaceholderElementHeight : string | null = null;

        // if active code view is set based on command and lazy initialization is enabled,
        // get height for lazy initialization placeholder element
        if (activeCodeViewIdentifier !== null && isLazyInitializationEnabled) {
            activeCodeViewIdentifier === foldersManager.getNormalizedFolderPath(activeCodeViewIdentifier);
            
            // get min lines count
            let minLinesCount : number | null = options.minCodeViewLinesCount || null;
            if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "MinCodeViewLinesCount"] !== undefined) {
                minLinesCount = Number.parseInt(element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "MinCodeViewLinesCount"] || "");
                if (Number.isNaN(minLinesCount)) {
                    throw new Error("Min code view lines count option must be a number.");
                }
            }
            
            // try to get element height based on pre elements in code box
            for (let i = 0; i < element.children.length; i++) {
                const child = element.children[i];

                if (!(child instanceof HTMLPreElement)) continue;

                let folderPath = ProjectCodeBox.getFolderPathFromDataset(child.dataset);
                let fileName = ProjectCodeBox.getNameFromDataset(child.dataset) || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                let packageName = ProjectCodeBox.getPackageNameFromDataset(child.dataset);

                const identifier = foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (identifier === activeCodeViewIdentifier) {
                    const codeElement = CodeBox.getCodeElement(child);
                    if (!codeElement) continue;
                    let linesCount = CodeBox.getLinesCount(codeElement);
                    if (minLinesCount !== null && linesCount < minLinesCount) {
                        linesCount = minLinesCount;
                    }
                    const height = linesCount * CodeBox.getCodeViewLineHeight(child, options.defaultCodeViewOptions || {});
                    lazyInitPlaceholderElementHeight = `${height}${CodeBox.getCodeViewLineHeightUnit(child, options.defaultCodeViewOptions || {})}`;
                    break;
                }
            }

            // if element height could not be calculated based on pre element in code box, try to get from parent code box
            if (lazyInitPlaceholderElementHeight === null && parentCodeBox) {
                lazyInitPlaceholderElementHeight = parentCodeBox.getHeightForLazyInitPlaceholderElement(activeCodeViewIdentifier, minLinesCount, options.defaultCodeViewOptions || {});
            }
        }
        
        super(element, options, codeBoxBuilder, lazyInitPlaceholderElementHeight);

        this.fillProjectCodeBoxOptionsFromDataset(options, element.dataset);
        
        this.commands = commands;
        this.parentCodeBox = parentCodeBox;
        this.initialPackagesFolderPath = initialPackagesFolderPath;
        this.projectName = projectName;

        codeBoxBuilder.getFolderStructureHeadingElement().innerText = options.folderStructureHeading || GlobalConfig.DEFAULT_PROJECT_FOLDER_STRUCTURE_HEADING;
        codeBoxBuilder.getPackagesHeadingElement().innerText = options.packagesHeading || GlobalConfig.DEFAULT_PROJECT_PACKAGES_HEADING;

        this.panelToggle = new PanelToggle(
            codeBoxBuilder.getPanelElement(),
            codeBoxBuilder.getPanelOpenButtonElement(),
            codeBoxBuilder.getPanelContentElement(),
            options.openPanelButtonAriaLabel || GlobalConfig.DEFAULT_OPEN_PANEL_BUTTON_ARIA_LABEL,
            options.closePanelButtonAriaLabel || GlobalConfig.DEFAULT_CLOSE_PANEL_BUTTON_ARIA_LABEL,
            () => this.onPanelToggled());
        this.packagesSectionToggle = new PackagesSectionToggle(
            codeBoxBuilder.getPanelContentElement(),
            codeBoxBuilder.getHorizontalRule(),
            codeBoxBuilder.getPackagesHeadingElement(),
            codeBoxBuilder.getPackagesContainer()
        );
        this.foldersManager = foldersManager;

        if (options.openRootFolderOnInit !== undefined ? options.openRootFolderOnInit : true) {
            this.foldersManager.openFolder("/", false, false);
        }
        if (options.openPanelOnInit) {
            this.panelToggle.open();
        }

        this.openActiveCodeViewFolderOnInit = options.openActiveCodeViewFolderOnInit !== undefined ? options.openActiveCodeViewFolderOnInit : true;
        this.openActiveCodeViewPackageOnInit = options.openActiveCodeViewPackageOnInit !== undefined ? options.openActiveCodeViewPackageOnInit : true;
        this.preventActiveCodeViewFolderOpenOnInitIfPackage = options.preventActiveCodeViewFolderOpenOnInitIfPackage !== undefined ? options.preventActiveCodeViewFolderOpenOnInitIfPackage : false;
        this.closePanelOnCodeViewSelect = options.closePanelOnCodeViewSelect !== undefined ? options.closePanelOnCodeViewSelect : true;

        this.showCodeViewEventSource.subscribe((_, codeView) => this.onShowCodeView(codeView));

        if (!this.isLazyInitializationEnabled) this.init();
    }

    public addCodeView(identifier: string, codeView: CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.foldersManager.getCodeViewByIdentifier(identifier) !== null) return false;

        const parsedFolderPath = identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined || fileName.trim() === "") return false;

        const codeViewCopy = codeView.clone();
        
        return this._addCodeView(identifier, codeViewCopy);
    }

    /**
     * Adds new code view to code box without making copy of code view.
     * @param identifier Identifier under which the code view should be added to code box.
     * @param codeView Code view.
     * @returns Indicates whether code view has been successfully added.
     */
    private _addCodeView(identifier: string, codeView: CodeView) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.foldersManager.getCodeViewByIdentifier(identifier) !== null) return false;

        const parsedFolderPath = identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined || fileName.trim() === "") return false;
        
        const success = this.foldersManager.addCodeView(fileName, codeView, this.showCodeViewEventSource, parsedFolderPath.join("/"));
        if (!success) return false;

        identifier = this.foldersManager.getItemIdentifier(fileName, parsedFolderPath.join("/"));

        const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
        const codeBoxCodeView = new ProjectCodeBoxCodeView(identifier, codeView, this, codeBoxCodeViewManager);
        this.codeViewEntries.set(codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager));

        return true;
    }

    public getCodeViews() : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();
        this.codeViewEntries.forEach(entry => codeBoxCodeViews.push(entry.codeBoxCodeView));
        return codeBoxCodeViews;
    }

    /**
     * Returns code views in folder.
     * @param folderPath Folder path.
     * @param includeSubfolders Determines whether code views in subfolders should also be included.
     * @returns Code views.
     */
    public getCodeViewsByFolderPath(folderPath : string, includeSubfolders : boolean = false) : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInFolder(folderPath, includeSubfolders);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeBoxCodeViews.push(codeViewEntry.codeBoxCodeView);
        }

        return codeBoxCodeViews;
    }

    /**
     * Returns code views in package.
     * @param packageName Package name (null for default package).
     * @returns Code views.
     */
    public getCodeViewsByPackage(packageName : string | null) : ProjectCodeBoxCodeView[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInPackage(packageName);

        const codeBoxCodeViews = new Array<ProjectCodeBoxCodeView>();

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeBoxCodeViews.push(codeViewEntry.codeBoxCodeView);
        }

        return codeBoxCodeViews;
    }

    public getCodeView(identifier: string) : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    /**
     * Returns code view based on folder path and name.
     * @param folderPath Folder path.
     * @param fileName Name of code view.
     * @returns Code view (or null if code view wasn't found).
     */
    public getCodeViewByFolderPath(folderPath : string, fileName : string) : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByFolderPath(folderPath, fileName);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    /**
     * Returns code view based on package and name.
     * @param packageName Package name (null for default package).
     * @param fileName Name of code view.
     * @returns Code view (or null if code view wasn't found).
     */
    public getCodeViewByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByPackage(packageName, fileName);
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public removeCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        const success = this.foldersManager.removeCodeViewByIdentifier(identifier);
        if (!success) return false;

        if (this.getCurrentlyActiveCodeView() === codeView) {
            this.changeActiveCodeView(null);
        }
        codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();

        this.codeViewEntries.delete(codeView);

        return true;
    }

    public removeAllCodeViews() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const identifiers = new Array<string>();
        this.codeViewEntries.forEach(codeViewEntry => {
            const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
            if (identifier === null) return;
            identifiers.push(identifier);
        });

        for (let identifier of identifiers) {
            this.removeCodeView(identifier);
        }
    }

    /**
     * Changes identifier of code view in code box. (It can change folder path and name of code view but it never changes package of code view.)
     * @param identifier Identifier of code view whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other code view in code box, it returns false).
     */
    public changeCodeViewIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeCodeViewIdentifier(identifier, newIdentifier, this.showCodeViewEventSource);
        if (!success) return false;

        const codeView = this.foldersManager.getCodeViewByIdentifier(newIdentifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        codeViewEntry?.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        return true;
    }

    /**
     * Changes package of code view.
     * @param identifier Identifier of code view whose package should be changed.
     * @param packageName Package name (null for default package). If package does not exist, it is created.
     * @param keepFolderPath Determines whether code view should stay in the same folder (if false, code view can be moved to different folder based on package).
     * @returns Indicates whether change has been successfully completed.
     */
    public changeCodeViewPackage(identifier : string, packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (packageName !== null && packageName.trim() === "") return false;

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return false;

        let fileName = codeViewEntry.codeBoxCodeView.getFileName() || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
        let folderPath = keepFolderPath ? codeViewEntry.codeBoxCodeView.getFolderPath() : null;
        const newIdentifier = this.foldersManager.getItemIdentifier(fileName, folderPath, true, packageName !== "" ? packageName : null);

        if (codeViewEntry.codeBoxCodeView.getIdentifier() !== newIdentifier && this.foldersManager.getCodeViewByIdentifier(newIdentifier) !== null) return false;
        if (this.foldersManager.getCodeViewByPackage(packageName, fileName) !== null) return false;

        if (codeViewEntry.codeBoxCodeView.getIdentifier() === newIdentifier) {
            this.foldersManager.removeCodeViewByIdentifier(identifier);
        }

        let success = this.foldersManager.addCodeView(fileName, codeView, this.showCodeViewEventSource, folderPath, true, packageName !== "" ? packageName : null);
        if (!success) return false;

        if (codeViewEntry.codeBoxCodeView.getIdentifier() !== newIdentifier) {
            this.foldersManager.removeCodeViewByIdentifier(identifier);
        }

        if (codeView === this.getCurrentlyActiveCodeView()) {
            this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(newIdentifier);
        }

        codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);

        if (this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.show();
        } else {
            this.packagesSectionToggle.hide();
        }

        return true;
    }

    /**
     * Removes code view from package.
     * @param identifier Identifier of code view that should be removed from package.
     * @returns Indicates whether code view has been successfully removed from package.
     */
    public removeCodeViewPackage(identifier : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.removeCodeViewPackage(identifier);
    }

    /**
     * Returns package of code view.
     * @param identifier Identifier of code view.
     * @returns Package of code view. If null is returned, code view belongs to default package. If undefined is returned, code view doesn't belong to any package or does not event exist.
     */
    public getCodeViewPackage(identifier : string) : string | null | undefined {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getCodeViewPackage(identifier);
    }

    public setActiveCodeView(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.foldersManager.getCodeViewByIdentifier(identifier);
        if (!codeView) return false;

        this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
        this.changeActiveCodeView(codeView);

        return true;
    }

    public setNoActiveCodeView() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.setNoCodeViewButtonAsActive();
        this.changeActiveCodeView(null);
    }

    public getActiveCodeView() : ProjectCodeBoxCodeView | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeView = this.getCurrentlyActiveCodeView();
        if (!codeView) return null;

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return null;

        return codeViewEntry.codeBoxCodeView;
    }

    public addFile(identifier: string, downloadLink: string | null = null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (this.foldersManager.getFileByIdentifier(identifier) !== null) return false;

        const parsedFolderPath = identifier.split("/");
        const fileName = parsedFolderPath.pop();
        if (fileName === undefined || fileName.trim() === "") return false;

        const codeBoxFileManager = new CodeBoxFileManager();
        const codeBoxFile = new ProjectCodeBoxFile(identifier, downloadLink, this, codeBoxFileManager);

        const success = this.foldersManager.addFile(fileName, codeBoxFile, parsedFolderPath.join("/"));
        if (!success) return false;

        identifier = this.foldersManager.getItemIdentifier(fileName, parsedFolderPath.join("/"));

        this.fileEntries.set(codeBoxFile, new FileEntry(codeBoxFileManager));

        return true;
    }

    public getFiles() : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFiles = new Array<ProjectCodeBoxFile>();
        this.fileEntries.forEach((_, codeBoxFile) => codeBoxFiles.push(codeBoxFile));
        return codeBoxFiles;
    }

    /**
     * Returns files in folder.
     * @param folderPath Folder path.
     * @param includeSubfolders Determines whether files in subfolders should also be included.
     * @returns Files.
     */
    public getFilesByFolderPath(folderPath : string, includeSubfolders : boolean = false) : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilesInFolder(folderPath, includeSubfolders);
    }

    /**
     * Returns files in package.
     * @param packageName Package name (null for default package).
     * @returns Files.
     */
    public getFilesByPackage(packageName : string | null) : ProjectCodeBoxFile[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilesInPackage(packageName);
    }

    public getFile(identifier: string) : ProjectCodeBoxFile | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByIdentifier(identifier);
    }

    /**
     * Returns file based on folder path and name.
     * @param folderPath Folder path.
     * @param fileName Name of file.
     * @returns File (or null if file wasn't found).
     */
    public getFileByFolderPath(folderPath : string, fileName : string) : ProjectCodeBoxFile | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByFolderPath(folderPath, fileName);
    }

    /**
     * Returns file based on package and name.
     * @param packageName Package name (null for default package).
     * @param fileName Name of file.
     * @returns File (or null if file wasn't found).
     */
    public getFileByPackage(packageName : string | null, fileName : string) : ProjectCodeBoxFile | null { // null pro defaultní package
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFileByPackage(packageName, fileName);
    }

    public removeFile(identifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        if (!fileEntry) return false;

        const success = this.foldersManager.removeFileByIdentifier(identifier);
        if (!success) return false;

        fileEntry.codeBoxFileManager.unlinkCodeBox();

        this.fileEntries.delete(codeBoxFile);

        return true;
    }

    public removeAllFiles() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const identifiers = new Array<string>();
        this.fileEntries.forEach((_, codeBoxFile) => {
            const identifier = codeBoxFile.getIdentifier();
            if (identifier === null) return;
            identifiers.push(identifier);
        });

        for (let identifier of identifiers) {
            this.removeFile(identifier);
        }
    }

    /**
     * Changes identifier of file in code box. (It can change folder path and name of file but it never changes package of file.)
     * @param identifier Indentifier of file whose identifier should be changed.
     * @param newIdentifier New identifier.
     * @returns Indicates whether change has been successfully completed (if passed new identifier already belongs to some other file in code box, it returns false).
     */
    public changeFileIdentifier(identifier: string, newIdentifier: string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeFileIdentifier(identifier, newIdentifier);
        if (!success) return false;

        const codeBoxFile = this.foldersManager.getFileByIdentifier(newIdentifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        fileEntry?.codeBoxFileManager.changeIdentifier(newIdentifier);

        return true;
    }

    /**
     * Changes package of file.
     * @param identifier Identifier of file whose package should be changed.
     * @param packageName Package name (null for default package). If package does not exist, it is created.
     * @param keepFolderPath Determines whether file should stay in the same folder (if false, file can be moved to different folder based on package).
     * @returns Indicates whether change has been successfully completed.
     */
    public changeFilePackage(identifier : string, packageName : string | null, keepFolderPath : boolean) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (packageName !== null && packageName.trim() === "") return false;

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        if (!fileEntry) return false;

        let fileName = codeBoxFile.getFileName() || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT;
        let folderPath = keepFolderPath ? codeBoxFile.getFolderPath() : null;
        const newIdentifier = this.foldersManager.getItemIdentifier(fileName, folderPath, true, packageName !== "" ? packageName : null);

        if (codeBoxFile.getIdentifier() !== newIdentifier && this.foldersManager.getFileByIdentifier(newIdentifier) !== null) return false;
        if (this.foldersManager.getFileByPackage(packageName, fileName) !== null) return false;

        if (codeBoxFile.getIdentifier() === newIdentifier) {
            this.foldersManager.removeFileByIdentifier(identifier);
        }

        let success = this.foldersManager.addFile(fileName, codeBoxFile, folderPath, true, packageName !== "" ? packageName : null);
        if (!success) return false;

        if (codeBoxFile.getIdentifier() !== newIdentifier) {
            this.foldersManager.removeFileByIdentifier(identifier);
        }

        fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);

        if (this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.show();
        } else {
            this.packagesSectionToggle.hide();
        }

        return true;
    }

    /**
     * Removes file from package.
     * @param identifier Identifier of file that should be removed from package.
     * @returns Indicates whether file has been successfully removed from package.
     */
    public removeFilePackage(identifier : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.removeFilePackage(identifier);
    }

    /**
     * Returns package of file.
     * @param identifier Identifier of file.
     * @returns Package of file. If null is returned, file belongs to default package. If undefined is returned, file doesn't belong to any package or does not even exist.
     */
    public getFilePackage(identifier : string) : string | null | undefined {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getFilePackage(identifier);
    }

    public changeFileDownloadLink(identifier: string, newDownloadLink: string | null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const success = this.foldersManager.changeFileDownloadLinkByIdentifier(identifier, newDownloadLink);
        if (!success) return false;

        const codeBoxFile = this.foldersManager.getFileByIdentifier(identifier);
        if (!codeBoxFile) return false;

        const fileEntry = this.fileEntries.get(codeBoxFile);
        fileEntry?.codeBoxFileManager.changeDownloadLink(newDownloadLink);

        return true;
    }

    /**
     * Creates new folder(s) (if not created yet).
     * @param folderPath Folder path.
     */
    public addFolder(folderPath : string) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.addFolder(folderPath);
    }

    /**
     * Removes folder and all its contents. This might also remove packages if their folders are removed (if generation of folders for packages is enabled via createFoldersForPackages option).
     * @param folderPath Path to folder that should be removed.
     * @returns Indicates whether folder has been successfully removed.
     */
    public removeFolder(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const codeViews = this.foldersManager.getCodeViewsInFolder(folderPath, true);
        const codeBoxFiles = this.foldersManager.getFilesInFolder(folderPath, true);

        const success = this.foldersManager.removeFolder(folderPath);
        if (!success) return false;

        const activeCodeView = this.getCurrentlyActiveCodeView();

        for (let codeView of codeViews) {
            if (codeView === activeCodeView) {
                this.changeActiveCodeView(null);
            }

            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;            

            codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
            this.codeViewEntries.delete(codeView);
        }

        for (let codeBoxFile of codeBoxFiles) {
            const fileEntry = this.fileEntries.get(codeBoxFile);
            if (!fileEntry) continue;

            fileEntry.codeBoxFileManager.unlinkCodeBox();
            this.fileEntries.delete(codeBoxFile);
        }

        if (!this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.hide();
        }

        return true;
    }

    /**
     * Renames folder. This can also change (rename) folder for packages and rename packages.
     * @param folderPath Path to folder that should be renamed.
     * @param newName New name for folder.
     * @returns Indicates whether folder has been successfully renamed.
     */
    public renameFolder(folderPath : string, newName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const newFolderPath = this.foldersManager.renameFolder(folderPath, newName);
        if (newFolderPath === null) return false;

        folderPath = this.foldersManager.getNormalizedFolderPath(folderPath);
        
        const codeViews = this.foldersManager.getCodeViewsInFolder(newFolderPath, true);
        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;

            const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
            if (identifier === null) continue;

            const newIdentifier = identifier.replace(folderPath, newFolderPath);

            codeViewEntry.codeBoxCodeViewManager.changeIdentifier(newIdentifier);
        }

        const codeBoxFiles = this.foldersManager.getFilesInFolder(newFolderPath, true);
        for (let codeBoxFile of codeBoxFiles) {
            const fileEntry = this.fileEntries.get(codeBoxFile);
            if (!fileEntry) continue;

            const identifier = codeBoxFile.getIdentifier();
            if (identifier === null) continue;

            const newIdentifier = identifier.replace(folderPath, newFolderPath);

            fileEntry.codeBoxFileManager.changeIdentifier(newIdentifier);
        }

        return true;
    }

    /**
     * Opens folder.
     * @param folderPath Path to folder that should be opened.
     * @param openParentFolders Determines whether parent folders should also be opened.
     * @param animate Determines whether animation should be used.
     */
    public openFolder(folderPath : string, openParentFolders : boolean = false, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.openFolder(folderPath, openParentFolders, animate);
    }

    /**
     * Closes folder.
     * @param folderPath Path to folder that should be closed.
     * @param closeChildFolders Determines whether subfolders should be closed too.
     * @param animate Determines whether animation should be used.
     */
    public closeFolder(folderPath : string, closeChildFolders : boolean = false, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.closeFolder(folderPath, closeChildFolders, animate);
    }

    /**
     * Checks whether folder exists.
     * @param folderPath Path to folder.
     * @returns Indicates whether folder exists.
     */
    public folderExists(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.folderExists(folderPath);
    }

    /**
     * Checks whether folder is opened.
     * @param folderPath Path to folder.
     * @returns Indicates whether folder is opened (false might also be returned if folder does not exist).
     */
    public isFolderOpened(folderPath : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.isFolderOpened(folderPath);
    }

    /**
     * Returns names of folder subfolders (only direct subfolders).
     * @param folderPath Path to folder.
     * @returns Names of subfolders or null if folder does not exist.
     */
    public getSubfolderNames(folderPath : string) : string[] | null {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getSubfolderNames(folderPath);
    }

    /**
     * Creates new package (if it does not exist yet).
     * @param name Name of package.
     */
    public addPackage(name : string) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.addPackage(name);

        if (this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.show();
        } else {
            this.packagesSectionToggle.hide();
        }
    }

    /**
     * Removes package.
     * @param name Package name.
     * @param removePackageFoldersAndContents Determines whether package folder and its contents should be removed.
     * @param removeAllCodeViewsAndFiles Determines whether all code views and files in package should be removed.
     * @returns Indicates whether package has been successfully removed.
     */
    public removePackage(name : string, removePackageFoldersAndContents : boolean = true, removeAllCodeViewsAndFiles : boolean = false) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        const activeCodeView = this.getCurrentlyActiveCodeView();

        if (this.foldersManager.isCreateFoldersForPackagesEnabled() && removePackageFoldersAndContents) {
            const packageFolderPath = this.foldersManager.getFolderPathToRemovePackage(name);
            if (packageFolderPath !== null) {
                if (removeAllCodeViewsAndFiles) {
                    const success = this.foldersManager.removePackage(name, true);
                    if (!success) return false;
                }
                const success = this.removeFolder(packageFolderPath);

                if (success) {
                    if (this.foldersManager.hasPackages()) {
                        this.packagesSectionToggle.show();
                    } else {
                        this.packagesSectionToggle.hide();
                    }
                }

                return success;
            } else {
                const codeViews = this.foldersManager.getCodeViewsInPackage(name);
                const codeBoxFiles = this.foldersManager.getFilesInPackage(name);

                for (let codeView of codeViews) {
                    const codeViewEntry = this.codeViewEntries.get(codeView);
                    if (!codeViewEntry) continue;
                    const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
                    if (identifier === null) continue;
                    this.foldersManager.removeCodeViewByIdentifier(identifier);
                    codeViewEntry.codeBoxCodeViewManager.unlinkCodeBox();
                    this.codeViewEntries.delete(codeView);

                    if (codeView === activeCodeView) {
                        this.changeActiveCodeView(null);
                    }
                }
                for (let codeBoxFile of codeBoxFiles) {
                    const fileEntry = this.fileEntries.get(codeBoxFile);
                    if (!fileEntry) continue;
                    const identifier = codeBoxFile.getIdentifier();
                    if (identifier === null) continue;
                    this.foldersManager.removeFileByIdentifier(identifier);
                    fileEntry.codeBoxFileManager.unlinkCodeBox();
                    this.fileEntries.delete(codeBoxFile);
                }

                const success = this.foldersManager.removePackage(name, removeAllCodeViewsAndFiles);

                if (success) {
                    if (this.foldersManager.hasPackages()) {
                        this.packagesSectionToggle.show();
                    } else {
                        this.packagesSectionToggle.hide();
                    }
                }

                return success;
            }
        } else {
            if (removeAllCodeViewsAndFiles) {
                let codeViews = this.foldersManager.getCodeViewsInPackage(name);
                let codeBoxFiles = this.foldersManager.getFilesInPackage(name);

                const success = this.foldersManager.removePackage(name, true);
                if (!success) return false;

                for (let codeView of codeViews) {
                    const codeViewEntry = this.codeViewEntries.get(codeView);
                    codeViewEntry?.codeBoxCodeViewManager.unlinkCodeBox();
                    this.codeViewEntries.delete(codeView);

                    if (codeView === activeCodeView) {
                        this.changeActiveCodeView(null);
                    }
                }
                for (let codeBoxFile of codeBoxFiles) {
                    const fileEntry = this.fileEntries.get(codeBoxFile);
                    fileEntry?.codeBoxFileManager.unlinkCodeBox();
                    this.fileEntries.delete(codeBoxFile);
                }

                if (this.foldersManager.hasPackages()) {
                    this.packagesSectionToggle.show();
                } else {
                    this.packagesSectionToggle.hide();
                }

                return true;
            } else {
                const success =  this.foldersManager.removePackage(name);

                if (success) {
                    if (this.foldersManager.hasPackages()) {
                        this.packagesSectionToggle.show();
                    } else {
                        this.packagesSectionToggle.hide();
                    }
                }

                return success;
            }
        }

    }

    /**
     * Renames package. This can also rename folders for package if generation of folders is enabled via createFoldersForPackages option.
     * @param name Current package name.
     * @param newName New package name.
     * @returns Indicates whether package has been successfully renamed.
     */
    public renamePackage(name : string, newName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (!this.foldersManager.packageExists(name)) return false;
        if (this.foldersManager.packageExists(newName)) return false;

        const codeViews = this.foldersManager.getCodeViewsInPackage(name);
        const codeBoxFiles = this.foldersManager.getFilesInPackage(name);

        const packageFolderPath = this.foldersManager.getPackageFolderPath(name);

        const success = this.foldersManager.addPackage(newName);
        if (!success) return false;
        if (this.foldersManager.isPackageFolderOpened(name)) {
            this.foldersManager.openPackage(newName, false);
        }

        for (let codeView of codeViews) {
            const codeViewEntry = this.codeViewEntries.get(codeView);
            if (!codeViewEntry) continue;
            codeViewEntry.codeBoxCodeView.changePackage(newName, codeViewEntry.codeBoxCodeView.getFolderPath() !== packageFolderPath);
        }
        for (let codeBoxFile of codeBoxFiles) {
            codeBoxFile.changePackage(newName, codeBoxFile.getFolderPath() !== packageFolderPath);
        }

        this.removePackage(name, true);

        return true;
    }

    /**
     * Opens package.
     * @param packageName Package name (null for default package).
     * @param animate Determines whether animation should be used.
     */
    public openPackage(packageName : string | null, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.openPackage(packageName, animate);
    }

    /**
     * Closes package.
     * @param packageName Package name (null for default package).
     * @param animate Determines whether animation should be used.
     */
    public closePackage(packageName : string | null, animate : boolean = true) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.foldersManager.closePackage(packageName, animate);
    }

    /**
     * Checks whether package exists.
     * @param packageName Package name.
     * @returns Indicates whether package exists.
     */
    public packageExists(packageName : string) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.packageExists(packageName);
    }

    /**
     * Checks whether package is opened.
     * @param packageName Package name.
     * @returns Indicates whether package is opened (false might also be returned if package does not exist).
     */
    public isPackageOpened(packageName : string | null) : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.isPackageFolderOpened(packageName);
    }

    /**
     * Returns all packages.
     * @returns Packages.
     */
    public getPackages() : string[] {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getPackageNames();
    }

    /**
     * Returns path to folder that is currently used for packages.
     * @returns Path to folder that is currently used for packages.
     */
    public getPackagesFolderPath() : string {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.foldersManager.getPackagesFolderPath();
    }

    /**
     * Sets new folder path for packages and removes all code views, files, folders and packages (everything needs to be removed, when folder path for packages is changed).
     * @param newPackagesFolderPath New folder path for packages.
     */
    public changePackagesFolderPathAndRemoveAll(newPackagesFolderPath : string) : void {
        this.removeAllCodeViews();
        this.removeAllFiles();

        const folderNames = this.getSubfolderNames("/");
        if (folderNames) {
            for (let folderName of folderNames) {
                this.removeFolder(folderName);
            }
        }

        const packageNames = this.getPackages();
        for (let packageName of packageNames) {
            this.removePackage(packageName, false, false);
        }

        this.foldersManager.setPackagesFolderPath(newPackagesFolderPath);
    }

    /**
     * Returns project name.
     * @returns Project name.
     */
    public getProjectName() : string {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.projectName;
    }

    /**
     * Sets new project name.
     * @param newName New project name.
     */
    public setProjectName(newName : string) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.projectName = newName;
        this.foldersManager.setRootFolderName(this.projectName);
    }

    /**
     * Opens panel.
     */
    public openPanel() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.panelToggle.open();
    }

    /**
     * Closes panel.
     */
    public closePanel() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        this.panelToggle.close();
    }

    /**
     * Checks whether panel is opened.
     * @returns Indicates whether panel is opened.
     */
    public isPanelOpened() : boolean {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.panelToggle.isOpened();
    }

    public reset() : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        if (!this.initialMemento) return;
        this.applyMemento(this.initialMemento);
    }

    public createMemento() : CodeBoxMemento {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        return this.createProjectCodeBoxMemento();
    }

    public applyMemento(memento: CodeBoxMemento) : void {
        if (!this.isInitialized()) throw new Error(CodeBox.CODE_BOX_NOT_INITIALIZED_ERROR);

        memento.apply(this);
    }

    protected onInit(codeBoxItemInfos: CodeBoxItemInfo[]) : void {
        for (let codeBoxItemInfo of codeBoxItemInfos) {
            if (codeBoxItemInfo.type === "CodeViewInfo" && codeBoxItemInfo.codeViewInfo) {
                let codeViewInfo = codeBoxItemInfo.codeViewInfo;

                let folderPath = ProjectCodeBox.getFolderPathFromDataset(codeViewInfo.dataset);
                let fileName = ProjectCodeBox.getNameFromDataset(codeViewInfo.dataset) || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                let packageName = ProjectCodeBox.getPackageNameFromDataset(codeViewInfo.dataset);
                let isActive = codeViewInfo.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Active"] !== undefined;

                const identifier = this.foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                const success = this.foldersManager.addCodeView(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (!success) {
                    if (!isActive) continue;

                    // active code view takes precedence over others (other code views with the same identifier are removed)
                    let activeCodeView = this.foldersManager.getCodeViewByIdentifier(identifier);
                    const success = this.foldersManager.removeCodeViewByIdentifier(identifier);
                    if (!success && packageName !== null) {
                        activeCodeView = this.foldersManager.getCodeViewByPackage(packageName !== "" ? packageName : null, fileName);
                        this.foldersManager.removeCodeViewByPackage(packageName !== "" ? packageName : null, fileName);
                    }
                    if (activeCodeView) {
                        this.codeViewEntries.delete(activeCodeView);
                    }
                    this.foldersManager.addCodeView(fileName, codeViewInfo.codeView, this.showCodeViewEventSource, folderPath, packageName !== null, packageName !== "" ? packageName : null);
                }

                const codeBoxCodeViewManager = new CodeBoxCodeViewManager();
                const codeBoxCodeView = new ProjectCodeBoxCodeView(identifier, codeViewInfo.codeView, this, codeBoxCodeViewManager);
                this.codeViewEntries.set(codeViewInfo.codeView, new CodeViewEntry(codeBoxCodeView, codeBoxCodeViewManager));

                if (isActive) {
                    this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
                }
            } else if (codeBoxItemInfo.type === "FileInfo" && codeBoxItemInfo.fileInfo) {
                let fileInfo = codeBoxItemInfo.fileInfo;

                let folderPath = ProjectCodeBox.getFolderPathFromDataset(fileInfo.dataset);
                let fileName = ProjectCodeBox.getNameFromDataset(fileInfo.dataset) || GlobalConfig.DEFAULT_FILE_BUTTON_TEXT;
                let packageName = ProjectCodeBox.getPackageNameFromDataset(fileInfo.dataset);

                const identifier = this.foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                const codeBoxFileManager = new CodeBoxFileManager();
                const codeBoxFile = new ProjectCodeBoxFile(identifier, fileInfo.downloadLink, this, codeBoxFileManager);

                const success = this.foldersManager.addFile(fileName, codeBoxFile, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (!success) continue;

                this.fileEntries.set(codeBoxFile, new FileEntry(codeBoxFileManager));
            } else if (codeBoxItemInfo.type === "HTMLElement" && codeBoxItemInfo.element) {
                const element = codeBoxItemInfo.element;

                if (element.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folders"] !== undefined) {
                    this.createFolderStructure(element);
                }
            }
        }

        if (this.foldersManager.hasPackages()) {
            this.packagesSectionToggle.show();
        } else {
            this.packagesSectionToggle.hide();
        }
    }

    protected onAfterInit() : void {
        if (this.parentCodeBox) {
            if (!this.parentCodeBox.isInitialized()) {
                this.parentCodeBox.init();
            }

            if (this.parentCodeBox.initialMemento) {
                this.parentCodeBox.initialMemento.applyToInherit(this);
            }
        }

        if (this.commands === null) return;
        this.processCommands(this.commands);
        this.commands = null;

        // potentionally open active code view folder and package based on options
        const activeCodeView = this.getCurrentlyActiveCodeView();
        if (activeCodeView) {
            const codeViewEntry = this.codeViewEntries.get(activeCodeView);
            if (codeViewEntry) {
                const packageName = codeViewEntry.codeBoxCodeView.getPackage();
                if (this.openActiveCodeViewFolderOnInit && (packageName === undefined || !this.preventActiveCodeViewFolderOpenOnInitIfPackage)) {
                    const folderPath = (codeViewEntry.codeBoxCodeView.getIdentifier() || "").split("/");
                    folderPath.pop();
                    this.foldersManager.openFolder(folderPath.join("/"), true, false);
                }
                if (this.openActiveCodeViewPackageOnInit && packageName !== undefined) {
                    this.foldersManager.openPackage(packageName, false);
                }
            }
        }

        this.initialMemento = this.createProjectCodeBoxMemento();
    }

    /**
     * Creates project code box memento.
     * @returns Project code box memento.
     */
    private createProjectCodeBoxMemento() : ProjectCodeBoxMemento {
        const codeViewMementoEntries = new Array<ProjectCodeBoxCodeViewMementoEntry>();
        const fileMementoEntries = new Array<ProjectCodeBoxFileMementoEntry>();

        this.codeViewEntries.forEach((codeViewEntry, codeView) => {
            const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
            if (identifier === null) return;
            codeViewMementoEntries.push({
                codeView: codeView,
                codeViewMemento: codeView.createMemento(),
                identifier: identifier,
                package: codeViewEntry.codeBoxCodeView.getPackage()
            });
        });
        this.fileEntries.forEach((_, codeBoxFile) => {
            const identifier = codeBoxFile.getIdentifier();
            if (identifier === null) return;
            fileMementoEntries.push({
                downloadLink: codeBoxFile.getDownloadLink(),
                identifier: identifier,
                package: codeBoxFile.getPackage()
            });
        });

        return new ProjectCodeBoxMemento(
            this,
            (identifier, codeView) => this._addCodeView(identifier, codeView),
            codeViewMementoEntries,
            fileMementoEntries,
            this.getCurrentlyActiveCodeView(),
            this.foldersManager.getFolderStructure(),
            this.foldersManager.getPackageInfos(),
            this.foldersManager.getPackagesFolderPath(),
            this.getProjectName(),
            this.isPanelOpened(),
            this.isFolderOpened("/")
        );
    }

    /**
     * Called by folders manager when code view is selected.
     * @param codeView Code view that should be set as active.
     */
    private onShowCodeView(codeView : CodeView) : void {
        this.changeActiveCodeView(codeView);

        if (this.closePanelOnCodeViewSelect) {
            this.panelToggle.close();
        }

        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;
        const identifier = codeViewEntry.codeBoxCodeView.getIdentifier();
        if (identifier === null) return;
        this.foldersManager.setCodeViewButtonsAsActiveByIdentifier(identifier);
    }

    /**
     * Called when panel is opened/closed.
     */
    private onPanelToggled() : void {
        this.foldersManager.updateTabNavigation(this.panelToggle.isOpened());
    }

    /**
     * Creates folders based on element with folder structure configuration.
     * @param element Element with folder structure configuration.
     * @param parentFolderNames Parent folder names (should not be passed, it is used internally).
     */
    private createFolderStructure(element : HTMLElement, parentFolderNames : string[] = []) {
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];

            if (!(child instanceof HTMLElement)) continue;

            let folderName : string | null = null;
            let childElement : HTMLElement | null = null;

            child.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
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

                this.foldersManager.addFolder(folderPath);

                if (child.dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Opened"] !== undefined) {
                    this.foldersManager.openFolder(folderPath, false, false);
                }

                if (childElement) {
                    this.createFolderStructure(childElement, folderNames);
                }
            }
        }
    }

    /**
     * Processes array of commands obtained from script of type application/json.
     * @param commands Commands.
     */
    private processCommands(commands : Array<any>) : void {
        for (let command of commands) {
            if (typeof command !== "object") continue;
            
            switch (command.command) {
                case ProjectCodeBox.COMMAND_RENAME_PROJECT:
                    this.processRenameProjectCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_ADD_FOLDER:
                    this.processAddFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_FOLDER:
                    this.processRemoveFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_RENAME_FOLDER:
                    this.processRenameFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_OPEN_FOLDER:
                    this.processOpenFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_CLOSE_FOLDER:
                    this.processCloseFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_ADD_PACKAGE:
                    this.processAddPackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_PACKAGE:
                    this.processRemovePackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_RENAME_PACKAGE:
                    this.processRenamePackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_OPEN_PACKAGE:
                    this.processOpenPackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_CLOSE_PACKAGE:
                    this.processClosePackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_CODE_VIEW:
                    this.processRemoveCodeViewCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_RENAME_CODE_VIEW:
                    this.processRenameCodeViewCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_MOVE_CODE_VIEW_TO_FOLDER:
                    this.processMoveCodeViewToFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_CHANGE_CODE_VIEW_PACKAGE:
                    this.processChangeCodeViewPackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_CODE_VIEW_PACKAGE:
                    this.processRemoveCodeViewPackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_ALL_CODE_VIEWS:
                    this.removeAllCodeViews();
                    break;
                case ProjectCodeBox.COMMAND_ADD_CODE_VIEW_HIGHLIGHT:
                    this.processAddCodeViewHighlightCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_CODE_VIEW_HIGHLIGHT:
                    this.processRemoveCodeViewHighlightCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_SET_ACTIVE_CODE_VIEW:
                    this.processSetActiveCodeViewCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_SET_NO_ACTIVE_CODE_VIEW:
                    this.setNoActiveCodeView();
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_FILE:
                    this.processRemoveFileCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_RENAME_FILE:
                    this.processRenameFileCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_MOVE_FILE_TO_FOLDER:
                    this.processMoveFileToFolderCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_CHANGE_FILE_PACKAGE:
                    this.processChangeFilePackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_FILE_PACKAGE:
                    this.processRemoveFilePackageCommand(command);
                    break;
                case ProjectCodeBox.COMMAND_REMOVE_ALL_FILES:
                    this.removeAllFiles();
                    break;
            }
        }
    }

    private processRenameProjectCommand(command : any) : void {
        if (typeof command.name !== "string") return;
        this.setProjectName(command.name);
    }

    private processAddFolderCommand(command : any) : void {
        if (typeof command.folderPath !== "string") return;
        this.addFolder(command.folderPath);
    }

    private processRemoveFolderCommand(command : any) : void {
        if (typeof command.folderPath !== "string") return;
        this.removeFolder(command.folderPath);
    }

    private processRenameFolderCommand(command : any) : void {
        if (typeof command.folderPath !== "string") return;
        if (typeof command.newName !== "string") return;
        this.renameFolder(command.folderPath, command.newName);
    }

    private processOpenFolderCommand(command : any) : void {
        if (typeof command.folderPath !== "string") return;
        if ((typeof command.openParentFolders !== "undefined") && (typeof command.openParentFolders !== "boolean")) return;
        let openParentFolders = command.openParentFolders === undefined ? false : command.openParentFolders;
        this.openFolder(command.folderPath, openParentFolders, false);
    }

    private processCloseFolderCommand(command : any) : void {
        if (typeof command.folderPath !== "string") return;
        if ((typeof command.closeChildFolders !== "undefined") && (typeof command.closeChildFolders !== "boolean")) return;
        let closeChildFolders = command.closeChildFolders === undefined ? false : command.closeChildFolders;
        this.closeFolder(command.folderPath, closeChildFolders);
    }

    private processAddPackageCommand(command : any) : void {
        if (typeof command.name !== "string") return;
        this.addPackage(command.name);
    }

    private processRemovePackageCommand(command : any) : void {
        if (typeof command.name !== "string") return;
        if ((typeof command.removePackageFoldersAndContents !== "undefined") && (typeof command.removePackageFoldersAndContents !== "boolean")) return;
        if ((typeof command.removeAllCodeViewsAndFiles !== "undefined") && (typeof command.removeAllCodeViewsAndFiles !== "boolean")) return;
        let removePackageFoldersAndContents = command.removePackageFoldersAndContents === undefined ? true : command.removePackageFoldersAndContents;
        let removeAllCodeViewsAndFiles = command.removeAllCodeViewsAndFiles === undefined ? false : command.removeAllCodeViewsAndFiles;
        this.removePackage(command.name, removePackageFoldersAndContents, removeAllCodeViewsAndFiles);
    }

    private processRenamePackageCommand(command : any) : void {
        if (typeof command.name !== "string") return;
        if (typeof command.newName !== "string") return;
        this.renamePackage(command.name, command.newName);
    }

    private processOpenPackageCommand(command : any) : void {
        if ((typeof command.name !== "string") && command.name !== null && (typeof command.name !== "undefined")) return;
        let name = (typeof command.name === "undefined") ? null : command.name;
        this.openPackage(name, false);
    }

    private processClosePackageCommand(command : any) : void {
        if ((typeof command.name !== "string") && command.name !== null && (typeof command.name !== "undefined")) return;
        let name = (typeof command.name === "undefined") ? null : command.name;
        this.closePackage(name, false);
    }

    private processRemoveCodeViewCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        this.removeCodeView(command.identifier);
    }

    private processRenameCodeViewCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.newName !== "string") return;
        const codeView = this.foldersManager.getCodeViewByIdentifier(command.identifier);
        if (!codeView) return;
        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;
        codeViewEntry.codeBoxCodeView.changeFileName(command.newName);
    }

    private processMoveCodeViewToFolderCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.folderPath !== "string") return;
        const codeView = this.foldersManager.getCodeViewByIdentifier(command.identifier);
        if (!codeView) return;
        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;
        codeViewEntry.codeBoxCodeView.moveToFolder(command.folderPath);
    }

    private processChangeCodeViewPackageCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.keepFolderPath !== "boolean") return;
        if ((typeof command.packageName !== "string") && command.packageName !== null && (typeof command.packageName !== "undefined")) return;
        let packageName = (typeof command.packageName === "undefined") ? null : command.packageName;
        this.changeCodeViewPackage(command.identifier, packageName, command.keepFolderPath);
    }

    private processRemoveCodeViewPackageCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        this.removeCodeViewPackage(command.identifier);
    }

    private processAddCodeViewHighlightCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.start !== "number") return;
        if ((typeof command.end !== "number") && command.end !== undefined) return;
        const codeView = this.foldersManager.getCodeViewByIdentifier(command.identifier);
        if (!codeView) return;
        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;
        if (command.end !== undefined) {
            codeViewEntry.codeBoxCodeView.addHighlight(command.start, command.end);
        } else {
            codeViewEntry.codeBoxCodeView.addHighlight(command.start);
        }
    }

    private processRemoveCodeViewHighlightCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if ((typeof command.start !== "number") && command.start !== undefined) return;
        if ((typeof command.end !== "number") && command.end !== undefined) return;

        const codeView = this.foldersManager.getCodeViewByIdentifier(command.identifier);
        if (!codeView) return;
        const codeViewEntry = this.codeViewEntries.get(codeView);
        if (!codeViewEntry) return;

        if (command.start !== undefined && command.end !== undefined) {
            codeViewEntry.codeBoxCodeView.removeHighlights(command.start, command.end);
        } else if (command.start !== undefined) {
            codeViewEntry.codeBoxCodeView.removeHighlights(command.start);
        } else {
            codeViewEntry.codeBoxCodeView.removeHighlights();
        }
    }

    private processSetActiveCodeViewCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        this.setActiveCodeView(command.identifier);
    }

    private processRemoveFileCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        this.removeFile(command.identifier);
    }

    private processRenameFileCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.newName !== "string") return;
        const codeBoxFile = this.foldersManager.getFileByIdentifier(command.identifier);
        if (!codeBoxFile) return;
        codeBoxFile.changeFileName(command.newName);
    }

    private processMoveFileToFolderCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.folderPath !== "string") return;
        const codeBoxFile = this.foldersManager.getFileByIdentifier(command.identifier);
        if (!codeBoxFile) return;
        codeBoxFile.moveToFolder(command.folderPath);
    }

    private processChangeFilePackageCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        if (typeof command.keepFolderPath !== "boolean") return;
        if ((typeof command.packageName !== "string") && command.packageName !== null && (typeof command.packageName !== "undefined")) return;
        let packageName = (typeof command.packageName === "undefined") ? null : command.packageName;
        this.changeFilePackage(command.identifier, packageName, command.keepFolderPath);
    }

    private processRemoveFilePackageCommand(command : any) : void {
        if (typeof command.identifier !== "string") return;
        this.removeFilePackage(command.identifier);
    }

    /**
     * Returns height for lazy initialization placeholder element based on passed code view identifier.
     * @param codeViewIdentifier Identifier of code view for which should be obtained height for lazy initialization placeholder element.
     * @param minLinesCount Minimum number of lines.
     * @param defaultCodeViewOptions Default code view options.
     * @returns Height for lazy initialization placeholder element or null if height could not be obtained.
     */
    private getHeightForLazyInitPlaceholderElement(codeViewIdentifier : string, minLinesCount : number | null, defaultCodeViewOptions : CodeViewOptions) : string | null {
        if (this.isInitialized()) {
            return this.initialMemento ? this.initialMemento.getCodeViewHeightByIdentifier(codeViewIdentifier, minLinesCount) : null;
        } else {
            // if code box is not initialized yet, height is obtained differently (this method might return wrong height for placeholder element, if user sets active code view that does not longer exists)

            const preElements = this.getPreElementsBeforeInitialization();
            if (preElements === null) return null;

            for (let preElement of preElements) {
                let folderPath = ProjectCodeBox.getFolderPathFromDataset(preElement.dataset);
                let fileName = ProjectCodeBox.getNameFromDataset(preElement.dataset) || GlobalConfig.DEFAULT_CODE_VIEW_BUTTON_TEXT;
                let packageName = ProjectCodeBox.getPackageNameFromDataset(preElement.dataset);

                const identifier = this.foldersManager.getItemIdentifier(fileName, folderPath, packageName !== null, packageName !== "" ? packageName : null);

                if (identifier === codeViewIdentifier) {
                    const codeElement = CodeBox.getCodeElement(preElement);
                    if (!codeElement) continue;
                    let linesCount = CodeBox.getLinesCount(codeElement);
                    if (minLinesCount !== null && linesCount < minLinesCount) {
                        linesCount = minLinesCount;
                    }
                    const height = linesCount * CodeBox.getCodeViewLineHeight(preElement, defaultCodeViewOptions);
                    return `${height}${CodeBox.getCodeViewLineHeightUnit(preElement, defaultCodeViewOptions)}`;
                }
            }

            if (this.parentCodeBox) {
                return this.parentCodeBox.getHeightForLazyInitPlaceholderElement(codeViewIdentifier, minLinesCount, defaultCodeViewOptions);
            }

            return null;
        }
    }

    /**
     * Returns folder path from dataset.
     * @param dataset Dataset.
     * @returns Folder path or null if folder path is not defined in dataset.
     */
    private static getFolderPathFromDataset(dataset : DOMStringMap) : string | null {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Folder"] || null;
    }

    /**
     * Returns name from dataset.
     * @param dataset Dataset.
     * @returns Name or null if name is not defined in dataset.
     */
    private static getNameFromDataset(dataset : DOMStringMap) : string | null {
        return dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Name"] || null;
    }

    /**
     * Returns package name from dataset.
     * @param dataset Dataset.
     * @returns Package name or null if package name is not defined in dataset.
     */
    private static getPackageNameFromDataset(dataset : DOMStringMap) : string | null {
        const packageName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "Package"];
        return packageName !== undefined ? packageName : null;
    }

    /**
     * Helper method for constructor to get name of icon from code box options.
     * @param options Code box options.
     * @param iconName Name (label..) of icon.
     * @returns Name of icon.
     */
    private static getIconName(options : ProjectCodeBoxOptions, iconName : "codeFile" | "file" | "download" | "panelOpenButton" | "folderArrow" | "project" | "folder" | "package") : string | null {
        if (!options.svgSpriteIcons) return null;
        return options.svgSpriteIcons[iconName] || null;
    }

    /**
     * Fills code box options by values from dataset.
     * @param options Code box options.
     * @param dataset Dataset of root code box element.
     */
    private fillProjectCodeBoxOptionsFromDataset(options : ProjectCodeBoxOptions, dataset : DOMStringMap) : void {
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderStructureHeading"] !== undefined) {
            options.folderStructureHeading = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderStructureHeading"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesHeading"] !== undefined) {
            options.packagesHeading = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesHeading"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"] !== undefined) {
            options.projectName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ProjectName"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"] !== undefined) {
            options.packagesFolderPath = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PackagesFolderPath"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "DefaultPackageName"] !== undefined) {
            options.defaultPackageName = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "DefaultPackageName"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] !== undefined) {
            options.createFoldersForPackages = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "CreateFoldersForPackages"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"] !== undefined) {
            options.foldersDelimiterForPackages = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FoldersDelimiterForPackages"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] !== undefined) {
            options.folderAnimationSpeed = Number.parseFloat(dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationSpeed"] || "");
            if (Number.isNaN(options.folderAnimationSpeed)) {
                throw new Error("Folder animation speed option must be a number.");
            }
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"] !== undefined) {
            options.folderAnimationEasingFunction = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "FolderAnimationEasingFunction"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewFolderOnInit"] !== undefined) {
            options.openActiveCodeViewFolderOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewFolderOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewPackageOnInit"] !== undefined) {
            options.openActiveCodeViewPackageOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenActiveCodeViewPackageOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PreventActiveCodeViewFolderOpenOnInitIfPackage"] !== undefined) {
            options.preventActiveCodeViewFolderOpenOnInitIfPackage = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "PreventActiveCodeViewFolderOpenOnInitIfPackage"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenRootFolderOnInit"] !== undefined) {
            options.openRootFolderOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenRootFolderOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelOnInit"] !== undefined) {
            options.openPanelOnInit = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelOnInit"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ClosePanelOnCodeViewSelected"] !== undefined) {
            options.closePanelOnCodeViewSelect = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ClosePanelOnCodeViewSelected"] === "true";
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelButtonAriaLabel"] !== undefined) {
            options.openPanelButtonAriaLabel = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "OpenPanelButtonAriaLabel"];
        }
        if (dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ClosePanelButtonAriaLabel"] !== undefined) {
            options.closePanelButtonAriaLabel = dataset[GlobalConfig.DATA_ATTRIBUTE_PREFIX + "ClosePanelButtonAriaLabel"];
        }
    }
}

export default ProjectCodeBox;