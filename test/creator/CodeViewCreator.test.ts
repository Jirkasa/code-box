import { Window } from "happy-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CodeViewCreator from "../../src/ts/creator/CodeViewCreator";

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

    <pre data-my-code-view><code>code view 1</code></pre>
    <pre data-my-code-view data-cb-id="CodeView2"><code>code view 2</code></pre>
    <pre data-my-code-view data-cb-id="CodeView3"><code>code view 3</code></pre>
    <pre data-my-code-view data-cb-id="CodeView4"><code>code view 4</code></pre>

    </body>
    </html>
    `);
});

describe("create()", () => {
    it("should create code views", () => {
        const codeViewCreator = new CodeViewCreator();

        codeViewCreator.create("[data-my-code-view]");

        expect(codeViewCreator.getCreatedCodeViews().length).toBe(4);
    });
});

describe("getCreatedCodeViewById()", () => {
    it("should return created code view by id", () => {
        const codeViewCreator = new CodeViewCreator();
        codeViewCreator.create("[data-my-code-view]");

        const codeView = codeViewCreator.getCreatedCodeViewById("CodeView2");

        expect(codeView).not.toBeNull();
    });

    it("should return null if code view does not exist", () => {
        const codeViewCreator = new CodeViewCreator();
        codeViewCreator.create("[data-my-code-view]");

        const codeView = codeViewCreator.getCreatedCodeViewById("asdkfdklůfjd");

        expect(codeView).toBeNull();
    });
});

describe("getCreatedCodeViewsCount()", () => {
    it("should return number of created code views", () => {
        const codeViewCreator = new CodeViewCreator();
        codeViewCreator.create("[data-my-code-view]");

        const count = codeViewCreator.getCreatedCodeViewsCount();

        expect(count).toBe(4);
    });
});