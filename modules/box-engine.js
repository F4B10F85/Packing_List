"use strict";

/*
|--------------------------------------------------------------------------
| Packing List - Box Engine
|--------------------------------------------------------------------------
| Questo modulo assegna gli articoli alle BOX.
|
| REGOLE ATTUALI
|
| 1. I CASCHI sono gli unici articoli che consumano spazio BOX.
|
| 2. Ogni BOX può contenere massimo 8 caschi.
|
| 3. Le IMBOTTITURE associate a un casco:
|    - seguono il casco;
|    - non consumano spazio;
|    - vengono divise insieme ai caschi quando il gruppo viene
|      distribuito su più BOX.
|
| 4. Tutti gli articoli che non sono:
|       - casco
|       - imbottitura
|
|    vengono messi in UNA SOLA BOX FINALE.
|
| 5. Un'imbottitura senza un casco precedente associabile viene
|    considerata articolo finale.
|
| 6. La quantità viene gestita realmente.
|
| 7. L'ordine delle righe sorgente viene mantenuto.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CONFIGURAZIONE
|--------------------------------------------------------------------------
*/

const BOX_ENGINE_CONFIG = {

    /*
    |----------------------------------------------------------------------
    | Numero massimo di caschi per BOX
    |----------------------------------------------------------------------
    */

    MAX_HELMETS_PER_BOX: 8,


    /*
    |----------------------------------------------------------------------
    | Unità di spazio
    |----------------------------------------------------------------------
    |
    | Un casco = 60 unità
    |
    | La struttura viene mantenuta per compatibilità con il resto
    | dell'applicazione.
    |----------------------------------------------------------------------
    */

    SPACE_UNITS_PER_HELMET: 60,


    /*
    |----------------------------------------------------------------------
    | RADICI CASCHI
    |----------------------------------------------------------------------
    */

    HELMET_ROOTS: [

        "CRB2",
        "CRG2",
        "CRJ2",
        "CRL2",
        "CRM2",
        "CRO2",
        "CRP2",
        "CRPL2",
        "CRS2",
        "CRT2",
        "CRTL2",
        "CRV2",
        "KP",
        "KPT",
        "NOVA",
        "CRABS",
        "CARB"

    ],


    /*
    |----------------------------------------------------------------------
    | RADICI IMBOTTITURE
    |----------------------------------------------------------------------
    */

    PADDING_ROOTS: [

        "CRX",
        "CRX2",
        "CRXU",
        "CRW",
        "CRW2",
        "CRY",
        "PK.PAD"

    ]

};


/*
|--------------------------------------------------------------------------
| ORDINA LE RADICI DALLA PIÙ SPECIFICA ALLA MENO SPECIFICA
|--------------------------------------------------------------------------
|
| Serve per evitare conflitti come:
|
|   CRX
|   CRX2
|   CRXU
|
| e:
|
|   KP
|   KPT
|
|--------------------------------------------------------------------------
*/

const HELMET_ROOTS_SORTED =
    [...BOX_ENGINE_CONFIG.HELMET_ROOTS]
        .sort(
            (a, b) =>
                b.length - a.length
        );


const PADDING_ROOTS_SORTED =
    [...BOX_ENGINE_CONFIG.PADDING_ROOTS]
        .sort(
            (a, b) =>
                b.length - a.length
        );


/*
|--------------------------------------------------------------------------
| NORMALIZZAZIONE CODICE
|--------------------------------------------------------------------------
*/

function normalizeCode(
    code
) {

    if (
        code === null ||
        code === undefined
    ) {

        return "";

    }


    return String(
        code
    )
        .trim()
        .toUpperCase();

}


/*
|--------------------------------------------------------------------------
| VERIFICA RADICE
|--------------------------------------------------------------------------
|
| La radice deve essere:
|
|   CODICE = RADICE
|
| oppure:
|
|   CODICE = RADICE.qualcosa
|
| In questo modo:
|
|   CRL2.DBLU.M.0005
|
| corrisponde a:
|
|   CRL2
|
| ma:
|
|   CRL20
|
| NON corrisponde a:
|
|   CRL2
|
|--------------------------------------------------------------------------
*/

