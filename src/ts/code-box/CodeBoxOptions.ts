import CodeViewOptions from "../code-view/CodeViewOptions";

type CodeBoxOptions = {
    lazyInit ?: boolean;
    implicitActive ?: boolean; // default je false
    defaultCodeViewOptions ?: CodeViewOptions;
    noCodeViewSelectedElementHeight ?: string; // prostě se to bude nastavovat tady a ne v CSS
    noCodeViewSelectedText ?: string;
}

// dále jsou tu file elementy:
    // - data-cb-file=cestakestažení data-cb-name=název - u ProjectCodeBoxu můžou být ještě další

export default CodeBoxOptions;