"use strict";


/*
|--------------------------------------------------------------------------
| Packing List - Excel Importer
|--------------------------------------------------------------------------
|
| Gestisce esclusivamente:
|
| - caricamento del file Excel
| - lettura del workbook
| - individuazione del foglio
| - conversione delle righe in oggetti JavaScript
| - restituzione dei dati importati
|
| Non contiene alcuna logica relativa alle BOX.
|
*/


/*
|--------------------------------------------------------------------------
| Configurazione
|--------------------------------------------------------------------------
*/

const IMPORTER_CONFIGURATION = {

    defaultSheetName: "Foglio1",

    supportedExtensions: [
        ".xlsx",
        ".xls"
    ]

};


/*
|--------------------------------------------------------------------------
| Importazione file Excel
|--------------------------------------------------------------------------
*/

async function importExcelFile(
    file
) {

    validateExcelFile(
        file
    );


    const arrayBuffer =
        await file.arrayBuffer();


    const workbook =
        XLSX.read(
            arrayBuffer,
            {
                type: "array"
            }
        );


    const worksheet =
        getWorksheet(
            workbook
        );


    const rows =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval: null,
                raw: true
            }
        );


    return {

        fileName:
            file.name,

        sheetName:
            worksheet.name,

        rowCount:
            rows.length,

        columns:
            getColumns(rows),

        rows:
            rows

    };

}


/*
|--------------------------------------------------------------------------
| Validazione file
|--------------------------------------------------------------------------
*/

function validateExcelFile(
    file
) {

    if (!file) {

        throw new Error(
            "Nessun file selezionato."
        );

    }


    const fileName =
        file.name.toLowerCase();


    const isSupported =
        IMPORTER_CONFIGURATION.supportedExtensions
            .some(
                (extension) =>
                    fileName.endsWith(
                        extension
                    )
            );


    if (!isSupported) {

        throw new Error(
            "Il file selezionato non è un file Excel valido."
        );

    }

}


/*
|--------------------------------------------------------------------------
| Recupera il foglio Excel
|--------------------------------------------------------------------------
*/

function getWorksheet(
    workbook
) {

    if (!workbook.SheetNames.length) {

        throw new Error(
            "Il file Excel non contiene fogli."
        );

    }


    let sheetName =
        IMPORTER_CONFIGURATION.defaultSheetName;


    if (
        !workbook.Sheets[sheetName]
    ) {

        sheetName =
            workbook.SheetNames[0];

    }


    const worksheet =
        workbook.Sheets[sheetName];


    if (!worksheet) {

        throw new Error(
            "Impossibile leggere il foglio Excel."
        );

    }


    worksheet.name =
        sheetName;


    return worksheet;

}


/*
|--------------------------------------------------------------------------
| Recupera colonne
|--------------------------------------------------------------------------
*/

function getColumns(
    rows
) {

    if (!rows.length) {

        return [];

    }


    return Object.keys(
        rows[0]
    );

}


/*
|--------------------------------------------------------------------------
| Esporta funzioni
|--------------------------------------------------------------------------
*/

window.PackingListImporter = {

    importExcelFile

};
