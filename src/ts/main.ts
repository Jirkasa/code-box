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
 */



/*
KOMENTÁŘE Z CODE BOX TŘÍDY

todo - ještě teda budu muset nějak zajistit resetování
        - možná
     - 
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
Ok, dostal jsem se do bodu, kdy můžu začít přemýšlet nad děděním.
    - nesmím zapomínat na to, že private metody jsou v podstatě public u instancí stejného typu uvnitř třídy

    - kde začít?
        - první taková nepěkná věc, kterou je potřeba udělat, je kdyžtak aktualizovat vlastnost initialCodeViewLinesCount - a kdyžtak to víc ve třídě CodeBox okomentovat
            - ono to nebude tak těžký, prostě na začátku v konstruktoru si získám command elementy, potom v těch command elementech všechny commandy, které nastavují aktivní code view a potom to kdyžtak změním - ono by se možná i do CodeBox konstruktoru mohla ta hodnota předávat jako volitelný parametr, ale to uvidím
                - nějak to půjde
                    - jde o to získat počet řádků aktivního code view
                        - pokud neexistuje command, který by měnil aktivní code view, mělo by to být v pohodě (implicitActive při dědění code boxu neplatí - napsat do dokumentace - platí to jen pro pre elementy uvnitř samotného code boxu...)
                            - pokud ale existuje, tak musím zjistit počet řádků toho code view
                                - pokud existuje to code view v aktuálním code boxu, tak to vzít odtud, a kdyžtak pokračovat směrem nahoru?
                                    - no jo..., ale ty code views už tam nemusí být - tak si asi budu muset pro každé code view v project code boxu získávat počet řádků? - já nevím - spíš bych udělal asi ještě nějakou metodu v CodeBoxu - toto by bylo dost pomalé
                                        - dělá se to před konstruktorem, takže tam budou
    - potom pozor na packages folder, protože ta se může časem změnit, když se ta složka přejmenuje

    Ok, potřebuju teda nějak pořešit to memento.
        - 

Příkazy:
    - možná spíš vytvořit jen atribut data-cb-command="příkaz"
    - to by možná bylo lepší - ale nevím jestli to tak dělat

    X - data-cb-command-rename-project
        - name

    - data-cb-command-add-folder
    - data-cb-command-remove-folder
    - data-cb-command-rename-folder
    - data-cb-command-open-folder (openParentFolders)
    - data-cb-command-close-folder (closeChildFolders)

    - data-cb-command-add-package
    - data-cb-command-remove-package
    - data-cb-command-rename-package
    - data-cb-command-open-package
    - data-cb-command-close-package

    - data-cb-command-remove-code-view
    - data-cb-command-rename-code-view
    - data-cb-command-move-code-view-to-folder
    - data-cb-command-change-code-view-package
    - data-cb-command-remove-code-view-package

    - data-cb-command-add-code-view-highlight
    - data-cb-command-remove-code-view-highlight
    X - data-cb-command-set-active-code-view
        - identifier
    - data-cb-command-set-no-active-code-view

    - data-cb-command-remove-file
    - data-cb-command-rename-file
    - data-cb-command-move-file-to-folder
    - data-cb-command-change-file-package
    - data-cb-command-remove-file-package

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