import CodeBoxOptions from "../CodeBoxOptions";

type ProjectCodeBoxOptions = {
    svgSpritePath ?: string;
    svgSpriteIcons ?: {
        codeFile ?: string;
        file ?: string;
        download ?: string;
        panelOpenButton ?: string;
        folderArrow ?: string;
        project ?: string;
        folder ?: string;
        package ?: string;
    };
    folderStructureHeading ?: string;
    packagesHeading ?: string;
    projectName ?: string;
    packagesFolderPath ?: string; // bude se dát přepsat přes ty konfigurační elementy
    defaultPackageName ?: string;
    createFoldersForPackages ?: boolean;
    foldersDelimiterForPackages ?: string;
    folderAnimationSpeed ?: number;
    folderAnimationEasingFunction ?: string;
    openActiveCodeViewFolderOnInit ?: boolean;
    openActiveCodeViewPackageOnInit ?: boolean;
    openRootFolderOnInit ?: boolean; // napsat že to má vliv jen v některých případech, když třeba není žádné code view aktivní (přednost má openActiveCodeViewFolder option)
    openPanelOnInit ?: boolean;
    openPanelButtonAriaLabel ?: string;
    closePanelButtonAriaLabel ?: string;
} & CodeBoxOptions;

// todo - potom to uklidit a popsat - a zkontrolovat že všechno používám

export default ProjectCodeBoxOptions;