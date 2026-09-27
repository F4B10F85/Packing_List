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
        "import"

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
        "import"
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

        case "result":

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

            return getImportWorkspace();

    }

}


/*
|--------------------------------------------------------------------------
| Workspace Packing List
|--------------------------------------------------------------------------
*/

function getResultWorkspace() {

    const importedData =
        applicationState.importedData;


    if (!importedData) {

        return `

            <div class="workspace-heading">

                <h2>
                    Packing List
                </h2>

                <p>
                    Importa un file Excel per visualizzare
                    la prima rielaborazione.
                </p>

            </div>


            <div class="card">

                <h3 class="card-title">
                    Nessun file elaborato
                </h3>

                <p class="card-description">
                    Non sono ancora disponibili dati da visualizzare.
                </p>

            </div>

        `;

    }


    return createPackingListResult(
        importedData
    );

}


/*
|--------------------------------------------------------------------------
| Risultato Packing List
|--------------------------------------------------------------------------
*/

function createPackingListResult(
    importedData
) {

    const boxes =
        importedData.boxes || [];


    const unassignedItems =
        importedData.unassignedItems || [];


    const rows = [];


    boxes.forEach(
        box => {

            /*
            |--------------------------------------------------------------------------
            | ORDINE REALE DELLA BOX
            |--------------------------------------------------------------------------
            |
            | Il Box Engine costruisce "box.items" mantenendo l'ordine effettivo:
            |
            |   CASCO
            |   IMBOTTITURA
            |   CASCO
            |   IMBOTTITURA
            |   ...
            |
            | Non dobbiamo più stampare separatamente:
            |
            |   box.helmets
            |   box.attachedItems
            |   box.tailItems
            |
            | perché così perderemmo l'ordine originale.
            |--------------------------------------------------------------------------
            */

            if (
                Array.isArray(
                    box.items
                )
            ) {

                box.items.forEach(
                    item => {

                        rows.push(
                            createPackingListRow(
                                box.boxNumber,
                                item
                            )
                        );

                    }
                );

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | FALLBACK
            |--------------------------------------------------------------------------
            |
            | Se per qualche motivo una vecchia BOX non possiede "items",
            | utilizziamo ancora la struttura precedente.
            |--------------------------------------------------------------------------
            */

            box.helmets.forEach(
                item => {

                    rows.push(
                        createPackingListRow(
                            box.boxNumber,
                            item
                        )
                    );

                }
            );


            box.attachedItems.forEach(
                item => {

                    rows.push(
                        createPackingListRow(
                            box.boxNumber,
                            item
                        )
                    );

                }
            );


            box.tailItems.forEach(
                item => {

                    rows.push(
                        createPackingListRow(
                            box.boxNumber,
                            item
                        )
                    );

                }
            );

        }
    );


    const tableRows =
        rows.map(
            row => `

                <tr>

                    <td>
                        ${escapeHtml(row.box)}
                    </td>

                    <td>
                        ${escapeHtml(row.order)}
                    </td>

                    <td>
                        ${escapeHtml(row.quantity)}
                    </td>

                    <td>
                        ${escapeHtml(row.code)}
                    </td>

                    <td>
                        ${escapeHtml(row.description)}
                    </td>

                    <td>
                        ${escapeHtml(row.personalization)}
                    </td>

                    <td>
                        ${escapeHtml(row.customerReference)}
                    </td>

                </tr>

            `
        ).join("");


    const unassignedRows =
        unassignedItems.map(
            item => `

                <tr>

                    <td>
                        CODA
                    </td>

                    <td>
                        ${escapeHtml(item.order)}
                    </td>

                    <td>
                        ${escapeHtml(item.quantity)}
                    </td>

                    <td>
                        ${escapeHtml(item.code)}
                    </td>

                    <td>
                        ${escapeHtml(item.description)}
                    </td>

                    <td>
                        ${escapeHtml(item.personalization)}
                    </td>

                    <td>
                        ${escapeHtml(item.customerReference)}
                    </td>

                </tr>

            `
        ).join("");


    return `

        <div class="workspace-heading">

            <h2>
                Packing List
            </h2>

            <p>

                Prima rielaborazione del file

                <strong>
                    ${escapeHtml(importedData.fileName)}
                </strong>.

            </p>

        </div>


        <div class="dashboard-grid">


            <div class="card stat-card">

                <div class="stat-label">
                    Righe importate
                </div>

                <div class="stat-value">
                    ${importedData.rowCount}
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    BOX generate
                </div>

                <div class="stat-value">
                    ${boxes.length}
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Totale Caschi
                </div>

                <div class="stat-value">
                    ${boxes.reduce(
                        (total, box) =>
                            total +
                            (box.helmets || []).reduce(
                                (boxTotal, helmet) =>
                                    boxTotal + Number(helmet.quantity || 0),
                                0
                            ),
                        0
                    )}
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Righe in coda
                </div>

                <div class="stat-value">
                    ${unassignedItems.length}
                </div>

            </div>


        </div>


        <div class="card">

            <h3 class="card-title">
                Risultato elaborazione
            </h3>


            <p class="card-description">

                Struttura definitiva delle colonne
                della Packing List.

            </p>

            <div
                style="
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 20px;
                "
            >
                <button
                    type="button"
                    class="button button-primary"
                    id="export-packing-list-button"
                    onclick="startPackingListExportAnimation()"
                >
                    Esporta PACKINGLIST.xlsx
                </button>
            </div>


            <div class="import-preview-table-wrapper">

                <table class="import-preview-table">

                    <thead>

                        <tr>

                            <th>
                                BOX
                            </th>

                            <th>
                                ORDER
                            </th>

                            <th>
                                Q.ty
                            </th>

                            <th>
                                CODE
                            </th>

                            <th>
                                DESCRIPTION
                            </th>

                            <th>
                                PERSONALIZATION
                            </th>

                            <th>
                                CUSTOMER REFERENCE
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            tableRows
                            || `

                                <tr>

                                    <td colspan="7">

                                        Nessuna riga
                                        assegnata alle BOX.

                                    </td>

                                </tr>

                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>


        ${
            unassignedItems.length
                ? `

                    <div class="card">

                        <h3 class="card-title">

                            Coda / articoli
                            non ancora assegnati

                        </h3>


                        <p class="card-description">

                            Queste righe vengono mostrate
                            separatamente perché il Box Engine
                            attuale non le ha assegnate
                            a una BOX.

                        </p>


                        <div class="import-preview-table-wrapper">

                            <table class="import-preview-table">

                                <thead>

                                    <tr>

                                        <th>
                                            BOX
                                        </th>

                                        <th>
                                            ORDER
                                        </th>

                                        <th>
                                            Q.ty
                                        </th>

                                        <th>
                                            CODE
                                        </th>

                                        <th>
                                            DESCRIPTION
                                        </th>

                                        <th>
                                            PERSONALIZATION
                                        </th>

                                        <th>
                                            CUSTOMER REFERENCE
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${unassignedRows}

                                </tbody>

                            </table>

                        </div>

                    </div>

                `
                : ""
        }

    `;

}


/*
|--------------------------------------------------------------------------
| Conversione riga interna -> Packing List
|--------------------------------------------------------------------------
*/

function createPackingListRow(
    boxNumber,
    item
) {

    return {

        box:
            boxNumber,

        order:
            formatCellValue(
                item.order
            ),

        quantity:
            formatCellValue(
                item.quantity
            ),

        code:
            formatCellValue(
                item.code
            ),

        description:
            formatCellValue(
                item.description
            ),

        personalization:
            formatCellValue(
                item.personalization
            ),

        customerReference:
            formatCellValue(
                item.customerReference
            )

    };

}

/*
|--------------------------------------------------------------------------
| INIZIALIZZAZIONE EXPORT PACKING LIST
|--------------------------------------------------------------------------
|
| Il workspace della Packing List viene creato dinamicamente.
| Per questo non cerchiamo il pulsante durante il caricamento
| del workspace.
|
| Intercettiamo invece il click sul document e controlliamo
| se proviene dal pulsante di esportazione.
|
*/

function initializePackingListExport() {

    document.addEventListener(
        "click",
        handlePackingListExportClick
    );

}


/*
|--------------------------------------------------------------------------
| CLICK EXPORT
|--------------------------------------------------------------------------
*/

function handlePackingListExportClick(
    event
) {

    const exportButton =
        event.target.closest(
            "#export-packing-list-button"
        );


    if (!exportButton) {

        return;

    }


    event.preventDefault();

    exportPackingListExcel();

}

/* 
|--------------------------------------------------------------------------
| Animazione esportazione Packing List
|--------------------------------------------------------------------------
*/

function startPackingListExportAnimation() {

    console.log(
        "PACKING LIST: avvio sequenza di esportazione."
    );


    const importedData =
        applicationState.importedData;


    if (!importedData) {

        alert(
            "Non ci sono dati elaborati da esportare."
        );

        return;

    }


    const boxes =
        importedData.boxes || [];


    if (!Array.isArray(boxes) || boxes.length === 0) {

        alert(
            "Non ci sono BOX da esportare."
        );

        return;

    }


    const helmetCount =
        boxes.reduce(
            (
                total,
                box
            ) => {

                return (
                    total +
                    (box.helmets || []).reduce(
                        (
                            boxTotal,
                            helmet
                        ) => {

                            return (
                                boxTotal +
                                Number(
                                    helmet.quantity || 0
                                )
                            );

                        },
                        0
                    )
                );

            },
            0
        );


    createPackingListExportOverlay(
        boxes,
        helmetCount
    );

}


/*
|--------------------------------------------------------------------------
| Overlay animazione esportazione
|--------------------------------------------------------------------------
*/

function createPackingListExportOverlay(
    boxes,
    helmetCount
) {

    removePackingListExportOverlay();


    injectPackingListExportStyles();


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "packing-list-export-overlay";


    const boxCount =
        boxes.length;


    const animatedDocuments =
        boxes
            .map(
                (
                    box,
                    index
                ) => {

                    const firstItem =
                        Array.isArray(box.items)
                            ? box.items[0]
                            : (
                                Array.isArray(box.helmets)
                                    ? box.helmets[0]
                                    : null
                            );


                    const code =
                        firstItem &&
                        firstItem.code
                            ? firstItem.code
                            : "PACKING";


                    return `
                        <div
                            class="packing-document packing-document-${index + 1}"
                        >

                            <div class="packing-document-header">
                                BOX ${box.boxNumber}
                            </div>

                            <div class="packing-document-line">
                                ${escapeHtml(
                                    String(code)
                                )}
                            </div>

                            <div class="packing-document-line short">
                                PACKING LIST
                            </div>

                        </div>
                    `;

                }
            )
            .join("");


    overlay.innerHTML = `

        <div class="packing-export-scene">


            <div class="packing-export-title">

                <div class="packing-export-eyebrow">
                    KEP
                </div>

                <div class="packing-export-main-title">
                    Generazione Packing List
                </div>

                <div class="packing-export-subtitle">
                    Preparazione del documento
                </div>

            </div>


            <div class="packing-document-stage">

                ${animatedDocuments}

                <div class="packing-final-document">

                    <div class="packing-final-spine"></div>

                    <div class="packing-final-cover">

                        <div class="packing-final-small">
                            PACKING LIST
                        </div>

                        <div class="packing-final-title">
                            PACKING<br>
                            LIST
                        </div>

                        <div class="packing-final-details">

                            ${boxCount} BOX
                            <span>•</span>
                            ${helmetCount} CASCHI

                        </div>

                    </div>

                </div>

            </div>


            <div class="packing-export-status">

                <span
                    class="packing-export-status-text"
                >
                    Composizione documento
                </span>

                <span
                    class="packing-export-check"
                >
                    ✓
                </span>

            </div>


            <div class="packing-export-progress">

                <div
                    class="packing-export-progress-bar"
                ></div>

            </div>


        </div>

    `;


    document.body.appendChild(
        overlay
    );


    /*
    |--------------------------------------------------------------------------
    | Sequenza temporale
    |--------------------------------------------------------------------------
    |
    | 0.0s  → apertura scena
    | 0.5s  → partono i documenti
    | 2.8s  → documento finale
    | 4.0s  → completamento
    | 5.0s  → esportazione reale
    |
    */


    window.setTimeout(
        () => {

            const status =
                overlay.querySelector(
                    ".packing-export-status-text"
                );


            if (status) {

                status.textContent =
                    "Assemblaggio Packing List";

            }

        },
        900
    );


    window.setTimeout(
        () => {

            const status =
                overlay.querySelector(
                    ".packing-export-status-text"
                );


            if (status) {

                status.textContent =
                    "Finalizzazione documento";

            }

        },
        2800
    );


    window.setTimeout(
        () => {

            const status =
                overlay.querySelector(
                    ".packing-export-status-text"
                );


            if (status) {

                status.textContent =
                    "Packing List completata";

            }


            overlay.classList.add(
                "packing-export-complete"
            );

        },
        4000
    );


    window.setTimeout(
        () => {

            removePackingListExportOverlay();


            /*
            |--------------------------------------------------------------------------
            | Qui parte la vera esportazione Excel
            |--------------------------------------------------------------------------
            */

            exportPackingListExcel();

        },
        5000
    );

}


/*
|--------------------------------------------------------------------------
| Rimozione overlay
|--------------------------------------------------------------------------
*/

function removePackingListExportOverlay() {

    const existingOverlay =
        document.getElementById(
            "packing-list-export-overlay"
        );


    if (existingOverlay) {

        existingOverlay.remove();

    }

}


/*
|--------------------------------------------------------------------------
| CSS animazione esportazione
|--------------------------------------------------------------------------
*/

function injectPackingListExportStyles() {

    if (
        document.getElementById(
            "packing-list-export-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "packing-list-export-styles";


    style.textContent = `

        /*
        |--------------------------------------------------------------------------
        | Overlay principale
        |--------------------------------------------------------------------------
        */

        #packing-list-export-overlay {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;

            justify-content: center;

            background:
                rgba(15, 25, 23, 0.72);

            backdrop-filter:
                blur(8px);

            -webkit-backdrop-filter:
                blur(8px);

            opacity: 0;

            animation:
                packingOverlayIn
                0.45s
                ease
                forwards;

        }


        /*
        |--------------------------------------------------------------------------
        | Scena
        |--------------------------------------------------------------------------
        */

        .packing-export-scene {

            width: min(
                620px,
                calc(100vw - 40px)
            );

            text-align: center;

            position: relative;

        }


        /*
        |--------------------------------------------------------------------------
        | Titoli
        |--------------------------------------------------------------------------
        */

        .packing-export-title {

            margin-bottom: 28px;

            opacity: 0;

            transform:
                translateY(15px);

            animation:
                packingTitleIn
                0.7s
                0.2s
                ease
                forwards;

        }


        .packing-export-eyebrow {

            font-size: 11px;

            letter-spacing: 4px;

            font-weight: 600;

            opacity: 0.65;

            margin-bottom: 8px;

        }


        .packing-export-main-title {

            font-size: 25px;

            font-weight: 600;

            letter-spacing: 0.2px;

        }


        .packing-export-subtitle {

            margin-top: 7px;

            font-size: 13px;

            opacity: 0.62;

        }


        /*
        |--------------------------------------------------------------------------
        | Area documenti
        |--------------------------------------------------------------------------
        */

        .packing-document-stage {

            height: 265px;

            position: relative;

            display: flex;

            align-items: center;

            justify-content: center;

            perspective: 1000px;

        }


        /*
        |--------------------------------------------------------------------------
        | Fogli
        |--------------------------------------------------------------------------
        */

        .packing-document {

            position: absolute;

            width: 165px;

            height: 210px;

            background: #ffffff;

            border-radius: 5px;

            padding: 18px;

            box-sizing: border-box;

            text-align: left;

            color: #26322f;

            box-shadow:
                0 18px 45px
                rgba(0, 0, 0, 0.28);

            opacity: 0;

            left: 50%;

            top: 50%;

            transform-origin:
                center center;

            animation:
                packingDocumentFly
                2.5s
                cubic-bezier(
                    0.22,
                    0.61,
                    0.36,
                    1
                )
                forwards;

        }


        .packing-document-header {

            font-size: 13px;

            font-weight: 700;

            letter-spacing: 1px;

            margin-bottom: 18px;

        }


        .packing-document-line {

            font-size: 11px;

            font-weight: 600;

            border-bottom:
                1px solid
                #d9dedc;

            padding-bottom: 7px;

            margin-bottom: 8px;

        }


        .packing-document-line.short {

            width: 72%;

            font-weight: 400;

            opacity: 0.55;

        }


        /*
        |--------------------------------------------------------------------------
        | Variazione dei fogli
        |--------------------------------------------------------------------------
        */

        .packing-document-1 {

            animation-delay:
                0.35s;

            --document-x:
                -360px;

            --document-y:
                -100px;

            --document-rotation:
                -18deg;

        }


        .packing-document-2 {

            animation-delay:
                0.65s;

            --document-x:
                330px;

            --document-y:
                -80px;

            --document-rotation:
                15deg;

        }


        .packing-document-3 {

            animation-delay:
                0.95s;

            --document-x:
                -320px;

            --document-y:
                120px;

            --document-rotation:
                13deg;

        }


        .packing-document-4 {

            animation-delay:
                1.25s;

            --document-x:
                310px;

            --document-y:
                115px;

            --document-rotation:
                -14deg;

        }


        .packing-document-5 {

            animation-delay:
                1.55s;

            --document-x:
                -270px;

            --document-y:
                0px;

            --document-rotation:
                -9deg;

        }


        .packing-document-6 {

            animation-delay:
                1.85s;

            --document-x:
                270px;

            --document-y:
                15px;

            --document-rotation:
                8deg;

        }


        /*
        |--------------------------------------------------------------------------
        | Documento finale
        |--------------------------------------------------------------------------
        */

        .packing-final-document {

            position: absolute;

            width: 190px;

            height: 225px;

            left: 50%;

            top: 50%;

            transform:
                translate(
                    -50%,
                    -50%
                )
                scale(0.35)
                rotateY(-35deg);

            opacity: 0;

            animation:
                packingFinalDocument
                1.2s
                2.65s
                cubic-bezier(
                    0.16,
                    1,
                    0.3,
                    1
                )
                forwards;

        }


        .packing-final-cover {

            position: absolute;

            inset: 0;

            border-radius: 7px;

            background:
                linear-gradient(
                    145deg,
                    #00645a,
                    #004d45
                );

            color: white;

            box-shadow:
                0 25px 60px
                rgba(0, 0, 0, 0.38);

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            padding: 25px;

            box-sizing: border-box;

        }


        .packing-final-spine {

            position: absolute;

            width: 12px;

            height: 100%;

            left: -5px;

            top: 0;

            border-radius: 5px 0 0 5px;

            background:
                rgba(0, 0, 0, 0.22);

            z-index: 2;

        }


        .packing-final-small {

            font-size: 9px;

            letter-spacing: 3px;

            opacity: 0.68;

            margin-bottom: 15px;

        }


        .packing-final-title {

            font-size: 25px;

            font-weight: 700;

            line-height: 1.05;

            letter-spacing: 1px;

        }


        .packing-final-details {

            margin-top: 22px;

            font-size: 10px;

            letter-spacing: 1px;

            opacity: 0.78;

        }


        .packing-final-details span {

            margin:
                0 6px;

            opacity: 0.45;

        }


        /*
        |--------------------------------------------------------------------------
        | Stato
        |--------------------------------------------------------------------------
        */

        .packing-export-status {

            height: 28px;

            margin-top: 12px;

            font-size: 13px;

            opacity: 0.8;

        }


        .packing-export-status-text {

            display: inline-block;

            transition:
                opacity
                0.25s
                ease;

        }


        .packing-export-check {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            width: 18px;

            height: 18px;

            margin-left: 7px;

            border-radius: 50%;

            background: #00645a;

            color: white;

            font-size: 11px;

            opacity: 0;

            transform:
                scale(0.5);

        }


        .packing-export-complete
        .packing-export-check {

            animation:
                packingCheckIn
                0.45s
                0.05s
                ease
                forwards;

        }


        /*
        |--------------------------------------------------------------------------
        | Barra progresso
        |--------------------------------------------------------------------------
        */

        .packing-export-progress {

            width: 260px;

            height: 3px;

            margin:
                12px
                auto
                0;

            overflow: hidden;

            border-radius: 10px;

            background:
                rgba(255,255,255,0.12);

        }


        .packing-export-progress-bar {

            width: 0%;

            height: 100%;

            background:
                #ffffff;

            animation:
                packingProgress
                4.65s
                linear
                forwards;

        }


        /*
        |--------------------------------------------------------------------------
        | Animazioni
        |--------------------------------------------------------------------------
        */

        @keyframes packingOverlayIn {

            from {

                opacity: 0;

            }

            to {

                opacity: 1;

            }

        }


        @keyframes packingTitleIn {

            from {

                opacity: 0;

                transform:
                    translateY(15px);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0);

            }

        }


        @keyframes packingDocumentFly {

            0% {

                opacity: 0;

                transform:
                    translate(
                        calc(
                            -50% +
                            var(--document-x)
                        ),
                        calc(
                            -50% +
                            var(--document-y)
                        )
                    )
                    rotate(
                        var(--document-rotation)
                    )
                    scale(0.72);

            }

            18% {

                opacity: 1;

            }

            72% {

                opacity: 1;

            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    rotate(0deg)
                    scale(0.72);

            }

        }


        @keyframes packingFinalDocument {

            0% {

                opacity: 0;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(0.35)
                    rotateY(-35deg);

            }

            55% {

                opacity: 1;

            }

            100% {

                opacity: 1;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1)
                    rotateY(0deg);

            }

        }


        @keyframes packingCheckIn {

            from {

                opacity: 0;

                transform:
                    scale(0.5);

            }

            to {

                opacity: 1;

                transform:
                    scale(1);

            }

        }


        @keyframes packingProgress {

            from {

                width: 0%;

            }

            to {

                width: 100%;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Riduzione movimento
        |--------------------------------------------------------------------------
        */

        @media (
            prefers-reduced-motion: reduce
        ) {

            #packing-list-export-overlay *,
            #packing-list-export-overlay {

                animation-duration:
                    0.01ms !important;

                animation-iteration-count:
                    1 !important;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/*
|--------------------------------------------------------------------------
| Esportazione Excel
|--------------------------------------------------------------------------
*/

function exportPackingListExcel() {

    const importedData =
        applicationState.importedData;


    if (!importedData) {

        alert(
            "Non ci sono dati disponibili per l'esportazione."
        );

        return;

    }


    const boxes =
        importedData.boxes || [];


    const unassignedItems =
        importedData.unassignedItems || [];


    /*
    |--------------------------------------------------------------------------
    | CONTROLLO DI SICUREZZA
    |--------------------------------------------------------------------------
    |
    | Se esiste ancora un articolo non assegnato,
    | non generiamo un file incompleto.
    |
    */

    if (unassignedItems.length > 0) {

        alert(
            "Esportazione bloccata: ci sono ancora articoli non assegnati alle BOX."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | COSTRUZIONE RIGHE
    |--------------------------------------------------------------------------
    |
    | È fondamentale utilizzare box.items.
    |
    | box.items contiene infatti l'ordine reale:
    |
    | CASCO
    | IMBOTTITURA
    | CASCO
    | IMBOTTITURA
    |
    | e così via.
    |
    */

    const exportRows = [];


    boxes.forEach(
        box => {

            let items = [];


            /*
            |------------------------------------------------------------------
            | Nuova struttura
            |------------------------------------------------------------------
            */

            if (
                Array.isArray(box.items)
            ) {

                items =
                    box.items;

            }


            /*
            |------------------------------------------------------------------
            | Fallback
            |------------------------------------------------------------------
            |
            | Manteniamo compatibilità con eventuali BOX create
            | con la struttura precedente.
            |
            */

            else {

                items = [

                    ...(Array.isArray(box.helmets)
                        ? box.helmets
                        : []
                    ),

                    ...(Array.isArray(box.attachedItems)
                        ? box.attachedItems
                        : []
                    ),

                    ...(Array.isArray(box.tailItems)
                        ? box.tailItems
                        : []
                    )

                ];

            }


            /*
            |------------------------------------------------------------------
            | Conversione delle righe
            |------------------------------------------------------------------
            */

            items.forEach(
                item => {

                    exportRows.push({

                        "BOX":
                            box.boxNumber,

                        "ORDER":
                            formatCellValue(
                                item.order
                            ),

                        "Q.ty":
                            getExportQuantity(
                                item.quantity
                            ),

                        "CODE":
                            formatCellValue(
                                item.code
                            ),

                        "DESCRIPTION":
                            formatCellValue(
                                item.description
                            ),

                        "PERSONALIZATION":
                            formatCellValue(
                                item.personalization
                            ),

                        "CUSTOMER REFERENCE":
                            formatCellValue(
                                item.customerReference
                            )

                    });

                }
            );

        }
    );


    /*
    |--------------------------------------------------------------------------
    | Controllo finale
    |--------------------------------------------------------------------------
    */

    if (
        exportRows.length === 0
    ) {

        alert(
            "Non ci sono righe da esportare."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Creazione worksheet
    |--------------------------------------------------------------------------
    */

    const worksheet =
        XLSX.utils.json_to_sheet(
            exportRows,
            {
                header: [
                    "BOX",
                    "ORDER",
                    "Q.ty",
                    "CODE",
                    "DESCRIPTION",
                    "PERSONALIZATION",
                    "CUSTOMER REFERENCE"
                ]
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Larghezza colonne
    |--------------------------------------------------------------------------
    |
    | Rendiamo il file immediatamente leggibile.
    |
    */

    worksheet["!cols"] = [

        {
            wch: 8
        },

        {
            wch: 18
        },

        {
            wch: 8
        },

        {
            wch: 22
        },

        {
            wch: 45
        },

        {
            wch: 35
        },

        {
            wch: 30
        }

    ];


    /*
    |--------------------------------------------------------------------------
    | Creazione workbook
    |--------------------------------------------------------------------------
    */

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "PACKINGLIST"
    );


    /*
    |--------------------------------------------------------------------------
    | Download
    |--------------------------------------------------------------------------
    */

    XLSX.writeFile(
        workbook,
        "PACKINGLIST.xlsx"
    );


    /*
    |--------------------------------------------------------------------------
    | Stato applicazione
    |--------------------------------------------------------------------------
    */

    setApplicationStatus(
        "PACKINGLIST.xlsx esportato",
        "success"
    );

}


/*
|--------------------------------------------------------------------------
| Quantità per Excel
|--------------------------------------------------------------------------
|
| Manteniamo le quantità numeriche come numeri Excel.
| Se invece il valore non è numerico, lo lasciamo come testo.
|
*/

function getExportQuantity(
    value
) {

    if (
        value === null
        || value === undefined
        || value === ""
    ) {

        return "";

    }


    const numericValue =
        Number(
            value
        );


    if (
        Number.isFinite(
            numericValue
        )
    ) {

        return numericValue;

    }


    return String(
        value
    );

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
        | Costruisce le BOX sulla base delle righe
        | classificate e regolamentate.
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

                    BOX:
                        box.boxNumber,

                    Caschi:
                        box.helmets.length,

                    "Articoli attached":
                        box.attachedItems.length,

                    "Articoli in coda":
                        box.tailItems.length,

                    "Spazio utilizzato":
                        box.usedSpaceUnits,

                    "Spazio disponibile":
                        box.remainingSpaceUnits,

                    Stato:
                        box.status

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

                    Riga:
                        item.sourceRow,

                    Codice:
                        item.code,

                    Descrizione:
                        item.description,

                    Quantità:
                        item.quantity,

                    Root:
                        item.root,

                    Tipo:
                        item.articleType,

                    Regola:
                        item.rule,

                    ".C":
                        item.hasC,

                    "Fine BOX":
                        item.goesToEnd,

                    "Qualsiasi BOX":
                        item.canUseAnyBox,

                    "Spazio":
                        item.occupancyUnits

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

                    Riga:
                        row.sourceRow,

                    Codice:
                        row.code,

                    Root:
                        row.root,

                    Tipo:
                        row.articleType,

                    Regola:
                        row.rule,

                    Ruolo:
                        row.packingRole,

                    ".C":
                        row.hasC,

                    "Fine BOX":
                        row.goesToEnd,

                    "Segue casco":
                        row.followsHelmet,

                    "Qualsiasi BOX":
                        row.canUseAnyBox,

                    "Spazio":
                        row.occupancyUnits

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

                    Riga:
                        row.sourceRow,

                    Codice:
                        row.code,

                    Descrizione:
                        row.description,

                    Quantità:
                        row.quantity,

                    Root:
                        row.root,

                    ".C":
                        row.hasC

                })
            )
        );


        const unknownCodes = {};


        unknownRows.forEach(
            row => {

                const code =
                    row.code
                    || "(CODICE VUOTO)";


                if (
                    !unknownCodes[code]
                ) {

                    unknownCodes[code] =
                        0;

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

                    Codice:
                        codice,

                    Quantità:
                        quantita

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
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

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

/* 
|--------------------------------------------------------------------------
| Esportazione PACKINGLIST.xlsx
|--------------------------------------------------------------------------
*/

function exportPackingListExcel() {

    console.log(
        "EXPORT PACKINGLIST: funzione avviata."
    );


    /*
    |--------------------------------------------------------------------------
    | Controllo libreria XLSX
    |--------------------------------------------------------------------------
    */

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "Errore: la libreria Excel XLSX non è disponibile."
        );

        console.error(
            "XLSX non è definito."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Recupero dati elaborati
    |--------------------------------------------------------------------------
    */

    const importedData =
        applicationState.importedData;


    if (!importedData) {

        alert(
            "Non ci sono dati elaborati da esportare."
        );

        console.error(
            "applicationState.importedData non disponibile."
        );

        return;

    }


    const boxes =
        importedData.boxes || [];


    if (!Array.isArray(boxes)) {

        alert(
            "Errore: le BOX elaborate non sono disponibili."
        );

        console.error(
            "importedData.boxes non è un array:",
            importedData.boxes
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Controllo articoli non assegnati
    |--------------------------------------------------------------------------
    */

    const unassignedItems =
        importedData.unassignedItems || [];


    if (
        unassignedItems.length > 0
    ) {

        alert(
            "Impossibile esportare: sono presenti articoli non assegnati."
        );

        console.error(
            "Articoli non assegnati:",
            unassignedItems
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Costruzione righe Excel
    |--------------------------------------------------------------------------
    */

    const exportRows = [];


    boxes.forEach(
        box => {

            let items = [];


            /*
            |--------------------------------------------------------------------------
            | Usa box.items se disponibile
            |--------------------------------------------------------------------------
            */

            if (
                Array.isArray(box.items)
            ) {

                items =
                    box.items;

            }


            /*
            |--------------------------------------------------------------------------
            | Compatibilità con struttura precedente
            |--------------------------------------------------------------------------
            */

            else {

                items = [

                    ...(
                        Array.isArray(
                            box.helmets
                        )
                            ? box.helmets
                            : []
                    ),

                    ...(
                        Array.isArray(
                            box.attachedItems
                        )
                            ? box.attachedItems
                            : []
                    ),

                    ...(
                        Array.isArray(
                            box.tailItems
                        )
                            ? box.tailItems
                            : []
                    )

                ];

            }


            /*
            |--------------------------------------------------------------------------
            | Inserimento articoli
            |--------------------------------------------------------------------------
            */

            items.forEach(
                item => {

                    exportRows.push({

                        "BOX":
                            box.boxNumber,

                        "ORDER":
                            formatCellValue(
                                item.order
                            ),

                        "Q.ty":
                            getExportQuantity(
                                item.quantity
                            ),

                        "CODE":
                            formatCellValue(
                                item.code
                            ),

                        "DESCRIPTION":
                            formatCellValue(
                                item.description
                            ),

                        "PERSONALIZATION":
                            formatCellValue(
                                item.personalization
                            ),

                        "CUSTOMER REFERENCE":
                            formatCellValue(
                                item.customerReference
                            )

                    });

                }
            );

        }
    );


    /*
    |--------------------------------------------------------------------------
    | Controllo risultato
    |--------------------------------------------------------------------------
    */

    if (
        exportRows.length === 0
    ) {

        alert(
            "Non ci sono articoli da esportare."
        );

        console.error(
            "exportRows è vuoto."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Creazione worksheet
    |--------------------------------------------------------------------------
    */

    const worksheet =
        XLSX.utils.json_to_sheet(
            exportRows
        );


    /*
    |--------------------------------------------------------------------------
    | Larghezza colonne
    |--------------------------------------------------------------------------
    */

    worksheet["!cols"] = [

        {
            wch: 8
        },

        {
            wch: 18
        },

        {
            wch: 10
        },

        {
            wch: 25
        },

        {
            wch: 45
        },

        {
            wch: 40
        },

        {
            wch: 30
        }

    ];


    /*
    |--------------------------------------------------------------------------
    | Creazione workbook
    |--------------------------------------------------------------------------
    */

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "PACKINGLIST"
    );


    /*
    |--------------------------------------------------------------------------
    | Download
    |--------------------------------------------------------------------------
    */

    XLSX.writeFile(
        workbook,
        "PACKINGLIST.xlsx"
    );


    console.log(
        "EXPORT PACKINGLIST completato.",
        exportRows
    );

}

function getExportQuantity(
    value
) {

    if (
        typeof value === "number"
    ) {

        return value;

    }


    const normalized =
        String(
            value ?? ""
        )
        .trim()
        .replace(
            ",",
            "."
        );


    const numericValue =
        Number(
            normalized
        );


    if (
        Number.isFinite(
            numericValue
        )
    ) {

        return numericValue;

    }


    return value ?? "";

}