function codeHasRoot(
    code,
    root
) {

    const normalizedCode =
        normalizeCode(
            code
        );


    const normalizedRoot =
        normalizeCode(
            root
        );


    return (
        normalizedCode === normalizedRoot ||
        normalizedCode.startsWith(
            normalizedRoot + "."
        )
    );

}


/*
|--------------------------------------------------------------------------
| CLASSIFICA DIRETTAMENTE IL CODICE
|--------------------------------------------------------------------------
|
| Il Box Engine non si fida più delle vecchie regole di coda.
|
| Determina direttamente:
|
|   helmet
|   padding
|   other
|
|--------------------------------------------------------------------------
*/

function classifyCode(
    code
) {

    const normalizedCode =
        normalizeCode(
            code
        );


    if (
        normalizedCode === ""
    ) {

        return "other";

    }


    for (
        const root of HELMET_ROOTS_SORTED
    ) {

        if (
            codeHasRoot(
                normalizedCode,
                root
            )
        ) {

            return "helmet";

        }

    }


    for (
        const root of PADDING_ROOTS_SORTED
    ) {

        if (
            codeHasRoot(
                normalizedCode,
                root
            )
        ) {

            return "padding";

        }

    }


    return "other";

}


/*
|--------------------------------------------------------------------------
| OTTIENE LA QUANTITÀ DELLA RIGA
|--------------------------------------------------------------------------
|
| Supportiamo i nomi più probabili utilizzati dal normalizzatore.
|
|--------------------------------------------------------------------------
*/

function getRowQuantity(
    row
) {

    const possibleValues = [

        row.quantity,
        row.qty,
        row.Qty,
        row.QTY,
        row["Q.ty"],
        row["Quantità"]

    ];


    for (
        const value of possibleValues
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            continue;

        }


        const numericValue =
            Number(
                String(
                    value
                )
                    .replace(
                        ",",
                        "."
                    )
            );


        if (
            Number.isFinite(
                numericValue
            )
        ) {

            return numericValue;

        }

    }


    /*
    |----------------------------------------------------------------------
    | Se la quantità non è presente assumiamo 1.
    |----------------------------------------------------------------------
    */

    return 1;

}


/*
|--------------------------------------------------------------------------
| CREA UNA RIGA CON QUANTITÀ MODIFICATA
|--------------------------------------------------------------------------
*/

function cloneRowWithQuantity(
    row,
    quantity,
    suffix
) {

    const clonedRow = {

        ...row

    };


    /*
    |----------------------------------------------------------------------
    | Manteniamo la quantità nel campo principale utilizzato dall'app.
    |----------------------------------------------------------------------
    */

    clonedRow.quantity =
        quantity;


    /*
    |----------------------------------------------------------------------
    | Manteniamo anche eventuali campi quantità esistenti.
    |----------------------------------------------------------------------
    */

    if (
        Object.prototype.hasOwnProperty.call(
            row,
            "qty"
        )
    ) {

        clonedRow.qty =
            quantity;

    }


    if (
        Object.prototype.hasOwnProperty.call(
            row,
            "Qty"
        )
    ) {

        clonedRow.Qty =
            quantity;

    }


    if (
        Object.prototype.hasOwnProperty.call(
            row,
            "QTY"
        )
    ) {

        clonedRow.QTY =
            quantity;

    }


    if (
        Object.prototype.hasOwnProperty.call(
            row,
            "Q.ty"
        )
    ) {

        clonedRow["Q.ty"] =
            quantity;

    }


    if (
        Object.prototype.hasOwnProperty.call(
            row,
            "Quantità"
        )
    ) {

        clonedRow["Quantità"] =
            quantity;

    }


    /*
    |----------------------------------------------------------------------
    | ID
    |----------------------------------------------------------------------
    |
    | Quando una riga viene spezzata tra BOX diverse, creiamo un ID
    | derivato per evitare collisioni.
    |----------------------------------------------------------------------
    */

    if (
        suffix !== undefined &&
        suffix !== null
    ) {

        const originalId =
            row.id !== undefined &&
            row.id !== null
                ? String(
                    row.id
                )
                : "row";


        clonedRow.id =
            `${originalId}__split_${suffix}`;

    }


    return clonedRow;

}


