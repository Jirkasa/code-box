import { Window } from "happy-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectCodeBoxCreator from "../../src/ts/creator/ProjectCodeBoxCreator";

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

    <div data-my-code-box></div>
    <div data-my-code-box data-cb-id="CodeBox2" data-cb-extends="CodeBox4">
        <pre data-cb-name="style.css"><code>some content</code></pre>
    </div>
    <div data-my-code-box data-cb-id="CodeBox3">
        <pre data-cb-name="main.js"><code>some content</code></pre>
    </div>
    <div data-my-code-box data-cb-id="CodeBox4" data-cb-extends="CodeBox3">
        <pre data-cb-name="something.js"><code>some content</code></pre>
    </div>

    </body>
    </html>
    `);
});

describe("create()", () => {
    it("should create project code boxes", () => {
        const codeBoxCreator = new ProjectCodeBoxCreator();

        codeBoxCreator.create("[data-my-code-box]");

        expect(codeBoxCreator.getCreatedCodeBoxes().length).toBe(4);
    });

    it("should create project code boxes that extend other project code boxes", () => {
        const codeBoxCreator = new ProjectCodeBoxCreator();

        codeBoxCreator.create("[data-my-code-box]");

        const codeBox2 = codeBoxCreator.getCreatedCodeBoxById("CodeBox2");
        const codeBox3 = codeBoxCreator.getCreatedCodeBoxById("CodeBox3");
        const codeBox4 = codeBoxCreator.getCreatedCodeBoxById("CodeBox4");
        codeBox2?.init();
        codeBox3?.init();
        codeBox4?.init();
        expect(codeBoxCreator.getCreatedCodeBoxes().length).toBe(4);
        expect(codeBox2?.getCodeViews().length).toBe(3);
        expect(codeBox3?.getCodeViews().length).toBe(1);
        expect(codeBox4?.getCodeViews().length).toBe(2);
    });
});

describe("getCreatedCodeBoxById()", () => {
    it("should return created code box by id", () => {
        const codeBoxCreator = new ProjectCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const codeBox = codeBoxCreator.getCreatedCodeBoxById("CodeBox2");

        expect(codeBox).not.toBeNull();
    });

    it("should return if code box does not exist", () => {
        const codeBoxCreator = new ProjectCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const codeBox = codeBoxCreator.getCreatedCodeBoxById("sadjkflsdfj");

        expect(codeBox).toBeNull();
    });
});

describe("getCreatedCodeBoxesCount()", () => {
    it("should return number of created code boxes", () => {
        const codeBoxCreator = new ProjectCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const count = codeBoxCreator.getCreatedCodeBoxesCount();

        expect(count).toBe(4);
    });
});