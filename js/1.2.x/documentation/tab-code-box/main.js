import { TabCodeBox } from "../../../../code-box/v1.2.x/index";

new TabCodeBox(document.getElementById("CreateTabCodeBoxExample"), {
    svgSpritePath: "../../../static/icon-sprite.svg",
    svgSpriteIcons: {
        codeFile: "file",
        file: "file-2",
        download: "download"
    }
});