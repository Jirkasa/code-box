import { TabCodeBox } from "../../../code-box/index";

new TabCodeBox(document.getElementById("CreateTabCodeBoxExample"), {
    svgSpritePath: "../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});