/*
|--------------------------------------------------------------------------
| CREA UNA NUOVA BOX
|--------------------------------------------------------------------------
*/

function createBox(
    boxNumber
) {

    return {

        boxNumber,

        /*
        |------------------------------------------------------------------
        | Caschi
        |------------------------------------------------------------------
        */

        helmets: [],


        /*
        |------------------------------------------------------------------
        | Imbottiture associate
        |------------------------------------------------------------------
        */

        attachedItems: [],


        /*
        |------------------------------------------------------------------
        | Articoli della BOX finale
        |------------------------------------------------------------------
        */

        tailItems: [],


        /*
        |------------------------------------------------------------------
        | Tutti gli articoli nell'ordine effettivo di imballaggio
        |------------------------------------------------------------------
        |
        | Questa proprietà viene aggiunta per mantenere l'ordine originale.
        |
        | Il vecchio frontend può continuare a utilizzare helmets,
        | attachedItems e tailItems.
        |
        | Il frontend aggiornato può utilizzare direttamente items.
        |
        |------------------------------------------------------------------
        */

        items: [],


        /*
        |------------------------------------------------------------------
        | Spazio
        |------------------------------------------------------------------
        */

        usedSpaceUnits: 0,

        capacityUnits:
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX *
            BOX_ENGINE_CONFIG.SPACE_UNITS_PER_HELMET,

        remainingSpaceUnits:
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX *
            BOX_ENGINE_CONFIG.SPACE_UNITS_PER_HELMET,


        /*
        |------------------------------------------------------------------
        | Controllo
        |------------------------------------------------------------------
        */

        status: "open"

    };

}


/*
|--------------------------------------------------------------------------
| AGGIORNA SPAZIO BOX
|--------------------------------------------------------------------------
*/

function updateBoxSpace(
    box
) {

    box.remainingSpaceUnits =
        box.capacityUnits -
        box.usedSpaceUnits;


    if (
        box.remainingSpaceUnits < 0
    ) {

        box.remainingSpaceUnits = 0;

    }

}


/*
|--------------------------------------------------------------------------
| AGGIUNGE UN CASCO ALLA BOX
|--------------------------------------------------------------------------
*/

function addHelmetToBox(
    box,
    helmet
) {

    const quantity =
        getRowQuantity(
            helmet
        );


    if (
        quantity <= 0
    ) {

        return false;

    }


    const currentHelmetQuantity =
        box.helmets.reduce(
            (
                total,
                item
            ) =>
                total +
                getRowQuantity(
                    item
                ),
            0
        );


    if (
        currentHelmetQuantity +
        quantity >
        BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
    ) {

        return false;

    }


    const requiredSpace =
        quantity *
        BOX_ENGINE_CONFIG.SPACE_UNITS_PER_HELMET;


    if (
        box.usedSpaceUnits +
        requiredSpace >
        box.capacityUnits
    ) {

        return false;

    }


    box.helmets.push(
        helmet
    );


    box.items.push(
        helmet
    );


    box.usedSpaceUnits +=
        requiredSpace;


    updateBoxSpace(
        box
    );


    return true;

}


/*
|--------------------------------------------------------------------------
| AGGIUNGE UN'IMBOTTITURA ASSOCIATA
|--------------------------------------------------------------------------
*/

function addAttachedItemToBox(
    box,
    item
) {

    box.attachedItems.push(
        item
    );


    box.items.push(
        item
    );


    /*
    |----------------------------------------------------------------------
    | Le imbottiture NON consumano spazio.
    |----------------------------------------------------------------------
    */

    return true;

}


/*
|--------------------------------------------------------------------------
| AGGIUNGE UN ARTICOLO FINALE
|--------------------------------------------------------------------------
*/

