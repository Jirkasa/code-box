import CodeBoxOptions from "../CodeBoxOptions";

type TabCodeBoxOptions = {
    svgSpritePath ?: string;
    svgSpriteIcons ?: {
        codeFile ?: string;
        file ?: string;
        download ?: string;
    }
} & CodeBoxOptions;

export default TabCodeBoxOptions;