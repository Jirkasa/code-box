import {CodeView, TabCodeBox, ProjectCodeBox} from "../../src/ts/main";

declare global {
    interface Window { myCodeBox: TabCodeBox; }
}

const codeView = new CodeView(document.getElementById("CodeViewTest") as HTMLPreElement, {
    highlight: "g,3,15",
    showGutter: true
});

codeView.addHighlight(7);
codeView.removeHighlights(5);
codeView.showGutter();
codeView.hideLineNumbers();

codeView.reset();
codeView.showGutter();

const codeView2 = codeView.clone();
codeView2.appendTo(document.getElementById("Page") as HTMLElement);

const tabCodeBox = new TabCodeBox(document.getElementById("TabCodeBoxTest") as HTMLElement, {
    svgSpritePath: "./static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});
window.myCodeBox = tabCodeBox;
// tabCodeBox.init();

new ProjectCodeBox(document.getElementById("ProjectCodeBoxTest") as HTMLElement, {
    projectName: "test",
    svgSpritePath: "./static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folder: "folder",
        folderArrow: "arrow-right",
        package: "package",
        project: "inventory"
    },
    minCodeViewLinesCount: 20,
    foldersDelimiterForPackages: ".",
    openPanelOnInit: true
});