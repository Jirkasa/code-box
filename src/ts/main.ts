export { default as CodeView } from "./code-view/CodeView";
export { default as TabCodeBox } from "./code-box/tab-code-box/TabCodeBox";
export { default as ProjectCodeBox } from "./code-box/project-code-box/ProjectCodeBox";
// todo - vyexportovat to
// todo - upravit importy, aby se to neimportovalo odtud

/**
 * přidat licenci: něco jako tady: https://github.com/sk-rt/handy-collapse/blob/main/src/index.ts
 */

/**
 
Tři UI komponenty:
    CodeView
        - bude obsahovat API na highlightování atp...
    TabCodeBox
        - používá CodeView
    ProjectCodeBox
        - používá CodeView
        - nebudu exportovat - bude se vytvářet pomocí nějaké další knihovny
    - potom teda ještě nějaký, který se bude ovládat jen přes kód

Další komponenty:
    ProjectCodeBoxFactory (možná ještě přejmenovat, ale myslím že je to dobré)
        - bude se dát nastavit lazy creation

Ta knihovna by měla být teda rozšiřitelná
    - chci potom vytvářet ten code highlight runner atp., tak na to myslet

- ještě by se hodil code box, který by se dal ovládat jen přes kód - někdo by to třeba někde využil

- u initializer komponent bude možnost získat code box podle id

- přidat něco jako onInit listener - možnost přidat funkci, která se zavolá po inicializaci code boxu
    - ale to nevím, ještě uvidím

Co mi ještě zbývá:
- extendnutí pomocí atributu (ale to až potom, protože to se netýká přímo ProjectCodeBoxu, ale spíš nějaké komponenty, která je bude inicializovat)
- název file elementu by měl jít nastavit přes data-cb-name nebo uvnitř elementu - asi spíš uvnitř elementu, ale mohl bych tam nechat možnost nastavit to i přes to (mělo by to přednost)
- container s příkazy
- dědění


- pluginy se asi nebudou předávat jako options, ale budou se moci přidávat nebo odebírat pomocí metod
    - plugin třídy budou mít metody, které se budou volat v různých situacích: init, reset (nevím jak to bude u mementa - ale asi se předtím taky všechno nejdřív nějak resetuje? - takže by se ta metoda mohla taky volat?), a další - nebo lepší - mohlo by existovat PluginMemento - dalo by se tam třeba nějak vytvořit? - uvidím
    - asi to udělám jen pro code view - kdybych někdy v budoucnu chtěl, můžu to udělat i pro code boxy
 */

/**
    - aby uživatel nemusel kdyžtak inicializovat code boxy a code views ručně, tak by na to mohla být nějaká speciální třída, kde by se předal selektor
        - CodeViewInitializer
        - TabCodeBoxInitializer
        - ProjectCodeBoxInitializer
            - je to ale hromadné, takže nějaký trochu jiný název (třeba CodeViewsInitializer...)
                - a bude to mít nějakou metodu init, která když se zavolá, tak se code boxy inicializují (půjde volat opakovaně - když uživatel na stránku nějakým svým způsobem přidá nový kód a bude jej chtít inicializovat, tak ať to funguje)
    
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