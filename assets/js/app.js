
"use strict";


/*
|--------------------------------------------------------------------------
| Packing List
|--------------------------------------------------------------------------
|
| Punto di ingresso principale dell'applicazione.
|
*/


/*
|--------------------------------------------------------------------------
| Stato applicazione
|--------------------------------------------------------------------------
*/

const applicationState = {

    importedData: null,

    currentWorkspace:
        "dashboard"

};


/*
|--------------------------------------------------------------------------
| Avvio applicazione
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    initializeNavigation();

    loadWorkspace(
        "dashboard"
    );

    setApplicationStatus(
        "Pronto",
        "success"
    );

}


/*
|--------------------------------------------------------------------------
| Navigazione
|--------------------------------------------------------------------------
*/

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".navigation-item"
        );


    navigationItems.forEach(
        (navigationItem) => {

            navigationItem.addEventListener(
                "click",
                () => {

                    const workspace =
                        navigationItem.dataset.workspace;


                    if (!workspace) {

                        return;

                    }


                    setActiveNavigationItem(
                        navigationItem
                    );


                    loadWorkspace(
                        workspace
                    );

                }
            );

        }
    );

}


function setActiveNavigationItem(
    activeItem
) {

    const navigationItems =
        document.querySelectorAll(
            ".navigation-item"
        );


    navigationItems.forEach(
        (navigationItem) => {

            navigationItem.classList.remove(
                "active"
            );

        }
    );


    activeItem.classList.add(
        "active"
    );

}


/*
|--------------------------------------------------------------------------
| Caricamento workspace
|--------------------------------------------------------------------------
*/

function loadWorkspace(
    workspaceName
) {

    const workspace =
        document.getElementById(
            "workspace"
        );


    const pageTitle =
        document.getElementById(
            "page-title"
        );


    if (!workspace) {

        return;

    }


    applicationState.currentWorkspace =
        workspaceName;


    workspace.innerHTML =
        getWorkspaceContent(
            workspaceName
        );


    if (pageTitle) {

        pageTitle.textContent =
            getWorkspaceTitle(
                workspaceName
            );

    }


    initializeWorkspace(
        workspaceName
    );

}


/*
|--------------------------------------------------------------------------
| Inizializzazione workspace
|--------------------------------------------------------------------------
*/

function initializeWorkspace(
    workspaceName
) {

    switch (workspaceName) {

        case "import":

            initializeImportWorkspace();

            break;

        default:

            break;

    }

}


/*
|--------------------------------------------------------------------------
| Titoli
|--------------------------------------------------------------------------
*/

function getWorkspaceTitle(
    workspaceName
) {

    const titles = {

        dashboard:
            "Dashboard",

        import:
            "Importazione",

        rules:
            "Regole",

        boxes:
            "BOX",

        control:
            "Controllo",

        result:
            "Packing List"

    };


    return (
        titles[workspaceName]
        || "Packing List"
    );

}


/*
|--------------------------------------------------------------------------
| Contenuti workspace
|--------------------------------------------------------------------------
*/

function getWorkspaceContent(
    workspaceName
) {

    switch (workspaceName) {

        case "dashboard":

            return getDashboardWorkspace();


        case "import":

            return getImportWorkspace();


        case "rules":

            return getRulesWorkspace();


        case "boxes":

            return getBoxesWorkspace();


        case "control":

            return getControlWorkspace();


        case "result":

            return getResultWorkspace();


        default:

            return getDashboardWorkspace();

    }

}


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

