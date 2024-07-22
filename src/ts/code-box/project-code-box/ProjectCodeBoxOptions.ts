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
    folderAnimationSpeed ?: number;
    folderAnimationEasingFunction ?: string;
} & CodeBoxOptions;

export default ProjectCodeBoxOptions;