/** Utility to create HTML code for SVG icons. */
class SVGIconElementCreator {
    /**
     * Creates HTML code for SVG icon.
     * @param svgSpritePath Path to SVG sprite with icons.
     * @param iconName Name of icon.
     * @returns HTML for SVG icon.
     */
    public static create(svgSpritePath : string, iconName : string) : string {
        return `
        <svg>
            <use xlink:href="${svgSpritePath}#${iconName}"></use>
        </svg>
        `;
    }
}

export default SVGIconElementCreator;