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

Co mi ještě zbývá:
- extendnutí pomocí atributu (ale to až potom, protože to se netýká přímo ProjectCodeBoxu, ale spíš nějaké komponenty, která je bude inicializovat)
- název file elementu by měl jít nastavit přes data-cb-name nebo uvnitř elementu - asi spíš uvnitř elementu, ale mohl bych tam nechat možnost nastavit to i přes to (mělo by to přednost)
- container s příkazy
- dědění
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
            - je to ale hromadné, takže nějaký trochu jiný název
    
    - Pluginy (uvidím jak to s pluginama nakonec bude):
        - v options by byla vlastnost plugin
            - předával by se tam new PluginInitializer<MyPlugin>()
                - přičemž CodeView by mělo tohle jako typ:
                    plugins : PluginInitializer<extends CodeViewPlugin>[] - něco takového
 */