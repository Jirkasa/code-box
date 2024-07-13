class SVGIconElementCreator {
    public static create(svgSpritePath : string, iconName : string) : string {
        return `
        <svg>
            <use xlink:href="${svgSpritePath}#${iconName}"></use>
        </svg>
        `;
    }
}

export default SVGIconElementCreator;