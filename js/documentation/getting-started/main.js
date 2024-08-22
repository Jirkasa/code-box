import { CodeView, TabCodeBox, ProjectCodeBox, TabCodeBoxCreator } from "../../../code-box/index";

new CodeView(document.getElementById("MyCodeView"));

new TabCodeBox(document.getElementById("MyTabCodeBox"), {
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});

new ProjectCodeBox(document.getElementById("MyProjectCodeBox"), {
    minCodeViewLinesCount: 10,
    projectName: "example",
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

const creator = new TabCodeBoxCreator({
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});
creator.create("[data-my-code-box]");