function addTailItemToBox(
    box,
    item
) {

    box.tailItems.push(
        item
    );


    box.items.push(
        item
    );


    /*
    |----------------------------------------------------------------------
    | Gli articoli finali non modificano lo spazio dei caschi.
    |
    | Questa è una scelta intenzionale secondo la nuova regola:
    |
    | "Tutto il resto va in una singola BOX finale, indipendentemente
    | dalla quantità."
    |----------------------------------------------------------------------
    */

    return true;

}


/*
|--------------------------------------------------------------------------
| CREA UNA NUOVA BOX
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
| COSTRUISCE I GRUPPI CASCO + IMBOTTITURE
|--------------------------------------------------------------------------
|
| Esempio:
|
|   CRL2........      3
|   CRXU.PAD52       2
|   CRXU.PAD57       1
|
| diventa:
|
|   Gruppo
|       casco = 3
|       padding:
|           PAD52 = 2
|           PAD57 = 1
|
|--------------------------------------------------------------------------
*/

function buildHelmetGroups(
    rows
) {

    const groups = [];

    let currentGroup = null;


    for (
        const row of rows
    ) {

        const articleType =
            classifyCode(
                row.code
            );


        /*
        |------------------------------------------------------------------
        | CASCO
        |------------------------------------------------------------------
        */

        if (
            articleType === "helmet"
        ) {

            currentGroup = {

                helmet:
                    row,

                helmetQuantity:
                    getRowQuantity(
                        row
                    ),

                paddings: [],

                sourceIndex:
                    groups.length

            };


            groups.push(
                currentGroup
            );


            continue;

        }


        /*
        |------------------------------------------------------------------
        | IMBOTTITURA
        |------------------------------------------------------------------
        |
        | Una padding immediatamente successiva al casco appartiene
        | a quel gruppo.
        |
        | Non guardiamo più ".C": questa distinzione non fa più parte
        | delle regole attuali.
        |------------------------------------------------------------------
        */

        if (
            articleType === "padding"
        ) {

            if (
                currentGroup !== null
            ) {

                currentGroup.paddings.push(
                    {

                        row,

                        quantity:
                            getRowQuantity(
                                row
                            ),

                        sourceIndex:
                            groups.length

                    }
                );

            }


            /*
            |----------------------------------------------------------------
            | Se non esiste un casco precedente, la padding sarà trattata
            | successivamente come articolo finale.
            |----------------------------------------------------------------
            */

            continue;

        }


        /*
        |------------------------------------------------------------------
        | ARTICOLO DIVERSO
        |------------------------------------------------------------------
        |
        | Un articolo diverso interrompe il legame con il casco precedente.
        |------------------------------------------------------------------
        */

        currentGroup = null;

    }


    return groups;

}


/*
|--------------------------------------------------------------------------
| TROVA LE PADDING ORFANE
|--------------------------------------------------------------------------
|
| Sono padding che non hanno un casco immediatamente precedente.
|--------------------------------------------------------------------------
*/

function findOrphanPaddings(
    rows
) {

    const orphanPaddings = [];

    let previousWasHelmet = false;


    for (
        const row of rows
    ) {

        const articleType =
            classifyCode(
                row.code
            );


        if (
            articleType === "helmet"
        ) {

            previousWasHelmet = true;

            continue;

        }


        if (
            articleType === "padding"
        ) {

            if (
                !previousWasHelmet
            ) {

                orphanPaddings.push(
                    row
                );

            }


            continue;

        }


        /*
        |------------------------------------------------------------------
        | Qualsiasi altro articolo interrompe il collegamento.
        |------------------------------------------------------------------
        */

        previousWasHelmet = false;

    }


    return orphanPaddings;

}


/*
|--------------------------------------------------------------------------
| DISTRIBUISCE UN GRUPPO CASCO NELLE BOX
|--------------------------------------------------------------------------
|
| Questa è la parte fondamentale del nuovo motore.
|
| Esempio:
|
| BOX corrente:
|   7 caschi
|
| Gruppo:
|   3 caschi
|   2 PAD52
|   1 PAD57
|
| Risultato:
|
| BOX X:
|   1 casco
|   1 PAD52
|
| BOX X+1:
|   2 caschi
|   1 PAD52
|   1 PAD57
|
|--------------------------------------------------------------------------
*/

