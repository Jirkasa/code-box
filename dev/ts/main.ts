import {CodeView, TabCodeBox} from "../../src/ts/main";

const codeView = new CodeView(document.getElementById("CodeViewTest") as HTMLPreElement, {
    highlight: "g,3,15",
    showGutter: true,
    cssClasses: ["u-mb-4"]
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
// tabCodeBox.init();