"use strict";

/*
|--------------------------------------------------------------------------
| PACKING LIST - NORMALIZER
|--------------------------------------------------------------------------
|
| Responsabilità:
|
| 1. Ricevere le righe lette dall'Excel.
| 2. Creare una struttura dati interna stabile.
| 3. Conservare i valori necessari alla Packing List finale.
| 4. Conservare la riga Excel originale.
|
| IMPORTANTE:
|
| Questo modulo NON assegna le BOX.
| Questo modulo NON applica le regole di imballaggio.
| Questo modulo NON decide l'ordine degli articoli.
|
| La responsabilità delle BOX appartiene al Rule Engine.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Colonne Excel utilizzate dalla Packing List finale
|--------------------------------------------------------------------------
|
| Questi nomi devono corrispondere ESATTAMENTE alle intestazioni
| presenti nel file Excel originale.
|
*/

const PACKING_LIST_COLUMNS = {

    order:
        "Rif. registrazione origine",

    quantity:
        "Quantità",

    code:
        "Codice",

    description:
        "Descrizione estesa",

    personalization:
        "Personalizzazione",

    customerReference:
        "Riferimento Cliente"

};


/*
|--------------------------------------------------------------------------
| Normalizzazione principale
|--------------------------------------------------------------------------
*/

function normalizeImportedRows(rows) {

    /*
    |--------------------------------------------------------------------------
    | Validazione di base
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(rows)) {

        throw new Error(
            "I dati importati non sono in formato valido."
        );

    }


    if (rows.length === 0) {

        throw new Error(
            "Il file Excel non contiene righe di dati."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Verifica colonne necessarie
    |--------------------------------------------------------------------------
    */

    validatePackingListColumns(
        rows
    );


    /*
    |--------------------------------------------------------------------------
    | Creazione dataset normalizzato
    |--------------------------------------------------------------------------
    */

    const normalizedRows =
        rows.map(
            (row, index) => {

                return normalizeRow(
                    row,
                    index
                );

            }
        );


    return normalizedRows;

}


/*
|--------------------------------------------------------------------------
| Validazione colonne
|--------------------------------------------------------------------------
*/

function validatePackingListColumns(rows) {

    const availableColumns =
        Object.keys(
            rows[0]
        );


    const requiredColumns =
        Object.values(
            PACKING_LIST_COLUMNS
        );


    const missingColumns =
        requiredColumns.filter(
            column =>
                !availableColumns.includes(
                    column
                )
        );


    if (missingColumns.length > 0) {

        throw new Error(
            "Nel file Excel mancano le colonne necessarie alla Packing List: " +
            missingColumns.join(", ")
        );

    }

}


/*
|--------------------------------------------------------------------------
| Normalizzazione della singola riga
|--------------------------------------------------------------------------
*/

function normalizeRow(row, index) {

    /*
    |--------------------------------------------------------------------------
    | Oggetto interno standardizzato
    |--------------------------------------------------------------------------
    |
    | La struttura è volutamente più ricca delle sole colonne finali.
    |
    | In questo modo il Rule Engine potrà lavorare sui dati senza
    | dover continuamente interrogare le intestazioni Excel.
    |
    */

    const normalizedRow = {

        /*
        |--------------------------------------------------------------------------
        | Identificazione interna
        |--------------------------------------------------------------------------
        */

        id:
            index + 1,

        sourceRow:
            index + 2,


        /*
        |--------------------------------------------------------------------------
        | Dati della Packing List
        |--------------------------------------------------------------------------
        */

        order:
            row[
                PACKING_LIST_COLUMNS.order
            ],

        quantity:
            normalizeQuantity(
                row[
                    PACKING_LIST_COLUMNS.quantity
                ]
            ),

        code:
            normalizeText(
                row[
                    PACKING_LIST_COLUMNS.code
                ]
            ),

        description:
            normalizeText(
                row[
                    PACKING_LIST_COLUMNS.description
                ]
            ),

        personalization:
            normalizeText(
                row[
                    PACKING_LIST_COLUMNS.personalization
                ]
            ),

        customerReference:
            normalizeText(
                row[
                    PACKING_LIST_COLUMNS.customerReference
                ]
            ),


        /*
        |--------------------------------------------------------------------------
        | Dati necessari al motore delle regole
        |--------------------------------------------------------------------------
        |
        | Questi campi vengono inizializzati ma NON valorizzati finché
        | non abbiamo definito esattamente le regole di assegnazione.
        |
        */

        root:
            null,

        padding:
            null,

        articleType:
            null,

        occupancy:
            null,


        /*
        |--------------------------------------------------------------------------
        | Assegnazione BOX
        |--------------------------------------------------------------------------
        |
        | Inizialmente ogni articolo non appartiene a nessuna BOX.
        |
        */

        box:
            null,

        placementStatus:
            "da_assegnare",


        /*
        |--------------------------------------------------------------------------
        | Dati originali
        |--------------------------------------------------------------------------
        |
        | Conserviamo l'intera riga Excel originale.
        |
        | Questo è importante perché il Rule Engine potrebbe avere bisogno
        | di una colonna che oggi non stiamo ancora utilizzando.
        |
        */

        source:
            row

    };


    return normalizedRow;

}


/*
|--------------------------------------------------------------------------
| Normalizzazione quantità
|--------------------------------------------------------------------------
*/

function normalizeQuantity(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    if (typeof value === "number") {

        return value;

    }


    const normalizedValue =
        String(value)
            .trim()
            .replace(",", ".");


    const numberValue =
        Number(
            normalizedValue
        );


    if (
        Number.isNaN(
            numberValue
        )
    ) {

        return 0;

    }


    return numberValue;

}


/*
|--------------------------------------------------------------------------
| Normalizzazione testo
|--------------------------------------------------------------------------
*/

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim();

}


/*
|--------------------------------------------------------------------------
| API pubblica
|--------------------------------------------------------------------------
*/

window.PackingListNormalizer = {

    normalizeImportedRows,

    validatePackingListColumns

};