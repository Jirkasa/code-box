type CodeViewOptions = {
    highlight ?: string; // todo - asi umožním předat i barvu - nebo spíš css třídu - nebudu to komplikovat
    showGutter ?: boolean;
    showLineNumbers ?: boolean;
    lineHeight ?: number;
    lineHeightUnit ?: string;
    cssClasses ?: string[];
} // todo - ještě možnost přidat plugin

// html only: (něco je i pro File elementy)
/**
 * Project + Tab:
 * data-cb-active
 * data-cb-name
 * 
 * Project:
 * data-cb-folder
 * data-cb-package
 */

export default CodeViewOptions;

/**
 * File elementy:
 * data-cb-file
 */

/**
 * Konfigurační element se složkami:
 * data-cb-folders (ul element)
 * data-cb-packages-folder
 * data-cb-commands
 * data-cb-opened
 */