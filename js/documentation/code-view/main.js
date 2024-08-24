import { CodeView } from "../../../code-box/index";

const optionCodeSwitches = document.querySelectorAll("[data-option-code-switch]");
optionCodeSwitches.forEach(codeSwitch => {
    const optionsObjectCodeExample = codeSwitch.parentElement.querySelector("[data-options-object-code]");
    const dataAttributeCodeExample = codeSwitch.parentElement.querySelector("[data-data-attribute-code]");

    if (optionsObjectCodeExample && dataAttributeCodeExample) {
        codeSwitch.addEventListener("change", () => {
            if (codeSwitch.value === "DataAttribute") {
                optionsObjectCodeExample.style.display = "none";
                dataAttributeCodeExample.style.removeProperty("display");
            } else {
                optionsObjectCodeExample.style.removeProperty("display");
                dataAttributeCodeExample.style.display = "none";
            }
        });
    }
});

new CodeView(document.getElementById("CreateCodeViewExample"), {
    highlight: "1-2,6"
});

new CodeView(document.getElementById("CodeViewHighlightExample"), {
    highlight: "1-3,7"
});

new CodeView(document.getElementById("CodeViewShowGutterExample"), {
    showGutter: false
});

new CodeView(document.getElementById("CodeViewShowLineNumbersExample"), {
    showLineNumbers: false
});

new CodeView(document.getElementById("CodeViewLineHeightExample"), {
    lineHeight: 4
});