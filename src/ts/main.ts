export { default as CodeView } from "./code-view/CodeView";
export { default as TabCodeBox } from "./code-box/tab-code-box/TabCodeBox";
// todo - vyexportovat to

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


 */