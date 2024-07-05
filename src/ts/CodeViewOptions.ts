type CodeViewOptions = {
    highlight ?: string; // todo - asi umožním předat i barvu - nebo spíš css třídu - nebudu to komplikovat
    showGutter ?: boolean;
    showLineNumbers ?: boolean;
    lineHeight ?: number;
    lineHeightUnit ?: string;
} // todo - ještě možnost přidat plugin

// todo - půjdou nastavit additional třídy

export default CodeViewOptions;