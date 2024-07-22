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

Další komponenty:
    ProjectCodeBoxFactory (možná ještě přejmenovat, ale myslím že je to dobré)
        - bude se dát nastavit lazy creation

Ta knihovna by měla být teda rozšiřitelná
    - chci potom vytvářet ten code highlight runner atp., tak na to myslet


Co mi ještě zbývá:
- extendnutí pomocí atributu (ale to až potom, protože to se netýká přímo ProjectCodeBoxu, ale spíš nějaké komponenty, která je bude inicializovat)
- otevření balíčku a otevření složky (defaultně se to pro aktivní code view otevře, ale půjde nastavit, aby se složka nebo package neotvírali - asi na to budou samostatné atributy - ale spíš pro code box, protože toho se to týká)
- možná by mohlo jít i nastavit, že má být project panel na začátku otevřený - asi jo - to by mělo jít
- název file elementu by měl jít nastavit přes data-cb-name nebo uvnitř elementu - asi spíš uvnitř elementu, ale mohl bych tam nechat možnost nastavit to i přes to (mělo by to přednost)
- na složky se dá nastavit, zda mají být otevřeny (to už ale myslím mám - nebo nevím) - data-cb-opened
- container s příkazy
- dědění
- projekt složka bude vždy otevřená (ale půjde zavřít nějakým atributem)
 */