function distributeHelmetGroup(
    group,
    boxes
) {

    let remainingHelmetQuantity =
        group.helmetQuantity;


    /*
    |----------------------------------------------------------------------
    | Quantità residue delle padding.
    |----------------------------------------------------------------------
    */

    const remainingPaddings =
        group.paddings.map(
            padding => ({

                row:
                    padding.row,

                remainingQuantity:
                    padding.quantity

            })
        );


    let splitIndex = 0;


    while (
        remainingHelmetQuantity > 0
    ) {

        let currentBox =
            boxes.length > 0
                ? boxes[
                    boxes.length - 1
                ]
                : null;


        /*
        |------------------------------------------------------------------
        | Se non esiste una BOX o è piena, creiamo una nuova BOX.
        |------------------------------------------------------------------
        */

        const currentHelmetQuantity =
            currentBox === null
                ? 0
                : currentBox.helmets.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        getRowQuantity(
                            item
                        ),
                    0
                );


        if (
            currentBox === null ||
            currentHelmetQuantity >=
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX
        ) {

            currentBox =
                createNextBox(
                    boxes
                );

        }


        /*
        |------------------------------------------------------------------
        | Spazi disponibili nella BOX.
        |------------------------------------------------------------------
        */

        const helmetsAlreadyInBox =
            currentBox.helmets.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    getRowQuantity(
                        item
                    ),
                0
            );


        const availableHelmetSlots =
            BOX_ENGINE_CONFIG.MAX_HELMETS_PER_BOX -
            helmetsAlreadyInBox;


        const helmetsForThisBox =
            Math.min(
                remainingHelmetQuantity,
                availableHelmetSlots
            );


        /*
        |------------------------------------------------------------------
        | CREA RIGA CASCO SPLITTATA
        |------------------------------------------------------------------
        */

        const helmetPart =
            cloneRowWithQuantity(
                group.helmet,
                helmetsForThisBox,
                splitIndex
            );


        helmetPart.articleType =
            "helmet";


        addHelmetToBox(
            currentBox,
            helmetPart
        );


        /*
        |------------------------------------------------------------------
        | DISTRIBUZIONE DELLE PADDING
        |------------------------------------------------------------------
        |
        | Per ogni BOX assegnamo al massimo una quantità di padding pari
        | ai caschi presenti in quella parte del gruppo.
        |
        | Questo mantiene il rapporto casco → padding.
        |------------------------------------------------------------------
        */

        let paddingSlotsAvailable =
            helmetsForThisBox;


        for (
            const padding of remainingPaddings
        ) {

            if (
                padding.remainingQuantity <= 0
            ) {

                continue;

            }


            if (
                paddingSlotsAvailable <= 0
            ) {

                break;

            }


            const paddingForThisBox =
                Math.min(
                    padding.remainingQuantity,
                    paddingSlotsAvailable
                );


            if (
                paddingForThisBox <= 0
            ) {

                continue;

            }


            const paddingPart =
                cloneRowWithQuantity(
                    padding.row,
                    paddingForThisBox,
                    `${splitIndex}_padding_${group.paddings.indexOf(padding) + 1}`
                );


            paddingPart.articleType =
                "padding";


            addAttachedItemToBox(
                currentBox,
                paddingPart
            );


            padding.remainingQuantity -=
                paddingForThisBox;


            paddingSlotsAvailable -=
                paddingForThisBox;

        }


        /*
        |------------------------------------------------------------------
        | Aggiorniamo il residuo del gruppo.
        |------------------------------------------------------------------
        */

        remainingHelmetQuantity -=
            helmetsForThisBox;


        splitIndex++;

    }


    /*
    |----------------------------------------------------------------------
    | EVENTUALI PADDING ECCEDENTI
    |----------------------------------------------------------------------
    |
    | Se esistono più padding rispetto ai caschi disponibili, non li
    | perdiamo.
    |
    | Vanno nella BOX finale insieme agli altri articoli.
    |----------------------------------------------------------------------
    */

    const excessPaddings = [];


    for (
        const padding of remainingPaddings
    ) {

        if (
            padding.remainingQuantity > 0
        ) {

            excessPaddings.push(
                cloneRowWithQuantity(
                    padding.row,
                    padding.remainingQuantity,
                    `excess_${group.sourceIndex}_${excessPaddings.length + 1}`
                )
            );

        }

    }


    return excessPaddings;

}


