import {CodeView} from "../../src/ts/main";

const codeView = new CodeView(document.getElementById("CodeViewTest") as HTMLPreElement, {
    highlight: "3-5"
});

codeView.addHighlight(7);
codeView.removeHighlights(5); // takže to nefunguje - mám to špatně dám to ai