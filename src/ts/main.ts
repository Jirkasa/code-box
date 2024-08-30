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
export { default as CodeBoxCreator } from "./creator/CodeBoxCreator";
export { default as CodeViewCreator } from "./creator/CodeViewCreator";
export { default as TabCodeBoxCreator } from "./creator/TabCodeBoxCreator";
export { default as ProjectCodeBoxCreator } from "./creator/ProjectCodeBoxCreator";
export { default as VirtualCodeBoxCreator } from "./creator/VirtualCodeBoxCreator";

/**

Jak vytvořit knihovnu:
https://krasimirtsonev.com/blog/article/javascript-library-starter-using-webpack-es6
UglifyJsPlugin

- pluginy se asi nebudou předávat jako options, ale budou se moci přidávat nebo odebírat pomocí metod
    - plugin třídy budou mít metody, které se budou volat v různých situacích: init, reset (nevím jak to bude u mementa - ale asi se předtím taky všechno nejdřív nějak resetuje? - takže by se ta metoda mohla taky volat?), a další - nebo lepší - mohlo by existovat PluginMemento - dalo by se tam třeba nějak vytvořit? - uvidím
    - asi to udělám jen pro code view - kdybych někdy v budoucnu chtěl, můžu to udělat i pro code boxy
 */

/**
    
    - Pluginy (uvidím jak to s pluginama nakonec bude):
        - v options by byla vlastnost plugin
            - předával by se tam new PluginInitializer<MyPlugin>()
                - přičemž CodeView by mělo tohle jako typ:
                    plugins : PluginInitializer<extends CodeViewPlugin>[] - něco takového
 */

/*

Příkazy:
    - možná spíš vytvořit jen atribut data-cb-command="příkaz"
    - to by možná bylo lepší - ale nevím jestli to tak dělat

    X - data-cb-command-rename-project
        - name

    X - data-cb-command-add-folder
        - folderPath
    X - data-cb-command-remove-folder
        - folderPath
    X - data-cb-command-rename-folder (toto je nebezpečné - protože já potřebuju získávat packages folder...)
        - folderPath
        - newName
    X - data-cb-command-open-folder (openParentFolders)
        - folderPath
        - openParentFolders (volitelné)
    X - data-cb-command-close-folder (closeChildFolders)
        - folderPath
        - closeChildFolders (volitelné)

    X - data-cb-command-add-package
        - name
    X - data-cb-command-remove-package
        - name
        - removePackageFoldersAndContents (volitelné)
        - removeAllCodeViewsAndFiles (volitelné)
    X - data-cb-command-rename-package
        - name
        - newName
    X - data-cb-command-open-package
        - name
    X - data-cb-command-close-package
        - name (volitelné) - null a undefined pro default package

    X - data-cb-command-remove-code-view
        - identifier
    X - data-cb-command-rename-code-view
        - identifier
        - newName
    X - data-cb-command-move-code-view-to-folder
        - identifier
        - folderPath
    X - data-cb-command-change-code-view-package
        - identifier
        - packageName - null a undefined pro default package
        - keepFolderPath (povinné!)
    X - data-cb-command-remove-code-view-package
        - identifier
    X - data-cb-command-remove-all-code-views

    X - data-cb-command-add-code-view-highlight
        - identifier
        - start
        - end (nepovinné)
    X - data-cb-command-remove-code-view-highlight
        - identifier
        - start (nepovinné)
        - end (nepovinné)
    X - data-cb-command-set-active-code-view
        - identifier
    X - data-cb-command-set-no-active-code-view

    X - data-cb-command-remove-file
        - identifier
    X - data-cb-command-rename-file
        - identifier
        - newName
    X - data-cb-command-move-file-to-folder
        - identifier
        - folderPath
    X - data-cb-command-change-file-package
        - identifier
        - packageName - null a undefined pro default package
        - keepFolderPath (povinné!)
    X - data-cb-command-remove-file-package
        - identifier
    X - data-cb-command-remove-all-files

    Tak ne, udělám to přes script, který se nebude spouštět, ale bude obsahovat json data:
    <script data-cb-commands type="application/json">[...]</script>

    Takže akorát se tam bude předávat nějaký objekt do pole jako command:
    {
    command: "název commandu"
    - nějaké další specifické atributy (třeba identifier)
    }

    - teď mě napadá, jestli neudělat tímto způsobem i folder structure konfigurační element - asi ne, to by se ne moc komfortně používalo
        - ale zase nevím jestli to použití konfiguračních elementů je ideální
*/

/*
ProjectCodeBox poznámky:
- napsat testy na tady ty věci můžu (hlavně na metody, které jsou složitější - na ty jednoduché ani moc nemusím)
- upravit importy
*/



/*
CodeViewOptions poznámky:
*/
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

/**
 * File elementy:
 * data-cb-file
 */

/**
 * Konfigurační element se složkami:
 * data-cb-folders (ul element)
 * data-cb-packages-folder
 * data-cb-opened
 */

/**
 * Element s příkazy:
 * data-cb-commands
 */
// todo - ještě možnost přidat plugin (spíš ne)


// CodeBoxOptions poznámky:
// todo - do dokumentace napsat, které vlastnosti je možné měnit i pomocí data atributů
// todo - do dokumentace taky napsat, že výška se kvůli lazy inicializaci musí nastavovat v code box options (a min code view lines count taky)

// dále jsou tu file elementy:
    // - data-cb-file=cestakestažení data-cb-name=název - u ProjectCodeBoxu můžou být ještě další







// Project code box creator:
// todo - zdokumentovat data-cb-id atribut
// todo - zdokumentovat data-cb-extends atribut