/*
|--------------------------------------------------------------------------
| CREA LA BOX FINALE
|--------------------------------------------------------------------------
|
| Tutto ciò che non è:
|
|   - casco
|   - imbottitura associata
|
| finisce qui.
|
| UNA SOLA BOX.
|
|--------------------------------------------------------------------------
*/

function createFinalBox(
    boxes,
    finalItems
) {

    if (
        finalItems.length === 0
    ) {

        return null;

    }


    const finalBox =
        createNextBox(
            boxes
        );


    for (
        const item of finalItems
    ) {

        const finalItem = {

            ...item

        };


        finalItem.articleType =
            classifyCode(
                finalItem.code
            );


        finalItem.placementStatus =
            "box_finale";


        addTailItemToBox(
            finalBox,
            finalItem
        );

    }


    return finalBox;

}


/*
|--------------------------------------------------------------------------
| RACCOLTA DEGLI ARTICOLI FINALI
|--------------------------------------------------------------------------
|
| Gli articoli finali vengono raccolti mantenendo esattamente l'ordine
| della sorgente.
|
|--------------------------------------------------------------------------
*/

function collectFinalItems(
    rows,
    excessPaddings
) {

    const finalItems = [];


    /*
    |----------------------------------------------------------------------
    | Prima raccogliamo gli ID delle padding che sono state associate
    | correttamente ai caschi.
    |----------------------------------------------------------------------
    */

    const associatedPaddingRows =
        new Set();


    /*
    |----------------------------------------------------------------------
    | Costruiamo i gruppi per identificare le padding associate.
    |----------------------------------------------------------------------
    */

    const groups =
        buildHelmetGroups(
            rows
        );


    for (
        const group of groups
    ) {

        for (
            const padding of group.paddings
        ) {

            associatedPaddingRows.add(
                padding.row
            );

        }

    }


    /*
    |----------------------------------------------------------------------
    | Gli articoli "other" vanno tutti nella BOX finale.
    |----------------------------------------------------------------------
    */

    for (
        const row of rows
    ) {

        const articleType =
            classifyCode(
                row.code
            );


        if (
            articleType === "other"
        ) {

            finalItems.push(
                row
            );

            continue;

        }


        /*
        |------------------------------------------------------------------
        | Padding non associate.
        |------------------------------------------------------------------
        */

        if (
            articleType === "padding" &&
            !associatedPaddingRows.has(
                row
            )
        ) {

            finalItems.push(
                row
            );

        }

    }


    /*
    |----------------------------------------------------------------------
    | Padding eccedenti.
    |----------------------------------------------------------------------
    |
    | Vengono aggiunte alla fine della lista.
    |
    | Non vengono perse.
    |----------------------------------------------------------------------
    */

    for (
        const excessPadding of excessPaddings
    ) {

        finalItems.push(
            excessPadding
        );

    }


    return finalItems;

}


/*
|--------------------------------------------------------------------------
| FINALIZZA LE BOX
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


        const helmetCount =
            box.helmets.reduce(
                (
                    total,
                    helmet
                ) =>
                    total +
                    getRowQuantity(
                        helmet
                    ),
                0
            );


        if (
            helmetCount >=
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
| CONTEGGIO CASCHI
|--------------------------------------------------------------------------
*/

function countHelmets(
    rows
) {

    return rows.reduce(
        (
            total,
            row
        ) => {

            if (
                classifyCode(
                    row.code
                ) !== "helmet"
            ) {

                return total;

            }


            return (
                total +
                getRowQuantity(
                    row
                )
            );

        },
        0
    );

}


/*
|--------------------------------------------------------------------------
| CONTEGGIO ARTICOLI
|--------------------------------------------------------------------------
*/

