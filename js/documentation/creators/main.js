import { CodeViewCreator, TabCodeBoxCreator, ProjectCodeBoxCreator, VirtualCodeBoxCreator } from "../../../code-box/index";

const codeViewCreator = new CodeViewCreator();
codeViewCreator.create("[data-my-code-view]");

const codeViewIdentifierExampleCreator = new CodeViewCreator();
codeViewIdentifierExampleCreator.create("[data-code-view-identifier-example]");

const codeView = codeViewIdentifierExampleCreator.getCreatedCodeViewById("MyIdentifier");
codeView.addHighlight("4");

const codeBoxIdentifierExampleCreator = new TabCodeBoxCreator({
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});
codeBoxIdentifierExampleCreator.create("[data-code-box-identifier-example]");

const codeBox = codeBoxIdentifierExampleCreator.getCreatedCodeBoxById("MyIdentifier");
codeBox.init();
codeBox.setActiveCodeView("connecting strings");

const tabCodeBoxCreator = new TabCodeBoxCreator({
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});
tabCodeBoxCreator.create("[data-tab-code-box-creator-example]");

const projectCodeBoxCreator = new ProjectCodeBoxCreator({
    minCodeViewLinesCount: 10,
    svgSpritePath: "../../static/icon-sprite.svg",
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
projectCodeBoxCreator.create("[data-project-code-box-creator-example]");

const projectCodeBoxInheritanceExampleCreator = new ProjectCodeBoxCreator({
    minCodeViewLinesCount: 10,
    svgSpritePath: "../../static/icon-sprite.svg",
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
projectCodeBoxInheritanceExampleCreator.create("[data-project-code-box-inheritance-example]");

const virtualCodeBoxCreator = new VirtualCodeBoxCreator();
virtualCodeBoxCreator.create("[data-virtual-code-box-creator-example]");