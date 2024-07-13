type CodeViewOptions = {
    highlight ?: string; // todo - asi umožním předat i barvu - nebo spíš css třídu - nebudu to komplikovat
    showGutter ?: boolean;
    showLineNumbers ?: boolean;
    lineHeight ?: number;
    lineHeightUnit ?: string;
    cssClasses ?: string[];
    // active je html only - a slouží to pro code boxy (a kdyžtak CodeBoxOptions budou mít jako vlastnost CodeViewOptions)
} // todo - ještě možnost přidat plugin

// html only:
/**
 * data-cb-active
 * data-cb-name
 */

export default CodeViewOptions;