function getDashboardWorkspace() {

    return `

        <div class="dashboard-grid">

            <div class="card stat-card">

                <div class="stat-label">
                    Articoli importati
                </div>

                <div
                    class="stat-value"
                    id="dashboard-imported-articles"
                >
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    BOX disponibili
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Articoli elaborati
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Anomalie
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>

        </div>


        <div class="card">

            <h2 class="card-title">
                Packing List
            </h2>

            <p class="card-description">
                Importa un file Excel per iniziare
                l'elaborazione della Packing List.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Workspace Importazione
|--------------------------------------------------------------------------
*/

function getImportWorkspace() {

    return `

        <div class="import-workspace">


            <div class="workspace-heading">

                <h2>
                    Importazione dati
                </h2>

                <p>
                    Carica il file Excel contenente
                    gli articoli da organizzare nella
                    Packing List.
                </p>

            </div>


            <div
                class="card"
                style="padding: 0; overflow: hidden;"
            >

                <label
                    class="import-dropzone"
                    id="import-dropzone"
                    for="excel-file-input"
                >

                    <div class="import-dropzone-content">

                        <div class="import-icon">
                            XLS
                        </div>

                        <div class="import-title">
                            Seleziona il file Excel
                        </div>

                        <div class="import-description">
                            Trascina qui il file oppure
                            fai clic per selezionarlo
                        </div>

                    </div>

                </label>


                <input
                    type="file"
                    id="excel-file-input"
                    class="import-file-input"
                    accept=".xlsx,.xls"
                >

            </div>


            <div
                id="import-status"
                class="import-status"
            ></div>


            <div
                id="import-file-info"
                class="import-file-info"
                style="display: none;"
            >

                <div class="import-file-details">

                    <div
                        class="import-file-name"
                        id="import-file-name"
                    ></div>

                    <div
                        class="import-file-meta"
                        id="import-file-meta"
                    ></div>

                </div>


                <button
                    type="button"
                    class="button button-secondary"
                    id="remove-import-button"
                >
                    Rimuovi
                </button>

            </div>


            <div
                id="import-preview"
                class="import-preview"
                style="display: none;"
            ></div>


        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Inizializzazione importazione
|--------------------------------------------------------------------------
*/

function initializeImportWorkspace() {

    const fileInput =
        document.getElementById(
            "excel-file-input"
        );


    const dropzone =
        document.getElementById(
            "import-dropzone"
        );


    const removeButton =
        document.getElementById(
            "remove-import-button"
        );


    if (!fileInput || !dropzone) {

        return;

    }


    fileInput.addEventListener(
        "change",
        handleFileSelection
    );


    dropzone.addEventListener(
        "dragover",
        handleDragOver
    );


    dropzone.addEventListener(
        "dragleave",
        handleDragLeave
    );


    dropzone.addEventListener(
        "drop",
        handleFileDrop
    );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            removeImportedFile
        );

    }


    updateImportWorkspace();

}


/*
|--------------------------------------------------------------------------
| Selezione file
|--------------------------------------------------------------------------
*/

async function handleFileSelection(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    await processImportedFile(
        file
    );

}


/*
|--------------------------------------------------------------------------
| Drag over
|--------------------------------------------------------------------------
*/

