abstract class Codebox {

}

export default Codebox;

/**
Co by měla tato základní třída dělat:
- může najít všechny pre elementy v předaném elementu a vytvořit z nich code views
    - zároveň může taky vzít datasety, protože ty budou taky potřeba - ProjectCodeBox jich bude mít pro code view víc
- vytvoří root element, na kterém potom mohou podtřídy stavět
- taky by se to mohlo starat o zobrazování aktivních ukázek kódu v nějakém elementu, který by se vytvořil podtřídou
    - 

Operace, které bych chtěl u obou code boxů:
    - přidat code view
    - nastavit code view název
    - smazat code view
    - resetovat code view do initial stavu (v jakém byl než se aplikovali změny přes metody)
        - a nebo ne?
            - budu - kvůli lazy loadingu
    - mohla by se o lazy loading starat už i tato třída?
        - ne, ale její init metoda by se mohla klidně zavolat až potom
        - takže by se tato metoda ještě mohla starat o stav code boxu

    - lazy initializing
        - jak to udělat?
        - u project code boxů se kdyžtak načtou i ty, na kterých je ukázka závislá
            - takže je půjde kdyžtak inicializovat zavoláním metody
        - musí být nějaký element, který se nejdříve zobrazí namísto ukázky
            - měl by jej asi vytvořit implementující code box?
                - ne, asi tam hodím default, ale tak kdyby náhodou, tak to půjde přepsat
            - a ten element nebude součástí root elementu

    - jaké stavy by tedy code box mohl mít?
        - uninitialized
        - initialized
            - nejsou to stavy - prostě to jen určuje, jestli je code box inicializován
    
    - aby uživatel nemusel kdyžtak inicializovat code boxy a code views ručně, tak by na to mohla být nějaká speciální třída, kde by se předal selektor
        - CodeViewInitializer
        - TabCodeBoxInitializer
        - ProjectCodeBoxInitializer
            - je to ale hromadné, takže nějaký trochu jiný název
    
 */