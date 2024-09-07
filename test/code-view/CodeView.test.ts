import {beforeEach, describe, expect, it, vi} from 'vitest';
import { Window } from 'happy-dom';
import CodeView from '../../src/ts/code-view/CodeView';
import CodeViewOptions from '../../src/ts/code-view/CodeViewOptions';

const window = new Window();
vi.stubGlobal('document', window.document);

beforeEach(() => {
    document.body.innerHTML = '';
    document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
        <title>Code Box</title>
    </head>
    <body>
        <pre id="MyCodeView"><code>let x = 1;
let y = 2;

let result = x + y;

console.log("result: " + result);</code></pre>
    </body>
    </html>
    `);
});

function createCodeView(options : CodeViewOptions = {}) : CodeView {
    return new CodeView(document.getElementById("MyCodeView") as HTMLPreElement, options);
}

describe("linesCount property", () => {
    it("should be the same as lines count of code", () => {
        const codeView = createCodeView();

        expect(codeView.linesCount).toBe(6);
    });
});

describe("lineHeight property", () => {
    it("should be the same as passed option lineHeight", () => {
        const codeView = createCodeView({ lineHeight: 4 });

        expect(codeView.lineHeight).toBe(4);
    })
});

describe("lineHeightUnit property", () => {
    it("should be the same as passed option lineHeightUnit", () => {
        const codeView = createCodeView({ lineHeightUnit: "px" });

        expect(codeView.lineHeightUnit).toBe("px");
    });
});

describe("reset()", () => {
    it("should remove all highlights added after initialization", () => {
        const codeView = createCodeView({ highlight: "2" });
        codeView.addHighlight(3, 4);

        codeView.reset();

        expect(codeView.getHighlightBoxes().length).toBe(1);
        expect(codeView.getHighlightBoxes()[0].getStart()).toBe(2);
    });

    it("should set gutter as hidden when showGutter option is set to false", () => {
        const codeView = createCodeView({ showGutter: false });
        codeView.showGutter();

        codeView.reset();

        expect(codeView.isGutterVisible()).toBe(false);
    });

    it("should set line numbers as hidden when showLineNumbers option is set to false", () => {
        const codeView = createCodeView({ showLineNumbers: false });
        codeView.showLineNumbers();

        codeView.reset();

        expect(codeView.areLineNumbersVisible()).toBe(false);
    });
});

describe("clone()", () => {
    it("should create copy of code view", () => {
        const codeView = createCodeView({ highlight: "3-4", showLineNumbers: false });

        const codeViewCopy = codeView.clone();

        expect(codeViewCopy).not.toBe(codeView);
        expect(codeViewCopy.getHighlightBoxes()[0].getStart()).toBe(3);
        expect(codeViewCopy.getHighlightBoxes()[0].getEnd()).toBe(4);
        expect(codeViewCopy.areLineNumbersVisible()).toBe(false);
    });
    it("should create copy of code view in its post-initialization state", () => {
        const codeView = createCodeView({ highlight: "3-4", showLineNumbers: false });
        codeView.showLineNumbers();

        const codeViewCopy = codeView.clone();

        expect(codeViewCopy.areLineNumbersVisible()).toBe(false);
    });
});

describe("addHighlight()", () => {
    it("should add highlight for one line", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(1);
        const highlight = codeView.getHighlightBoxes()[0];
    
        expect(highlight.getStart()).toBe(1);
        expect(highlight.getEnd()).toBe(1);
    });

    it("should add highlight spanned across multiple lines", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(1, 3);
        
        const highlight = codeView.getHighlightBoxes()[0];
        expect(highlight.getStart()).toBe(1);
        expect(highlight.getEnd()).toBe(3);
    });

    it("should limit start of highlight to 1", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(-5);
        
        const highlight = codeView.getHighlightBoxes()[0];
        expect(highlight.getStart()).toBe(1);
    });

    it("should limit end of highlight to start of highlight", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(2, 1);
        
        const highlight = codeView.getHighlightBoxes()[0];
        expect(highlight.getStart()).toBe(2);
        expect(highlight.getEnd()).toBe(2);
    });

    it("should limit start of highlight to lines count of code", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(600);
        
        const highlight = codeView.getHighlightBoxes()[0];
        expect(highlight.getStart()).toBe(codeView.linesCount);
    });

    it("should limit end of highlight to lines count of code", () => {
        const codeView = createCodeView();
    
        codeView.addHighlight(2, 600);
        const highlight = codeView.getHighlightBoxes()[0];
    
        expect(highlight.getStart()).toBe(2);
        expect(highlight.getEnd()).toBe(codeView.linesCount);
    });
});

describe("removeHighlights()", ()=> {
    it("should remove all highlights", () => {
        const codeView = createCodeView({ highlight: "2,4" });
    
        codeView.removeHighlights();

        expect(codeView.getHighlightBoxes().length).toBe(0);
    });

    it("should remove highlight that intersects passed line", () => {
        const codeView = createCodeView({ highlight: "1,3-4" });

        codeView.removeHighlights(3);

        const highlight = codeView.getHighlightBoxes()[0];
        expect(highlight.getStart()).toBe(1);
        expect(highlight.getEnd()).toBe(1);
    });

    it("should remove highlight that intersects passed range", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6"});

        codeView.removeHighlights(3, 5);

        const highlight = codeView.getHighlightBoxes(1)[0];
        expect(highlight.getStart()).toBe(1);
        expect(highlight.getEnd()).toBe(1);
        expect(codeView.getHighlightBoxes().length).toBe(1);
    });

    it("should remove highlights from line to last line", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6"});

        codeView.removeHighlights(2, null);

        const highlight = codeView.getHighlightBoxes(1)[0];
        expect(highlight.getStart()).toBe(1);
        expect(highlight.getEnd()).toBe(1);
        expect(codeView.getHighlightBoxes().length).toBe(1);
    });
});

describe("getHighlightBoxes()", () => {
    it("should return empty array if no parameters are passed and there are no highlights", () => {
        const codeView = createCodeView();

        expect(codeView.getHighlightBoxes().length).toBe(0);
    });

    it("should return all highlight boxes when no parameters are passed", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6" });

        expect(codeView.getHighlightBoxes().length).toBe(3);
    });

    it("should return all highlight boxes that intersect passed line", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6" });

        expect(codeView.getHighlightBoxes(5).length).toBe(1);
    });

    it("should return all highlight boxes that intersect passed range", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6" });

        expect(codeView.getHighlightBoxes(2, 5).length).toBe(2);
    });

    it("should return all highlight boxes from line to end line", () => {
        const codeView = createCodeView({ highlight: "1,3,5-6" });

        expect(codeView.getHighlightBoxes(2, null).length).toBe(2);
    });
});

describe("showGutter()", () => {
    it("should show gutter", () => {
        const codeView = createCodeView({ showGutter: false });

        codeView.showGutter();

        expect(codeView.isGutterVisible()).toBe(true);
    });
});

describe("hideGutter()", () => {
    it("should hide gutter", () => {
        const codeView = createCodeView();

        codeView.hideGutter();

        expect(codeView.isGutterVisible()).toBe(false);
    });
});

describe("showLineNumbers()", () => {
    it("should show gutter", () => {
        const codeView = createCodeView({ showLineNumbers: false });

        codeView.showLineNumbers();

        expect(codeView.areLineNumbersVisible()).toBe(true);
    });
});

describe("hideLineNumbers()", () => {
    it("should hide gutter", () => {
        const codeView = createCodeView();

        codeView.hideLineNumbers();

        expect(codeView.areLineNumbersVisible()).toBe(false);
    });
});