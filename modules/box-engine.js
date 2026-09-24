"use strict";

/*
|--------------------------------------------------------------------------
| Packing List - Box Engine
|--------------------------------------------------------------------------
| Questo modulo assegna gli articoli alle BOX.
|
| Riceve:
|
|   righe normalizzate
|   +
|   classificazione
|   +
|   regole
|
| Restituisce:
|
|   BOX 1
|   BOX 2
|   BOX 3
|   ...
|
| IMPORTANTE:
| Il Box Engine NON modifica i dati originali.
| Crea una struttura separata per il risultato dell'imballaggio.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Costanti
|--------------------------------------------------------------------------
*/

const BOX_ENGINE_CONFIG = {

    /*
    |--------------------------------------------------------------------------
    | Numero massimo di caschi per BOX
    |--------------------------------------------------------------------------
    */

    MAX_HELMETS_PER_BOX: 8,


    /*
    |--------------------------------------------------------------------------
    | Unità di spazio
    |--------------------------------------------------------------------------
    |
    | 60 unità = 1 spazio casco
    |--------------------------------------------------------------------------
    */

    SPACE_UNITS_PER_HELMET: 60

};


/*
|--------------------------------------------------------------------------
| Crea una nuova BOX
|--------------------------------------------------------------------------
*/

function createBox(
    boxNumber
) {

    return {

        boxNumber,

        /*
        |--------------------------------------------------------------------------
        | Caschi contenuti nella BOX
        |--------------------------------------------------------------------------
        */

        helmets: [],


        /*
        |--------------------------------------------------------------------------
        | Articoli associati ai caschi
        |--------------------------------------------------------------------------
        |
        | Principalmente imbottiture senza ".C".
        |--------------------------------------------------------------------------
        */

        attachedItems: [],


        /*
        |--------------------------------------------------------------------------
        | Articoli da posizionare alla fine
        |--------------------------------------------------------------------------
        */

        tailItems: [],


        /*
        |--------------------------------------------------------------------------
        | Spazio
        |--------------------------------------------------------------------------
        */

        usedSpaceUnits: 0,

        capacityUnits:
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX *
            BOX_ENGINE_CONFIG.SPACE_UNITS_PER_HELMET,

        remainingSpaceUnits:
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX *
            BOX_ENGINE_CONFIG.SPACE_UNITS_PER_HELMET,


        /*
        |--------------------------------------------------------------------------
        | Controllo
        |--------------------------------------------------------------------------
        */

        status: "open"

    };

}


/*
|--------------------------------------------------------------------------
| Aggiorna lo spazio disponibile della BOX
|--------------------------------------------------------------------------
*/

function updateBoxSpace(
    box
) {

    box.remainingSpaceUnits =
        box.capacityUnits -
        box.usedSpaceUnits;


    if (
        box.remainingSpaceUnits <= 0
    ) {

        box.remainingSpaceUnits = 0;

    }

}


/*
|--------------------------------------------------------------------------
| Verifica se una BOX può contenere un articolo
|--------------------------------------------------------------------------
*/

function canFitItem(
    box,
    item
) {

    if (
        item.occupancyUnits === null ||
        item.occupancyUnits === undefined
    ) {

        return false;

    }


    return (
        box.usedSpaceUnits +
        item.occupancyUnits
    ) <= box.capacityUnits;

}


/*
|--------------------------------------------------------------------------
| Aggiunge un articolo alla coda della BOX
|--------------------------------------------------------------------------
*/

