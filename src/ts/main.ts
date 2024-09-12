// CodeView
export { default as CodeView } from "./code-view/CodeView";
export { default as CodeViewMemento } from "./code-view/CodeViewMemento";
export { default as CodeViewOptions } from "./code-view/CodeViewOptions";
export { default as HighlightBox } from "./code-view/HighlightBox";

// CodeBox (core)
export { default as CodeBox, CodeBoxItemInfo, CodeViewInfo, FileInfo } from "./code-box/CodeBox";
export { default as CodeBoxBuilder } from "./code-box/CodeBoxBuilder";
export { default as CodeBoxCodeView } from "./code-box/CodeBoxCodeView";
export { default as CodeBoxCodeViewManager } from "./code-box/CodeBoxCodeViewManager";
export { default as CodeBoxFile } from "./code-box/CodeBoxFile";
export { default as CodeBoxFileManager } from "./code-box/CodeBoxFileManager";
export { default as CodeBoxMemento, CodeViewMementoEntry, FileMementoEntry } from "./code-box/CodeBoxMemento";
export { default as CodeBoxOptions } from "./code-box/CodeBoxOptions";
export { default as CodeViewButton } from "./code-box/CodeViewButton";
export { default as ElementCodeViewButton } from "./code-box/ElementCodeViewButton";
export { default as FileButton } from "./code-box/FileButton";
export { default as ElementFileButon } from "./code-box/ElementFileButton";

// TabCodeBox
export { default as TabCodeBox } from "./code-box/tab-code-box/TabCodeBox";
export { default as TabCodeBoxCodeView } from "./code-box/tab-code-box/TabCodeBoxCodeView";
export { default as TabCodeBoxFile } from "./code-box/tab-code-box/TabCodeBoxFile";
export { default as TabCodeBoxOptions} from "./code-box/tab-code-box/TabCodeBoxOptions";

// ProjectCodeBox
export { default as ProjectCodeBox } from "./code-box/project-code-box/ProjectCodeBox";
export { default as ProjectCodeBoxCodeView } from "./code-box/project-code-box/ProjectCodeBoxCodeView";
export { default as ProjectCodeBoxFile } from "./code-box/project-code-box/ProjectCodeBoxFile";
export { default as ProjectCodeBoxOptions } from "./code-box/project-code-box/ProjectCodeBoxOptions";

// VirtualCodeBox
export { default as VirtualCodeBox } from "./code-box/virtual-code-box/VirtualCodeBox";

// Creators
export { default as CodeBoxCreator, CodeBoxCreatorEntry, AdditionalCodeBoxInfo } from "./creator/CodeBoxCreator";
export { default as CodeViewCreator, CodeViewCreatorEntry } from "./creator/CodeViewCreator";
export { default as TabCodeBoxCreator } from "./creator/TabCodeBoxCreator";
export { default as ProjectCodeBoxCreator } from "./creator/ProjectCodeBoxCreator";
export { default as VirtualCodeBoxCreator } from "./creator/VirtualCodeBoxCreator";



/**
TODO:
- neincludovat dev types do dist
- dokumentační komentáře kdyžtak upravit podle dokumentace (ale to uvidím jak se mi bude chtít)
- napsat testy (alespoň na složitější věci)
- dev prostředí kdyžtak okomentovat, ale asi to teď smazat - kdyžtak tam jen přidat text, že se jedná o development prostředí (kdyby někdo chtěl na knihovně pracovat)
- napsat README (přidat tam odkaz na dokumentaci)
- v README vysvětlit, jak se dá na knihovně pracovat
*/

/**

Jak vytvořit knihovnu:
- https://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6

- UglifyJsPlugin
 */

/**
 * počet řádků: 9393
 */

/*
Co otestovat:
X - CodeView
X - ProjectCodeBox
    - nevím jestli radši ještě neotestovat dědičnost (možná spíš ty mementa)
- TabCodeBox (tohle už bude o dost jednodušší - nejsou tam složky a packages)
- VirtualCodeBox
- ... a dál - asi mementa, možná creatory.. - ještě uvidím
*/