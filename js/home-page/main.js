import { TabCodeBox, ProjectCodeBox } from "../../code-box/index";

new TabCodeBox(document.getElementById("TabCodeBoxExample"), {
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});

new ProjectCodeBox(document.getElementById("ProjectCodeBoxExample"), {
    minCodeViewLinesCount: 20,
    packagesFolderPath: "src/main/java",
    preventActiveCodeViewFolderOpenOnInitIfPackage: true,
    foldersDelimiterForPackages: ".",
    projectName: "example-app",
    svgSpritePath: "./static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folderArrow: "arrow-right",
        folder: "folder",
        project: "inventory",
        package: "package"
    }
});