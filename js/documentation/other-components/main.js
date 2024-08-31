import { CodeView, TabCodeBox } from "../../../code-box/index";

const highlightBoxExampleCodeView = new CodeView(document.getElementById("HighlightBoxExample"));
const highlightBox = highlightBoxExampleCodeView.addHighlight("1");
highlightBox.setRange(4, 6);

const codeViewMementoExampleCodeView = new CodeView(document.getElementById("CodeViewMementoExample"));
// create memento (saved state of code view)
const codeViewMemento = codeViewMementoExampleCodeView.createMemento();

// do some changes
codeViewMementoExampleCodeView.addHighlight("4");

// apply memento (restore to the saved state of code view)
codeViewMementoExampleCodeView.applyMemento(codeViewMemento);

const codeBoxMementoExampleCodeBox = new TabCodeBox(document.getElementById("MyCodeBox"), {
    lazyInit: false,
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});
// create memento (saved state of code box)
const codeBoxMemento = codeBoxMementoExampleCodeBox.createMemento();

// do some changes
codeBoxMementoExampleCodeBox.removeCodeView("addition");

// apply memento (restore to the saved state of code box)
codeBoxMementoExampleCodeBox.applyMemento(codeBoxMemento);