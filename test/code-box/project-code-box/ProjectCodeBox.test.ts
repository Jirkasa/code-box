import {beforeEach, describe, expect, it, vi} from 'vitest';
import { Window } from 'happy-dom';
import ProjectCodeBox from '../../../src/ts/code-box/project-code-box/ProjectCodeBox';
import ProjectCodeBoxOptions from '../../../src/ts/code-box/project-code-box/ProjectCodeBoxOptions';
import CodeView from '../../../src/ts/code-view/CodeView';

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
<div id="MyProjectCodeBox">
    <ul data-cb-folders>
        <li>
            src
            <ul>
                <li>
                    main
                    <ul>
                        <li>java</li>
                        <li>resources</li>
                        <li>webapp</li>
                    </ul>
                </li>
                <li>
                    test
                    <ul>
                        <li>java</li>
                        <li>resources</li>
                    </ul>
                </li>
            </ul>
        </li>
        <li>target</li>
    </ul>

    <pre data-cb-name="style.css" data-cb-folder="css"><code>some content</code></pre>
    <pre data-cb-name="anotherStyle.css" data-cb-folder="css/subfolder"><code>some content</code></pre>
    <pre data-cb-name="main.js" data-cb-folder="js"><code>some content</code></pre>
    <pre data-cb-name="MyApp.java" data-cb-package="io.github.jirkasa" data-cb-active><code>some content</code></pre>
    <pre data-cb-name="Something.java" data-cb-package><code>some content</code></pre>
    <pre data-cb-name="pom.xml"><code>some content</code></pre>

    <div data-cb-name="Image.png" data-cb-file="../static/Image.png" data-cb-folder="assets/img"></div>
    <div data-cb-name="favicon.svg" data-cb-file="../static/favicon.svg" data-cb-folder="assets/img" data-cb-package="io.github.jirkasa"></div>
    <div data-cb-name="something.zip" data-cb-file></div>
    <div data-cb-name="data.xls" data-cb-file data-cb-package="io.github.jirkasa.data"></div>
    <div data-cb-name="default_data.xls" data-cb-file data-cb-package></div>
