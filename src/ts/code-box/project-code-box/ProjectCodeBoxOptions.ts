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
    openActiveCodeViewFolder ?: boolean;
    openActiveCodeViewPackage ?: boolean;
} & CodeBoxOptions;

export default ProjectCodeBoxOptions;