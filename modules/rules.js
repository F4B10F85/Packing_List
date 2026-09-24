"use strict";

/*
|--------------------------------------------------------------------------
| Packing List - Rules Engine
|--------------------------------------------------------------------------
| Questo modulo definisce COME deve essere trattato ogni articolo.
|
| Non assegna ancora il numero della BOX.
| L'assegnazione fisica verrà gestita da box-engine.js.
|
| Il classifier ci ha già detto cosa è l'articolo.
| Qui decidiamo:
|
| - se appartiene al contenuto principale della BOX
| - se deve stare alla fine
| - se segue un casco
| - se occupa spazio
| - quale priorità di posizionamento deve avere
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Costanti
|--------------------------------------------------------------------------
*/

const PACKING_RULES = {

    /*
    |--------------------------------------------------------------------------
    | Capacità BOX
    |--------------------------------------------------------------------------
    */

    BOX_MAX_HELMETS: 8,


    /*
    |--------------------------------------------------------------------------
    | Unità di spazio
    |--------------------------------------------------------------------------
    |
    | 60 unità = 1 spazio casco
    |
    | 20 imbottiture .C = 60 unità
    | 6 BOX.INS./BOX.FRB. = 60 unità
    |
    */

    BOX_SPACE_UNITS: 60,


    /*
    |--------------------------------------------------------------------------
    | Spazio occupato dagli articoli
    |--------------------------------------------------------------------------
    */

    HELMET_SPACE_UNITS: 60,

    PADDING_C_SPACE_UNITS: 3,

    BOX_ACCESSORY_SPACE_UNITS: 10,

    ZERO_SPACE_UNITS: 0

};


/*
|--------------------------------------------------------------------------
| Applica le regole a una singola riga classificata
|--------------------------------------------------------------------------
*/

function applyRulesToRow(
    row
) {

    /*
    |--------------------------------------------------------------------------
    | CASCO
    |--------------------------------------------------------------------------
    |
    | Il casco rappresenta il contenuto principale della BOX.
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "helmet"
    ) {

        return {

            ...row,

            rule: "helmet",

            packingRole: "main",

            followsHelmet: false,

            goesToEnd: false,

            canUseAnyBox: false,

            occupiesSpace: true,

            occupancyUnits:
                PACKING_RULES.HELMET_SPACE_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | IMBOTTITURA SENZA .C
    |--------------------------------------------------------------------------
    |
    | Segue il casco.
    |
    | Non deve essere conteggiata come spazio autonomo.
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "padding" &&
        row.hasC === false
    ) {

        return {

            ...row,

            rule: "padding_attached",

            packingRole: "attached",

            followsHelmet: true,

            goesToEnd: false,

            canUseAnyBox: false,

            occupiesSpace: false,

            occupancyUnits:
                PACKING_RULES.ZERO_SPACE_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | IMBOTTITURA CON .C
    |--------------------------------------------------------------------------
    |
    | 20 pezzi = 1 spazio casco.
    |
    | Questi articoli devono essere posizionati alla fine della BOX.
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "padding" &&
        row.hasC === true
    ) {

        return {

            ...row,

            rule: "padding_c",

            packingRole: "tail",

            followsHelmet: false,

            goesToEnd: true,

            canUseAnyBox: false,

            occupiesSpace: true,

            occupancyUnits:
                PACKING_RULES.PADDING_C_SPACE_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | CRZ.
    |--------------------------------------------------------------------------
    |
    | Targhetta in busta.
    |
    | Deve stare alla fine.
    | Può essere inserita in qualsiasi BOX.
    | Non occupa spazio significativo.
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "special_label"
    ) {

        return {

            ...row,

            rule: "special_label",

            packingRole: "tail_free",

            followsHelmet: false,

            goesToEnd: true,

            canUseAnyBox: true,

            occupiesSpace: false,

            occupancyUnits:
                PACKING_RULES.ZERO_SPACE_UNITS

        };

    }

    /*
    |--------------------------------------------------------------------------
    | CROMO.MUFFS.
    |--------------------------------------------------------------------------
    | Earmuffs per rider.
    |
    | Stessa logica delle targhette CRZ:
    |
    | - va in coda
    | - può essere inserito in qualsiasi BOX
    | - non occupa spazio
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "rider_earmuffs"
    ) {

        return {

            ...row,

            rule: "rider_earmuffs",

            packingRole: "tail_free",

            followsHelmet: false,

            goesToEnd: true,

            canUseAnyBox: true,

            occupiesSpace: false,

            occupancyUnits:
                PACKING_RULES.ZERO_SPACE_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | BOX.INS. / BOX.FRB.
    |--------------------------------------------------------------------------
    |
    | 6 pezzi = 1 spazio casco.
    |
    | Devono essere trattati come articoli di coda.
    |--------------------------------------------------------------------------
    */

    if (
        row.articleType === "box_accessory"
    ) {

        return {

            ...row,

            rule: "box_accessory",

            packingRole: "tail",

            followsHelmet: false,

            goesToEnd: true,

            canUseAnyBox: false,

            occupiesSpace: true,

            occupancyUnits:
                PACKING_RULES.BOX_ACCESSORY_SPACE_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | ARTICOLO NON RICONOSCIUTO
    |--------------------------------------------------------------------------
    |
    | Non inventiamo una regola.
    |
    | Viene marcato come "da analizzare".
    | In questo modo non rischiamo di inserirlo erroneamente
    | nelle BOX.
    |--------------------------------------------------------------------------
    */

    return {

        ...row,

        rule: "unknown",

        packingRole: "unknown",

        followsHelmet: false,

        goesToEnd: true,

        canUseAnyBox: false,

        occupiesSpace: false,

        occupancyUnits: null,

        placementStatus: "da_analizzare"

    };

}


/*
|--------------------------------------------------------------------------
| Applica le regole a tutte le righe
|--------------------------------------------------------------------------
*/

function applyRules(
    rows
) {

    if (
        !Array.isArray(rows)
    ) {

        throw new Error(
            "Il Rules Engine richiede un array di righe classificate."
        );

    }

    return rows.map(
        (
            row
        ) =>
            applyRulesToRow(
                row
            )
    );

}


/*
|--------------------------------------------------------------------------
| API pubblica
|--------------------------------------------------------------------------
*/

window.PackingListRules = {

    applyRules,

    applyRulesToRow,

    constants: PACKING_RULES

};