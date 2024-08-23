import { CodeView, TabCodeBox, ProjectCodeBox } from "../../../code-box/index";

const cssCodeSwitches = document.querySelectorAll("[data-css-code-switch]");
cssCodeSwitches.forEach(codeSwitch => {
    const lessCodeExample = codeSwitch.parentElement.querySelector("[data-less-code]");
    const cssCodeExample = codeSwitch.parentElement.querySelector("[data-css-code]");

    if (lessCodeExample && cssCodeExample) {
        codeSwitch.addEventListener("change", () => {
            if (codeSwitch.value === "CSS") {
                lessCodeExample.style.display = "none";
                cssCodeExample.style.removeProperty("display");
            } else {
                lessCodeExample.style.removeProperty("display");
                cssCodeExample.style.display = "none";
            }
        });
    }
});

new CodeView(document.getElementById("CodeViewStylingExample"), { highlight: "2"});

new TabCodeBox(document.getElementById("TabCodeBoxStylingExample"), {
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});

new ProjectCodeBox(document.getElementById("ProjectCodeBoxStylingExample"), {
    minCodeViewLinesCount: 20,
    packagesFolderPath: "src/main/java",
    foldersDelimiterForPackages: ".",
    projectName: "example-app",
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