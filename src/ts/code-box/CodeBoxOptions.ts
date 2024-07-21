import CodeViewOptions from "../code-view/CodeViewOptions";

type CodeBoxOptions = {
    lazyInit ?: boolean;
    implicitActive ?: boolean; // default je false
    defaultCodeViewOptions ?: CodeViewOptions;
    noCodeViewSelectedElementHeight ?: string; // prostě se to bude nastavovat tady a ne v CSS
    noCodeViewSelectedText ?: string;
    minCodeViewLinesCount ?: number; // ale okomentovat to - podle toho se jen bere minimální výška pro code view containery - není to přesné - nebere to v potaz padding (je to jen k tomu, aby se mohla nastavit nějaká optimální minimální výška)
}

// dále jsou tu file elementy:
    // - data-cb-file=cestakestažení data-cb-name=název - u ProjectCodeBoxu můžou být ještě další

export default CodeBoxOptions;