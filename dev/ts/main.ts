import {CodeView} from "../../src/ts/main";

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

codeView.clone(document.getElementById("Page") as HTMLElement);