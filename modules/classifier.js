"use strict";

/*
|--------------------------------------------------------------------------
| Classifier
|--------------------------------------------------------------------------
| Interpreta il CODICE dell'articolo e determina:
|
| - ROOT
| - TIPO ARTICOLO
| - presenza di ".C"
| - gruppo di posizionamento
| - spazio occupato nella BOX
|
| IMPORTANTE:
| Il classifier NON assegna ancora la BOX.
| La BOX verrà assegnata successivamente dal Box Engine.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Unità di spazio
|--------------------------------------------------------------------------
| Utilizziamo 60 unità per rappresentare una posizione completa.
|
| 1 casco                    = 60 unità
| 20 imbottiture ".C"       = 60 unità
| 6 BOX.INS./BOX.FRB.       = 60 unità
|
| In questo modo evitiamo problemi con numeri decimali durante
| l'assegnazione delle BOX.
|--------------------------------------------------------------------------
*/

const CLASSIFIER_SPACE = {

    BOX_UNITS: 60,

    HELMET_UNITS: 60,

    PADDING_C_UNITS: 3,

    BOX_ACCESSORY_UNITS: 10,

    ZERO_UNITS: 0

};


/*
|--------------------------------------------------------------------------
| Root dei caschi
|--------------------------------------------------------------------------
*/

const HELMET_ROOTS = [

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

];


/*
|--------------------------------------------------------------------------
| Root delle imbottiture
|--------------------------------------------------------------------------
*/

const PADDING_ROOTS = [

    "CRX",
    "CRX2",
    "CRXU",
    "CRW",
    "CRW2",
    "CRY",
    "PK.PAD"

];


/*
|--------------------------------------------------------------------------
| Root degli articoli speciali
|--------------------------------------------------------------------------
*/

const SPECIAL_ROOTS = {

    CRZ: "CRZ",
    BOX_INS: "BOX.INS",
    BOX_FRB: "BOX.FRB"

};


/*
|--------------------------------------------------------------------------
| Normalizzazione del codice
|--------------------------------------------------------------------------
| Non modifichiamo il codice originale.
| Creiamo una versione normalizzata solo per i controlli interni.
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

    return String(code)
        .trim()
        .toUpperCase();

}


/*
|--------------------------------------------------------------------------
| Individuazione ROOT
|--------------------------------------------------------------------------
| Le root vengono ordinate dalla più lunga alla più corta.
|
| Questo è importante per casi come:
|
| CRPL2
| CRP2
|
| CRPL2 deve essere riconosciuta prima di CRP2.
|--------------------------------------------------------------------------
*/

function findRoot(
    normalizedCode,
    roots
) {

    const orderedRoots = [
        ...roots
    ].sort(
        (
            firstRoot,
            secondRoot
        ) =>
            secondRoot.length -
            firstRoot.length
    );

    for (
        const root of orderedRoots
    ) {

        if (
            normalizedCode === root ||
            normalizedCode.startsWith(
                `${root}.`
            )
        ) {

            return root;

        }

    }

    return null;

}


/*
|--------------------------------------------------------------------------
| Individuazione ".C"
|--------------------------------------------------------------------------
| ".C" viene considerato un segmento autonomo del codice.
|
| Esempio:
|
| CRX.PAD55.C
|
| -> true
|
| Mentre una semplice lettera C contenuta in un altro segmento
| non deve essere interpretata come ".C".
|--------------------------------------------------------------------------
*/

function hasCDimension(
    normalizedCode
) {

    const segments =
        normalizedCode.split(".");

    return segments.includes("C");

}


/*
|--------------------------------------------------------------------------
| Classificazione del codice
|--------------------------------------------------------------------------
*/

