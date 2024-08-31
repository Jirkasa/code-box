import { CodeView, TabCodeBox, ProjectCodeBox } from "../../code-box/index";

new CodeView(document.getElementById("SimpleCodeView"));

new CodeView(document.getElementById("HighlightingExampleCodeView"), {
    highlight: "1-2,6"
});

new TabCodeBox(document.getElementById("TabCodeBoxExample"), {
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});

new ProjectCodeBox(document.getElementById("ProjectCodeBoxExample"), {
    minCodeViewLinesCount: 20,
    projectName: "example-app",
    packagesFolderPath: "src/main/java",
    foldersDelimiterForPackages: ".",
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folderArrow: "arrow-right",
        folder: "folder",
        project: "inventory",
        package: "package"
    }
});

const codeBox1 = new ProjectCodeBox(document.getElementById("CodeBoxInheritance1"), {
    minCodeViewLinesCount: 10,
    openPanelOnInit: true,
    svgSpritePath: "../static/icon-sprite.svg",
    projectName: "example-app",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folderArrow: "arrow-right",
        folder: "folder",
        project: "inventory",
        package: "package"
    }
});

new ProjectCodeBox(document.getElementById("CodeBoxInheritance2"), {
    minCodeViewLinesCount: 10,
    openPanelOnInit: true,
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folderArrow: "arrow-right",
        folder: "folder",
        project: "inventory",
        package: "package"
    }
}, codeBox1);

new CodeView(document.getElementById("StylingCodeViewExample"), {
    highlight: "4"
});

new TabCodeBox(document.getElementById("StylingTabCodeBoxExample"), {
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});

new ProjectCodeBox(document.getElementById("StylingProjectCodeBoxExample"), {
    minCodeViewLinesCount: 20,
    projectName: "example-app",
    packagesFolderPath: "src/main/java",
    foldersDelimiterForPackages: ".",
    svgSpritePath: "../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download",
        panelOpenButton: "double-arrow-right",
        folderArrow: "arrow-right",
        folder: "folder",
        project: "inventory",
        package: "package"
    }
});

const counterCodeView = new CodeView(document.getElementById("VisualizationOfCodeExecutionExample"));

const highlightBox = counterCodeView.addHighlight(1);
const steps = [4, 5, 7, 4, 5, 7, 4, 5, 7, 8];
let currentStep = 0;

setInterval(() => {
    const lineNumber = steps[currentStep];

    highlightBox.setRange(lineNumber);

    if (currentStep === (steps.length - 1)) {
        currentStep = 0;
    } else {
        currentStep++;
    }
}, 400);