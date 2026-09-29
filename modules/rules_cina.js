"use strict";

/*
|--------------------------------------------------------------------------
| Packing List - Rules CINA
|--------------------------------------------------------------------------
| Regole specifiche per il cliente CINA.
|
| IMPORTANTE:
| Le regole STANDARD rimangono completamente separate e sono definite
| in rules.js.
|
| Questo modulo contiene esclusivamente le differenze necessarie
| per CINA.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CONFIGURAZIONE CINA
|--------------------------------------------------------------------------
*/

const PACKING_RULES_CINA = {

    /*
    |--------------------------------------------------------------------------
    | Capacità BOX
    |--------------------------------------------------------------------------
    |
    | CINA utilizza tre capacità possibili:
    |
    | - 12 caschi
    | - 10 caschi
    |
    | La capacità viene determinata dal tipo di casco.
    |--------------------------------------------------------------------------
    */

    BOX_MAX_HELMETS_DEFAULT: 10,

    BOX_MAX_HELMETS_12: 12,

    BOX_MAX_HELMETS_10: 10,


    /*
    |--------------------------------------------------------------------------
    | Unità di spazio
    |--------------------------------------------------------------------------
    */

    BOX_SPACE_UNITS: 60,

    HELMET_SPACE_UNITS: 60,

    PADDING_C_SPACE_UNITS: 3,

    BOX_ACCESSORY_SPACE_UNITS: 10,

    ZERO_SPACE_UNITS: 0

};


/*
|--------------------------------------------------------------------------
| DETERMINA SE UN CRS2 HA 4 CIFRE FINALI
|--------------------------------------------------------------------------
|
| Esempi:
|
| CRS2.BLK.M.0023
|              ^^^^
|
| CRS2 con 4 cifre finali → capacità 10
|
| CRS2
| CRS2.BLK.M
|
| non hanno 4 cifre finali → capacità 12
|--------------------------------------------------------------------------
*/

function isCrs2WithFourFinalDigits(
    row
) {

    const code =
        row &&
        row.normalizedCode
            ? String(
                row.normalizedCode
            )
            .trim()
            .toUpperCase()
            : String(
                row && row.code !== undefined
                    ? row.code
                    : ""
            )
                .trim()
                .toUpperCase();


    return (
        row &&
        row.root === "CRS2" &&
        /\.\d{4}$/.test(
            code
        )
    );

}


/*
|--------------------------------------------------------------------------
| DETERMINA LA CAPACITÀ DEL CASCO
|--------------------------------------------------------------------------
|
| Regole CINA:
|
| NOVA                         → 12
| CRB2                         → 12
| CRS2 senza 4 cifre finali   → 12
| CRS2 con 4 cifre finali     → 10
| Tutti gli altri caschi      → 10
|--------------------------------------------------------------------------
*/

function getHelmetBoxCapacity(
    row
) {

    if (
        !row ||
        row.articleType !== "helmet"
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_DEFAULT;

    }


    if (
        row.root === "NOVA"
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_12;

    }


    if (
        row.root === "CRB2"
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_12;

    }

    if (
        row.root === "CRABS"
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_12;

    }


    if (
        row.root === "CRS2"
    ) {

        if (
            isCrs2WithFourFinalDigits(
                row
            )
        ) {

            return PACKING_RULES_CINA
                .BOX_MAX_HELMETS_10;

        }


        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_12;

    }


    return PACKING_RULES_CINA
        .BOX_MAX_HELMETS_DEFAULT;

}


/*
|--------------------------------------------------------------------------
| DETERMINA LA CAPACITÀ DEL GRUPPO
|--------------------------------------------------------------------------
|
| La capacità viene determinata dal casco / dai caschi presenti
| nel gruppo.
|
| Regola:
|
| se almeno un casco richiede capacità 10,
| il gruppo utilizza capacità 10.
|
| Altrimenti utilizza capacità 12.
|--------------------------------------------------------------------------
*/

function getGroupBoxCapacity(
    group
) {

    if (
        !group
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_DEFAULT;

    }


    const helmets = [];


    if (
        group.helmet
    ) {

        helmets.push(
            group.helmet
        );

    }


    if (
        Array.isArray(
            group.helmets
        )
    ) {

        helmets.push(
            ...group.helmets
        );

    }


    if (
        helmets.length === 0
    ) {

        return PACKING_RULES_CINA
            .BOX_MAX_HELMETS_DEFAULT;

    }


    for (
        const helmet of helmets
    ) {

        if (
            getHelmetBoxCapacity(
                helmet
            ) ===
            PACKING_RULES_CINA
                .BOX_MAX_HELMETS_10
        ) {

            return PACKING_RULES_CINA
                .BOX_MAX_HELMETS_10;

        }

    }


    return PACKING_RULES_CINA
        .BOX_MAX_HELMETS_12;

}


/*
|--------------------------------------------------------------------------
| API PUBBLICA
|--------------------------------------------------------------------------
*/

window.PackingListRulesCina = {

    getHelmetBoxCapacity,

    getGroupBoxCapacity,

    isCrs2WithFourFinalDigits,

    constants:
        PACKING_RULES_CINA

};