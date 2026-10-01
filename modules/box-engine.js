"use strict";

/*
|--------------------------------------------------------------------------
| Packing List - Box Engine
|--------------------------------------------------------------------------
| Questo modulo assegna gli articoli alle BOX.
|
| Il motore è comune a tutti i clienti.
|
| Le differenze relative alla capacità delle BOX vengono delegate
| alle regole specifiche del cliente:
|
|   STANDARD → rules.js
|   CINA     → rules_cina.js
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CONFIGURAZIONE STANDARD
|--------------------------------------------------------------------------
|
| Questi valori rappresentano il comportamento storico STANDARD.
|
| IMPORTANTE:
| STANDARD rimane il comportamento predefinito.
|--------------------------------------------------------------------------
*/

const BOX_ENGINE_CONFIG = {

    MAX_HELMETS_PER_BOX: 8,

    SPACE_UNITS_PER_HELMET: 60,


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
        "CARB",
        "CARBH"

    ],


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
| NORMALIZZA IL CLIENTE
|--------------------------------------------------------------------------
*/

function normalizeCustomer(
    customer
) {

    if (
        customer === null ||
        customer === undefined
    ) {

        return "STANDARD";

    }


    const normalizedCustomer =
        String(
            customer
        )
            .trim()
            .toUpperCase();


    if (
        normalizedCustomer === "CINA"
    ) {

        return "CINA";

    }


    if (
        normalizedCustomer === "HERMES"
    ) {

        return "HERMES";

    }


    return "STANDARD";

}


/*
|--------------------------------------------------------------------------
| ORDINA LE RADICI
|--------------------------------------------------------------------------
*/

const HELMET_ROOTS_SORTED =
    [
        ...BOX_ENGINE_CONFIG.HELMET_ROOTS
    ]
        .sort(
            (
                firstRoot,
                secondRoot
            ) =>
                secondRoot.length -
                firstRoot.length
        );


const PADDING_ROOTS_SORTED =
    [
        ...BOX_ENGINE_CONFIG.PADDING_ROOTS
    ]
        .sort(
            (
                firstRoot,
                secondRoot
            ) =>
                secondRoot.length -
                firstRoot.length
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
            normalizedRoot
        )
    );

}


/*
|--------------------------------------------------------------------------
| CLASSIFICA DIRETTAMENTE IL CODICE
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


    clonedRow.quantity =
        quantity;


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
| OTTIENE LA CAPACITÀ DELLA BOX PER IL CLIENTE
|--------------------------------------------------------------------------
*/

function getBoxCapacityForCustomer(
    customer,
    row
) {

    const normalizedCustomer =
        normalizeCustomer(customer);


    if (
        normalizedCustomer === "CINA" &&
        window.PackingListRulesCina
    ) {

        return window.PackingListRulesCina
            .getHelmetBoxCapacity(row);

    }


    if (
        normalizedCustomer === "HERMES" &&
        window.PackingListRulesHermes
    ) {

        return window.PackingListRulesHermes
            .getHelmetBoxCapacity(row);

    }


    return PACKING_RULES
        .BOX_MAX_HELMETS;

}


/*
|--------------------------------------------------------------------------
| OTTIENE LA CAPACITÀ DEL GRUPPO
|--------------------------------------------------------------------------
*/

function getGroupBoxCapacity(
    customer,
    group
) {

    const normalizedCustomer =
        normalizeCustomer(customer);


    if (
        normalizedCustomer === "CINA" &&
        window.PackingListRulesCina
    ) {

        return window.PackingListRulesCina
            .getGroupBoxCapacity(group);

    }


    if (
        normalizedCustomer === "HERMES" &&
        window.PackingListRulesHermes
    ) {

        return window.PackingListRulesHermes
            .getGroupBoxCapacity(group);

    }


    return PACKING_RULES
        .BOX_MAX_HELMETS;

}


/*
|--------------------------------------------------------------------------
| CREA UNA NUOVA BOX
|--------------------------------------------------------------------------
*/

function createBox(
    boxNumber,
    capacity
) {

    const maxHelmets =
        capacity !== undefined &&
        capacity !== null
            ? capacity
            : BOX_ENGINE_CONFIG
                .MAX_HELMETS_PER_BOX;


    return {

        boxNumber,


        helmets: [],


        attachedItems: [],


        tailItems: [],


        items: [],


        usedSpaceUnits: 0,


        capacityUnits:
            maxHelmets *
            BOX_ENGINE_CONFIG
                .SPACE_UNITS_PER_HELMET,


        remainingSpaceUnits:
            maxHelmets *
            BOX_ENGINE_CONFIG
                .SPACE_UNITS_PER_HELMET,


        maxHelmets,


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


    const boxCapacity =
        box.maxHelmets !== undefined
            ? box.maxHelmets
            : BOX_ENGINE_CONFIG
                .MAX_HELMETS_PER_BOX;


    if (
        currentHelmetQuantity +
        quantity >
        boxCapacity
    ) {

        return false;

    }


    const requiredSpace =
        quantity *
        BOX_ENGINE_CONFIG
            .SPACE_UNITS_PER_HELMET;


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


    return true;

}


/*
|--------------------------------------------------------------------------
| CREA LA BOX SUCCESSIVA
|--------------------------------------------------------------------------
*/

function createNextBox(
    boxes,
    capacity
) {

    const boxNumber =
        boxes.length + 1;


    const box =
        createBox(
            boxNumber,
            capacity
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


            continue;

        }


        currentGroup = null;

    }


    return groups;

}


