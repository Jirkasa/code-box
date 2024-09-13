import { Window } from "happy-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VirtualCodeBoxCreator from "../../src/ts/creator/VirtualCodeBoxCreator";

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
    <div data-my-code-box data-cb-id="CodeBox2"></div>
    <div data-my-code-box data-cb-id="CodeBox3"></div>
    <div data-my-code-box data-cb-id="CodeBox4"></div>

    </body>
    </html>
    `);
});

describe("create()", () => {
    it("should create virtual code boxes", () => {
        const codeBoxCreator = new VirtualCodeBoxCreator();

        codeBoxCreator.create("[data-my-code-box]");

        expect(codeBoxCreator.getCreatedCodeBoxes().length).toBe(4);
    });
});

describe("getCreatedCodeBoxById()", () => {
    it("should return created code box by id", () => {
        const codeBoxCreator = new VirtualCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const codeBox = codeBoxCreator.getCreatedCodeBoxById("CodeBox2");

        expect(codeBox).not.toBeNull();
    });

    it("should return if code box does not exist", () => {
        const codeBoxCreator = new VirtualCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const codeBox = codeBoxCreator.getCreatedCodeBoxById("sadjkflsdfj");

        expect(codeBox).toBeNull();
    });
});

describe("getCreatedCodeBoxesCount()", () => {
    it("should return number of created code boxes", () => {
        const codeBoxCreator = new VirtualCodeBoxCreator();
        codeBoxCreator.create("[data-my-code-box]");

        const count = codeBoxCreator.getCreatedCodeBoxesCount();

        expect(count).toBe(4);
    });
});