function classifyCode(
    code
) {

    const normalizedCode =
        normalizeCode(code);


    /*
    |--------------------------------------------------------------------------
    | Codice vuoto
    |--------------------------------------------------------------------------
    */

    if (
        normalizedCode === ""
    ) {

        return {

            normalizedCode: "",

            root: null,

            articleType: "unknown",

            placementGroup: "unknown",

            hasC: false,

            occupancyUnits: null

        };

    }


    /*
    |--------------------------------------------------------------------------
    | CRZ.
    |--------------------------------------------------------------------------
    | Targhetta in busta.
    |
    | Va alla fine della BOX.
    | Può utilizzare qualsiasi spazio libero.
    | Non consideriamo spazio occupato.
    |--------------------------------------------------------------------------
    */

    if (
        normalizedCode.startsWith(
            "CRZ."
        )
    ) {

        return {

            normalizedCode,

            root: SPECIAL_ROOTS.CRZ,

            articleType: "special_label",

            placementGroup: "tail_free",

            hasC: false,

            occupancyUnits:
                CLASSIFIER_SPACE.ZERO_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | BOX.INS.
    |--------------------------------------------------------------------------
    */

    if (
        normalizedCode.startsWith(
            "BOX.INS."
        )
    ) {

        return {

            normalizedCode,

            root: SPECIAL_ROOTS.BOX_INS,

            articleType: "box_accessory",

            placementGroup: "tail",

            hasC: false,

            occupancyUnits:
                CLASSIFIER_SPACE.BOX_ACCESSORY_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | BOX.FRB.
    |--------------------------------------------------------------------------
    */

    if (
        normalizedCode.startsWith(
            "BOX.FRB."
        )
    ) {

        return {

            normalizedCode,

            root: SPECIAL_ROOTS.BOX_FRB,

            articleType: "box_accessory",

            placementGroup: "tail",

            hasC: false,

            occupancyUnits:
                CLASSIFIER_SPACE.BOX_ACCESSORY_UNITS

        };

    }

    /*
    |--------------------------------------------------------------------------
    | CROMO.MUFFS.
    |--------------------------------------------------------------------------
    | Earmuffs per rider.
    |
    | Va in coda alla BOX.
    | Può essere inserito in qualsiasi BOX.
    | Non occupa spazio.
    |--------------------------------------------------------------------------
    */

    if (
        normalizedCode.startsWith(
            "CROMO.MUFFS."
        )
    ) {

        return {

            normalizedCode,

            root: "CROMO.MUFFS",

            articleType: "rider_earmuffs",

            placementGroup: "tail_free",

            hasC: false,

            occupancyUnits:
                CLASSIFIER_SPACE.ZERO_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Casco
    |--------------------------------------------------------------------------
    */

    const helmetRoot =
        findRoot(
            normalizedCode,
            HELMET_ROOTS
        );

    if (
        helmetRoot !== null
    ) {

        return {

            normalizedCode,

            root: helmetRoot,

            articleType: "helmet",

            placementGroup: "helmet",

            hasC: false,

            occupancyUnits:
                CLASSIFIER_SPACE.HELMET_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Imbottitura
    |--------------------------------------------------------------------------
    */

    const paddingRoot =
        findRoot(
            normalizedCode,
            PADDING_ROOTS
        );

    if (
        paddingRoot !== null
    ) {

        const isC =
            hasCDimension(
                normalizedCode
            );


        /*
        |--------------------------------------------------------------------------
        | Imbottitura senza ".C"
        |--------------------------------------------------------------------------
        | Segue il casco.
        | Non occupa una posizione autonoma nella BOX.
        |--------------------------------------------------------------------------
        */

        if (
            !isC
        ) {

            return {

                normalizedCode,

                root: paddingRoot,

                articleType: "padding",

                placementGroup:
                    "padding_attached",

                hasC: false,

                occupancyUnits:
                    CLASSIFIER_SPACE.ZERO_UNITS

            };

        }


        /*
        |--------------------------------------------------------------------------
        | Imbottitura con ".C"
        |--------------------------------------------------------------------------
        | Va alla fine della BOX.
        |
        | 20 pezzi = 1 posizione.
        |--------------------------------------------------------------------------
        */

        return {

            normalizedCode,

            root: paddingRoot,

            articleType: "padding",

            placementGroup:
                "padding_tail",

            hasC: true,

            occupancyUnits:
                CLASSIFIER_SPACE.PADDING_C_UNITS

        };

    }


    /*
    |--------------------------------------------------------------------------
    | ROOT non riconosciuta
    |--------------------------------------------------------------------------
    | Per ora non inventiamo lo spazio occupato.
    |
    | Questi articoli verranno trattati dal motore delle regole
    | come articoli da mettere alla fine delle BOX.
    |--------------------------------------------------------------------------
    */

    return {

        normalizedCode,

        root: null,

        articleType: "other",

        placementGroup: "tail",

        hasC:
            hasCDimension(
                normalizedCode
            ),

        occupancyUnits: null

    };

}


/*
|--------------------------------------------------------------------------
| Classificazione di una riga normalizzata
|--------------------------------------------------------------------------
*/

function classifyRow(
    row
) {

    const classification =
        classifyCode(
            row.code
        );


    return {

        ...row,

        normalizedCode:
            classification.normalizedCode,

        root:
            classification.root,

        articleType:
            classification.articleType,

        placementGroup:
            classification.placementGroup,

        hasC:
            classification.hasC,

        occupancyUnits:
            classification.occupancyUnits

    };

}


/*
|--------------------------------------------------------------------------
| Classificazione di tutte le righe
|--------------------------------------------------------------------------
*/

function classifyRows(
    rows
) {

    if (
        !Array.isArray(rows)
    ) {

        throw new Error(
            "Il classifier richiede un array di righe normalizzate."
        );

    }

    return rows.map(
        (
            row
        ) =>
            classifyRow(
                row
            )
    );

}


/*
|--------------------------------------------------------------------------
| API pubblica
|--------------------------------------------------------------------------
*/

window.PackingListClassifier = {

    classifyCode,

    classifyRow,

    classifyRows

};