/*
|--------------------------------------------------------------------------
| TROVA LE PADDING ORFANE
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


        previousWasHelmet = false;

    }


    return orphanPaddings;

}


/*
|--------------------------------------------------------------------------
| DISTRIBUISCE UN GRUPPO CASCO NELLE BOX
|--------------------------------------------------------------------------
*/

function distributeHelmetGroup(
    group,
    boxes,
    customer
) {

    let remainingHelmetQuantity =
        group.helmetQuantity;


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


    /*
    |--------------------------------------------------------------------------
    | CAPACITÀ DEL GRUPPO
    |--------------------------------------------------------------------------
    |
    | STANDARD:
    |   8
    |
    | CINA:
    |   10 oppure 12
    |
    | La capacità viene fissata per tutto il gruppo.
    |--------------------------------------------------------------------------
    */

    const groupCapacity =
        getGroupBoxCapacity(
            customer,
            group
        );


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
        |--------------------------------------------------------------------------
        | La BOX corrente può essere utilizzata solo se appartiene allo
        | stesso tipo di capacità del gruppo.
        |--------------------------------------------------------------------------
        */

        const currentBoxCapacity =
            currentBox === null
                ? null
                : currentBox.maxHelmets;


        if (
            currentBox === null ||
            currentBoxCapacity !==
            groupCapacity
        ) {

            currentBox =
                createNextBox(
                    boxes,
                    groupCapacity
                );

        }


        const currentHelmetQuantity =
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


        if (
            currentHelmetQuantity >=
            groupCapacity
        ) {

            currentBox =
                createNextBox(
                    boxes,
                    groupCapacity
                );

        }


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
            groupCapacity -
            helmetsAlreadyInBox;


        const helmetsForThisBox =
            Math.min(
                remainingHelmetQuantity,
                availableHelmetSlots
            );


        if (
            helmetsForThisBox <= 0
        ) {

            currentBox =
                createNextBox(
                    boxes,
                    groupCapacity
                );

            continue;

        }


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


        remainingHelmetQuantity -=
            helmetsForThisBox;


        splitIndex++;

    }


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


    /*
    |--------------------------------------------------------------------------
    | La BOX finale non ha una capacità casco significativa.
    |
    | Manteniamo comunque una capacità numerica coerente per non rompere
    | il modello dati esistente.
    |--------------------------------------------------------------------------
    */

    const finalBox =
        createNextBox(
            boxes,
            BOX_ENGINE_CONFIG
                .MAX_HELMETS_PER_BOX
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
*/

function collectFinalItems(
    rows,
    excessPaddings
) {

    const finalItems = [];


    const associatedPaddingRows =
        new Set();


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


        const boxCapacity =
            box.maxHelmets !== undefined
                ? box.maxHelmets
                : BOX_ENGINE_CONFIG
                    .MAX_HELMETS_PER_BOX;


        if (
            helmetCount >=
            boxCapacity
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
|
| customer:
|
|   "STANDARD" → comportamento storico
|   "CINA"     → regole CINA
|
| Se customer non viene specificato:
|
|   STANDARD
|
|--------------------------------------------------------------------------
*/

function buildBoxes(
    rows,
    customer
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


    const normalizedCustomer =
        normalizeCustomer(
            customer
        );


    /*
    |--------------------------------------------------------------------------
    | CLASSIFICAZIONE
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | GRUPPI CASCO + IMBOTTITURE
    |--------------------------------------------------------------------------
    */

    const helmetGroups =
        buildHelmetGroups(
            workingRows
        );


    /*
    |--------------------------------------------------------------------------
    | BOX CASCHI
    |--------------------------------------------------------------------------
    */

    const boxes = [];


    const excessPaddings = [];


    for (
        const group of helmetGroups
    ) {

        const groupExcessPaddings =
            distributeHelmetGroup(
                group,
                boxes,
                normalizedCustomer
            );


        excessPaddings.push(
            ...groupExcessPaddings
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ARTICOLI FINALI
    |--------------------------------------------------------------------------
    */

    const finalItems =
        collectFinalItems(
            workingRows,
            excessPaddings
        );


    /*
    |--------------------------------------------------------------------------
    | BOX FINALE
    |--------------------------------------------------------------------------
    */

    createFinalBox(
        boxes,
        finalItems
    );


    /*
    |--------------------------------------------------------------------------
    | FINALIZZAZIONE
    |--------------------------------------------------------------------------
    */

    finalizeBoxes(
        boxes
    );


    /*
    |--------------------------------------------------------------------------
    | CONTROLLO INTEGRITÀ
    |--------------------------------------------------------------------------
    */

    validateHelmetAssignment(
        workingRows,
        boxes
    );


    /*
    |--------------------------------------------------------------------------
    | STATISTICHE
    |--------------------------------------------------------------------------
    */

    const helmetCount =
        countHelmets(
            workingRows
        );


    const unassignedItems = [];


    return {

        customer:
            normalizedCustomer,

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

    getBoxCapacityForCustomer,

    getGroupBoxCapacity,

    constants:
        BOX_ENGINE_CONFIG

};