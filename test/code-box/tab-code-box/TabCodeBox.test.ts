import { Window } from "happy-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TabCodeBox from "../../../src/ts/code-box/tab-code-box/TabCodeBox";
import TabCodeBoxOptions from "../../../src/ts/code-box/tab-code-box/TabCodeBoxOptions";
import CodeView from "../../../src/ts/code-view/CodeView";

const window = new Window();
vi.stubGlobal('window', window);
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

    <div id="MyTabCodeBox">
        <pre data-cb-name="CodeView1" data-cb-active><code>some content</code></pre>
        <pre data-cb-name="CodeView2"><code>some content</code></pre>
        <div data-cb-name="File1" data-cb-file="./assets/img/File.png"></div>
        <div data-cb-name="File2" data-cb-file></div>
    </div>

    <pre id="MyCodeView"><code>some content</code></pre>

    </body>
    </html>
    `);
});

function createCodeBox(options : TabCodeBoxOptions = {}) : TabCodeBox {
    const codeBox = new TabCodeBox(document.getElementById("MyTabCodeBox") as HTMLElement, options);
    codeBox.init();
    return codeBox;
}

describe("addCodeView()", () => {
    it("should add code view", () => {
        const codeBox = createCodeBox();

        const codeView = new CodeView(document.getElementById("MyCodeView") as HTMLPreElement);
        const result = codeBox.addCodeView("New Code View", codeView);

        expect(result).toBe(true);
        expect(codeBox.getCodeView("New Code View")).not.toBeNull();
    });

    it("should not add code view if some other code view with the same identifier exists", () => {
        const codeBox = createCodeBox();

        const codeView = new CodeView(document.getElementById("MyCodeView") as HTMLPreElement);
        const result = codeBox.addCodeView("CodeView1", codeView);

        expect(result).toBe(false);
    });
});

describe("getCodeViews()", () => {
    it("should return code views", () => {
        const codeBox = createCodeBox();

        const codeViews = codeBox.getCodeViews();

        expect(codeViews.length).toBeGreaterThan(0);
    });
});

describe("getCodeView()", () => {
    it("should return code view by identifier", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeView("CodeView1");

        expect(codeView).not.toBeNull();
        expect(codeView?.getIdentifier()).toBe("CodeView1");
    });

    it("should return null when code view is not found", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeView("asdklfjsdlkfjk");

        expect(codeView).toBeNull();
    });
});

describe("removeCodeView()", () => {
    it("should remove code view by identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeCodeView("CodeView1");

        expect(result).toBe(true);
        expect(codeBox.getCodeView("CodeView1")).toBeNull();
    });

    it("should return false when code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeCodeView("sldakjfklsdf");

        expect(result).toBe(false);
    });
});

describe("removeAllCodeViews()", () => {
    it("should remove all code views", () => {
        const codeBox = createCodeBox();

        codeBox.removeAllCodeViews();

        expect(codeBox.getCodeViews().length).toBe(0);
    });
});

describe("changeCodeViewIdentifier()", () => {
    it("should change identifier of code view", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeCodeViewIdentifier("CodeView1", "RenamedCodeView");

        expect(result).toBe(true);
        expect(codeBox.getCodeView("CodeView1")).toBeNull();
        expect(codeBox.getCodeView("RenamedCodeView")).not.toBeNull();
    });

    it("should not change identifier of code views when passed new identifier already belongs to some other code view in code box", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeCodeViewIdentifier("CodeView1", "CodeView2");

        expect(result).toBe(false);
        expect(codeBox.getCodeView("CodeView1")).not.toBeNull();
        expect(codeBox.getCodeView("CodeView2")).not.toBeNull();
    });

    it("should return false when code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeCodeViewIdentifier("alksdjfjklds", "RenamedCodeView");

        expect(result).toBe(false);
    });
});

describe("getCodeViewButtonPosition()", () => {
    it("should return position of code view button", () => {
        const codeBox = createCodeBox();

        const position = codeBox.getCodeViewButtonPosition("CodeView2");

        expect(position).toBe(1);
    });

    it("should return null if code view does not exist", () => {
        const codeBox = createCodeBox();

        const position = codeBox.getCodeViewButtonPosition("alskdjfdkl");

        expect(position).toBeNull();
    });
});

describe("setCodeViewButtonPosition()", () => {
    it("should change position of code view button", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setCodeViewButtonPosition("CodeView1", 2);

        expect(result).toBe(true);
        expect(codeBox.getCodeViewButtonPosition("CodeView1")).toBe(2);
        expect(codeBox.getFileButtonPosition("File1")).toBe(0);
    });

    it("should return false when position after max position is passed", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setCodeViewButtonPosition("CodeView1", 1000000);

        expect(result).toBe(false);
        expect(codeBox.getCodeViewButtonPosition("CodeView1")).toBe(0);
    });

    it("should return false when position lower than 0 is passed", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setCodeViewButtonPosition("CodeView1", -1);

        expect(result).toBe(false);
        expect(codeBox.getCodeViewButtonPosition("CodeView1")).toBe(0);
    });

    it("should return false if code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setCodeViewButtonPosition("asdfdsafjk", 1);

        expect(result).toBe(false);
    });
});

describe("setActiveCodeView()", () => {
    it("should change active code view", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setActiveCodeView("CodeView2");

        expect(result).toBe(true);
        expect(codeBox.getActiveCodeView()?.getIdentifier()).toBe("CodeView2");
    });

    it("should return false when code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setActiveCodeView("asdlkfjasdklf");

        expect(result).toBe(false);
    });
});

describe("setNoActiveCodeView()", () => {
    it("should set no active code view", () => {
        const codeBox = createCodeBox();

        codeBox.setNoActiveCodeView();

        expect(codeBox.getActiveCodeView()).toBeNull();
    });
});

describe("getActiveCodeView()", () => {
    it("should return active code view", () => {
        const codeBox = createCodeBox();
        codeBox.setActiveCodeView("CodeView1");

        const codeView = codeBox.getActiveCodeView();

        expect(codeView?.getIdentifier()).toBe("CodeView1");
    });

    it("should return null if no active code view is set", () => {
        const codeBox = createCodeBox();
        codeBox.setNoActiveCodeView();

        const result = codeBox.getActiveCodeView();

        expect(result).toBe(null);
    });
});

describe("addFile()", () => {
    it("should add downloadable file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("NewFile", "../static/Image.png");

        expect(result).toBe(true);
        const file = codeBox.getFile("NewFile");
        expect(file).not.toBeNull();
        expect(file?.getDownloadLink()).toBe("../static/Image.png");
    });

    it("should add non-dowloadable file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("NewFile");

        expect(result).toBe(true);
        const file = codeBox.getFile("NewFile");
        expect(file).not.toBeNull();
        expect(file?.getDownloadLink()).toBeNull();
    });

    it("should not add file when there already is file with the same identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("File2");

        expect(result).toBe(false);
    });
});

describe("getFiles()", () => {
    it("should return files", () => {
        const codeBox = createCodeBox();

        const files = codeBox.getFiles();

        expect(files.length).toBeGreaterThan(0);
    });
});

describe("getFile()", () => {
    it("should return file by identifier", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFile("File1");

        expect(file).not.toBeNull();
        expect(file?.getIdentifier()).toBe("File1");
    });

    it("should return null when file is not found", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFile("asdklfjsdlkfjk");

        expect(file).toBeNull();
    });
});

describe("removeFile()", () => {
    it("should remove file by identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFile("File1");

        expect(result).toBe(true);
        expect(codeBox.getFile("File1")).toBeNull();
    });

    it("should return false when file does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFile("sldakjfklsdf");

        expect(result).toBe(false);
    });
});

describe("removeAllFiles()", () => {
    it("should remove all files", () => {
        const codeBox = createCodeBox();

        codeBox.removeAllFiles();

        expect(codeBox.getFiles().length).toBe(0);
    });
});

describe("changeFileIdentifier()", () => {
    it("should change identifier of file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileIdentifier("File1", "RenamedFile");

        expect(result).toBe(true);
        expect(codeBox.getFile("File1")).toBeNull();
        expect(codeBox.getFile("RenamedFile")).not.toBeNull();
    });

    it("should not change identifier of files when passed new identifier already belongs to some other file in code box", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileIdentifier("File1", "File2");

        expect(result).toBe(false);
        expect(codeBox.getFile("File1")).not.toBeNull();
        expect(codeBox.getFile("File2")).not.toBeNull();
    });

    it("should return false when file does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileIdentifier("alksdjfjklds", "RenamedFile");

        expect(result).toBe(false);
    });
});

describe("getFileButtonPosition()", () => {
    it("should return position of file button", () => {
        const codeBox = createCodeBox();

        const position = codeBox.getFileButtonPosition("File2");

        expect(position).toBe(3);
    });

    it("should return null if file does not exist", () => {
        const codeBox = createCodeBox();

        const position = codeBox.getFileButtonPosition("alskdjfdkl");

        expect(position).toBeNull();
    });
});

describe("setFileButtonPosition()", () => {
    it("should change position of file button", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setFileButtonPosition("File1", 0);

        expect(result).toBe(true);
        expect(codeBox.getFileButtonPosition("File1")).toBe(0);
        expect(codeBox.getCodeViewButtonPosition("CodeView1")).toBe(2);
    });

    it("should return false when position after max position is passed", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setFileButtonPosition("File1", 1000000);

        expect(result).toBe(false);
        expect(codeBox.getFileButtonPosition("File1")).toBe(2);
    });

    it("should return false when position lower than 0 is passed", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setFileButtonPosition("File1", -1);

        expect(result).toBe(false);
        expect(codeBox.getFileButtonPosition("File1")).toBe(2);
    });

    it("should return false if file does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setFileButtonPosition("asdfdsafjk", 1);

        expect(result).toBe(false);
    });
});

describe("changeFileDownloadLink()", () => {
    it("should change download link of file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("File1", "../static/SomethingElse.png");

        expect(result).toBe(true);
        const file = codeBox.getFile("File1");
        expect(file?.getDownloadLink()).toBe("../static/SomethingElse.png");
    });

    it("should set file as non-downloadable", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("File1", null);

        expect(result).toBe(true);
        const file = codeBox.getFile("File1");
        expect(file?.getDownloadLink()).toBe(null);
    });

    it("should return false when files does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("aůlskjfdf", "../static/SomethingElse.png");

        expect(result).toBe(false);
    });
});