import { ProjectCodeBox } from "../../../code-box/index";

new ProjectCodeBox(document.getElementById("CreateProjectCodeBoxExample"), {
    minCodeViewLinesCount: 20,
    projectName: "example-app",
    packagesFolderPath: "src/main/java",
    foldersDelimiterForPackages: ".",
    svgSpritePath: "../../static/icon-sprite.svg",
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

const codeBox1 = new ProjectCodeBox(document.getElementById("CodeBoxInheritance1"), {
    minCodeViewLinesCount: 10,
    svgSpritePath: "../../static/icon-sprite.svg",
    projectName: "example-app",
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

new ProjectCodeBox(document.getElementById("CodeBoxInheritance2"), {
    minCodeViewLinesCount: 10,
    svgSpritePath: "../../static/icon-sprite.svg",
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
}, codeBox1);