function countRows(
    boxes
) {

    return boxes.reduce(
        (
            total,
            box
        ) =>
            total +
            box.items.length,
        0
    );

}


/*
|--------------------------------------------------------------------------
| VALIDAZIONE CASCHI
|--------------------------------------------------------------------------
*/

function validateHelmetAssignment(
    rows,
    boxes
) {

    const sourceHelmetQuantity =
        countHelmets(
            rows
        );


    const assignedHelmetQuantity =
        boxes.reduce(
            (
                total,
                box
            ) =>
                total +
                box.helmets.reduce(
                    (
                        boxTotal,
                        helmet
                    ) =>
                        boxTotal +
                        getRowQuantity(
                            helmet
                        ),
                    0
                ),
            0
        );


    if (
        sourceHelmetQuantity !==
        assignedHelmetQuantity
    ) {

        throw new Error(
            `Controllo caschi fallito: ${sourceHelmetQuantity} caschi sorgente, ${assignedHelmetQuantity} caschi assegnati.`
        );

    }

}


/*
|--------------------------------------------------------------------------
| MOTORE PRINCIPALE
|--------------------------------------------------------------------------
*/

function buildBoxes(
    rows
) {

    if (
        !Array.isArray(
            rows
        )
    ) {

        throw new Error(
            "Il Box Engine richiede un array di righe."
        );

    }


    /*
    |----------------------------------------------------------------------
    | 1. Creiamo una copia logica delle righe con classificazione diretta.
    |----------------------------------------------------------------------
    */

    const workingRows =
        rows.map(
            row => ({

                ...row,

                articleType:
                    classifyCode(
                        row.code
                    )

            })
        );


    /*
    |----------------------------------------------------------------------
    | 2. Costruiamo i gruppi casco + imbottiture.
    |----------------------------------------------------------------------
    */

    const helmetGroups =
        buildHelmetGroups(
            workingRows
        );


    /*
    |----------------------------------------------------------------------
    | 3. Creiamo le BOX dei caschi.
    |----------------------------------------------------------------------
    */

    const boxes = [];


    const excessPaddings = [];


    for (
        const group of helmetGroups
    ) {

        const groupExcessPaddings =
            distributeHelmetGroup(
                group,
                boxes
            );


        excessPaddings.push(
            ...groupExcessPaddings
        );

    }


    /*
    |----------------------------------------------------------------------
    | 4. Raccogliamo tutto ciò che deve finire nella BOX finale.
    |----------------------------------------------------------------------
    */

    const finalItems =
        collectFinalItems(
            workingRows,
            excessPaddings
        );


    /*
    |----------------------------------------------------------------------
    | 5. Creiamo UNA SOLA BOX finale.
    |----------------------------------------------------------------------
    |
    | Se non ci sono caschi:
    |
    |   BOX 1 = articoli finali
    |
    | Se esistono già BOX casco:
    |
    |   BOX successiva = articoli finali
    |
    |--------------------------------------------------------------------------
    */

    createFinalBox(
        boxes,
        finalItems
    );


    /*
    |----------------------------------------------------------------------
    | 6. Finalizzazione.
    |----------------------------------------------------------------------
    */

    finalizeBoxes(
        boxes
    );


    /*
    |----------------------------------------------------------------------
    | 7. Controllo integrità caschi.
    |----------------------------------------------------------------------
    */

    validateHelmetAssignment(
        workingRows,
        boxes
    );


    /*
    |----------------------------------------------------------------------
    | 8. STATISTICHE
    |----------------------------------------------------------------------
    */

    const helmetCount =
        countHelmets(
            workingRows
        );


    const unassignedItems = [];


    return {

        boxes,

        unassignedItems,

        statistics: {

            boxCount:
                boxes.length,

            helmetCount,

            unassignedCount:
                unassignedItems.length,

            itemCount:
                countRows(
                    boxes
                )

        }

    };

}


/*
|--------------------------------------------------------------------------
| API PUBBLICA
|--------------------------------------------------------------------------
*/

window.PackingListBoxEngine = {

    buildBoxes,

    createBox,

    constants:
        BOX_ENGINE_CONFIG

};