function handleDragOver(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const dropzone =
        document.getElementById(
            "import-dropzone"
        );


    if (dropzone) {

        dropzone.classList.add(
            "drag-over"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Drag leave
|--------------------------------------------------------------------------
*/

function handleDragLeave(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const dropzone =
        document.getElementById(
            "import-dropzone"
        );


    if (dropzone) {

        dropzone.classList.remove(
            "drag-over"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Drop file
|--------------------------------------------------------------------------
*/

async function handleFileDrop(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const dropzone =
        document.getElementById(
            "import-dropzone"
        );


    if (dropzone) {

        dropzone.classList.remove(
            "drag-over"
        );

    }


    const file =
        event.dataTransfer.files[0];


    if (!file) {

        return;

    }


    await processImportedFile(
        file
    );

}


/*
|--------------------------------------------------------------------------
| Elaborazione file importato
|--------------------------------------------------------------------------
*/

async function processImportedFile(
    file
) {

    showImportStatus(
        "Importazione del file in corso...",
        "success"
    );

    try {

        const importedData =
            await PackingListImporter.importExcelFile(
                file
            );


        /*
        |--------------------------------------------------------------------------
        | NORMALIZZAZIONE
        |--------------------------------------------------------------------------
        | Trasforma le righe Excel in oggetti interni stabili.
        |--------------------------------------------------------------------------
        */

        const normalizedRows =
            PackingListNormalizer.normalizeImportedRows(
                importedData.rows
            );


        /*
        |--------------------------------------------------------------------------
        | CLASSIFICAZIONE
        |--------------------------------------------------------------------------
        | Interpreta il CODE e determina:
        |
        | - root
        | - tipo articolo
        | - presenza ".C"
        | - gruppo di posizionamento
        | - spazio occupato
        |
        | Nessuna BOX viene ancora assegnata.
        |--------------------------------------------------------------------------
        */

        const classifiedRows =
            PackingListClassifier.classifyRows(
                normalizedRows
            );


        const ruledRows =
            PackingListRules.applyRules(
                classifiedRows
            );


        importedData.normalizedRows =
            ruledRows;

        /*
        |--------------------------------------------------------------------------
        | BOX ENGINE
        |--------------------------------------------------------------------------
        | Costruisce le BOX sulla base delle righe classificate e regolamentate.
        |--------------------------------------------------------------------------
        */

        const boxResult =
            PackingListBoxEngine.buildBoxes(
                ruledRows
            );


        importedData.boxes =
            boxResult.boxes;


        importedData.unassignedItems =
            boxResult.unassignedItems;


        importedData.boxStatistics =
            boxResult.statistics;

            
        console.log(
            "RISULTATO BOX ENGINE:",
            boxResult.statistics
        );


        console.table(
            boxResult.boxes.map(
                box => ({
                    BOX: box.boxNumber,
                    Caschi: box.helmets.length,
                    "Articoli attached":
                        box.attachedItems.length,
                    "Articoli in coda":
                        box.tailItems.length,
                    "Spazio utilizzato":
                        box.usedSpaceUnits,
                    "Spazio disponibile":
                        box.remainingSpaceUnits,
                    Stato: box.status
                })
            )
        );


        console.log(
            "ARTICOLI NON ASSEGNATI:",
            boxResult.unassignedItems.length
        );

        console.table(
            boxResult.unassignedItems.map(
                item => ({
                    Riga: item.sourceRow,
                    Codice: item.code,
                    Descrizione: item.description,
                    Quantità: item.quantity,
                    Root: item.root,
                    Tipo: item.articleType,
                    Regola: item.rule,
                    ".C": item.hasC,
                    "Fine BOX": item.goesToEnd,
                    "Qualsiasi BOX": item.canUseAnyBox,
                    "Spazio": item.occupancyUnits
                })
            )
        );


        /*
            |--------------------------------------------------------------------------
            | DEBUG CLASSIFICAZIONE
            |--------------------------------------------------------------------------
            */

            console.table(
                ruledRows.map(
                    row => ({
                        Riga: row.sourceRow,
                        Codice: row.code,
                        Root: row.root,
                        Tipo: row.articleType,
                        Regola: row.rule,
                        Ruolo: row.packingRole,
                        ".C": row.hasC,
                        "Fine BOX": row.goesToEnd,
                        "Segue casco": row.followsHelmet,
                        "Qualsiasi BOX": row.canUseAnyBox,
                        "Spazio": row.occupancyUnits
                    })
                )
            );

            const unknownRows =
                ruledRows.filter(
                    row =>
                        row.rule === "unknown"
                );


            console.log(
                "ARTICOLI CON ROOT NON ANCORA GESTITA:",
                unknownRows.length
            );


            console.table(
                unknownRows.map(
                    row => ({
                        Riga: row.sourceRow,
                        Codice: row.code,
                        Descrizione: row.description,
                        Quantità: row.quantity,
                        Root: row.root,
                        ".C": row.hasC
                    })
                )
            );

            const unknownCodes = {};


            unknownRows.forEach(
                row => {

                    const code =
                        row.code || "(CODICE VUOTO)";

                    if (
                        !unknownCodes[code]
                    ) {

                        unknownCodes[code] = 0;

                    }

                    unknownCodes[code] +=
                        row.quantity || 0;

                }
            );


            console.table(
                Object.entries(
                    unknownCodes
                ).map(
                    (
                        [codice, quantita]
                    ) => ({
                        Codice: codice,
                        Quantità: quantita
                    })
                )
            );
   

        applicationState.importedData =
            importedData;


        showImportStatus(
            `File importato correttamente: ${importedData.rowCount} righe lette.`,
            "success"
        );


        setApplicationStatus(
            "Dati importati",
            "success"
        );

    } catch (
        error
    ) {

        console.error(
            "Errore importazione:",
            error
        );


        showImportStatus(
            error.message,
            "error"
        );


        setApplicationStatus(
            "Errore importazione",
            "danger"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Aggiornamento workspace importazione
|--------------------------------------------------------------------------
*/

function updateImportWorkspace() {

    const importedData =
        applicationState.importedData;


    const fileInfo =
        document.getElementById(
            "import-file-info"
        );


    const preview =
        document.getElementById(
            "import-preview"
        );


    if (!fileInfo || !preview) {

        return;

    }


    if (!importedData) {

        fileInfo.style.display =
            "none";

        preview.style.display =
            "none";

        return;

    }


    fileInfo.style.display =
        "flex";


    preview.style.display =
        "block";


    const fileName =
        document.getElementById(
            "import-file-name"
        );


    const fileMeta =
        document.getElementById(
            "import-file-meta"
        );


    if (fileName) {

        fileName.textContent =
            importedData.fileName;

    }


    if (fileMeta) {

        fileMeta.textContent =
            `${importedData.rowCount} righe · ${importedData.columns.length} colonne · Foglio "${importedData.sheetName}"`;

    }


    preview.innerHTML =
        createImportPreview(
            importedData
        );

}


/*
|--------------------------------------------------------------------------
| Anteprima
|--------------------------------------------------------------------------
*/

function createImportPreview(
    importedData
) {

    const previewRows =
        importedData.rows.slice(
            0,
            10
        );


    const header =
        importedData.columns
            .map(
                (column) => `
                    <th>
                        ${escapeHtml(column)}
                    </th>
                `
            )
            .join("");


    const body =
        previewRows
            .map(
                (row) => {

                    const cells =
                        importedData.columns
                            .map(
                                (column) => `
                                    <td>
                                        ${escapeHtml(
                                            formatCellValue(
                                                row[column]
                                            )
                                        )}
                                    </td>
                                `
                            )
                            .join("");


                    return `
                        <tr>
                            ${cells}
                        </tr>
                    `;

                }
            )
            .join("");


    return `

        <div class="import-preview-header">

            <h3 class="import-preview-title">
                Anteprima dati
            </h3>

            <div class="import-preview-info">
                Prime ${previewRows.length} righe
            </div>

        </div>


        <div class="import-preview-table-wrapper">

            <table class="import-preview-table">

                <thead>
                    <tr>
                        ${header}
                    </tr>
                </thead>

                <tbody>
                    ${body}
                </tbody>

            </table>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Formattazione valori
|--------------------------------------------------------------------------
*/

function formatCellValue(
    value
) {

    if (
        value === null
        || value === undefined
    ) {

        return "";

    }


    if (
        value instanceof Date
    ) {

        return value.toLocaleDateString(
            "it-IT"
        );

    }


    return String(
        value
    );

}


/*
|--------------------------------------------------------------------------
| Protezione HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*
|--------------------------------------------------------------------------
| Rimozione importazione
|--------------------------------------------------------------------------
*/

function removeImportedFile() {

    applicationState.importedData =
        null;


    updateImportWorkspace();


    const fileInput =
        document.getElementById(
            "excel-file-input"
        );


    if (fileInput) {

        fileInput.value =
            "";

    }


    showImportStatus(
        "Importazione rimossa.",
        "success"
    );


    setApplicationStatus(
        "Pronto",
        "success"
    );


    updateDashboard();

}


/*
|--------------------------------------------------------------------------
| Messaggio importazione
|--------------------------------------------------------------------------
*/

function showImportStatus(
    message,
    type
) {

    const status =
        document.getElementById(
            "import-status"
        );


    if (!status) {

        return;

    }


    status.textContent =
        message;


    status.className =
        `import-status visible ${type}`;

}


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

function updateDashboard() {

    const counter =
        document.getElementById(
            "dashboard-imported-articles"
        );


    if (!counter) {

        return;

    }


    const importedData =
        applicationState.importedData;


    counter.textContent =
        importedData
            ? importedData.rowCount
            : 0;

}


/*
|--------------------------------------------------------------------------
| Stato applicazione
|--------------------------------------------------------------------------
*/

function setApplicationStatus(
    message,
    type = "success"
) {

    const status =
        document.getElementById(
            "application-status"
        );


    const indicator =
        document.getElementById(
            "application-status-indicator"
        );


    if (status) {

        status.textContent =
            message;

    }


    if (indicator) {

        indicator.style.background =
            getStatusColor(
                type
            );

    }

}


/*
|--------------------------------------------------------------------------
| Colore stato
|--------------------------------------------------------------------------
*/

function getStatusColor(
    type
) {

    const colors = {

        success:
            "var(--color-success)",

        warning:
            "var(--color-warning)",

        danger:
            "var(--color-danger)"

    };


    return (
        colors[type]
        || colors.success
    );

}


/*
|--------------------------------------------------------------------------
| Stato applicazione accessibile
|--------------------------------------------------------------------------
*/

window.PackingListApplication = {

    getState: () =>
        applicationState

};
