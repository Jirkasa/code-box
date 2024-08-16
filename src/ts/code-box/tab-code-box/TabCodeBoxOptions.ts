import CodeBoxOptions from "../CodeBoxOptions";

/** Tab code box options. */
type TabCodeBoxOptions = {
    /** Path to the SVG sprite that contains icons. */
    svgSpritePath ?: string;
    /** Names of the icons in the SVG sprite. */
    svgSpriteIcons ?: {
        /** Icon for the code view button. */
        codeFile ?: string;
        /** Icon for the file button. */
        file ?: string;
        /** Icon that is displayed on file buttons with a download link. */
        download ?: string;
    }
} & CodeBoxOptions;

export default TabCodeBoxOptions;