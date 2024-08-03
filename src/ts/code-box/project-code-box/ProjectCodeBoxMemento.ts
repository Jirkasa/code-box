class ProjectCodeBoxMemento {
    constructor() {
        
    }
}

export default ProjectCodeBoxMemento;

/**
 * Pokud by to potom nějak obsahovalo code views, tak by tam měla být nějaká vlastnost, která by určovala, jestli se už memento použilo
    - ne, bude tam metoda, která vrátí kopii code views
*/

/**
 * Nové abstraktní metody pro CodeBox:
 * reset() - resetne to do initial stavu
 * createMemento()
 * applyMemento()
 * 
 * - to memento bude muset být i pro code view
 *      - a kdyžtak se vždycky při resetu možná ptát jestli code view nebo tak v tom code boxu neexistuje, ať se zbytečně nepřidává znovu? - no asi spíš ne - ono je to jedno - prostě se to smaže všechno a potom se to zase vrátí
 *              - ale to memento by si mohlo i ukládat code box, ve kterém bylo vytvořeno, aby se vědělo, že jde o ten samý a kdyžtak se nemuseli vytvářet nové code views
 *                  - s tím bude ještě hodně práce
 */