function addTailItemToBox(
    box,
    item
) {

    if (
        !item.goesToEnd
    ) {

        throw new Error(
            `L'articolo ${item.code} non è classificato come articolo di coda.`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Articoli a spazio zero
    |--------------------------------------------------------------------------
    |
    | CRZ e CROMO.MUFFS possono essere inseriti senza consumare spazio.
    |--------------------------------------------------------------------------
    */

    if (
        item.occupancyUnits === 0
    ) {

        box.tailItems.push(
            item
        );

        return true;

    }


    /*
    |--------------------------------------------------------------------------
    | Articoli che occupano spazio
    |--------------------------------------------------------------------------
    */

    if (
        !canFitItem(
            box,
            item
        )
    ) {

        return false;

    }


    box.tailItems.push(
        item
    );


    box.usedSpaceUnits +=
        item.occupancyUnits;


    updateBoxSpace(
        box
    );


    return true;

}


/*
|--------------------------------------------------------------------------
| Aggiunge un casco alla BOX
|--------------------------------------------------------------------------
*/

function addHelmetToBox(
    box,
    helmet
) {

    if (
        box.helmets.length >=
        BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
    ) {

        return false;

    }


    if (
        !canFitItem(
            box,
            helmet
        )
    ) {

        return false;

    }


    box.helmets.push(
        helmet
    );


    box.usedSpaceUnits +=
        helmet.occupancyUnits;


    updateBoxSpace(
        box
    );


    return true;

}


/*
|--------------------------------------------------------------------------
| Aggiunge un articolo associato
|--------------------------------------------------------------------------
*/

function addAttachedItemToBox(
    box,
    item
) {

    /*
    |--------------------------------------------------------------------------
    | Gli articoli attached non consumano spazio.
    |--------------------------------------------------------------------------
    */

    box.attachedItems.push(
        item
    );


    return true;

}


/*
|--------------------------------------------------------------------------
| Trova l'ultima BOX aperta
|--------------------------------------------------------------------------
*/

function getCurrentBox(
    boxes
) {

    if (
        boxes.length === 0
    ) {

        return null;

    }


    return boxes[
        boxes.length - 1
    ];

}


/*
|--------------------------------------------------------------------------
| Crea una nuova BOX
|--------------------------------------------------------------------------
*/

function createNextBox(
    boxes
) {

    const boxNumber =
        boxes.length + 1;


    const box =
        createBox(
            boxNumber
        );


    boxes.push(
        box
    );


    return box;

}


/*
|--------------------------------------------------------------------------
| Costruzione delle BOX principali
|--------------------------------------------------------------------------
| Prima vengono inseriti tutti i caschi.
|
| Questo garantisce:
|
| BOX 1 = primi 8 caschi
| BOX 2 = successivi 8
| ecc.
|--------------------------------------------------------------------------
*/

function createHelmetBoxes(
    rows
) {

    const boxes = [];


    for (
        const row of rows
    ) {

        if (
            row.articleType !== "helmet"
        ) {

            continue;

        }


        let currentBox =
            getCurrentBox(
                boxes
            );


        /*
        |--------------------------------------------------------------------------
        | Se non esiste una BOX oppure è piena, ne creiamo una nuova.
        |--------------------------------------------------------------------------
        */

        if (
            currentBox === null ||
            currentBox.helmets.length >=
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
        ) {

            currentBox =
                createNextBox(
                    boxes
                );

        }


        /*
        |--------------------------------------------------------------------------
        | Aggiungiamo il casco.
        |--------------------------------------------------------------------------
        */

        const added =
            addHelmetToBox(
                currentBox,
                row
            );


        if (
            !added
        ) {

            throw new Error(
                `Impossibile inserire il casco "${row.code}" nella BOX ${currentBox.boxNumber}.`
            );

        }

    }


    return boxes;

}


/*
|--------------------------------------------------------------------------
| Individua la BOX del casco corrente
|--------------------------------------------------------------------------
|
| Le imbottiture senza ".C" seguono il casco.
|
| Per mantenere il rapporto con l'ordine dell'Excel, individuiamo
| l'ultimo casco incontrato e utilizziamo la sua BOX.
|--------------------------------------------------------------------------
*/

function buildHelmetBoxMap(
    rows,
    boxes
) {

    const helmetBoxMap =
        new Map();


    let boxIndex = 0;

    let helmetsInCurrentBox = 0;


    for (
        const row of rows
    ) {

        if (
            row.articleType !== "helmet"
        ) {

            continue;

        }


        if (
            helmetsInCurrentBox >=
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
        ) {

            boxIndex++;

            helmetsInCurrentBox = 0;

        }


        const box =
            boxes[
                boxIndex
            ];


        helmetBoxMap.set(
            row.id,
            box
        );


        helmetsInCurrentBox++;

    }


    return helmetBoxMap;

}


/*
|--------------------------------------------------------------------------
| Associazione delle imbottiture attached
|--------------------------------------------------------------------------
*/

function assignAttachedItems(
    rows,
    boxes,
    helmetBoxMap
) {

    let currentHelmet = null;


    for (
        const row of rows
    ) {

        /*
        |--------------------------------------------------------------------------
        | Nuovo casco.
        |--------------------------------------------------------------------------
        */

        if (
            row.articleType === "helmet"
        ) {

            currentHelmet =
                row;

            continue;

        }


        /*
        |--------------------------------------------------------------------------
        | Imbottitura senza ".C".
        |--------------------------------------------------------------------------
        */

        if (
            row.articleType === "padding" &&
            row.hasC === false
        ) {

            if (
                currentHelmet === null
            ) {

                throw new Error(
                    `L'imbottitura "${row.code}" non può essere associata: nessun casco precedente.`
                );

            }


            const box =
                helmetBoxMap.get(
                    currentHelmet.id
                );


            if (
                !box
            ) {

                throw new Error(
                    `Impossibile trovare la BOX del casco "${currentHelmet.code}".`
                );

            }


            addAttachedItemToBox(
                box,
                row
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| Trova la prima BOX con spazio sufficiente
|--------------------------------------------------------------------------
*/

function findBoxForTailItem(
    boxes,
    item
) {

    /*
    |--------------------------------------------------------------------------
    | Gli articoli a spazio zero possono stare in qualsiasi BOX.
    |
    | Per mantenere una distribuzione semplice e prevedibile, li mettiamo
    | nella prima BOX esistente.
    |--------------------------------------------------------------------------
    */

    if (
        item.occupancyUnits === 0
    ) {

        if (
            boxes.length === 0
        ) {

            return null;

        }

        return boxes[0];

    }


    /*
    |--------------------------------------------------------------------------
    | Per gli articoli che occupano spazio cerchiamo la prima BOX
    | con spazio sufficiente.
    |--------------------------------------------------------------------------
    */

    for (
        const box of boxes
    ) {

        if (
            canFitItem(
                box,
                item
            )
        ) {

            return box;

        }

    }


    return null;

}


/*
|--------------------------------------------------------------------------
| Assegnazione degli articoli di coda
|--------------------------------------------------------------------------
*/

function assignTailItems(
    rows,
    boxes
) {

    const unassignedItems = [];


    for (
        const row of rows
    ) {

        if (
            !row.goesToEnd
        ) {

            continue;

        }


        const box =
            findBoxForTailItem(
                boxes,
                row
            );


        /*
        |--------------------------------------------------------------------------
        | Nessuna BOX disponibile.
        |--------------------------------------------------------------------------
        |
        | Per ora non creiamo automaticamente una BOX vuota.
        | Segnaliamo l'articolo come non assegnato.
        |--------------------------------------------------------------------------
        */

        if (
            box === null
        ) {

            unassignedItems.push(
                {
                    ...row,

                    placementStatus:
                        "non_assegnato"

                }
            );

            continue;

        }


        const added =
            addTailItemToBox(
                box,
                row
            );


        if (
            !added
        ) {

            unassignedItems.push(
                {
                    ...row,

                    placementStatus:
                        "non_assegnato"

                }
            );

            continue;

        }

    }


    return unassignedItems;

}


/*
|--------------------------------------------------------------------------
| Aggiorna stato BOX
|--------------------------------------------------------------------------
*/

function finalizeBoxes(
    boxes
) {

    for (
        const box of boxes
    ) {

        updateBoxSpace(
            box
        );


        /*
        |--------------------------------------------------------------------------
        | Una BOX con 8 caschi è completa dal punto di vista principale.
        |
        | Gli articoli di coda possono comunque essere presenti.
        |--------------------------------------------------------------------------
        */

        if (
            box.helmets.length >=
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
        ) {

            box.status =
                "full";

        } else {

            box.status =
                "open";

        }

    }

}


/*
|--------------------------------------------------------------------------
| Controllo integrità
|--------------------------------------------------------------------------
|
| Verifica che ogni casco sia stato assegnato.
|--------------------------------------------------------------------------
*/

function validateHelmetAssignment(
    rows,
    boxes
) {

    const sourceHelmets =
        rows.filter(
            row =>
                row.articleType === "helmet"
        );


    const assignedHelmets =
        boxes.flatMap(
            box =>
                box.helmets
        );


    if (
        sourceHelmets.length !==
        assignedHelmets.length
    ) {

        throw new Error(
            `Controllo caschi fallito: ${sourceHelmets.length} caschi sorgente, ${assignedHelmets.length} caschi assegnati.`
        );

    }

}


/*
|--------------------------------------------------------------------------
| Motore principale
|--------------------------------------------------------------------------
*/

function buildBoxes(
    rows
) {

    if (
        !Array.isArray(rows)
    ) {

        throw new Error(
            "Il Box Engine richiede un array di righe."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | 1. Creazione BOX in base ai caschi
    |--------------------------------------------------------------------------
    */

    const boxes =
        createHelmetBoxes(
            rows
        );


    /*
    |--------------------------------------------------------------------------
    | Nessun casco
    |--------------------------------------------------------------------------
    */

    if (
        boxes.length === 0
    ) {

        return {

            boxes: [],

            unassignedItems:
                rows.map(
                    row => ({
                        ...row,

                        placementStatus:
                            "non_assegnato"

                    })
                ),

            statistics: {

                boxCount: 0,

                helmetCount: 0,

                unassignedCount:
                    rows.length

            }

        };

    }


    /*
    |--------------------------------------------------------------------------
    | 2. Mappa casco → BOX
    |--------------------------------------------------------------------------
    */

    const helmetBoxMap =
        buildHelmetBoxMap(
            rows,
            boxes
        );


    /*
    |--------------------------------------------------------------------------
    | 3. Imbottiture senza ".C"
    |--------------------------------------------------------------------------
    */

    assignAttachedItems(
        rows,
        boxes,
        helmetBoxMap
    );


    /*
    |--------------------------------------------------------------------------
    | 4. Articoli di coda
    |--------------------------------------------------------------------------
    */

    const unassignedItems =
        assignTailItems(
            rows,
            boxes
        );


    /*
    |--------------------------------------------------------------------------
    | 5. Finalizzazione
    |--------------------------------------------------------------------------
    */

    finalizeBoxes(
        boxes
    );


    /*
    |--------------------------------------------------------------------------
    | 6. Controllo integrità
    |--------------------------------------------------------------------------
    */

    validateHelmetAssignment(
        rows,
        boxes
    );


    /*
    |--------------------------------------------------------------------------
    | Statistiche
    |--------------------------------------------------------------------------
    */

    const helmetCount =
        rows.filter(
            row =>
                row.articleType === "helmet"
        ).length;


    return {

        boxes,

        unassignedItems,

        statistics: {

            boxCount:
                boxes.length,

            helmetCount,

            unassignedCount:
                unassignedItems.length

        }

    };

}


/*
|--------------------------------------------------------------------------
| API pubblica
|--------------------------------------------------------------------------
*/

window.PackingListBoxEngine = {

    buildBoxes,

    createBox,

    constants:
        BOX_ENGINE_CONFIG

};