</div>

    <pre id="MyCodeView"><code>some content</code></pre>
    </body>
    </html>
    `);
});

function createCodeBox(options : ProjectCodeBoxOptions = {}) : ProjectCodeBox {
    const codeBox = new ProjectCodeBox(document.getElementById("MyProjectCodeBox") as HTMLElement, options);
    codeBox.init();
    return codeBox;
}

describe("addCodeView()", () => {
    it("should add code view", () => {
        const codeBox = createCodeBox();

        const codeView = new CodeView(document.getElementById("MyCodeView") as HTMLPreElement);
        const result = codeBox.addCodeView("js/mytest.js", codeView);

        expect(codeBox.getCodeView("js/mytest.js")).not.toBeNull();
        expect(result).toBe(true);
    });

    it("should not add code view if some other code view with the same identifier exists", () => {
        const codeBox = createCodeBox();

        const codeView = new CodeView(document.getElementById("MyCodeView") as HTMLPreElement);
        const result = codeBox.addCodeView("pom.xml", codeView);

        expect(result).toBe(false);
    });
});

describe("getCodeViewsByFolderPath()", () => {
    it("should return all code views in folder", () => {
        const codeBox = createCodeBox();

        const codeViews = codeBox.getCodeViewsByFolderPath("css");

        expect(codeViews.length).toBe(1);
    });

    it("should return all code views in folder and subfolders", () => {
        const codeBox = createCodeBox();

        const codeViews = codeBox.getCodeViewsByFolderPath("css", true);

        expect(codeViews.length).toBe(2);
    });
});

describe("getCodeViewsByPackage()", () => {
    it("should return code views by package", () => {
        const codeBox = createCodeBox();

        const codeViews = codeBox.getCodeViewsByPackage("io.github.jirkasa");

        expect(codeViews.length).toBe(1);
    });

    it("should return code views in default package", () => {
        const codeBox = createCodeBox();

        const codeViews = codeBox.getCodeViewsByPackage(null);

        expect(codeViews.length).toBe(1);
    });
});

describe("getCodeView()", () => {
    it("should return code view by identifier", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeView("js/main.js");

        expect(codeView).not.toBeNull();
    });

    it("should return null if code view is not found", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeView("dsalkfdlkf/skfsdf.js");

        expect(codeView).toBeNull();
    });
});

describe("getCodeViewByFolderPath()", () => {
    it("should return code view by folder path and name", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeViewByFolderPath("js", "main.js");

        expect(codeView).not.toBeNull();
    });

    it("should return null if code view is not found", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeViewByFolderPath("dsalkfdlkf", "skfsdf.js");

        expect(codeView).toBeNull();
    });
});

describe("getCodeViewByPackage()", () => {
    it("should return code view by package and name", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeViewByPackage("io.github.jirkasa", "MyApp.java");

        expect(codeView).not.toBeNull();
    });

    it("should return null if code view is not found", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeViewByPackage("dsalkfdsd.dksfjdlkf", "skfsdf.java");

        expect(codeView).toBeNull();
    });
});

describe("removeCodeView()", () => {
    it("should remove code view by identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeCodeView("js/main.js");

        expect(result).toBe(true);
        expect(codeBox.getCodeView("js/main.js")).toBeNull();
    });

    it("should return false if code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeCodeView("asůldkfjdslkfj/lksadflkdsfj.js");

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

        const result = codeBox.changeCodeViewIdentifier("js/main.js", "ts/main.ts");

        expect(codeBox.getCodeView("js/main.js")).toBeNull();
        expect(codeBox.getCodeView("ts/main.ts")).not.toBeNull();
        expect(result).toBe(true);
    });

    it("should return false if code view is not found", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeCodeViewIdentifier("asdlkfjd/slkdfdsl.js", "sdfddfd/main.ts");

        expect(result).toBe(false);
    });

    it("should not change identifier if there already is code view with the same identifier", () => {
        const codeBox = createCodeBox();

        const codeView = codeBox.getCodeView("js/main.js");
        const result = codeBox.changeCodeViewIdentifier("js/main.js", "css/style.css");

        expect(codeView?.getIdentifier()).toBe("js/main.js");
        expect(codeBox.getCodeView("css/style.css")).not.toBeNull();
        expect(result).toBe(false);
    });
});

describe("changeCodeViewPackage()", () => {
    it("should change package of code view but keep folder path", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const codeView = codeBox.getCodeViewByPackage("io.github.jirkasa", "MyApp.java");

        const result = codeBox.changeCodeViewPackage("src/main/java/io.github.jirkasa/MyApp.java", "new.package", true);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("src/main/java/io.github.jirkasa");
        expect(codeView?.getPackage()).toBe("new.package");
    });

    it("should change package of code view and also folder path", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const codeView = codeBox.getCodeViewByPackage("io.github.jirkasa", "MyApp.java");

        const result = codeBox.changeCodeViewPackage("src/main/java/io.github.jirkasa/MyApp.java", "new.package", false);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("src/main/java/new.package");
        expect(codeView?.getPackage()).toBe("new.package");
    });

    it("should change package of code view and also folder path when foldersDelimiterForPackages option is set", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const codeView = codeBox.getCodeViewByPackage("io.github.jirkasa", "MyApp.java");

        const result = codeBox.changeCodeViewPackage("src/main/java/io/github/jirkasa/MyApp.java", "new.package", false);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("src/main/java/new/package");
        expect(codeView?.getPackage()).toBe("new.package");
    });

    it("should set package for code view that does not yet have package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const codeView = codeBox.getCodeViewByFolderPath("css", "style.css");

        const result = codeBox.changeCodeViewPackage("css/style.css", "new.package", true);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("css");
        expect(codeView?.getPackage()).toBe("new.package");
    });

    it("should set package for code view that does not yet have package and move it to different folder", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const codeView = codeBox.getCodeViewByFolderPath("css", "style.css");

        const result = codeBox.changeCodeViewPackage("css/style.css", "new.package", false);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("src/main/java/new/package");
        expect(codeView?.getPackage()).toBe("new.package");
    });

    it("should set code view to default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const codeView = codeBox.getCodeViewByFolderPath("css", "style.css");

        const result = codeBox.changeCodeViewPackage("css/style.css", null, true);

        expect(result).toBe(true);
        expect(codeView?.getFolderPath()).toBe("css");
        expect(codeView?.getPackage()).toBeNull();
    });
});

describe("removeCodeViewPackage()", () => {
    it("should remove code view from package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const codeView = codeBox.getCodeViewByPackage("io.github.jirkasa", "MyApp.java");

        const result = codeBox.removeCodeViewPackage("src/main/java/io/github/jirkasa/MyApp.java");

        expect(result).toBe(true);
        expect(codeView?.getPackage()).toBeUndefined();
    });

    it("should remove code view from default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const codeView = codeBox.getCodeViewByPackage(null, "Something.java");

        const result = codeBox.removeCodeViewPackage("src/main/java/Something.java");

        expect(result).toBe(true);
        expect(codeView?.getPackage()).toBeUndefined();
    });
});

describe("getCodeViewPackage()", () => {
    it("should return package of code view", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getCodeViewPackage("src/main/java/io/github/jirkasa/MyApp.java");

        expect(packageName).toBe("io.github.jirkasa");
    });

    it("should return null if code view is in default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getCodeViewPackage("src/main/java/Something.java");

        expect(packageName).toBeNull();
    });

    it("should return undefined if code view does not have package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getCodeViewPackage("js/main.js");

        expect(packageName).toBeUndefined();
    });
});

describe("setActiveCodeView()", () => {
    it("should set code view as active", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setActiveCodeView("js/main.js");

        const codeView = codeBox.getCodeView("js/main.js");
        expect(result).toBe(true);
        expect(codeBox.getActiveCodeView()).toBe(codeView);
    });

    it("should return false when code view does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.setActiveCodeView("sdafsdf/adskfjdslkůf.js");

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

        const codeView = codeBox.getActiveCodeView();

        expect(codeView?.getIdentifier()).toBe("io.github.jirkasa/MyApp.java");
    });

    it("should return null if no code view is active", () => {
        const codeBox = createCodeBox();
        codeBox.setNoActiveCodeView();

        const codeView = codeBox.getActiveCodeView();

        expect(codeView).toBeNull();
    });
});

describe("addFile()", () => {
    it("should add downloadable file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("images/MyImage.png", "../static/MyImage.png");

        expect(result).toBe(true);
        const file = codeBox.getFile("images/MyImage.png");
        expect(file).not.toBeNull();
        expect(file?.getDownloadLink()).toBe("../static/MyImage.png");
    });

    it("should add non-downloadable file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("images/MyImage.png");

        expect(result).toBe(true);
        const file = codeBox.getFile("images/MyImage.png");
        expect(file).not.toBeNull();
        expect(file?.getDownloadLink()).toBeNull();
    });

    it("should not add file when there already is file with the same identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.addFile("assets/img/Image.png");

        expect(result).toBe(false);
    });
});

describe("getFilesByFolderPath", () => {
    it("should return all files in folder", () => {
        const codeBox = createCodeBox();

        const files = codeBox.getFilesByFolderPath("assets/img");

        expect(files.length).toBe(2);
    });

    it("should return all files in folder and subfolders", () => {
        const codeBox = createCodeBox();

        const files = codeBox.getFilesByFolderPath("assets", true);

        expect(files.length).toBe(2);
    });
});

describe("getFilesByPackage()", () => {
    it("should return all files in package", () => {
        const codeBox = createCodeBox();

        const files = codeBox.getFilesByPackage("io.github.jirkasa");

        expect(files.length).toBe(1);
    });

    it("should return all files in default package", () => {
        const codeBox = createCodeBox();

        const files = codeBox.getFilesByPackage(null);

        expect(files.length).toBe(1);
    });
});

describe("getFile()", () => {
    it("should return file by identifier", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFile("assets/img/Image.png");

        expect(file).not.toBeNull();
    });

    it("should return null if file is not found", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFile("dkljfwe/sdafdf.png");

        expect(file).toBeNull();
    });
});

describe("getFileByFolderPath()", () => {
    it("should return file by folder path and name", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFileByFolderPath("assets/img", "favicon.svg");

        expect(file).not.toBeNull();
    });

    it("should return null if file is not found", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFileByFolderPath("sdfakdsjfl", "lkfsdjf.png");

        expect(file).toBeNull();
    });
});

describe("getFileByPackage()", () => {
    it("should return file by package and name", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFileByPackage("io.github.jirkasa", "favicon.svg");

        expect(file).not.toBeNull();
    });

    it("should return null if file is not found", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFileByPackage("dsalkfdsd.dksfjdlkf", "skfsdf.svg");

        expect(file).toBeNull();
    });
});

describe("removeFile()", () => {
    it("should remove file by identifier", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFile("assets/img/Image.png");

        expect(result).toBe(true);
        expect(codeBox.getFile("assets/img/Image.png")).toBeNull();
    });

    it("should return false if file does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFile("asůldkfjdslkfj/lksadflkdsfj.png");

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

        const result = codeBox.changeFileIdentifier("assets/img/Image.png", "assets/images/MyImage.png");

        expect(codeBox.getFile("assets/img/Image.png")).toBeNull();
        expect(codeBox.getFile("assets/images/MyImage.png")).not.toBeNull();
        expect(result).toBe(true);
    });

    it("should return false if file is not found", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileIdentifier("asdlkfjd/slkdfdsl.png", "sdfddfd/image.png");

        expect(result).toBe(false);
    });

    it("should not change identifier if there already is file with the same identifier", () => {
        const codeBox = createCodeBox();

        const file = codeBox.getFile("assets/img/Image.png");
        const result = codeBox.changeFileIdentifier("assets/img/Image.png", "assets/img/favicon.svg");

        expect(file?.getIdentifier()).toBe("assets/img/Image.png");
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(result).toBe(false);
    });
});

describe("changeFilePackage()", () => {
    it("should change package of file but keep folder path", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const file = codeBox.getFileByPackage("io.github.jirkasa", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", "new.package", true);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("assets/img");
        expect(file?.getPackage()).toBe("new.package");
    });

    it("should change package of file and also folder path", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const file = codeBox.getFileByPackage("io.github.jirkasa", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", "new.package", false);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("src/main/java/new.package");
        expect(file?.getPackage()).toBe("new.package");
    });

    it("should change package of file and also folder path when foldersDelimiterForPackages option is set", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const file = codeBox.getFileByPackage("io.github.jirkasa", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", "new.package", false);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("src/main/java/new/package");
        expect(file?.getPackage()).toBe("new.package");
    });

    it("should set package for file that does not yet have package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });
        const file = codeBox.getFileByFolderPath("assets/img", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", "new.package", true);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("assets/img");
        expect(file?.getPackage()).toBe("new.package");
    });

    it("should set package for file that does not yet have package and move it to different folder", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const file = codeBox.getFileByFolderPath("assets/img", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", "new.package", false);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("src/main/java/new/package");
        expect(file?.getPackage()).toBe("new.package");
    });

    it("should set file to default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const file = codeBox.getFileByFolderPath("assets/img", "favicon.svg");

        const result = codeBox.changeFilePackage("assets/img/favicon.svg", null, true);

        expect(result).toBe(true);
        expect(file?.getFolderPath()).toBe("assets/img");
        expect(file?.getPackage()).toBeNull();
    });
});

describe("removeFilePackage()", () => {
    it("should remove file from package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const file = codeBox.getFileByPackage("io.github.jirkasa", "favicon.svg");

        const result = codeBox.removeFilePackage("assets/img/favicon.svg");

        expect(result).toBe(true);
        expect(file?.getPackage()).toBeUndefined();
    });

    it("should remove file from default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });
        const file = codeBox.getFileByPackage(null, "src/main/java/default_data.xls");

        const result = codeBox.removeFilePackage("src/main/java/default_data.xls");

        expect(result).toBe(true);
        expect(file?.getPackage()).toBeUndefined();
    });
});

describe("getFilePackage()", () => {
    it("should return package of file", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getFilePackage("assets/img/favicon.svg");

        expect(packageName).toBe("io.github.jirkasa");
    });

    it("should return null if file is in default package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getFilePackage("src/main/java/default_data.xls");

        expect(packageName).toBeNull();
    });

    it("should return undefined if file does not have package", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const packageName = codeBox.getFilePackage("assets/img/Image.png");

        expect(packageName).toBeUndefined();
    });
});

describe("changeFileDownloadLink()", () => {
    it("should change download link of file", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("assets/img/Image.png", "../static/SomethingElse.png");

        expect(result).toBe(true);
        const file = codeBox.getFile("assets/img/Image.png");
        expect(file?.getDownloadLink()).toBe("../static/SomethingElse.png");
    });

    it("should set file as non-downloadable", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("assets/img/Image.png", null);

        expect(result).toBe(true);
        const file = codeBox.getFile("assets/img/Image.png");
        expect(file?.getDownloadLink()).toBeNull();
    });

    it("should return false when file does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.changeFileDownloadLink("asůlfdslfj", "../static/SomethingElse.png");

        expect(result).toBe(false);
    });
});

describe("addFolder()", () => {
    it("should add folders", () => {
        const codeBox = createCodeBox();

        codeBox.addFolder("new/something/folder");

        expect(codeBox.folderExists("new/something/folder")).toBe(true);
    });
});

describe("removeFolder()", () => {
    it("should remove folder and all its contents", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFolder("css");

        expect(result).toBe(true);
        expect(codeBox.folderExists("css")).toBe(false);
        expect(codeBox.getCodeView("css/style.css")).toBeNull();
        expect(codeBox.getCodeView("css/subfolder/anotherStyle.css")).toBeNull();
    });

    it("should remove folder and also packages", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const result = codeBox.removeFolder("src/main");

        expect(result).toBe(true);
        expect(codeBox.folderExists("src/main")).toBe(false);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.getCodeView("src/main/java/io/github/jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("should return false if folder does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removeFolder("sdfksdjkfdf");

        expect(result).toBe(false);
    });
});

describe("renameFolder()", () => {
    it("should rename folder", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renameFolder("css", "styles");

        expect(result).toBe(true);
        expect(codeBox.folderExists("css")).toBe(false);
        expect(codeBox.folderExists("styles")).toBe(true);
        expect(codeBox.getCodeView("css/style.css")).toBeNull();
        expect(codeBox.getCodeView("styles/style.css")?.getIdentifier()).toBe("styles/style.css");
        expect(codeBox.getCodeView("css/subfolder/anotherStyle.css")).toBeNull();
        expect(codeBox.getCodeView("styles/subfolder/anotherStyle.css")?.getIdentifier()).toBe("styles/subfolder/anotherStyle.css");
    });

    it("should rename folder path for packages", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });

        const result = codeBox.renameFolder("src/main", "new");

        expect(result).toBe(true);
        expect(codeBox.folderExists("src/main")).toBe(false);
        expect(codeBox.folderExists("src/new")).toBe(true);
        expect(codeBox.getPackagesFolderPath()).toBe("src/new/java");
    });

    it("should rename packages", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java", foldersDelimiterForPackages: "." });

        const result = codeBox.renameFolder("src/main/java/io/github/jirkasa", "something");

        expect(result).toBe(true);
        expect(codeBox.folderExists("src/main/java/io/github/jirkasa")).toBe(false);
        expect(codeBox.folderExists("src/main/java/io/github/something")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.packageExists("io.github.something")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa.data")).toBe(false);
        expect(codeBox.packageExists("io.github.something.data")).toBe(true);
        expect(codeBox.getFile("src/main/java/io/github/jirkasa/data/data.xls")).toBeNull();
        expect(codeBox.getFile("src/main/java/io/github/something/data/data.xls")?.getIdentifier()).toBe("src/main/java/io/github/something/data/data.xls");
    });

    it("should return false if folder does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renameFolder("asdkfjkf/sdklfjdskf", "skfjdf");

        expect(result).toBe(false);
    });

    it("should remove slashes from passed name", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renameFolder("css", "sty/le/s");

        expect(result).toBe(true);
        expect(codeBox.folderExists("css")).toBe(false);
        expect(codeBox.folderExists("styles")).toBe(true);
    });
});

describe("openFolder()", () => {
    it("should open folder", () => {
        const codeBox = createCodeBox();

        codeBox.openFolder("css");

        expect(codeBox.folderExists("css")).toBe(true);
        expect(codeBox.isFolderOpened("css")).toBe(true);
    });

    it("should open folder and its parent folders", () => {
        const codeBox = createCodeBox();

        codeBox.openFolder("css/subfolder", true);

        expect(codeBox.folderExists("css/subfolder")).toBe(true);
        expect(codeBox.isFolderOpened("css/subfolder")).toBe(true);
        expect(codeBox.folderExists("css")).toBe(true);
        expect(codeBox.isFolderOpened("css")).toBe(true);
    });
});

describe("closeFolder()", () => {
    it("should close folder", () => {
        const codeBox = createCodeBox();
        codeBox.openFolder("css");

        codeBox.closeFolder("css");

        expect(codeBox.folderExists("css")).toBe(true);
        expect(codeBox.isFolderOpened("css")).toBe(false);
    });

    it("should close folder and its subfolders", () => {
        const codeBox = createCodeBox();
        codeBox.openFolder("css/subfolder", true);

        codeBox.closeFolder("css", true);

        expect(codeBox.folderExists("css/subfolder")).toBe(true);
        expect(codeBox.isFolderOpened("css/subfolder")).toBe(false);
        expect(codeBox.folderExists("css")).toBe(true);
        expect(codeBox.isFolderOpened("css")).toBe(false);
    });
});

describe("folderExists()", () => {
    it("should return true when folder exists", () => {
        const codeBox = createCodeBox();

        const result = codeBox.folderExists("src");
        
        expect(result).toBe(true);
    });

    it("should return false when folder does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.folderExists("sjaslk");
        
        expect(result).toBe(false);
    });
});

describe("isFolderOpened()", () => {
    it("should return false when folder is not opened", () => {
        const codeBox = createCodeBox();
        codeBox.closeFolder("css");

        const result = codeBox.isFolderOpened("css");

        expect(codeBox.folderExists("css")).toBe(true);
        expect(result).toBe(false);
    });

    it("should return true when folder is opened", () => {
        const codeBox = createCodeBox();
        codeBox.openFolder("css");

        const result = codeBox.isFolderOpened("css");

        expect(codeBox.folderExists("css")).toBe(true);
        expect(result).toBe(true);
    });

    it("should return false when folder does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.isFolderOpened("asůldkfjdfj");

        expect(codeBox.folderExists("asůldkfjdfj")).toBe(false);
        expect(result).toBe(false);
    });

    it("should return false when path to root folder is passed and root folder is not opened", () => {
        const codeBox = createCodeBox();
        codeBox.closeFolder("/");

        const result = codeBox.isFolderOpened("/");

        expect(result).toBe(false);
    });

    it("should return true when path to root folder is passed and root folder is opened", () => {
        const codeBox = createCodeBox();
        codeBox.openFolder("/");

        const result = codeBox.isFolderOpened("/");

        expect(result).toBe(true);
    });
});

describe("getSubfolderNames()", () => {
    it("should return subfolder names of folder", () => {
        const codeBox = createCodeBox();

        const subfolders = codeBox.getSubfolderNames("css");

        expect(subfolders).toEqual(["subfolder"]);
    });

    it("should return subfolders of root folder", () => {
        const codeBox = createCodeBox();

        const subfolders = codeBox.getSubfolderNames("/");

        expect(subfolders?.length).toBeGreaterThan(0);
    });
});

describe("addPackage()", () => {
    it("should add package and create folder for package", () => {
        const codeBox = createCodeBox();

        codeBox.addPackage("my.test");

        expect(codeBox.packageExists("my.test")).toBe(true);
        expect(codeBox.folderExists("my.test")).toBe(true);
    });

    it("should add package and do not create folder for package when createFoldersForPackages option is set to false", () => {
        const codeBox = createCodeBox({ createFoldersForPackages: false });

        codeBox.addPackage("my.test");

        expect(codeBox.packageExists("my.test")).toBe(true);
        expect(codeBox.folderExists("my.test")).toBe(false);
    });

    it("should add package and create folders based on delimiter", () => {
        const codeBox = createCodeBox({ foldersDelimiterForPackages: "." });

        codeBox.addPackage("my.test");

        expect(codeBox.packageExists("my.test")).toBe(true);
        expect(codeBox.folderExists("my.test")).toBe(false);
        expect(codeBox.folderExists("my/test")).toBe(true);
    });
});

describe("removePackage()", () => {
    it("should remove package but keep folder, code views and files", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removePackage("io.github.jirkasa", false);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")?.getPackage()).toBeUndefined();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("should remove package and its folder", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removePackage("io.github.jirkasa");

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("should remove package, its folder, and all its code views and files", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removePackage("io.github.jirkasa", true, true);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).toBeNull();
    });

    it("should remove package and all its code views and files but do not remove folder", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removePackage("io.github.jirkasa", false, true);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).toBeNull();
    });

    it("it should remove package and its code view and files in its folder that belong to that package but do not remove the folder as it contains some other stuff (foldersDelimiterForPackages option is set)", () => {
        const codeBox = createCodeBox({ foldersDelimiterForPackages: "." });

        const result = codeBox.removePackage("io.github.jirkasa");

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io/github/jirkasa")).toBe(true);
        expect(codeBox.folderExists("io/github/jirkasa/data")).toBe(true);
        expect(codeBox.getCodeView("io/github/jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("it should remove package and its code view and files but do not remove the folder as it contains some other stuff (foldersDelimiterForPackages option is set)", () => {
        const codeBox = createCodeBox({ foldersDelimiterForPackages: "." });

        const result = codeBox.removePackage("io.github.jirkasa", true, true);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("io/github/jirkasa")).toBe(true);
        expect(codeBox.folderExists("io/github/jirkasa/data")).toBe(true);
        expect(codeBox.getCodeView("io/github/jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).toBeNull();
    });

    it("should remove package but keep folder, code views and files when packagesFolderPath option is set", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });

        const result = codeBox.removePackage("io.github.jirkasa", false);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("src/main/java/io.github.jirkasa")).toBe(true);
        expect(codeBox.getCodeView("src/main/java/io.github.jirkasa/MyApp.java")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getCodeView("src/main/java/io.github.jirkasa/MyApp.java")?.getPackage()).toBeUndefined();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("should return false when package does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.removePackage("asldkfjkd");

        expect(result).toBe(false);
    });

    it("should remove package but keep code views and files when createFoldersForPackages options is disabled", () => {
        const codeBox = createCodeBox({ createFoldersForPackages: false });

        const result = codeBox.removePackage("io.github.jirkasa");

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.getCodeView("MyApp.java")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getCodeView("MyApp.java")?.getPackage()).toBeUndefined();
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBeUndefined();
    });

    it("should remove package and its code views and files when createFoldersForPackages options is disabled but true is passed as last parameter", () => {
        const codeBox = createCodeBox({ createFoldersForPackages: false });

        const result = codeBox.removePackage("io.github.jirkasa", true, true);

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.getCodeView("MyApp.java")).toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).toBeNull();
    });
});

describe("renamePackage()", () => {
    it("should rename package and its folder", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renamePackage("io.github.jirkasa", "something.else");

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.packageExists("something.else")).toBe(true);
        expect(codeBox.folderExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.folderExists("something.else")).toBe(true);
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getCodeView("something.else/MyApp.java")).not.toBeNull();
        expect(codeBox.getCodeView("something.else/MyApp.java")?.getPackage()).toBe("something.else");
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBe("something.else");
    });

    it("should rename package and its folders when delimiter is set and potentionally create new folder", () => {
        const codeBox = createCodeBox({ foldersDelimiterForPackages: "." });

        const result = codeBox.renamePackage("io.github.jirkasa", "io.sickhub.jirkasa.new");

        expect(result).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(false);
        expect(codeBox.packageExists("io.sickhub.jirkasa.new")).toBe(true);
        expect(codeBox.folderExists("io/sickhub/jirkasa/new")).toBe(true);
        expect(codeBox.getCodeView("io/github/jirkasa/MyApp.java")).toBeNull();
        expect(codeBox.getCodeView("io/sickhub/jirkasa/new/MyApp.java")?.getPackage()).toBe("io.sickhub.jirkasa.new");
        expect(codeBox.getFile("assets/img/favicon.svg")?.getPackage()).toBe("io.sickhub.jirkasa.new");
    });

    it("should return false when package does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renamePackage("lskdjflkdasf", "newPackage");

        expect(result).toBe(false);
    });

    it("should return false when new package name is already taken", () => {
        const codeBox = createCodeBox();

        const result = codeBox.renamePackage("io.github.jirkasa", "io.github.jirkasa.data");

        expect(result).toBe(false);
    });
});

describe("openPackage()", () => {
    it("should open package", () => {
        const codeBox = createCodeBox();

        codeBox.openPackage("io.github.jirkasa");

        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.isPackageOpened("io.github.jirkasa")).toBe(true);
    });

    it("should open default package", () => {
        const codeBox = createCodeBox();

        codeBox.openPackage(null);

        expect(codeBox.isPackageOpened(null)).toBe(true);
    });
});

describe("closePackage()", () => {
    it("should close package", () => {
        const codeBox = createCodeBox();
        codeBox.openPackage("io.github.jirkasa");

        codeBox.closePackage("io.github.jirkasa");

        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.isPackageOpened("io.github.jirkasa")).toBe(false);
    });

    it("should open default package", () => {
        const codeBox = createCodeBox();

        codeBox.closePackage(null);

        expect(codeBox.isPackageOpened(null)).toBe(false);
    });
});

describe("packageExists()", () => {
    it("should return true when package exists", () => {
        const codeBox = createCodeBox();

        const result = codeBox.packageExists("io.github.jirkasa");

        expect(result).toBe(true);
    });

    it("should return false when package does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.packageExists("ksldfa");

        expect(result).toBe(false);
    });
});

describe("isPackageOpened()", () => {
    it("should return false when package is not opened", () => {
        const codeBox = createCodeBox();
        codeBox.closePackage("io.github.jirkasa");

        const result = codeBox.isPackageOpened("io.github.jirkasa");

        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(result).toBe(false);
    });

    it("should return true when package is opened", () => {
        const codeBox = createCodeBox();
        codeBox.openPackage("io.github.jirkasa");

        const result = codeBox.isPackageOpened("io.github.jirkasa");

        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(result).toBe(true);
    });

    it("should return false package when package does not exist", () => {
        const codeBox = createCodeBox();

        const result = codeBox.isPackageOpened("sdkfjsdfkl");

        expect(codeBox.packageExists("sdkfjsdfkl")).toBe(false);
        expect(result).toBe(false);
    });

    it("should return false when default package is not opened", () => {
        const codeBox = createCodeBox();
        codeBox.closePackage(null);

        const result = codeBox.isPackageOpened(null);

        expect(result).toBe(false);
    });

    it("should return true when default package is opened", () => {
        const codeBox = createCodeBox();
        codeBox.openPackage(null);

        const result = codeBox.isPackageOpened(null);

        expect(result).toBe(true);
    });
});

describe("getPackages()", () => {
    it("should return array of package names", () => {
        const codeBox = createCodeBox();

        const packages = codeBox.getPackages();

        expect(packages.length).toBeGreaterThan(0);
    });
});

describe("getPackagesFolderPath()", () => {
    it("should return packages folder path when root folder is set as folder path for packages", () => {
        const codeBox = createCodeBox();

        const folderPath = codeBox.getPackagesFolderPath();

        expect(folderPath).toBe("");
    });

    it("should return packages folder path", () => {
        const codeBox = createCodeBox({ packagesFolderPath: "src/main/java" });

        const folderPath = codeBox.getPackagesFolderPath();

        expect(folderPath).toBe("src/main/java");
    });
});

describe("changePackagesFolderPathAndRemoveAll()", () => {
    it("should change packages folder path and remove all code views, files, folders and packages", () => {
        const codeBox = createCodeBox();

        codeBox.changePackagesFolderPathAndRemoveAll("src/main");

        expect(codeBox.getPackagesFolderPath()).toBe("src/main");
        expect(codeBox.getCodeViews().length).toBe(0);
        expect(codeBox.getFiles().length).toBe(0);
        const subfolderNames = codeBox.getSubfolderNames("/");
        expect(subfolderNames).not.toBeNull();
        if (subfolderNames != null) {
            expect(subfolderNames.length).toBe(0);
        }
        expect(codeBox.getPackages().length).toBe(0);
        expect(codeBox.getActiveCodeView()).toBeNull();
    });
});

describe("getProjectName()", () => {
    it("should return name of project (root) folder", () => {
        const codeBox = createCodeBox({ projectName: "my-test" });

        const projectName = codeBox.getProjectName();

        expect(projectName).toBe("my-test");
    });
});

describe("setProjectName()", () => {
    it("should rename project (root) folder", () => {
        const codeBox = createCodeBox({ projectName: "my-test" });

        codeBox.setProjectName("my-new-name");

        expect(codeBox.getProjectName()).toBe("my-new-name");
    });
});

describe("openPanel()", () => {
    it("should open panel", () => {
        const codeBox = createCodeBox();

        codeBox.openPanel();

        expect(codeBox.isPanelOpened()).toBe(true);
    });
});

describe("closePanel()", () => {
    it("should close panel", () => {
        const codeBox = createCodeBox();
        codeBox.openPanel();

        codeBox.closePanel();

        expect(codeBox.isPanelOpened()).toBe(false);
    });
});

describe("isPanelOpened()", () => {
    it("should return false when panel is not opened", () => {
        const codeBox = createCodeBox();
        codeBox.closePanel();

        const result = codeBox.isPanelOpened();

        expect(result).toBe(false);
    });

    it("should return true when panel is opened", () => {
        const codeBox = createCodeBox();
        codeBox.openPanel();

        const result = codeBox.isPanelOpened();

        expect(result).toBe(true);
    });
});

describe("reset()", () => {
    it("should reset code box to its post-initialization state", () => {
        const codeBox = createCodeBox();
        codeBox.addFolder("newFolder");
        codeBox.removeFolder("src/main");
        codeBox.removePackage("io.github.jirkasa.data");
        codeBox.addPackage("io.github.jirkasa.new");
        codeBox.changeCodeViewPackage("css/style.css", "io.github.jirkasa", false);

        codeBox.reset();

        expect(codeBox.getCodeViews().length).toBe(6);
        expect(codeBox.getFiles().length).toBe(5);
        expect(codeBox.getPackages().length).toBe(2);
        expect(codeBox.folderExists("src/main/java")).toBe(true);
        expect(codeBox.folderExists("src/main/resources")).toBe(true);
        expect(codeBox.folderExists("src/main/webapp")).toBe(true);
        expect(codeBox.folderExists("src/test/java")).toBe(true);
        expect(codeBox.folderExists("src/test/resources")).toBe(true);
        expect(codeBox.folderExists("target")).toBe(true);
        expect(codeBox.folderExists("newFolder")).toBe(false);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa.data")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa.new")).toBe(false);
        expect(codeBox.getCodeView("css/style.css")).not.toBeNull();
        expect(codeBox.getCodeView("css/style.css")?.getPackage()).toBeUndefined();
        expect(codeBox.getCodeView("css/subfolder/anotherStyle.css")).not.toBeNull();
        expect(codeBox.getCodeView("js/main.js")).not.toBeNull();
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).not.toBeNull();
        expect(codeBox.getCodeView("Something.java")).not.toBeNull();
        expect(codeBox.getCodeView("pom.xml")).not.toBeNull();
        expect(codeBox.getFile("assets/img/Image.png")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getFile("something.zip")).not.toBeNull();
        expect(codeBox.getFile("io.github.jirkasa.data/data.xls")).not.toBeNull();
        expect(codeBox.getFile("default_data.xls")).not.toBeNull();
    });
});

describe("createMemento() + applyMemento()", () => {
    it("should create and apply memento", () => {
        const codeBox = createCodeBox();

        const memento = codeBox.createMemento();
        codeBox.addFolder("newFolder");
        codeBox.removeFolder("src/main");
        codeBox.removePackage("io.github.jirkasa.data");
        codeBox.addPackage("io.github.jirkasa.new");
        codeBox.changeCodeViewPackage("css/style.css", "io.github.jirkasa", false);
        codeBox.applyMemento(memento);

        expect(codeBox.getCodeViews().length).toBe(6);
        expect(codeBox.getFiles().length).toBe(5);
        expect(codeBox.getPackages().length).toBe(2);
        expect(codeBox.folderExists("src/main/java")).toBe(true);
        expect(codeBox.folderExists("src/main/resources")).toBe(true);
        expect(codeBox.folderExists("src/main/webapp")).toBe(true);
        expect(codeBox.folderExists("src/test/java")).toBe(true);
        expect(codeBox.folderExists("src/test/resources")).toBe(true);
        expect(codeBox.folderExists("target")).toBe(true);
        expect(codeBox.folderExists("newFolder")).toBe(false);
        expect(codeBox.packageExists("io.github.jirkasa")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa.data")).toBe(true);
        expect(codeBox.packageExists("io.github.jirkasa.new")).toBe(false);
        expect(codeBox.getCodeView("css/style.css")).not.toBeNull();
        expect(codeBox.getCodeView("css/style.css")?.getPackage()).toBeUndefined();
        expect(codeBox.getCodeView("css/subfolder/anotherStyle.css")).not.toBeNull();
        expect(codeBox.getCodeView("js/main.js")).not.toBeNull();
        expect(codeBox.getCodeView("io.github.jirkasa/MyApp.java")).not.toBeNull();
        expect(codeBox.getCodeView("Something.java")).not.toBeNull();
        expect(codeBox.getCodeView("pom.xml")).not.toBeNull();
        expect(codeBox.getFile("assets/img/Image.png")).not.toBeNull();
        expect(codeBox.getFile("assets/img/favicon.svg")).not.toBeNull();
        expect(codeBox.getFile("something.zip")).not.toBeNull();
        expect(codeBox.getFile("io.github.jirkasa.data/data.xls")).not.toBeNull();
        expect(codeBox.getFile("default_data.xls")).not.toBeNull();
    });
});